# Current State

## Last completed slice

Stage 3B v1 added the read-only assisted/manual ECC Lite helper defined by the
[ECC Lite Profile Contract](ECC_LITE_PROFILE.md). It inventories exactly the
two accepted unchanged skill sources, previews collision-free manual copy
steps, binds source version and SHA-256 evidence to the exact clean `HEAD`,
verifies copied files including single-link identity, and provides exact manual
removal guidance.

## Active slice

None authorized.

## Current state

Repository support only. `scripts/ecc-lite.js` implements read-only `preview`
and `verify`; it does not copy, install, activate, repair, or remove anything.
ECC Lite is not registered with the generic installer and has no install state,
doctor, repair, or uninstall integration. No skill has been installed or
activated, and no runtime, connector, MCP, agent, hook, external-system access,
or private-data change was created.

## Recommended next slice

No further ECC Lite implementation slice is recommended. After an independent
exact-head review and merge, the operator may separately decide whether to
run the read-only preview and perform the documented manual copy. Repository
documentation does not authorize that use or activation.
