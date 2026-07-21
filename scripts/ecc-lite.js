#!/usr/bin/env node

/**
 * Read-only preview and verification for the assisted/manual ECC Lite profile.
 *
 * This helper never installs, copies, deletes, repairs, or records state. Its
 * output is a deterministic JSON receipt and a set of operator-performed steps.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const PROFILE_ID = 'entrepreneur-codex';
const SKILLS = Object.freeze([
  'agent-introspection-debugging',
  'intent-driven-development',
]);
const SOURCE_PATHS = Object.freeze([
  'package.json',
  ...SKILLS.map(skill => `skills/${skill}`),
]);
const OPERATIONS = Object.freeze(['preview', 'verify']);
const SHA1_PATTERN = /^[0-9a-f]{40}$/;
const GIT_TIMEOUT_MS = 10000;
const GIT_MAX_BUFFER = 4 * 1024 * 1024;

class EccLiteError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'EccLiteError';
    this.code = code;
  }
}

function fail(code, message) {
  throw new EccLiteError(code, message);
}

function normalizeForReport(value) {
  return value.split(path.sep).join('/');
}

function pathKey(value) {
  const resolved = path.resolve(value);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function isContained(rootPath, candidatePath) {
  const rootKey = pathKey(rootPath);
  const candidateKey = pathKey(candidatePath);
  return candidateKey === rootKey || candidateKey.startsWith(`${rootKey}${path.sep}`);
}

function safeJoin(rootPath, ...segments) {
  const candidate = path.resolve(rootPath, ...segments);
  if (!isContained(rootPath, candidate) || pathKey(candidate) === pathKey(rootPath)) {
    fail('UNSAFE_PATH', 'A derived path escaped or replaced its approved root.');
  }
  return candidate;
}

function lstatIfPresent(filePath) {
  try {
    return fs.lstatSync(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function gitEnvironment() {
  return Object.fromEntries(Object.entries(process.env)
    .filter(([name]) => !name.toUpperCase().startsWith('GIT_')));
}

function runGit(repoRoot, args) {
  const result = spawnSync(
    'git',
    ['--no-optional-locks', '-C', repoRoot, ...args],
    {
      cwd: repoRoot,
      env: gitEnvironment(),
      encoding: null,
      shell: false,
      windowsHide: true,
      timeout: GIT_TIMEOUT_MS,
      maxBuffer: GIT_MAX_BUFFER,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  if (result.error || result.signal || result.status !== 0 || !Buffer.isBuffer(result.stdout)) {
    fail('GIT_INSPECTION_FAILED', 'Read-only Git source inspection failed.');
  }
  return result.stdout;
}

function deriveHeadCommit(repoRoot) {
  const output = runGit(repoRoot, ['rev-parse', '--verify', 'HEAD^{commit}'])
    .toString('utf8')
    .trim();
  if (!SHA1_PATTERN.test(output)) {
    fail('GIT_INSPECTION_FAILED', 'Git returned an invalid HEAD commit.');
  }
  return output;
}

function validateHome(rawHome) {
  if (typeof rawHome !== 'string' || rawHome.length === 0) {
    fail('INVALID_ARGUMENT', '--home is required and must have a value.');
  }
  if (rawHome.includes('\0') || !path.isAbsolute(rawHome)) {
    fail('INVALID_HOME', '--home must be a valid absolute path.');
  }

  const parts = rawHome.split(/[\\/]+/);
  if (parts.includes('.') || parts.includes('..')) {
    fail('INVALID_HOME', '--home must not contain dot or traversal segments.');
  }

  const resolved = path.resolve(rawHome);
  if (pathKey(resolved) === pathKey(path.parse(resolved).root)) {
    fail('INVALID_HOME', '--home must not be a filesystem root.');
  }
  return resolved;
}

function parseArgs(argv) {
  const [operation, ...args] = argv;
  if (!OPERATIONS.includes(operation)) {
    fail('INVALID_OPERATION', 'Operation must be exactly preview or verify.');
  }

  let values = {};
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    const value = args[index + 1];
    if (!['--home', '--source-commit'].includes(name)) {
      fail('UNKNOWN_ARGUMENT', `Unknown argument: ${name || '(missing)'}.`);
    }
    if (Object.prototype.hasOwnProperty.call(values, name)) {
      fail('DUPLICATE_ARGUMENT', `Argument may appear only once: ${name}.`);
    }
    if (typeof value !== 'string' || value.length === 0 || value.startsWith('--')) {
      fail('INVALID_ARGUMENT', `${name} requires a value.`);
    }
    values = { ...values, [name]: value };
  }

  const home = validateHome(values['--home']);
  const sourceCommit = values['--source-commit'];
  if (typeof sourceCommit !== 'string' || !SHA1_PATTERN.test(sourceCommit)) {
    fail(
      'INVALID_SOURCE_COMMIT',
      '--source-commit must be the exact lowercase 40-character repository commit.'
    );
  }

  return Object.freeze({ operation, home, sourceCommit });
}

function inspectExistingChain(candidatePath, approvedRoot, includeCandidate = true) {
  if (!isContained(approvedRoot, candidatePath)) {
    return Object.freeze({ path: candidatePath, reason: 'outside_approved_root' });
  }

  const relative = path.relative(approvedRoot, candidatePath);
  const segments = relative.split(path.sep).filter(Boolean);
  const inspectedSegments = includeCandidate ? segments : segments.slice(0, -1);

  let current = approvedRoot;
  const rootStats = lstatIfPresent(current);
  if (rootStats?.isSymbolicLink()) {
    return Object.freeze({ path: current, reason: 'symbolic_link' });
  }
  if (rootStats && !rootStats.isDirectory()) {
    return Object.freeze({ path: current, reason: 'non_directory_ancestor' });
  }
  if (!rootStats) return null;

  for (const segment of inspectedSegments) {
    current = path.join(current, segment);
    const stats = lstatIfPresent(current);
    if (!stats) return null;
    if (stats.isSymbolicLink()) {
      return Object.freeze({ path: current, reason: 'symbolic_link' });
    }
    if (!stats.isDirectory()) {
      return Object.freeze({ path: current, reason: 'non_directory_ancestor' });
    }
  }
  return null;
}

function readRegularFile(filePath, approvedRoot, options = {}) {
  if (!isContained(approvedRoot, filePath)) {
    fail('UNSAFE_SOURCE', 'A source file escaped the repository root.');
  }
  const ancestorIssue = inspectExistingChain(filePath, approvedRoot, false);
  if (ancestorIssue) {
    fail('UNSAFE_SOURCE', 'A source ancestor is not a real directory.');
  }

  const before = lstatIfPresent(filePath);
  if (!before || !before.isFile() || before.isSymbolicLink()) {
    fail('UNSAFE_SOURCE', 'Every source entry must be an existing regular file.');
  }

  const descriptor = fs.openSync(filePath, fs.constants.O_RDONLY);
  try {
    const opened = fs.fstatSync(descriptor);
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino) {
      fail('SOURCE_CHANGED', 'A source file changed identity while it was inspected.');
    }
    if (options.requireSingleLink && opened.nlink !== 1) {
      fail('UNSAFE_SOURCE_LINK_COUNT', 'Every source file must have exactly one hard link.');
    }
    const content = fs.readFileSync(descriptor);
    const after = fs.fstatSync(descriptor);
    if (after.size !== opened.size
      || after.mtimeMs !== opened.mtimeMs
      || after.nlink !== opened.nlink) {
      fail('SOURCE_CHANGED', 'A source file changed while it was inspected.');
    }
    return Object.freeze({
      content,
      sizeBytes: content.length,
      sha256: crypto.createHash('sha256').update(content).digest('hex'),
      linkCount: opened.nlink,
    });
  } finally {
    fs.closeSync(descriptor);
  }
}

function listSourceFiles(directoryPath, approvedRoot) {
  const issue = inspectExistingChain(directoryPath, approvedRoot);
  if (issue) fail('UNSAFE_SOURCE', 'A skill source directory is unsafe.');
  const stats = lstatIfPresent(directoryPath);
  if (!stats || !stats.isDirectory() || stats.isSymbolicLink()) {
    fail('UNSAFE_SOURCE', 'A skill source must be an existing real directory.');
  }

  return fs.readdirSync(directoryPath, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap(entry => {
      const entryPath = safeJoin(directoryPath, entry.name);
      if (entry.isSymbolicLink()) {
        fail('UNSAFE_SOURCE', 'Symbolic links are not allowed in an ECC Lite skill source.');
      }
      if (entry.isDirectory()) return listSourceFiles(entryPath, approvedRoot);
      if (!entry.isFile()) {
        fail('UNSAFE_SOURCE', 'Special filesystem objects are not allowed in a skill source.');
      }
      const file = readRegularFile(entryPath, approvedRoot, { requireSingleLink: true });
      return [Object.freeze({ path: entryPath, ...file })];
    });
}

function parseGitTree(output) {
  return output.toString('utf8').split('\0').filter(Boolean).map(record => {
    const match = record.match(/^([0-7]{6}) ([a-z]+) ([0-9a-f]{40})\t(.+)$/s);
    if (!match) fail('GIT_INSPECTION_FAILED', 'Git returned an invalid source-tree record.');
    return Object.freeze({
      mode: match[1],
      type: match[2],
      objectId: match[3],
      relativePath: normalizeForReport(match[4]),
    });
  }).sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function assertRelevantSourceClean(repoRoot, commit) {
  const checks = [
    ['diff-index', '--cached', '--name-only', '-z', commit, '--', ...SOURCE_PATHS],
    ['diff-files', '--name-only', '-z', '--', ...SOURCE_PATHS],
    ['diff', '--name-only', '-z', commit, '--', ...SOURCE_PATHS],
    ['ls-files', '--others', '--exclude-standard', '-z', '--', ...SOURCE_PATHS],
    ['ls-files', '--others', '--ignored', '--exclude-standard', '-z', '--', ...SOURCE_PATHS],
  ];
  if (checks.some(args => runGit(repoRoot, args).length > 0)) {
    fail(
      'SOURCE_NOT_AT_HEAD',
      'Relevant index, worktree, or untracked source content differs from exact HEAD.'
    );
  }
}

function bindSourceToHead(repoRoot, expectedCommit, workingFiles) {
  const actualCommit = deriveHeadCommit(repoRoot);
  if (expectedCommit !== actualCommit) {
    fail('SOURCE_COMMIT_MISMATCH', '--source-commit does not equal this checkout\'s HEAD.');
  }
  assertRelevantSourceClean(repoRoot, actualCommit);

  const records = parseGitTree(runGit(repoRoot, [
    'ls-tree',
    '-r',
    '-z',
    '--full-tree',
    actualCommit,
    '--',
    ...SOURCE_PATHS,
  ]));
  const expectedPaths = workingFiles
    .map(file => file.relativePath)
    .sort((left, right) => left.localeCompare(right));
  const trackedPaths = records.map(record => record.relativePath);
  if (JSON.stringify(expectedPaths) !== JSON.stringify(trackedPaths)) {
    fail('SOURCE_NOT_AT_HEAD', 'Relevant source paths differ from the exact HEAD tree.');
  }

  const recordsByPath = new Map(records.map(record => [record.relativePath, record]));
  for (const file of workingFiles) {
    const record = recordsByPath.get(file.relativePath);
    if (!record || record.type !== 'blob' || !['100644', '100755'].includes(record.mode)) {
      fail('SOURCE_NOT_AT_HEAD', 'A relevant source is not a tracked regular file at HEAD.');
    }
    const committedContent = runGit(repoRoot, ['cat-file', 'blob', record.objectId]);
    if (!committedContent.equals(file.content)) {
      fail('SOURCE_NOT_AT_HEAD', 'Relevant source bytes differ from the exact HEAD tree.');
    }
  }
  return actualCommit;
}

function inventorySource(sourceCommit) {
  const packagePath = safeJoin(REPO_ROOT, 'package.json');
  const packageFile = readRegularFile(
    packagePath,
    REPO_ROOT,
    { requireSingleLink: true }
  );
  let repoVersion;
  try {
    repoVersion = JSON.parse(packageFile.content.toString('utf8')).version;
  } catch {
    fail('INVALID_SOURCE', 'package.json must contain valid JSON.');
  }
  if (typeof repoVersion !== 'string' || repoVersion.length === 0) {
    fail('INVALID_SOURCE', 'package.json must declare a non-empty version.');
  }

  const workingSkillFiles = SKILLS.flatMap(skill => {
    const sourceDir = safeJoin(REPO_ROOT, 'skills', skill);
    return listSourceFiles(sourceDir, REPO_ROOT).map(file => Object.freeze({
      skill,
      relativePath: normalizeForReport(path.relative(REPO_ROOT, file.path)),
      sourcePath: file.path,
      sizeBytes: file.sizeBytes,
      sha256: file.sha256,
      content: file.content,
    }));
  }).sort((left, right) => left.relativePath.localeCompare(right.relativePath));

  if (workingSkillFiles.length === 0
    || SKILLS.some(skill => !workingSkillFiles.some(file => file.skill === skill))) {
    fail('INVALID_SOURCE', 'Each accepted ECC Lite skill must contain at least one source file.');
  }
  const actualCommit = bindSourceToHead(REPO_ROOT, sourceCommit, [
    Object.freeze({ relativePath: 'package.json', content: packageFile.content }),
    ...workingSkillFiles,
  ]);
  const files = workingSkillFiles.map(file => Object.freeze({
    skill: file.skill,
    relativePath: file.relativePath,
    sourcePath: file.sourcePath,
    sizeBytes: file.sizeBytes,
    sha256: file.sha256,
  }));

  return Object.freeze({
    repoRoot: REPO_ROOT,
    repoVersion,
    repoCommit: actualCommit,
    commitProvenance: 'derived-head-byte-bound',
    files,
  });
}

function destinationFor(home, sourceFile) {
  const skillsRoot = safeJoin(home, '.agents', 'skills');
  const relativeWithinSkill = path.relative(
    path.join(REPO_ROOT, 'skills', sourceFile.skill),
    sourceFile.sourcePath
  );
  const skillRoot = safeJoin(skillsRoot, sourceFile.skill);
  const destinationPath = safeJoin(skillRoot, relativeWithinSkill);
  return Object.freeze({ skillsRoot, skillRoot, destinationPath });
}

function classifyCollision(skillRoot, approvedRoot) {
  const ancestorIssue = inspectExistingChain(skillRoot, approvedRoot, false);
  if (ancestorIssue) {
    return Object.freeze({
      kind: 'unsafe_ancestor',
      path: ancestorIssue.path,
      reason: ancestorIssue.reason,
    });
  }
  const stats = lstatIfPresent(skillRoot);
  if (!stats) return null;
  if (stats.isSymbolicLink()) {
    return Object.freeze({ kind: 'symbolic_link', path: skillRoot });
  }
  return Object.freeze({
    kind: stats.isDirectory() ? 'existing_directory' : 'existing_non_directory',
    path: skillRoot,
  });
}

function buildManualCopySteps(source, home) {
  return SKILLS.flatMap(skill => {
    const skillFiles = source.files.filter(file => file.skill === skill);
    const directories = [...new Set(skillFiles.map(file =>
      path.dirname(destinationFor(home, file).destinationPath)
    ))].sort((left, right) => left.localeCompare(right));
    const directorySteps = directories.map(directoryPath => Object.freeze({
      action: 'create_directory',
      path: directoryPath,
      recursive: true,
    }));
    const copySteps = skillFiles.map(file => Object.freeze({
      action: 'copy_file',
      source: file.sourcePath,
      destination: destinationFor(home, file).destinationPath,
      requiredSha256: file.sha256,
      overwrite: false,
    }));
    return directorySteps.concat(copySteps);
  }).map((step, index) => Object.freeze({ sequence: index + 1, ...step }));
}

function buildRemovalGuidance(source, home) {
  const instructions = SKILLS.flatMap(skill => {
    const skillFiles = source.files.filter(file => file.skill === skill);
    const fileSteps = skillFiles
      .slice()
      .sort((left, right) => right.relativePath.localeCompare(left.relativePath))
      .map(file => Object.freeze({
        action: 'remove_file_if_single_link_and_hash_matches',
        path: destinationFor(home, file).destinationPath,
        requiredLinkCount: 1,
        requiredSha256: file.sha256,
        onMismatch: 'stop_and_review',
      }));
    const directories = [...new Set(skillFiles.map(file =>
      path.dirname(destinationFor(home, file).destinationPath)
    ))].sort((left, right) => right.length - left.length || right.localeCompare(left));
    const directorySteps = directories.map(directoryPath => Object.freeze({
      action: 'remove_empty_directory',
      path: directoryPath,
      onNotEmpty: 'preserve_and_review',
    }));
    return fileSteps.concat(directorySteps);
  }).map((step, index) => Object.freeze({ sequence: index + 1, ...step }));

  return Object.freeze({
    automaticRemoval: false,
    precondition: 'Run verify and proceed only for files reported matching.',
    instructions,
  });
}

function baseReport(operation, home, source) {
  const skillsRoot = safeJoin(home, '.agents', 'skills');
  return Object.freeze({
    schemaVersion: 1,
    operation,
    readOnly: true,
    profile: Object.freeze({
      id: PROFILE_ID,
      target: 'codex',
      delivery: 'assisted-manual',
      skills: SKILLS,
    }),
    source,
    destination: Object.freeze({ home, skillsRoot }),
    manualRemoval: buildRemovalGuidance(source, home),
  });
}

function preview(home, sourceCommit) {
  const source = inventorySource(sourceCommit);
  const collisions = SKILLS.map(skill => {
    const representative = source.files.find(file => file.skill === skill);
    const skillRoot = destinationFor(home, representative).skillRoot;
    const collision = classifyCollision(skillRoot, home);
    return collision ? Object.freeze({ skill, ...collision }) : null;
  }).filter(Boolean);
  const ready = collisions.length === 0;

  return Object.freeze({
    ...baseReport('preview', home, source),
    status: ready ? 'ready' : 'blocked',
    collisions,
    manualCopySteps: ready ? buildManualCopySteps(source, home) : [],
    verification: Object.freeze({
      command: Object.freeze([
        process.execPath, path.resolve(__filename), 'verify', '--home', home,
        '--source-commit', sourceCommit,
      ]),
      successStatus: 'matching',
    }),
  });
}

function inspectDestinationFile(home, sourceFile) {
  const destination = destinationFor(home, sourceFile);
  const ancestorIssue = inspectExistingChain(destination.destinationPath, home, false);
  const common = {
    skill: sourceFile.skill,
    relativePath: normalizeForReport(path.relative(destination.skillsRoot, destination.destinationPath)),
    path: destination.destinationPath,
    expectedSha256: sourceFile.sha256,
  };
  if (ancestorIssue) {
    return Object.freeze({ ...common, state: 'drifted', reason: ancestorIssue.reason });
  }

  const stats = lstatIfPresent(destination.destinationPath);
  if (!stats) return Object.freeze({ ...common, state: 'missing' });
  if (stats.isSymbolicLink() || !stats.isFile()) {
    return Object.freeze({
      ...common,
      state: 'drifted',
      reason: stats.isSymbolicLink() ? 'symbolic_link' : 'not_regular_file',
    });
  }

  const actual = readRegularFile(destination.destinationPath, destination.skillsRoot);
  if (actual.linkCount !== 1) {
    return Object.freeze({
      ...common,
      state: 'drifted',
      reason: 'multiple_hard_links',
      linkCount: actual.linkCount,
      actualSha256: actual.sha256,
    });
  }
  return Object.freeze({
    ...common,
    state: actual.sha256 === sourceFile.sha256 ? 'matching' : 'drifted',
    ...(actual.sha256 === sourceFile.sha256 ? {} : { reason: 'hash_mismatch' }),
    actualSha256: actual.sha256,
  });
}

function listDestinationEntries(directoryPath, relativeRoot = directoryPath) {
  const stats = lstatIfPresent(directoryPath);
  if (!stats || stats.isSymbolicLink() || !stats.isDirectory()) return [];
  return fs.readdirSync(directoryPath, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap(entry => {
      const entryPath = safeJoin(directoryPath, entry.name);
      const record = Object.freeze({
        path: entryPath,
        relativePath: normalizeForReport(path.relative(relativeRoot, entryPath)),
        type: entry.isSymbolicLink()
          ? 'symbolic_link'
          : entry.isDirectory()
            ? 'directory'
            : entry.isFile() ? 'file' : 'special',
      });
      return entry.isDirectory() && !entry.isSymbolicLink()
        ? [record].concat(listDestinationEntries(entryPath, relativeRoot))
        : [record];
    });
}

function findUnexpectedEntries(home, source) {
  const skillsRoot = safeJoin(home, '.agents', 'skills');
  const expectedFiles = new Set(source.files.map(file =>
    normalizeForReport(path.relative(skillsRoot, destinationFor(home, file).destinationPath))
  ));
  const expectedDirectories = new Set(source.files.flatMap(file => {
    const destination = destinationFor(home, file);
    const relativeFile = path.relative(skillsRoot, destination.destinationPath);
    const segments = relativeFile.split(path.sep).slice(0, -1);
    return segments.map((_, index) => normalizeForReport(segments.slice(0, index + 1).join(path.sep)));
  }));

  return SKILLS.flatMap(skill => {
    const skillRoot = safeJoin(skillsRoot, skill);
    if (inspectExistingChain(skillRoot, home, false)) return [];
    return listDestinationEntries(skillRoot, skillsRoot);
  }).filter(entry => entry.type === 'directory'
    ? !expectedDirectories.has(entry.relativePath)
    : !expectedFiles.has(entry.relativePath));
}

function verify(home, sourceCommit) {
  const source = inventorySource(sourceCommit);
  const files = source.files.map(file => inspectDestinationFile(home, file));
  const unexpectedEntries = findUnexpectedEntries(home, source);
  const hasDrift = files.some(file => file.state === 'drifted') || unexpectedEntries.length > 0;
  const hasMissing = files.some(file => file.state === 'missing');
  const status = hasDrift ? 'drifted' : hasMissing ? 'missing' : 'matching';

  return Object.freeze({
    ...baseReport('verify', home, source),
    status,
    verification: Object.freeze({ files, unexpectedEntries }),
  });
}

function buildReport(options) {
  return options.operation === 'preview'
    ? preview(options.home, options.sourceCommit)
    : verify(options.home, options.sourceCommit);
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const report = buildReport(options);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exitCode = ['ready', 'matching'].includes(report.status) ? 0 : 2;
  } catch (error) {
    const code = error instanceof EccLiteError ? error.code : 'READ_FAILED';
    const message = error instanceof EccLiteError
      ? error.message
      : 'ECC Lite could not complete the read-only inspection.';
    process.stderr.write(`${JSON.stringify({
      readOnly: true,
      error: { code, message },
    }, null, 2)}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = Object.freeze({
  buildReport,
  parseArgs,
});
