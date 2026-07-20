#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const { createManifestInstallPlan } = require('../../scripts/lib/install-executor');
const { resolveInstallPlan } = require('../../scripts/lib/install-manifests');
const {
  copyFileExclusiveWithinTrustedRoot,
} = require('../../scripts/lib/entrepreneur-codex-profile');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`FAIL ${name}: ${error.stack || error.message}`);
    failed += 1;
  }
}

function withTempHome(fn) {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-entrepreneur-profile-'));
  try {
    return fn(homeDir);
  } finally {
    fs.rmSync(homeDir, { recursive: true, force: true });
  }
}

const moduleIds = [
  'skill-intent-driven-development',
  'skill-agent-introspection-debugging',
];

test('resolves the entrepreneur profile to exactly two synthetic skills for Codex', () => {
  const plan = resolveInstallPlan({
    repoRoot,
    profileId: 'entrepreneur-codex',
    target: 'codex',
  });

  assert.deepStrictEqual([...plan.selectedModuleIds].sort(), [...moduleIds].sort());
  assert.deepStrictEqual(plan.skippedModuleIds, []);
});

test('refuses the entrepreneur profile for every non-Codex target', () => {
  for (const target of ['claude', 'cursor', 'gemini', 'opencode']) {
    assert.throws(
      () => resolveInstallPlan({ repoRoot, profileId: 'entrepreneur-codex', target }),
      /only supports.*codex|does not support.*target/i,
    );
  }
});

test('refuses every request modifier that could broaden or narrow the fixed profile', () => {
  const modifiers = [
    { moduleIds: ['security'] },
    { includeComponentIds: ['capability:security'] },
    { excludeComponentIds: ['capability:security'] },
  ];

  for (const modifier of modifiers) {
    assert.throws(
      () => resolveInstallPlan({
        repoRoot,
        profileId: 'entrepreneur-codex',
        target: 'codex',
        ...modifier,
      }),
      /fixed profile|cannot be combined|request modifiers/i,
    );
  }
});

test('maps only the unchanged skill bodies beneath the temporary home managed skill root', () => {
  withTempHome(homeDir => {
    const plan = createManifestInstallPlan({
      sourceRoot: repoRoot,
      homeDir,
      projectRoot: repoRoot,
      profileId: 'entrepreneur-codex',
      target: 'codex',
    });
    const skillsRoot = path.join(homeDir, '.agents', 'skills');

    assert.deepStrictEqual([...plan.selectedModuleIds].sort(), [...moduleIds].sort());
    assert.strictEqual(plan.installStatePath, path.join(homeDir, '.codex', 'ecc-install-state.json'));
    assert.ok(plan.operations.length >= 2);
    assert.ok(plan.operations.every(operation => {
      const relative = path.relative(skillsRoot, operation.destinationPath);
      return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    }));
    assert.deepStrictEqual(
      [...new Set(plan.operations.map(operation => path.relative(skillsRoot, operation.destinationPath).split(path.sep)[0]))].sort(),
      ['agent-introspection-debugging', 'intent-driven-development'],
    );
  });
});

test('does not change generic Codex single-skill destination behavior', () => {
  withTempHome(homeDir => {
    const plan = createManifestInstallPlan({
      sourceRoot: repoRoot,
      homeDir,
      projectRoot: repoRoot,
      moduleIds: ['skill-intent-driven-development'],
      target: 'codex',
    });

    assert.ok(plan.operations.every(operation => (
      operation.destinationPath.startsWith(path.join(homeDir, '.codex', 'skills', 'intent-driven-development'))
    )));
  });
});

test('does not redirect unrelated Codex profiles into the ECC Lite managed skill root', () => {
  withTempHome(homeDir => {
    const plan = createManifestInstallPlan({
      sourceRoot: repoRoot,
      homeDir,
      projectRoot: repoRoot,
      profileId: 'minimal',
      target: 'codex',
    });
    const eccLiteSkillsRoot = path.join(homeDir, '.agents', 'skills');
    const genericSkillOperations = plan.operations.filter(operation => (
      operation.sourceRelativePath.startsWith(`skills${path.sep}`)
      || operation.sourceRelativePath.startsWith('skills/')
    ));

    assert.ok(genericSkillOperations.length > 0);
    assert.ok(genericSkillOperations.every(operation => {
      const relative = path.relative(eccLiteSkillsRoot, operation.destinationPath);
      return relative.startsWith('..') || path.isAbsolute(relative);
    }));
  });
});

test('removes a partially written managed file when fsync fails', () => {
  withTempHome(homeDir => {
    const sourcePath = path.join(homeDir, 'source.md');
    const trustedRoot = path.join(homeDir, '.agents', 'skills');
    const destinationPath = path.join(trustedRoot, 'intent-driven-development', 'SKILL.md');
    fs.writeFileSync(sourcePath, 'managed content');
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });

    const originalFsync = fs.fsyncSync;
    fs.fsyncSync = () => {
      throw new Error('simulated fsync failure');
    };
    try {
      assert.throws(
        () => copyFileExclusiveWithinTrustedRoot(sourcePath, destinationPath, trustedRoot, 'install'),
        /simulated fsync failure/i,
      );
    } finally {
      fs.fsyncSync = originalFsync;
    }

    assert.ok(!fs.existsSync(destinationPath));
  });
});

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
