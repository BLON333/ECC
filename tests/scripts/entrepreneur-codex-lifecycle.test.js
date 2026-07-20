#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const { createManifestInstallPlan } = require('../../scripts/lib/install-executor');
const { applyInstallPlan } = require('../../scripts/lib/install/apply');
const {
  buildDoctorReport,
  repairInstalledStates,
  uninstallInstalledStates,
} = require('../../scripts/lib/install-lifecycle');

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
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-entrepreneur-lifecycle-'));
  try {
    return fn(homeDir);
  } finally {
    fs.rmSync(homeDir, { recursive: true, force: true });
  }
}

function makePlan(homeDir) {
  return createManifestInstallPlan({
    sourceRoot: repoRoot,
    homeDir,
    projectRoot: repoRoot,
    profileId: 'entrepreneur-codex',
    target: 'codex',
  });
}

function statePath(homeDir) {
  return path.join(homeDir, '.codex', 'ecc-install-state.json');
}

function skillPath(homeDir, skillId) {
  return path.join(homeDir, '.agents', 'skills', skillId);
}

function readState(homeDir) {
  return JSON.parse(fs.readFileSync(statePath(homeDir), 'utf8'));
}

function doctor(homeDir) {
  return buildDoctorReport({
    repoRoot,
    homeDir,
    projectRoot: repoRoot,
    targets: ['codex'],
    profileId: 'entrepreneur-codex',
  });
}

test('supports a pristine first install and writes matching validated state', () => {
  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));

    assert.ok(fs.existsSync(path.join(skillPath(homeDir, 'intent-driven-development'), 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(skillPath(homeDir, 'agent-introspection-debugging'), 'SKILL.md')));
    const state = readState(homeDir);
    assert.strictEqual(state.request.profile, 'entrepreneur-codex');
    assert.strictEqual(state.target.installStatePath, statePath(homeDir));
    assert.strictEqual(doctor(homeDir).summary.errorCount, 0);
  });
});

test('installer dry-run is read-only and exposes only the accepted destinations', () => {
  withTempHome(homeDir => {
    const result = spawnSync(process.execPath, [
      path.join(repoRoot, 'scripts', 'install-apply.js'),
      '--target', 'codex',
      '--profile', 'entrepreneur-codex',
      '--dry-run',
      '--json',
    ], {
      cwd: repoRoot,
      env: { ...process.env, HOME: homeDir },
      encoding: 'utf8',
    });

    assert.strictEqual(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.ok(payload.plan.operations.every(operation => operation.destinationPath.startsWith(path.join(homeDir, '.agents', 'skills'))));
    assert.deepStrictEqual(fs.readdirSync(homeDir), []);
  });
});

test('refuses collisions without adopting identical content or changing existing files', () => {
  withTempHome(homeDir => {
    const collision = path.join(skillPath(homeDir, 'intent-driven-development'), 'SKILL.md');
    fs.mkdirSync(path.dirname(collision), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, 'skills', 'intent-driven-development', 'SKILL.md'), collision);

    assert.throws(() => applyInstallPlan(makePlan(homeDir)), /collision|already exists/i);
    assert.ok(fs.existsSync(collision));
    assert.ok(!fs.existsSync(statePath(homeDir)));
  });
});

test('refuses an existing state file on new install', () => {
  withTempHome(homeDir => {
    fs.mkdirSync(path.dirname(statePath(homeDir)), { recursive: true });
    fs.writeFileSync(statePath(homeDir), '{}');

    assert.throws(() => applyInstallPlan(makePlan(homeDir)), /state.*exists|collision/i);
    assert.strictEqual(fs.readFileSync(statePath(homeDir), 'utf8'), '{}');
  });
});

test('rolls back only newly created managed files after a partial failure', () => {
  withTempHome(homeDir => {
    const plan = makePlan(homeDir);
    const unrelated = path.join(homeDir, '.agents', 'keep.txt');
    fs.mkdirSync(path.dirname(unrelated), { recursive: true });
    fs.writeFileSync(unrelated, 'keep');
    const originalLink = fs.linkSync;
    const concurrent = path.join(skillPath(homeDir, 'intent-driven-development'), 'concurrent.txt');
    fs.linkSync = () => {
      fs.writeFileSync(concurrent, 'preserve');
      throw new Error('simulated state commit failure');
    };
    try {
      assert.throws(() => applyInstallPlan(plan), /simulated state commit failure/i);
    } finally {
      fs.linkSync = originalLink;
    }
    assert.ok(!fs.existsSync(path.join(skillPath(homeDir, 'intent-driven-development'), 'SKILL.md')));
    assert.ok(!fs.existsSync(skillPath(homeDir, 'agent-introspection-debugging')));
    assert.ok(!fs.existsSync(statePath(homeDir)));
    assert.ok(!fs.existsSync(path.join(homeDir, '.codex')));
    assert.strictEqual(fs.readFileSync(unrelated, 'utf8'), 'keep');
    assert.strictEqual(fs.readFileSync(concurrent, 'utf8'), 'preserve');
  });
});

test('preserves a late state collision while rolling back newly copied files', () => {
  withTempHome(homeDir => {
    const plan = makePlan(homeDir);
    const originalOpen = fs.openSync;
    const originalClose = fs.closeSync;
    let remainingCreates = plan.operations.length;
    let stateCollisionCreated = false;
    fs.openSync = (...args) => {
      const isManagedDestination = plan.operations.some(operation => (
        path.resolve(operation.destinationPath) === path.resolve(args[0])
      ));
      if (isManagedDestination) {
        remainingCreates -= 1;
      }
      if (remainingCreates === 0 && !stateCollisionCreated) {
        stateCollisionCreated = true;
        fs.mkdirSync(path.dirname(statePath(homeDir)), { recursive: true });
        const descriptor = originalOpen(
          statePath(homeDir),
          fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL,
          0o600,
        );
        try {
          fs.writeSync(descriptor, 'concurrent-state');
        } finally {
          originalClose(descriptor);
        }
      }
      return originalOpen(...args);
    };
    try {
      assert.throws(() => applyInstallPlan(plan), /exist|collision/i);
    } finally {
      fs.openSync = originalOpen;
    }

    assert.strictEqual(fs.readFileSync(statePath(homeDir), 'utf8'), 'concurrent-state');
    assert.ok(!fs.existsSync(skillPath(homeDir, 'intent-driven-development')));
    assert.ok(!fs.existsSync(skillPath(homeDir, 'agent-introspection-debugging')));
  });
});

test('rollback preserves a managed file replaced before state publication fails', () => {
  withTempHome(homeDir => {
    const plan = makePlan(homeDir);
    const replaced = plan.operations.find(operation => (
      operation.moduleId === 'skill-intent-driven-development'
    )).destinationPath;
    const originalLink = fs.linkSync;
    fs.linkSync = () => {
      fs.rmSync(replaced);
      fs.writeFileSync(replaced, 'concurrent-replacement');
      throw new Error('simulated state commit failure');
    };

    try {
      assert.throws(() => applyInstallPlan(plan), /simulated state commit failure/i);
    } finally {
      fs.linkSync = originalLink;
    }

    assert.strictEqual(fs.readFileSync(replaced, 'utf8'), 'concurrent-replacement');
    assert.ok(!fs.existsSync(skillPath(homeDir, 'agent-introspection-debugging')));
    assert.ok(!fs.existsSync(statePath(homeDir)));
  });
});

test('rollback preserves an empty managed directory replaced before state publication fails', () => {
  withTempHome(homeDir => {
    const plan = makePlan(homeDir);
    const replacedDirectory = skillPath(homeDir, 'intent-driven-development');
    const originalLink = fs.linkSync;
    fs.linkSync = () => {
      fs.rmSync(replacedDirectory, { recursive: true, force: true });
      fs.mkdirSync(replacedDirectory);
      throw new Error('simulated state directory race');
    };

    try {
      assert.throws(() => applyInstallPlan(plan), /simulated state directory race/i);
    } finally {
      fs.linkSync = originalLink;
    }

    assert.ok(fs.existsSync(replacedDirectory));
    assert.deepStrictEqual(fs.readdirSync(replacedDirectory), []);
    assert.ok(!fs.existsSync(statePath(homeDir)));
  });
});

test('keeps created directory identity handles open through state publication', () => {
  withTempHome(homeDir => {
    const plan = makePlan(homeDir);
    const originalOpen = fs.openSync;
    const originalClose = fs.closeSync;
    const originalLink = fs.linkSync;
    const heldDirectoryDescriptors = new Set();
    let observedHeldDirectory = false;

    fs.openSync = (targetPath, ...args) => {
      const descriptor = originalOpen(targetPath, ...args);
      try {
        if (
          path.resolve(String(targetPath)).startsWith(`${path.resolve(homeDir)}${path.sep}`)
          && fs.statSync(targetPath).isDirectory()
        ) {
          heldDirectoryDescriptors.add(descriptor);
        }
      } catch (_error) {
        // Non-directory opens are irrelevant to this ownership-handle check.
      }
      return descriptor;
    };
    fs.closeSync = descriptor => {
      heldDirectoryDescriptors.delete(descriptor);
      return originalClose(descriptor);
    };
    fs.linkSync = () => {
      observedHeldDirectory = heldDirectoryDescriptors.size > 0;
      throw new Error('simulated state publication failure');
    };

    try {
      assert.throws(() => applyInstallPlan(plan), /simulated state publication failure/i);
    } finally {
      fs.openSync = originalOpen;
      fs.closeSync = originalClose;
      fs.linkSync = originalLink;
    }

    assert.strictEqual(observedHeldDirectory, true);
    assert.strictEqual(heldDirectoryDescriptors.size, 0);
  });
});

test('repair and uninstall fail closed for missing, malformed, and mismatched state', () => {
  const operations = [
    () => {},
    homeDir => {
      fs.mkdirSync(skillPath(homeDir, 'intent-driven-development'), { recursive: true });
    },
    homeDir => {
      fs.mkdirSync(path.dirname(statePath(homeDir)), { recursive: true });
      fs.writeFileSync(statePath(homeDir), '{bad json');
    },
    homeDir => {
      applyInstallPlan(makePlan(homeDir));
      const state = readState(homeDir);
      state.resolution.selectedModules = ['skill-intent-driven-development'];
      fs.writeFileSync(statePath(homeDir), `${JSON.stringify(state, null, 2)}\n`);
    },
  ];

  for (const arrange of operations) {
    withTempHome(homeDir => {
      arrange(homeDir);
      const repair = repairInstalledStates({ repoRoot, homeDir, projectRoot: repoRoot, targets: ['codex'], profileId: 'entrepreneur-codex', dryRun: false });
      const uninstall = uninstallInstalledStates({ repoRoot, homeDir, projectRoot: repoRoot, targets: ['codex'], profileId: 'entrepreneur-codex', dryRun: false });
      assert.ok(repair.summary.errorCount > 0);
      assert.ok(uninstall.summary.errorCount > 0);
    });
  }
});

test('reports legacy artifacts without modifying them', () => {
  withTempHome(homeDir => {
    const legacy = path.join(homeDir, '.codex', 'skills', 'legacy-skill', 'SKILL.md');
    fs.mkdirSync(path.dirname(legacy), { recursive: true });
    fs.writeFileSync(legacy, 'legacy');

    const report = doctor(homeDir);
    assert.ok(report.legacyArtifacts.some(entry => entry.path === path.join(homeDir, '.codex', 'skills')));
    assert.strictEqual(fs.readFileSync(legacy, 'utf8'), 'legacy');
  });
});

test('doctor fails closed for missing, malformed, mismatched, escaped, and drifted state', () => {
  withTempHome(homeDir => {
    fs.mkdirSync(skillPath(homeDir, 'intent-driven-development'), { recursive: true });
    assert.ok(doctor(homeDir).summary.errorCount > 0, 'partial artifacts without state must fail');
  });

  withTempHome(homeDir => {
    fs.mkdirSync(path.dirname(statePath(homeDir)), { recursive: true });
    fs.writeFileSync(statePath(homeDir), '{not json');
    assert.ok(doctor(homeDir).summary.errorCount > 0, 'malformed state must fail');
  });

  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));
    const state = readState(homeDir);
    state.resolution.selectedModules = ['skill-intent-driven-development'];
    fs.writeFileSync(statePath(homeDir), `${JSON.stringify(state, null, 2)}\n`);
    assert.ok(doctor(homeDir).summary.errorCount > 0, 'mismatched profile must fail');
  });

  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));
    const state = readState(homeDir);
    state.operations[0].destinationPath = path.join(homeDir, 'escape.txt');
    fs.writeFileSync(statePath(homeDir), `${JSON.stringify(state, null, 2)}\n`);
    assert.ok(doctor(homeDir).summary.errorCount > 0, 'out-of-containment state must fail');
  });

  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));
    fs.appendFileSync(path.join(skillPath(homeDir, 'intent-driven-development'), 'SKILL.md'), '\ndrift');
    assert.ok(doctor(homeDir).summary.errorCount > 0, 'managed drift must fail');
  });
});

test('refuses symlink or junction destinations that escape the managed skill root', () => {
  withTempHome(homeDir => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-entrepreneur-outside-'));
    const destination = skillPath(homeDir, 'intent-driven-development');
    try {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.symlinkSync(outside, destination, process.platform === 'win32' ? 'junction' : 'dir');
      assert.throws(() => applyInstallPlan(makePlan(homeDir)), /symlink|junction|contain|collision|escape/i);
      assert.deepStrictEqual(fs.readdirSync(outside), []);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test('installer refuses a parent junction introduced immediately before destination creation', () => {
  withTempHome(homeDir => {
    const plan = makePlan(homeDir);
    const firstManagedOperation = plan.operations.find(operation => (
      operation.moduleId === 'skill-intent-driven-development'
    ));
    const managedDirectory = skillPath(homeDir, 'intent-driven-development');
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-entrepreneur-install-race-'));
    const originalOpen = fs.openSync;
    let injected = false;
    fs.openSync = (...args) => {
      if (!injected && path.resolve(args[0]) === path.resolve(firstManagedOperation.destinationPath)) {
        injected = true;
        fs.rmdirSync(managedDirectory);
        fs.symlinkSync(outside, managedDirectory, process.platform === 'win32' ? 'junction' : 'dir');
      }
      return originalOpen(...args);
    };

    try {
      assert.throws(() => applyInstallPlan(plan), /contain|escape|junction|symlink|outside/i);
      assert.deepStrictEqual(fs.readdirSync(outside), []);
      assert.ok(!fs.existsSync(statePath(homeDir)));
    } finally {
      fs.openSync = originalOpen;
      fs.rmSync(managedDirectory, { recursive: true, force: true });
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test('doctor, repair, and uninstall refuse a post-install junction escape', () => {
  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-entrepreneur-lifecycle-outside-'));
    const managedDirectory = skillPath(homeDir, 'intent-driven-development');
    try {
      fs.cpSync(managedDirectory, outside, { recursive: true });
      fs.rmSync(managedDirectory, { recursive: true, force: true });
      fs.symlinkSync(outside, managedDirectory, process.platform === 'win32' ? 'junction' : 'dir');

      assert.ok(doctor(homeDir).summary.errorCount > 0);
      const repair = repairInstalledStates({ repoRoot, homeDir, projectRoot: repoRoot, profileId: 'entrepreneur-codex', dryRun: false });
      const uninstall = uninstallInstalledStates({ repoRoot, homeDir, projectRoot: repoRoot, profileId: 'entrepreneur-codex', dryRun: false });
      assert.ok(repair.summary.errorCount > 0);
      assert.ok(uninstall.summary.errorCount > 0);
      assert.ok(fs.existsSync(path.join(outside, 'SKILL.md')));
      assert.ok(fs.existsSync(statePath(homeDir)));
    } finally {
      fs.rmSync(managedDirectory, { recursive: true, force: true });
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test('repair begins with dry-run, restores missing managed content, and blocks drift', () => {
  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));
    const missing = path.join(skillPath(homeDir, 'intent-driven-development'), 'SKILL.md');
    fs.rmSync(missing);

    const preview = repairInstalledStates({ repoRoot, homeDir, projectRoot: repoRoot, targets: ['codex'], dryRun: true });
    assert.ok(preview.summary.plannedRepairCount > 0);
    assert.ok(!fs.existsSync(missing));
    const repaired = repairInstalledStates({ repoRoot, homeDir, projectRoot: repoRoot, targets: ['codex'], dryRun: false });
    assert.strictEqual(repaired.summary.errorCount, 0);
    assert.ok(fs.existsSync(missing));
  });

  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));
    const drifted = path.join(skillPath(homeDir, 'intent-driven-development'), 'SKILL.md');
    fs.appendFileSync(drifted, '\ndrift');
    const before = fs.readFileSync(drifted, 'utf8');
    const result = repairInstalledStates({ repoRoot, homeDir, projectRoot: repoRoot, targets: ['codex'], dryRun: false });
    assert.ok(result.summary.errorCount > 0);
    assert.strictEqual(fs.readFileSync(drifted, 'utf8'), before);
  });
});

test('repair refuses a destination created after health inspection without overwriting it', () => {
  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));
    const missing = path.join(skillPath(homeDir, 'intent-driven-development'), 'SKILL.md');
    fs.rmSync(missing);

    const originalOpen = fs.openSync;
    let injected = false;
    fs.openSync = (...args) => {
      if (!injected && path.resolve(args[0]) === path.resolve(missing)) {
        injected = true;
        fs.writeFileSync(missing, 'concurrent-content');
      }
      return originalOpen(...args);
    };

    let result;
    try {
      result = repairInstalledStates({
        repoRoot,
        homeDir,
        projectRoot: repoRoot,
        targets: ['codex'],
        dryRun: false,
      });
    } finally {
      fs.openSync = originalOpen;
    }

    assert.ok(result.summary.errorCount > 0);
    assert.strictEqual(fs.readFileSync(missing, 'utf8'), 'concurrent-content');
    assert.ok(fs.existsSync(statePath(homeDir)));
  });
});

test('repair refuses a parent junction introduced immediately before destination creation', () => {
  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));
    const managedDirectory = skillPath(homeDir, 'intent-driven-development');
    const savedDirectory = `${managedDirectory}-saved`;
    const missing = path.join(managedDirectory, 'SKILL.md');
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-entrepreneur-repair-race-'));
    fs.rmSync(missing);

    const originalOpen = fs.openSync;
    let injected = false;
    fs.openSync = (...args) => {
      if (!injected && path.resolve(args[0]) === path.resolve(missing)) {
        injected = true;
        fs.renameSync(managedDirectory, savedDirectory);
        fs.symlinkSync(outside, managedDirectory, process.platform === 'win32' ? 'junction' : 'dir');
      }
      return originalOpen(...args);
    };

    let result;
    try {
      result = repairInstalledStates({
        repoRoot,
        homeDir,
        projectRoot: repoRoot,
        targets: ['codex'],
        dryRun: false,
      });
      assert.ok(result.summary.errorCount > 0);
      assert.deepStrictEqual(fs.readdirSync(outside), []);
      assert.ok(fs.existsSync(statePath(homeDir)));
    } finally {
      fs.openSync = originalOpen;
      fs.rmSync(managedDirectory, { recursive: true, force: true });
      if (fs.existsSync(savedDirectory)) {
        fs.renameSync(savedDirectory, managedDirectory);
      }
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test('Codex repair and uninstall CLIs require --apply after the default dry-run', () => {
  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));
    const managedFile = path.join(skillPath(homeDir, 'intent-driven-development'), 'SKILL.md');
    fs.rmSync(managedFile);

    const repairPreview = spawnSync(process.execPath, [
      path.join(repoRoot, 'scripts', 'repair.js'), '--profile', 'entrepreneur-codex', '--json',
    ], { cwd: repoRoot, env: { ...process.env, HOME: homeDir }, encoding: 'utf8' });
    assert.strictEqual(repairPreview.status, 0, repairPreview.stderr);
    assert.strictEqual(JSON.parse(repairPreview.stdout).dryRun, true);
    assert.ok(!fs.existsSync(managedFile));

    const adapterAliasPreview = spawnSync(process.execPath, [
      path.join(repoRoot, 'scripts', 'repair.js'), '--target', 'codex-home', '--json',
    ], { cwd: repoRoot, env: { ...process.env, HOME: homeDir }, encoding: 'utf8' });
    assert.strictEqual(adapterAliasPreview.status, 0, adapterAliasPreview.stderr);
    assert.strictEqual(JSON.parse(adapterAliasPreview.stdout).dryRun, true);
    assert.ok(!fs.existsSync(managedFile));

    repairInstalledStates({ repoRoot, homeDir, projectRoot: repoRoot, targets: ['codex'], dryRun: false });
    const uninstallPreview = spawnSync(process.execPath, [
      path.join(repoRoot, 'scripts', 'uninstall.js'), '--profile', 'entrepreneur-codex', '--json',
    ], { cwd: repoRoot, env: { ...process.env, HOME: homeDir }, encoding: 'utf8' });
    assert.strictEqual(uninstallPreview.status, 0, uninstallPreview.stderr);
    assert.strictEqual(JSON.parse(uninstallPreview.stdout).dryRun, true);
    assert.ok(fs.existsSync(statePath(homeDir)));
  });
});

test('explicit profile selection is required for missing-state ECC Lite diagnosis', () => {
  withTempHome(homeDir => {
    const generic = buildDoctorReport({
      repoRoot,
      homeDir,
      projectRoot: repoRoot,
      targets: ['codex'],
    });
    const selected = doctor(homeDir);

    assert.strictEqual(generic.summary.errorCount, 0);
    assert.strictEqual(generic.results.length, 0);
    assert.ok(selected.summary.errorCount > 0);
  });
});

test('lifecycle CLIs reject a missing profile value and conflicting target', () => {
  withTempHome(homeDir => {
    const missing = spawnSync(process.execPath, [
      path.join(repoRoot, 'scripts', 'doctor.js'), '--profile',
    ], { cwd: repoRoot, env: { ...process.env, HOME: homeDir }, encoding: 'utf8' });
    const conflicting = spawnSync(process.execPath, [
      path.join(repoRoot, 'scripts', 'repair.js'),
      '--profile', 'entrepreneur-codex',
      '--target', 'claude',
    ], { cwd: repoRoot, env: { ...process.env, HOME: homeDir }, encoding: 'utf8' });

    assert.strictEqual(missing.status, 1);
    assert.match(missing.stderr, /missing value.*profile/i);
    assert.strictEqual(conflicting.status, 1);
    assert.match(conflicting.stderr, /only supports.*codex/i);
  });
});

test('uninstall begins with dry-run, preserves unrelated files, and blocks drift', () => {
  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));
    const unrelated = path.join(homeDir, '.agents', 'skills', 'unrelated', 'SKILL.md');
    fs.mkdirSync(path.dirname(unrelated), { recursive: true });
    fs.writeFileSync(unrelated, 'keep');

    const preview = uninstallInstalledStates({ homeDir, projectRoot: repoRoot, targets: ['codex'], dryRun: true });
    assert.strictEqual(preview.summary.plannedRemovalCount, 1);
    assert.ok(fs.existsSync(statePath(homeDir)));
    const result = uninstallInstalledStates({ homeDir, projectRoot: repoRoot, targets: ['codex'], dryRun: false });
    assert.strictEqual(result.summary.errorCount, 0);
    assert.ok(!fs.existsSync(statePath(homeDir)));
    assert.ok(!fs.existsSync(skillPath(homeDir, 'intent-driven-development')));
    assert.strictEqual(fs.readFileSync(unrelated, 'utf8'), 'keep');
  });

  withTempHome(homeDir => {
    applyInstallPlan(makePlan(homeDir));
    const drifted = path.join(skillPath(homeDir, 'intent-driven-development'), 'SKILL.md');
    fs.appendFileSync(drifted, '\ndrift');
    const result = uninstallInstalledStates({ homeDir, projectRoot: repoRoot, targets: ['codex'], dryRun: false });
    assert.ok(result.summary.errorCount > 0);
    assert.ok(fs.existsSync(statePath(homeDir)));
    assert.match(fs.readFileSync(drifted, 'utf8'), /drift/);
  });
});

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
