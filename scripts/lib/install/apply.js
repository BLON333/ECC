'use strict';

const fs = require('fs');
const path = require('path');

const { writeInstallState } = require('../install-state');
const { filterMcpConfig, parseDisabledMcpServers } = require('../mcp-config');
const { buildInstallIndex, isNamespacedSource, rewriteRelativeLinks } = require('./link-rewrite');
const {
  PROFILE_ID: ENTREPRENEUR_PROFILE_ID,
  assertMatchingState,
  assertProfilePlan,
  copyFileExclusiveWithinTrustedRoot,
  removeCreatedDirectoryIfUnchanged,
  removeCreatedFileIfUnchanged,
} = require('../entrepreneur-codex-profile');

function isMarkdownPath(filePath) {
  return /\.(md|mdx|markdown)$/i.test(String(filePath || ''));
}

// Map every copy-file operation to { sourceRel, destRel } so relative links in
// namespaced markdown can be rewritten to the file's actual installed location
// (issue #2340). Returns null when the plan lacks the data needed to do so.
function buildLinkIndexForPlan(plan) {
  if (!plan || !plan.targetRoot || !Array.isArray(plan.operations)) {
    return null;
  }
  const mappings = [];
  for (const operation of plan.operations) {
    if (operation.kind === 'copy-file' && operation.sourceRelativePath) {
      mappings.push({
        sourceRel: operation.sourceRelativePath,
        destRel: path.relative(plan.targetRoot, operation.destinationPath),
      });
    }
  }
  return buildInstallIndex(mappings);
}

function readJsonObject(filePath, label) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to parse ${label} at ${filePath}: ${error.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Invalid ${label} at ${filePath}: expected a JSON object`);
  }

  return parsed;
}

function cloneJsonValue(value) {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepMergeJson(baseValue, patchValue) {
  if (!isPlainObject(baseValue) || !isPlainObject(patchValue)) {
    return cloneJsonValue(patchValue);
  }

  const merged = { ...baseValue };
  for (const [key, value] of Object.entries(patchValue)) {
    if (isPlainObject(value) && isPlainObject(merged[key])) {
      merged[key] = deepMergeJson(merged[key], value);
    } else {
      merged[key] = cloneJsonValue(value);
    }
  }
  return merged;
}

function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function replacePluginRootPlaceholders(value, pluginRoot) {
  if (!pluginRoot) {
    return value;
  }

  if (typeof value === 'string') {
    return value.split('${CLAUDE_PLUGIN_ROOT}').join(pluginRoot);
  }

  if (Array.isArray(value)) {
    return value.map(item => replacePluginRootPlaceholders(item, pluginRoot));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        replacePluginRootPlaceholders(nestedValue, pluginRoot),
      ])
    );
  }

  return value;
}

function findHooksSourcePath(plan, hooksDestinationPath) {
  const operation = plan.operations.find(item => item.destinationPath === hooksDestinationPath);
  return operation ? operation.sourcePath : null;
}

function samePathIdentity(left, right) {
  return Boolean(left)
    && Boolean(right)
    && left.dev === right.dev
    && left.ino === right.ino
    && (
      typeof left.birthtimeMs !== 'number'
      || typeof right.birthtimeMs !== 'number'
      || left.birthtimeMs === right.birthtimeMs
    );
}

function ensureTrackedDirectory(directoryPath, boundaryPath, allowedExisting, createdDirectories) {
  const resolvedDirectory = path.resolve(directoryPath);
  const resolvedBoundary = path.resolve(boundaryPath);
  if (resolvedDirectory === resolvedBoundary) {
    return;
  }
  const relative = path.relative(resolvedBoundary, resolvedDirectory);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Install collision: directory escapes the approved home at ${resolvedDirectory}`);
  }

  const recorded = createdDirectories.find(entry => entry.directoryPath === resolvedDirectory);
  if (fs.existsSync(resolvedDirectory)) {
    const current = fs.lstatSync(resolvedDirectory, { bigint: true });
    if (!current.isDirectory() || current.isSymbolicLink()) {
      throw new Error(`Install collision: directory is a symlink or junction at ${resolvedDirectory}`);
    }
    if (recorded && !samePathIdentity(current, recorded.identity)) {
      throw new Error(`Install collision: directory changed during install at ${resolvedDirectory}`);
    }
    if (!recorded && !allowedExisting.has(resolvedDirectory)) {
      throw new Error(`Install collision: unexpected directory appeared at ${resolvedDirectory}`);
    }
    return;
  }

  ensureTrackedDirectory(
    path.dirname(resolvedDirectory),
    resolvedBoundary,
    allowedExisting,
    createdDirectories
  );
  try {
    fs.mkdirSync(resolvedDirectory);
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(`Install collision: directory appeared at ${resolvedDirectory}`);
    }
    throw error;
  }
  const identity = fs.lstatSync(resolvedDirectory, { bigint: true });
  if (!identity.isDirectory() || identity.isSymbolicLink()) {
    throw new Error(`Install collision: directory changed during creation at ${resolvedDirectory}`);
  }
  createdDirectories.push({ directoryPath: resolvedDirectory, identity });
}

function isMcpConfigPath(filePath) {
  const basename = path.basename(String(filePath || ''));
  return basename === '.mcp.json' || basename === 'mcp.json';
}

function buildResolvedClaudeHooks(plan) {
  if (!plan.adapter || (plan.adapter.target !== 'claude' && plan.adapter.target !== 'claude-project')) {
    return null;
  }

  const pluginRoot = plan.targetRoot;
  const hooksDestinationPath = path.join(plan.targetRoot, 'hooks', 'hooks.json');
  const hooksSourcePath = findHooksSourcePath(plan, hooksDestinationPath) || hooksDestinationPath;
  if (!fs.existsSync(hooksSourcePath)) {
    return null;
  }

  const hooksConfig = readJsonObject(hooksSourcePath, 'hooks config');
  const resolvedHooks = replacePluginRootPlaceholders(hooksConfig.hooks, pluginRoot);
  if (!resolvedHooks || typeof resolvedHooks !== 'object' || Array.isArray(resolvedHooks)) {
    throw new Error(`Invalid hooks config at ${hooksSourcePath}: expected "hooks" to be a JSON object`);
  }

  return {
    hooksDestinationPath,
    resolvedHooksConfig: {
      ...hooksConfig,
      hooks: resolvedHooks,
    },
  };
}

function applyEntrepreneurCodexPlan(plan) {
  const homeDir = path.dirname(path.dirname(plan.installStatePath));
  const paths = assertProfilePlan(plan, homeDir);
  assertMatchingState(plan.statePreview, homeDir, 'install');

  if (fs.existsSync(paths.statePath)) {
    throw new Error(`Install collision: install-state already exists at ${paths.statePath}`);
  }
  for (const skillDirectory of paths.skillDirectories) {
    if (fs.existsSync(skillDirectory)) {
      throw new Error(`Install collision: managed skill destination already exists at ${skillDirectory}`);
    }
  }

  for (const operation of plan.operations) {
    if (!operation.sourcePath || !fs.existsSync(operation.sourcePath) || !fs.statSync(operation.sourcePath).isFile()) {
      throw new Error(`Missing source file for install: ${operation.sourcePath || operation.sourceRelativePath}`);
    }
  }

  const createdFiles = [];
  const createdDirectories = [];
  const agentsRoot = path.dirname(paths.skillsRoot);
  const candidateParentDirectories = [
    agentsRoot,
    paths.skillsRoot,
    paths.codexRoot,
  ];
  const allowedExistingDirectories = new Set([
    paths.homeDir,
    ...candidateParentDirectories.filter(directory => fs.existsSync(directory)),
  ].map(directory => path.resolve(directory)));
  try {
    for (const directory of candidateParentDirectories) {
      ensureTrackedDirectory(
        directory,
        paths.homeDir,
        allowedExistingDirectories,
        createdDirectories
      );
    }
    for (const skillDirectory of paths.skillDirectories) {
      ensureTrackedDirectory(
        skillDirectory,
        paths.homeDir,
        allowedExistingDirectories,
        createdDirectories
      );
    }
    for (const operation of plan.operations) {
      ensureTrackedDirectory(
        path.dirname(operation.destinationPath),
        paths.homeDir,
        allowedExistingDirectories,
        createdDirectories
      );
      const createdFile = copyFileExclusiveWithinTrustedRoot(
        operation.sourcePath,
        operation.destinationPath,
        paths.skillsRoot,
        'install'
      );
      createdFiles.push(createdFile);
    }
    writeInstallState(paths.statePath, plan.statePreview, { exclusive: true });
  } catch (error) {
    for (const createdFile of createdFiles.reverse()) {
      removeCreatedFileIfUnchanged(createdFile.filePath, createdFile.identity);
    }
    for (const createdDirectory of createdDirectories.reverse()) {
      removeCreatedDirectoryIfUnchanged(
        createdDirectory.directoryPath,
        createdDirectory.identity
      );
    }
    throw error;
  }

  return { ...plan, applied: true };
}

function applyInstallPlan(plan) {
  if (plan.profileId === ENTREPRENEUR_PROFILE_ID) {
    return applyEntrepreneurCodexPlan(plan);
  }
  const resolvedClaudeHooksPlan = buildResolvedClaudeHooks(plan);
  const disabledServers = parseDisabledMcpServers(process.env.ECC_DISABLED_MCPS);
  const linkIndex = buildLinkIndexForPlan(plan);

  for (const operation of plan.operations) {
    fs.mkdirSync(path.dirname(operation.destinationPath), { recursive: true });

    if (operation.kind === 'merge-json') {
      const payload = cloneJsonValue(operation.mergePayload);
      if (payload === undefined) {
        throw new Error(`Missing merge payload for ${operation.destinationPath}`);
      }

      const filteredPayload = (
        isMcpConfigPath(operation.destinationPath) && disabledServers.length > 0
      )
        ? filterMcpConfig(payload, disabledServers).config
        : payload;

      const currentValue = fs.existsSync(operation.destinationPath)
        ? readJsonObject(operation.destinationPath, 'existing JSON config')
        : {};
      const mergedValue = deepMergeJson(currentValue, filteredPayload);
      fs.writeFileSync(operation.destinationPath, formatJson(mergedValue), 'utf8');
      continue;
    }

    if (operation.kind === 'copy-file' && isMcpConfigPath(operation.destinationPath) && disabledServers.length > 0) {
      const sourceConfig = readJsonObject(operation.sourcePath, 'MCP config');
      const filteredConfig = filterMcpConfig(sourceConfig, disabledServers).config;
      fs.writeFileSync(operation.destinationPath, formatJson(filteredConfig), 'utf8');
      continue;
    }

    // Namespaced markdown (e.g. skills/<id> -> skills/ecc/<id>) needs its
    // relative cross-directory links rewritten so they resolve after install
    // (issue #2340). Files whose install path is unchanged (no namespace
    // injected) and all non-markdown files stay on the byte-for-byte copy path.
    if (
      linkIndex
      && operation.kind === 'copy-file'
      && operation.sourceRelativePath
      && isMarkdownPath(operation.destinationPath)
      && isNamespacedSource(operation.sourceRelativePath, linkIndex)
    ) {
      const rewritten = rewriteRelativeLinks(
        fs.readFileSync(operation.sourcePath, 'utf8'),
        { sourceRel: operation.sourceRelativePath, index: linkIndex }
      );
      fs.writeFileSync(operation.destinationPath, rewritten, 'utf8');
      continue;
    }

    fs.copyFileSync(operation.sourcePath, operation.destinationPath);
  }

  if (resolvedClaudeHooksPlan) {
    fs.mkdirSync(path.dirname(resolvedClaudeHooksPlan.hooksDestinationPath), { recursive: true });
    fs.writeFileSync(
      resolvedClaudeHooksPlan.hooksDestinationPath,
      JSON.stringify(resolvedClaudeHooksPlan.resolvedHooksConfig, null, 2) + '\n',
      'utf8'
    );
  }

  writeInstallState(plan.installStatePath, plan.statePreview);

  return {
    ...plan,
    applied: true,
  };
}

module.exports = {
  applyInstallPlan,
};
