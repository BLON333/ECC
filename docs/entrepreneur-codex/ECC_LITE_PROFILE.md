# ECC Lite Profile

This is the sole normative v1 contract for ECC Lite inside Entrepreneur Codex.
Code and focused tests own exact runtime behavior; this contract defines the
profile, its human-governed delivery, and its safety boundary.

## Profile and architecture

Entrepreneur Codex is the complete human-governed harness described in the
[landing page](README.md). ECC Lite is only the small personal Codex profile
inside that harness.

| Field | V1 contract |
|---|---|
| Profile ID | `entrepreneur-codex` |
| Target | Codex only |
| Membership | Exactly `intent-driven-development` and `agent-introspection-debugging` |
| Skill bodies | Existing sources remain byte-unchanged |
| Delivery | Read-only preview and verification plus operator-performed assisted/manual copy |
| Installed state | None; repository delivery does not install or activate the profile |

The design names the corresponding synthetic single-skill modules
`skill-intent-driven-development` and
`skill-agent-introspection-debugging`. V1 does not register those modules with
the generic installer or create another skill. No third skill belongs in the
profile.

`intent-driven-development` helps shape materially ambiguous work into bounded,
observable acceptance criteria. `agent-introspection-debugging` helps capture,
diagnose, and recover from agent or session failure. Neither skill authorizes
implementation, production recovery, or external action.

The operator model is:

> Explore -> Shape -> Plan -> Build -> Review -> Release -> Recover

These are human operating phases, not seven installed skills.

## Assisted/manual v1

The repository helper accepts only:

```text
<absolute-node> <repository>/scripts/ecc-lite.js <preview|verify>
  --home <absolute-home> --source-commit <expected-commit>
```

Both operations are read-only. The helper never creates a directory, copies a
file, writes state, repairs or removes content, invokes the generic installer,
changes Codex configuration, installs the profile, or activates a skill.

The operator supplies an absolute non-root home without dot or traversal
segments and an exact lowercase 40-character source commit. The helper does not
infer a home from environment variables. The expected commit must equal the
checkout's derived `HEAD` or inspection fails closed.

## Source binding

V1 inventories only `package.json` and the complete regular-file contents of:

- `skills/intent-driven-development`; and
- `skills/agent-introspection-debugging`.

The helper binds repository version, derived source commit, repository-relative
and absolute source paths, byte lengths, and SHA-256 hashes to the same exact
committed tree. Relevant index and worktree bytes must equal `HEAD`, and no
relevant untracked or ignored path may exist.

Missing files, path escape, symlink or special-object sources, multiple source
hard links, staged drift, working-tree drift, additional source content, or a
source identity change fails closed. Restoring working bytes cannot hide a
different staged source.

## Placement and collision safety

The only destination mapping is:

```text
<absolute-home>/.agents/skills/<skill>/<source-relative-file>
```

Both skill destinations must be absent before manual copying. Any existing
destination is a collision, even when its bytes match. A symlink, junction,
non-directory ancestor, unsafe filesystem object, or path escape blocks the
operation. V1 never adopts, merges, overwrites, migrates, or disables existing
content.

When ready, `preview` emits deterministic JSON containing the exact source
inventory, hashes, no-overwrite copy steps, an absolute cwd-independent
verification command, and hash-bound manual removal guidance. The operator
performs copying with a trusted local filesystem tool under separate authority.

## Verification and removal safety

`verify` reports each expected file as:

- `matching` only for the expected SHA-256, a regular file, and one hard link;
- `missing` when absent; or
- `drifted` for changed bytes, unsafe type, multiple hard links, or unexpected
  content inside either profile skill.

Overall status is `matching`, `missing`, or `drifted`. Exit status `0` means a
ready preview or matching verification, `2` means a valid blocked, missing, or
drifted report, and `1` means input or inspection failed. Verification writes
no state and grants no ownership of existing content.

Removal remains manual. First run `verify`, then remove only a listed file that
is still matching, has one hard link, and retains its required SHA-256. Stop on
missing, changed, linked, or unsafe content. Remove only listed directories
that are empty, and preserve every unrelated file and configuration surface.

## Evidence-based change

Keep a harness evidence record only for an evaluated pilot, material failure,
recurring friction, or proposed harness change. Link to existing diffs, checks,
reviews, and logs; do not copy secrets, private content, complete conversations,
or hidden reasoning.

A future change requires recurring evidence, one bounded proposal, regression
evaluation, and human acceptance or rejection. Acceptance still requires a
live issue, governed worktree, pull request, exact-head checks and review,
merge authority, and any separate installation or activation authority.
Rejection changes nothing.

## Explicit exclusions

ECC Lite v1 is not another repository, runtime, dashboard, autonomous agent,
agent suite, workflow engine, orchestration platform, hook bundle, MCP bundle,
connector bundle, email engine, private-domain workflow, or self-improving
system.

V1 adds no skills, agents, hooks, MCPs, connectors, browser automation,
dependencies, manifests, schemas, configuration merge, install state, automated
copy, installer registration, activation, doctor, repair, uninstall, rollback,
legacy migration, telemetry platform, autonomous evolution, or private-system
integration. Any automated lifecycle is a separately designed and authorized
future outcome, not an implied next step.
