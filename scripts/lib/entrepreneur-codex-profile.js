'use strict';

const fs = require('fs');
const path = require('path');

const { assertWithinTrustedRoot, isWithinRoot } = require('./path-safety');

const PROFILE_ID = 'entrepreneur-codex';
const MODULE_IDS = Object.freeze([
  'skill-intent-driven-development',
  'skill-agent-introspection-debugging',
]);
const SKILL_IDS = Object.freeze([
  'intent-driven-development',
  'agent-introspection-debugging',
]);

function sameStrings(left, right) {
  return Array.isArray(left)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function sameStringSet(left, right) {
  const sortedRight = [...right].sort();
  return Array.isArray(left)
    && left.length === right.length
    && [...left].sort().every((value, index) => value === sortedRight[index]);
}

function getPaths(homeDir) {
  const resolvedHome = path.resolve(homeDir);
  return Object.freeze({
    homeDir: resolvedHome,
    codexRoot: path.join(resolvedHome, '.codex'),
    skillsRoot: path.join(resolvedHome, '.agents', 'skills'),
    statePath: path.join(resolvedHome, '.codex', 'ecc-install-state.json'),
    skillDirectories: SKILL_IDS.map(skillId => path.join(resolvedHome, '.agents', 'skills', skillId)),
  });
}

function assertTrustedRoots(paths, action) {
  assertWithinTrustedRoot(paths.codexRoot, paths.homeDir, action);
  assertWithinTrustedRoot(paths.skillsRoot, paths.homeDir, action);
  assertWithinTrustedRoot(paths.statePath, paths.codexRoot, action);
}

function sameStatField(left, right, fieldName) {
  if (!(fieldName in left) || !(fieldName in right)) {
    return true;
  }
  return left[fieldName] === right[fieldName];
}

function sameBirthtime(left, right) {
  return sameStatField(left, right, 'birthtimeNs')
    && sameStatField(left, right, 'birthtimeMs');
}

function sameFilesystemObjectIdentity(left, right) {
  return sameStatField(left, right, 'mode')
    && sameStatField(left, right, 'size')
    && sameStatField(left, right, 'mtimeNs')
    && sameStatField(left, right, 'mtimeMs')
    && sameStatField(left, right, 'ctimeNs')
    && sameStatField(left, right, 'ctimeMs');
}

function sameFileIdentity(left, right) {
  return Boolean(left)
    && Boolean(right)
    && left.dev === right.dev
    && left.ino === right.ino
    && sameBirthtime(left, right)
    && sameFilesystemObjectIdentity(left, right);
}

function removeCreatedFileIfUnchanged(filePath, identity) {
  try {
    const current = fs.lstatSync(filePath, { bigint: true });
    if (sameFileIdentity(current, identity)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function removeCreatedDirectoryIfUnchanged(directoryPath, identity) {
  try {
    const current = fs.lstatSync(directoryPath, { bigint: true });
    if (
      !sameFileIdentity(current, identity)
      || !current.isDirectory()
      || current.isSymbolicLink()
    ) {
      return;
    }

    const confirmed = fs.lstatSync(directoryPath, { bigint: true });
    if (
      sameFileIdentity(confirmed, identity)
      && confirmed.isDirectory()
      && !confirmed.isSymbolicLink()
    ) {
      fs.rmdirSync(directoryPath);
    }
  } catch (error) {
    if (!['ENOENT', 'ENOTEMPTY', 'EEXIST'].includes(error.code)) {
      throw error;
    }
  }
}

function copyFileExclusiveWithinTrustedRoot(sourcePath, destinationPath, trustedRoot, action) {
  const sourceStat = fs.statSync(sourcePath);
  if (!sourceStat.isFile()) {
    throw new Error(`Missing source file for ${action}: ${sourcePath}`);
  }
  const content = fs.readFileSync(sourcePath);
  assertWithinTrustedRoot(destinationPath, trustedRoot, action);

  let descriptor = null;
  let identity = null;
  let failure = null;
  try {
    descriptor = fs.openSync(
      destinationPath,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL,
      sourceStat.mode & 0o777
    );
    identity = fs.fstatSync(descriptor, { bigint: true });

    // The exclusive open protects the leaf. Re-resolve the now-existing path
    // and bind it to the opened file before any managed content is written so
    // a late parent junction or symlink swap fails closed.
    assertWithinTrustedRoot(destinationPath, trustedRoot, action);
    const openedPathIdentity = fs.statSync(destinationPath, { bigint: true });
    if (!sameFileIdentity(openedPathIdentity, identity)) {
      throw new Error(`Refusing ${action}: destination changed during exclusive creation`);
    }

    fs.writeFileSync(descriptor, content);
    fs.fsyncSync(descriptor);

    assertWithinTrustedRoot(destinationPath, trustedRoot, action);
    const writtenDescriptorIdentity = fs.fstatSync(descriptor, { bigint: true });
    const writtenPathIdentity = fs.statSync(destinationPath, { bigint: true });
    if (!sameFileIdentity(writtenPathIdentity, writtenDescriptorIdentity)) {
      throw new Error(`Refusing ${action}: destination changed while writing managed content`);
    }
    identity = writtenPathIdentity;
  } catch (error) {
    failure = error;
  } finally {
    if (descriptor !== null) {
      try {
        // Bind cleanup to the descriptor's final contents even when write or
        // fsync fails after the exclusive create has already changed the file.
        identity = fs.fstatSync(descriptor, { bigint: true });
      } catch (error) {
        failure = failure || error;
      }
      try {
        fs.closeSync(descriptor);
      } catch (error) {
        failure = failure || error;
      }
    }
  }

  if (failure) {
    if (identity) {
      try {
        removeCreatedFileIfUnchanged(destinationPath, identity);
      } catch (cleanupError) {
        throw new Error(`${failure.message}; failed to remove the incomplete managed file: ${cleanupError.message}`);
      }
    }
    throw failure;
  }
  return { filePath: destinationPath, identity };
}

function assertManagedOperation(operation, paths, action) {
  if (!MODULE_IDS.includes(operation.moduleId)) {
    throw new Error(`Invalid ${PROFILE_ID} state: unexpected module ${operation.moduleId}`);
  }
  if (
    operation.kind !== 'copy-file'
    || operation.ownership !== 'managed'
    || operation.strategy !== 'preserve-relative-path'
    || operation.scaffoldOnly !== false
  ) {
    throw new Error(`Invalid ${PROFILE_ID} state: only managed copy-file operations are allowed`);
  }
  const skillId = operation.moduleId.replace(/^skill-/, '');
  const sourcePrefix = `skills/${skillId}/`;
  const normalizedSource = String(operation.sourceRelativePath || '').replace(/\\/g, '/');
  if (!normalizedSource.startsWith(sourcePrefix)) {
    throw new Error(`Invalid ${PROFILE_ID} state: source does not match ${operation.moduleId}`);
  }
  const skillDirectory = path.join(paths.skillsRoot, skillId);
  assertWithinTrustedRoot(operation.destinationPath, skillDirectory, action);
  if (!isWithinRoot(operation.destinationPath, paths.skillsRoot)) {
    throw new Error(`Invalid ${PROFILE_ID} state: destination escapes the managed skill root`);
  }
  const expectedDestination = path.join(paths.skillsRoot, normalizedSource.slice('skills/'.length));
  if (path.resolve(operation.destinationPath) !== path.resolve(expectedDestination)) {
    throw new Error(`Invalid ${PROFILE_ID} state: source and destination paths do not match`);
  }
}

function assertProfilePlan(plan, homeDir) {
  if (plan.profileId !== PROFILE_ID) {
    return null;
  }
  const paths = getPaths(homeDir);
  assertTrustedRoots(paths, 'install');
  if (plan.target !== 'codex' || plan.adapter?.id !== 'codex-home') {
    throw new Error(`${PROFILE_ID} only supports the Codex target`);
  }
  if (
    path.resolve(plan.targetRoot) !== paths.codexRoot
    || path.resolve(plan.installRoot) !== paths.codexRoot
  ) {
    throw new Error(`Invalid ${PROFILE_ID} plan: target root does not match the approved location`);
  }
  if (!sameStringSet(plan.selectedModuleIds, MODULE_IDS) || plan.skippedModuleIds.length !== 0) {
    throw new Error(`Invalid ${PROFILE_ID} plan: module resolution does not match the accepted profile`);
  }
  if (path.resolve(plan.installStatePath) !== paths.statePath) {
    throw new Error(`Invalid ${PROFILE_ID} plan: install-state path does not match the approved location`);
  }
  if (!Array.isArray(plan.operations) || plan.operations.length === 0) {
    throw new Error(`Invalid ${PROFILE_ID} plan: no managed skill files were resolved`);
  }
  plan.operations.forEach(operation => assertManagedOperation(operation, paths, 'install'));
  return paths;
}

function assertMatchingState(state, homeDir, action = 'lifecycle') {
  const paths = getPaths(homeDir);
  assertTrustedRoots(paths, action);
  if (!state || state.request?.profile !== PROFILE_ID) {
    throw new Error(`No valid matching ${PROFILE_ID} install-state is available`);
  }
  if (
    state.target?.id !== 'codex-home'
    || state.target?.target !== 'codex'
    || state.target?.kind !== 'home'
    || path.resolve(state.target.root) !== paths.codexRoot
    || path.resolve(state.target.installStatePath) !== paths.statePath
  ) {
    throw new Error(`Invalid ${PROFILE_ID} state: target or install-state path mismatch`);
  }
  if (
    !sameStringSet(state.resolution?.selectedModules, MODULE_IDS)
    || !sameStrings(state.resolution?.skippedModules, [])
    || !sameStrings(state.request.modules, [])
    || !sameStrings(state.request.includeComponents, [])
    || !sameStrings(state.request.excludeComponents, [])
    || !sameStrings(state.request.legacyLanguages, [])
    || state.request.legacyMode !== false
  ) {
    throw new Error(`Invalid ${PROFILE_ID} state: request or resolution mismatch`);
  }
  if (!Array.isArray(state.operations) || state.operations.length === 0) {
    throw new Error(`Invalid ${PROFILE_ID} state: managed operations are missing`);
  }
  state.operations.forEach(operation => assertManagedOperation(operation, paths, action));
  if (!sameStringSet([...new Set(state.operations.map(operation => operation.moduleId))], MODULE_IDS)) {
    throw new Error(`Invalid ${PROFILE_ID} state: managed operations do not cover both accepted modules`);
  }
  return paths;
}

function hasManagedArtifacts(homeDir) {
  return getPaths(homeDir).skillDirectories.some(skillDirectory => fs.existsSync(skillDirectory));
}

function listLegacyArtifacts(homeDir) {
  const candidates = [
    ['codex-skills', path.join(homeDir, '.codex', 'skills')],
    ['codex-plugins', path.join(homeDir, '.codex', 'plugins')],
    ['codex-plugin-cache', path.join(homeDir, '.codex', 'plugin-cache')],
    ['codex-quarantine', path.join(homeDir, '.codex', 'quarantine')],
    ['codex-quarantined', path.join(homeDir, '.codex', 'quarantined')],
    ['namespaced-ecc-skills', path.join(homeDir, '.agents', 'skills', 'ecc')],
  ];
  return candidates
    .filter(([, candidatePath]) => fs.existsSync(candidatePath))
    .map(([kind, candidatePath]) => ({ kind, path: candidatePath, action: 'report-only' }));
}

module.exports = {
  MODULE_IDS,
  PROFILE_ID,
  SKILL_IDS,
  assertMatchingState,
  assertProfilePlan,
  copyFileExclusiveWithinTrustedRoot,
  getPaths,
  hasManagedArtifacts,
  listLegacyArtifacts,
  removeCreatedDirectoryIfUnchanged,
  removeCreatedFileIfUnchanged,
};
