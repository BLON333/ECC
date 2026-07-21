/**
 * Tests for the read-only ECC Lite assisted/manual helper.
 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'ecc-lite.js');
const SOURCE_COMMIT = execFileSync(
  'git',
  ['-C', REPO_ROOT, 'rev-parse', '--verify', 'HEAD^{commit}'],
  { encoding: 'utf8' }
).trim();
const EXPECTED_SKILLS = [
  'agent-introspection-debugging',
  'intent-driven-development',
];

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function walk(rootPath) {
  if (!fs.existsSync(rootPath)) return [];

  const results = [];
  const visit = currentPath => {
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name))) {
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(rootPath, fullPath).split(path.sep).join('/');
      results.push({
        relativePath,
        type: entry.isDirectory() ? 'directory' : entry.isFile() ? 'file' : 'other',
        hash: entry.isFile() ? sha256(fullPath) : null,
      });
      if (entry.isDirectory()) visit(fullPath);
    }
  };
  visit(rootPath);
  return results;
}

function runScript(scriptPath, operation, homeDir, sourceCommit = SOURCE_COMMIT, options = {}) {
  const args = [
    scriptPath,
    operation,
    '--home',
    homeDir,
    '--source-commit',
    sourceCommit,
    ...(options.extraArgs || []),
  ];
  const result = spawnSync(process.execPath, args, {
    cwd: options.cwd || REPO_ROOT,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 10000,
  });

  return {
    code: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    json: result.stdout ? JSON.parse(result.stdout) : null,
    errorJson: result.stderr ? JSON.parse(result.stderr) : null,
  };
}

function run(operation, homeDir, extraArgs = [], env = {}) {
  return runScript(SCRIPT, operation, homeDir, SOURCE_COMMIT, { extraArgs, env });
}

function git(repoRoot, args) {
  return execFileSync('git', ['-C', repoRoot, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function createSourceRepo(containerDir) {
  const repoRoot = path.join(containerDir, 'source-repo');
  fs.mkdirSync(path.join(repoRoot, 'scripts'), { recursive: true });
  fs.copyFileSync(SCRIPT, path.join(repoRoot, 'scripts', 'ecc-lite.js'));
  fs.writeFileSync(
    path.join(repoRoot, 'package.json'),
    `${JSON.stringify({ name: 'ecc-lite-source-fixture', version: '1.2.3' }, null, 2)}\n`,
    'utf8'
  );
  for (const skill of EXPECTED_SKILLS) {
    const skillDir = path.join(repoRoot, 'skills', skill);
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `# ${skill}\n`, 'utf8');
  }
  git(repoRoot, ['init', '--quiet']);
  git(repoRoot, ['config', 'user.email', 'ecc-lite-test@example.invalid']);
  git(repoRoot, ['config', 'user.name', 'ECC Lite Test']);
  git(repoRoot, ['add', '--', 'package.json', 'skills']);
  git(repoRoot, ['commit', '--quiet', '-m', 'fixture source']);
  return {
    repoRoot,
    scriptPath: path.join(repoRoot, 'scripts', 'ecc-lite.js'),
    commit: git(repoRoot, ['rev-parse', '--verify', 'HEAD^{commit}']),
  };
}

function installExpectedFiles(homeDir) {
  for (const skill of EXPECTED_SKILLS) {
    const destinationDir = path.join(homeDir, '.agents', 'skills', skill);
    fs.mkdirSync(destinationDir, { recursive: true });
    fs.copyFileSync(
      path.join(REPO_ROOT, 'skills', skill, 'SKILL.md'),
      path.join(destinationDir, 'SKILL.md')
    );
  }
}

function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (error) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${error.stack || error.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing ecc-lite.js ===\n');
  let passed = 0;
  let failed = 0;

  const cases = [
    ['preview inventories exactly two unchanged skill files', () => {
      const homeDir = createTempDir('ecc-lite-preview-');
      try {
        const before = walk(homeDir);
        const result = run('preview', homeDir);
        assert.strictEqual(result.code, 0, result.stderr);
        assert.strictEqual(result.stderr, '');
        assert.deepStrictEqual(walk(homeDir), before, 'preview mutated the supplied home');

        const report = result.json;
        assert.strictEqual(report.schemaVersion, 1);
        assert.strictEqual(report.operation, 'preview');
        assert.strictEqual(report.readOnly, true);
        assert.strictEqual(report.status, 'ready');
        assert.deepStrictEqual(report.profile, {
          id: 'entrepreneur-codex',
          target: 'codex',
          delivery: 'assisted-manual',
          skills: EXPECTED_SKILLS,
        });
        assert.strictEqual(report.source.repoCommit, SOURCE_COMMIT);
        assert.strictEqual(report.source.repoVersion, '2.0.0');
        assert.deepStrictEqual(
          report.source.files.map(file => file.relativePath),
          EXPECTED_SKILLS.map(skill => `skills/${skill}/SKILL.md`)
        );
        for (const file of report.source.files) {
          assert.match(file.sha256, /^[0-9a-f]{64}$/);
          assert.strictEqual(file.sizeBytes > 0, true);
          assert.strictEqual(
            file.sha256,
            sha256(path.join(REPO_ROOT, ...file.relativePath.split('/')))
          );
        }
      } finally {
        cleanup(homeDir);
      }
    }],

    ['preview emits deterministic manual copy, verify, and removal guidance', () => {
      const homeDir = createTempDir('ecc-lite-guidance-');
      try {
        const first = run('preview', homeDir);
        const second = run('preview', homeDir);
        assert.strictEqual(first.code, 0, first.stderr);
        assert.strictEqual(second.code, 0, second.stderr);
        assert.strictEqual(first.stdout, second.stdout);

        const report = first.json;
        assert.strictEqual(report.collisions.length, 0);
        assert.strictEqual(report.manualCopySteps.length, 4);
        assert.deepStrictEqual(
          report.manualCopySteps.map(step => step.action),
          ['create_directory', 'copy_file', 'create_directory', 'copy_file']
        );
        assert.deepStrictEqual(
          report.verification.command,
          [process.execPath, SCRIPT, 'verify', '--home', homeDir,
            '--source-commit', SOURCE_COMMIT]
        );
        assert.strictEqual(report.manualRemoval.instructions.length, 4);
        assert.deepStrictEqual(
          report.manualRemoval.instructions.map(step => step.action),
          ['remove_file_if_single_link_and_hash_matches', 'remove_empty_directory',
            'remove_file_if_single_link_and_hash_matches', 'remove_empty_directory']
        );
        assert.ok(report.manualRemoval.instructions.every(step => step.path));
        assert.ok(report.manualRemoval.instructions
          .filter(step => step.action === 'remove_file_if_single_link_and_hash_matches')
          .every(step => step.requiredLinkCount === 1
            && /^[0-9a-f]{64}$/.test(step.requiredSha256)));
      } finally {
        cleanup(homeDir);
      }
    }],

    ['preview reports an existing destination as a collision without adopting it', () => {
      const homeDir = createTempDir('ecc-lite-collision-');
      try {
        installExpectedFiles(homeDir);
        const before = walk(homeDir);
        const result = run('preview', homeDir);
        assert.strictEqual(result.code, 2);
        assert.strictEqual(result.json.status, 'blocked');
        assert.strictEqual(result.json.manualCopySteps.length, 0);
        assert.deepStrictEqual(
          result.json.collisions.map(collision => collision.skill),
          EXPECTED_SKILLS
        );
        assert.ok(result.json.collisions.every(collision => collision.kind === 'existing_directory'));
        assert.deepStrictEqual(walk(homeDir), before);
      } finally {
        cleanup(homeDir);
      }
    }],

    ['verify reports both files missing without creating parent directories', () => {
      const parentDir = createTempDir('ecc-lite-missing-parent-');
      const homeDir = path.join(parentDir, 'not-created-home');
      try {
        const result = run('verify', homeDir);
        assert.strictEqual(result.code, 2);
        assert.strictEqual(result.json.status, 'missing');
        assert.deepStrictEqual(
          result.json.verification.files.map(file => file.state),
          ['missing', 'missing']
        );
        assert.strictEqual(fs.existsSync(homeDir), false);
      } finally {
        cleanup(parentDir);
      }
    }],

    ['verify reports an exact manual copy as matching', () => {
      const homeDir = createTempDir('ecc-lite-matching-');
      try {
        installExpectedFiles(homeDir);
        const before = walk(homeDir);
        const result = run('verify', homeDir);
        assert.strictEqual(result.code, 0, result.stderr);
        assert.strictEqual(result.json.status, 'matching');
        assert.deepStrictEqual(
          result.json.verification.files.map(file => file.state),
          ['matching', 'matching']
        );
        assert.deepStrictEqual(result.json.verification.unexpectedEntries, []);
        assert.deepStrictEqual(walk(homeDir), before);
      } finally {
        cleanup(homeDir);
      }
    }],

    ['verify reports changed, missing, and unexpected content as drifted', () => {
      const homeDir = createTempDir('ecc-lite-drifted-');
      try {
        installExpectedFiles(homeDir);
        fs.writeFileSync(
          path.join(homeDir, '.agents', 'skills', EXPECTED_SKILLS[0], 'SKILL.md'),
          'changed\n',
          'utf8'
        );
        fs.rmSync(path.join(homeDir, '.agents', 'skills', EXPECTED_SKILLS[1], 'SKILL.md'));
        fs.writeFileSync(
          path.join(homeDir, '.agents', 'skills', EXPECTED_SKILLS[1], 'EXTRA.md'),
          'extra\n',
          'utf8'
        );
        const before = walk(homeDir);
        const result = run('verify', homeDir);
        assert.strictEqual(result.code, 2);
        assert.strictEqual(result.json.status, 'drifted');
        assert.deepStrictEqual(
          result.json.verification.files.map(file => file.state),
          ['drifted', 'missing']
        );
        assert.strictEqual(result.json.verification.files[0].reason, 'hash_mismatch');
        assert.deepStrictEqual(
          result.json.verification.unexpectedEntries.map(entry => entry.relativePath),
          [`${EXPECTED_SKILLS[1]}/EXTRA.md`]
        );
        assert.deepStrictEqual(walk(homeDir), before);
      } finally {
        cleanup(homeDir);
      }
    }],

    ['a symbolic-link destination fails closed and is never traversed', () => {
      const containerDir = createTempDir('ecc-lite-link-');
      const homeDir = path.join(containerDir, 'home');
      const outsideDir = path.join(containerDir, 'outside');
      fs.mkdirSync(homeDir);
      fs.mkdirSync(outsideDir);
      for (const skill of EXPECTED_SKILLS) {
        const outsideSkill = path.join(outsideDir, skill);
        fs.mkdirSync(outsideSkill);
        fs.writeFileSync(path.join(outsideSkill, 'SECRET.md'), 'must not be traversed\n', 'utf8');
      }
      const skillsRoot = path.join(homeDir, '.agents', 'skills');
      fs.mkdirSync(path.dirname(skillsRoot), { recursive: true });
      try {
        try {
          fs.symlinkSync(outsideDir, skillsRoot, process.platform === 'win32' ? 'junction' : 'dir');
        } catch (error) {
          if (['EPERM', 'EACCES', 'ENOSYS'].includes(error.code)) return;
          throw error;
        }
        const result = run('preview', homeDir);
        assert.strictEqual(result.code, 2);
        assert.strictEqual(result.json.status, 'blocked');
        assert.ok(result.json.collisions.every(collision => collision.kind === 'unsafe_ancestor'));
        assert.strictEqual(result.stdout.includes('SECRET.md'), false);

        const verification = run('verify', homeDir);
        assert.strictEqual(verification.code, 2);
        assert.strictEqual(verification.json.status, 'drifted');
        assert.deepStrictEqual(verification.json.verification.unexpectedEntries, []);
        assert.strictEqual(verification.stdout.includes('SECRET.md'), false);
      } finally {
        cleanup(containerDir);
      }
    }],

    ['the explicit home is required and inherited HOME is ignored', () => {
      const inheritedHome = createTempDir('ecc-lite-inherited-home-');
      try {
        const missing = spawnSync(process.execPath, [
          SCRIPT,
          'preview',
          '--source-commit',
          SOURCE_COMMIT,
        ], {
          cwd: REPO_ROOT,
          env: { ...process.env, HOME: inheritedHome },
          encoding: 'utf8',
        });
        assert.strictEqual(missing.status, 1);
        const error = JSON.parse(missing.stderr);
        assert.strictEqual(error.error.code, 'INVALID_ARGUMENT');
        assert.deepStrictEqual(walk(inheritedHome), []);
      } finally {
        cleanup(inheritedHome);
      }
    }],

    ['relative, traversal, root, and malformed path inputs fail closed', () => {
      const invalidHomes = [
        'relative-home',
        `${path.join(os.tmpdir(), 'safe')}${path.sep}..${path.sep}escaped`,
        path.parse(os.tmpdir()).root,
      ];
      for (const homeDir of invalidHomes) {
        const result = run('preview', homeDir);
        assert.strictEqual(result.code, 1, `${homeDir}: ${result.stdout} ${result.stderr}`);
        assert.strictEqual(result.errorJson.error.code, 'INVALID_HOME');
      }
    }],

    ['invalid commits, duplicate options, and unknown operations fail closed', () => {
      const homeDir = createTempDir('ecc-lite-invalid-args-');
      try {
        const invalidCommit = spawnSync(process.execPath, [
          SCRIPT, 'preview', '--home', homeDir, '--source-commit', 'not-a-commit',
        ], { cwd: REPO_ROOT, encoding: 'utf8' });
        assert.strictEqual(invalidCommit.status, 1);
        assert.strictEqual(JSON.parse(invalidCommit.stderr).error.code, 'INVALID_SOURCE_COMMIT');

        const duplicate = run('preview', homeDir, ['--home', homeDir]);
        assert.strictEqual(duplicate.code, 1);
        assert.strictEqual(duplicate.errorJson.error.code, 'DUPLICATE_ARGUMENT');

        const unknown = run('install', homeDir);
        assert.strictEqual(unknown.code, 1);
        assert.strictEqual(unknown.errorJson.error.code, 'INVALID_OPERATION');
        assert.deepStrictEqual(walk(homeDir), []);
      } finally {
        cleanup(homeDir);
      }
    }],

    ['preview and verify never create install state or generic lifecycle artifacts', () => {
      const homeDir = createTempDir('ecc-lite-no-state-');
      try {
        assert.strictEqual(run('preview', homeDir).code, 0);
        assert.strictEqual(run('verify', homeDir).code, 2);
        assert.strictEqual(fs.existsSync(path.join(homeDir, '.codex')), false);
        assert.strictEqual(fs.existsSync(path.join(homeDir, '.agents')), false);
      } finally {
        cleanup(homeDir);
      }
    }],

    ['source receipt binds actual HEAD and refuses tracked or untracked source drift', () => {
      const packageContainer = createTempDir('ecc-lite-dirty-package-');
      const firstContainer = createTempDir('ecc-lite-dirty-source-');
      const secondContainer = createTempDir('ecc-lite-untracked-source-');
      try {
        const packageFixture = createSourceRepo(packageContainer);
        fs.writeFileSync(
          path.join(packageFixture.repoRoot, 'package.json'),
          `${JSON.stringify({ name: 'changed', version: '9.9.9' })}\n`,
          'utf8'
        );
        const packageResult = runScript(
          packageFixture.scriptPath,
          'preview',
          path.join(packageContainer, 'home'),
          packageFixture.commit,
          { cwd: packageContainer }
        );
        assert.strictEqual(packageResult.code, 1);
        assert.strictEqual(packageResult.errorJson.error.code, 'SOURCE_NOT_AT_HEAD');

        const tracked = createSourceRepo(firstContainer);
        const trackedHome = path.join(firstContainer, 'home');
        fs.writeFileSync(
          path.join(tracked.repoRoot, 'skills', EXPECTED_SKILLS[0], 'SKILL.md'),
          '# changed after commit\n',
          'utf8'
        );
        const trackedResult = runScript(
          tracked.scriptPath,
          'preview',
          trackedHome,
          tracked.commit,
          { cwd: firstContainer }
        );
        assert.strictEqual(trackedResult.code, 1);
        assert.strictEqual(trackedResult.errorJson.error.code, 'SOURCE_NOT_AT_HEAD');

        const untracked = createSourceRepo(secondContainer);
        const untrackedHome = path.join(secondContainer, 'home');
        fs.writeFileSync(
          path.join(untracked.repoRoot, 'skills', EXPECTED_SKILLS[1], 'UNTRACKED.md'),
          'not in HEAD\n',
          'utf8'
        );
        const untrackedResult = runScript(
          untracked.scriptPath,
          'preview',
          untrackedHome,
          untracked.commit,
          { cwd: secondContainer }
        );
        assert.strictEqual(untrackedResult.code, 1);
        assert.strictEqual(untrackedResult.errorJson.error.code, 'SOURCE_NOT_AT_HEAD');

        const wrongCommit = 'f'.repeat(40) === SOURCE_COMMIT ? 'e'.repeat(40) : 'f'.repeat(40);
        const mismatch = runScript(SCRIPT, 'preview', trackedHome, wrongCommit);
        assert.strictEqual(mismatch.code, 1);
        assert.strictEqual(mismatch.errorJson.error.code, 'SOURCE_COMMIT_MISMATCH');
      } finally {
        cleanup(packageContainer);
        cleanup(firstContainer);
        cleanup(secondContainer);
      }
    }],

    ['source files with more than one hard link fail closed', () => {
      const containerDir = createTempDir('ecc-lite-source-hardlink-');
      try {
        const fixture = createSourceRepo(containerDir);
        const sourcePath = path.join(
          fixture.repoRoot,
          'skills',
          EXPECTED_SKILLS[0],
          'SKILL.md'
        );
        fs.linkSync(sourcePath, path.join(containerDir, 'outside-hardlink.md'));
        const result = runScript(
          fixture.scriptPath,
          'preview',
          path.join(containerDir, 'home'),
          fixture.commit,
          { cwd: containerDir }
        );
        assert.strictEqual(result.code, 1);
        assert.strictEqual(result.errorJson.error.code, 'UNSAFE_SOURCE_LINK_COUNT');
      } finally {
        cleanup(containerDir);
      }
    }],

    ['staged source drift cannot be hidden by restoring HEAD bytes in the worktree', () => {
      const containerDir = createTempDir('ecc-lite-hidden-index-drift-');
      try {
        const fixture = createSourceRepo(containerDir);
        const relativePath = `skills/${EXPECTED_SKILLS[0]}/SKILL.md`;
        const sourcePath = path.join(fixture.repoRoot, ...relativePath.split('/'));
        const headBytes = fs.readFileSync(sourcePath);
        fs.writeFileSync(sourcePath, '# staged bytes that differ from HEAD\n', 'utf8');
        git(fixture.repoRoot, ['add', '--', relativePath]);
        fs.writeFileSync(sourcePath, headBytes);

        assert.strictEqual(
          git(fixture.repoRoot, ['status', '--porcelain=v1', '--', relativePath]),
          `MM ${relativePath}`
        );
        const result = runScript(
          fixture.scriptPath,
          'preview',
          path.join(containerDir, 'home'),
          fixture.commit,
          { cwd: containerDir }
        );
        assert.strictEqual(result.code, 1);
        assert.strictEqual(result.errorJson.error.code, 'SOURCE_NOT_AT_HEAD');
      } finally {
        cleanup(containerDir);
      }
    }],

    ['a matching destination with more than one hard link is drifted', () => {
      const homeDir = createTempDir('ecc-lite-destination-hardlink-');
      try {
        installExpectedFiles(homeDir);
        const installedPath = path.join(
          homeDir,
          '.agents',
          'skills',
          EXPECTED_SKILLS[0],
          'SKILL.md'
        );
        fs.linkSync(installedPath, path.join(homeDir, 'outside-hardlink.md'));
        const result = run('verify', homeDir);
        assert.strictEqual(result.code, 2);
        assert.strictEqual(result.json.status, 'drifted');
        assert.strictEqual(result.json.verification.files[0].state, 'drifted');
        assert.strictEqual(result.json.verification.files[0].reason, 'multiple_hard_links');
        assert.strictEqual(result.json.verification.files[0].linkCount, 2);
        const removal = result.json.manualRemoval.instructions.find(step =>
          step.path === installedPath
        );
        assert.strictEqual(removal.requiredLinkCount, 1);
        assert.strictEqual(removal.onMismatch, 'stop_and_review');
      } finally {
        cleanup(homeDir);
      }
    }],

    ['verification command replays the exact helper from an arbitrary cwd', () => {
      const containerDir = createTempDir('ecc-lite-replay-');
      const homeDir = path.join(containerDir, 'home');
      const unrelatedCwd = path.join(containerDir, 'unrelated-cwd');
      fs.mkdirSync(homeDir);
      fs.mkdirSync(unrelatedCwd);
      try {
        const preview = run('preview', homeDir);
        assert.strictEqual(preview.code, 0, preview.stderr);
        const command = preview.json.verification.command;
        assert.deepStrictEqual(command, [
          process.execPath,
          SCRIPT,
          'verify',
          '--home',
          homeDir,
          '--source-commit',
          SOURCE_COMMIT,
        ]);
        assert.strictEqual(path.isAbsolute(command[0]), true);
        assert.strictEqual(path.isAbsolute(command[1]), true);

        const replay = spawnSync(command[0], command.slice(1), {
          cwd: unrelatedCwd,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        assert.strictEqual(replay.status, 2, replay.stderr);
        const verification = JSON.parse(replay.stdout);
        assert.strictEqual(verification.operation, 'verify');
        assert.strictEqual(verification.status, 'missing');
        assert.strictEqual(verification.source.repoCommit, SOURCE_COMMIT);
      } finally {
        cleanup(containerDir);
      }
    }],

    ['linked skill roots and non-regular destination files fail closed', () => {
      const previewContainer = createTempDir('ecc-lite-linked-skill-root-');
      const verifyContainer = createTempDir('ecc-lite-linked-destination-');
      try {
        const previewHome = path.join(previewContainer, 'home');
        const outsideSkill = path.join(previewContainer, 'outside-skill');
        fs.mkdirSync(outsideSkill);
        const linkedSkillRoot = path.join(
          previewHome,
          '.agents',
          'skills',
          EXPECTED_SKILLS[0]
        );
        fs.mkdirSync(path.dirname(linkedSkillRoot), { recursive: true });
        fs.symlinkSync(
          outsideSkill,
          linkedSkillRoot,
          process.platform === 'win32' ? 'junction' : 'dir'
        );
        const preview = run('preview', previewHome);
        assert.strictEqual(preview.code, 2);
        const linkedCollision = preview.json.collisions.find(collision =>
          collision.skill === EXPECTED_SKILLS[0]
        );
        assert.strictEqual(linkedCollision.kind, 'symbolic_link');

        const verifyHome = path.join(verifyContainer, 'home');
        const firstSkillRoot = path.join(
          verifyHome,
          '.agents',
          'skills',
          EXPECTED_SKILLS[0]
        );
        const secondSkillRoot = path.join(
          verifyHome,
          '.agents',
          'skills',
          EXPECTED_SKILLS[1]
        );
        const outsideDestination = path.join(verifyContainer, 'outside-destination');
        fs.mkdirSync(firstSkillRoot, { recursive: true });
        fs.mkdirSync(secondSkillRoot, { recursive: true });
        fs.mkdirSync(outsideDestination);
        fs.symlinkSync(
          outsideDestination,
          path.join(firstSkillRoot, 'SKILL.md'),
          process.platform === 'win32' ? 'junction' : 'dir'
        );
        fs.mkdirSync(path.join(secondSkillRoot, 'SKILL.md'));

        const verification = run('verify', verifyHome);
        assert.strictEqual(verification.code, 2);
        assert.strictEqual(verification.json.status, 'drifted');
        assert.deepStrictEqual(
          verification.json.verification.files.map(file => file.reason),
          ['symbolic_link', 'not_regular_file']
        );
      } finally {
        cleanup(previewContainer);
        cleanup(verifyContainer);
      }
    }],
  ];

  for (const [name, fn] of cases) {
    if (test(name, fn)) passed += 1;
    else failed += 1;
  }

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
