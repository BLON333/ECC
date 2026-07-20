const path = require('path');

const {
  createInstallTargetAdapter,
  isForeignPlatformPath,
  normalizeRelativePath,
} = require('./helpers');
const { PROFILE_ID: ENTREPRENEUR_PROFILE_ID } = require('../entrepreneur-codex-profile');

module.exports = createInstallTargetAdapter({
  id: 'codex-home',
  target: 'codex',
  kind: 'home',
  rootSegments: ['.codex'],
  installStatePathSegments: ['ecc-install-state.json'],
  nativeRootRelativePath: '.codex',
  planOperations(input, adapter) {
    const modules = Array.isArray(input.modules) ? input.modules : [];
    return modules.flatMap(module => (
      (Array.isArray(module.paths) ? module.paths : [])
        .filter(sourceRelativePath => !isForeignPlatformPath(sourceRelativePath, 'codex'))
        .map(sourceRelativePath => {
          const normalized = normalizeRelativePath(sourceRelativePath);
          const operation = adapter.createScaffoldOperation(module.id, normalized, input);
          if (input.profileId === ENTREPRENEUR_PROFILE_ID && normalized.startsWith('skills/')) {
            return {
              ...operation,
              destinationPath: path.join(input.homeDir, '.agents', normalized),
            };
          }
          return operation;
        })
    ));
  },
});
