# ECC Lite Profile Contract

This document is the normative v1 contract for ECC Lite inside Entrepreneur
Codex. Stage 3A.2 accepted the design. Stage 3B v1 adds only a read-only helper
for previewing and verifying an explicit assisted/manual copy. It does not
copy, install, repair, remove, or activate anything, and it grants no
external-action authority.

## Entrepreneur Codex and ECC Lite

Entrepreneur Codex is the complete human-governed harness:

- Codex Desktop and CLI;
- repository memory and operating contracts;
- focused task context;
- Git repositories, branches, and worktrees;
- GitHub pull requests, CI, and reviews;
- permissions and approval boundaries;
- operator decisions;
- durable evidence; and
- ECC Lite.

ECC Lite is only the small ECC-managed capability profile inside that larger
harness. V1 is delivered by explicit assisted/manual copying, not an automated
installer. ECC Lite is not the harness itself.

ECC Lite is not:

- a new runtime;
- a dashboard;
- an autonomous agent;
- an agent suite;
- a workflow engine;
- an orchestration platform;
- a hook bundle;
- an MCP bundle;
- a connector bundle;
- an email-management engine;
- an insurance-specific workflow; or
- a self-improving autonomous system.

## Accepted profile

| Field | Accepted value |
|---|---|
| Profile ID | `entrepreneur-codex` |
| Target | Codex only |
| Shared-core modules | Exactly `skill-intent-driven-development` and `skill-agent-introspection-debugging` |
| Skill bodies | The existing skills remain unchanged |
| V1 delivery | Read-only preview and verification plus explicit assisted/manual copying |
| Installation state | No repository change installs or activates the profile |

No other skill belongs in the initial shared profile.

### Skill boundaries

| Single-skill module ID | Existing unchanged skill |
|---|---|
| `skill-intent-driven-development` | `intent-driven-development` |
| `skill-agent-introspection-debugging` | `agent-introspection-debugging` |

These two `skill-*` names are the synthetic single-skill module IDs recorded by
the Stage 3A.2 design. The v1 helper does not register them with the generic
installer; it maps the two existing skill directories directly. Neither name
creates a module, a skill, or a skill-body change. The profile remains exactly
these two existing skills.

`intent-driven-development`:

- helps turn ambiguous or consequential work into bounded, observable scope
  and acceptance criteria;
- is used selectively rather than imposed on trivial tasks; and
- does not itself authorize implementation or external action.

`agent-introspection-debugging`:

- helps capture, diagnose, and recover from Codex session failure, looping,
  context drift, and environment mismatch; and
- does not claim to provide product, production, deployment, database, or
  incident recovery.

## Seven-phase operator model

The plain-English working model is:

> Explore → Shape → Plan → Build → Review → Release → Recover

These phases describe how the human-governed harness is operated. They do not
map one-to-one to installed skills.

| Phase | Initial mechanism |
|---|---|
| Explore | Native Codex inspection, repository memory, Git, GitHub, and `AGENTS.md`. |
| Shape | Native dialogue and operator judgment; use intent-driven development only when material ambiguity or consequence justifies it. |
| Plan | Native planning for simple work; use intent-driven development for bounded, observable acceptance criteria. |
| Build | Native Codex operating under the closest repository instructions, accepted slice, and exact task authority. |
| Review | Repository-specific validation, diffs, GitHub CI, independent exact-head review, and human judgment. |
| Release | GitHub controls and explicit [Operator Contract](OPERATOR_CONTRACT.md) authorization. |
| Recover | Agent introspection debugging for session or agent failure; repository runbooks and operator decisions for product or production recovery. |

## Harness-engineering principles

Lilian Weng's
[Harness Engineering for Self-Improvement](https://lilianweng.github.io/posts/2026-07-04-harness/)
is an important design reference, not repository authority. Entrepreneur Codex
adopts only the bounded, human-governed principles recorded here:

- keep the operator interface deliberately simple;
- use repository and filesystem artifacts as durable memory instead of carrying
  every artifact and log in live context;
- operate a goal-directed loop that plans, executes, observes or tests, and
  then improves or stops;
- preserve failures, rejected proposals, and negative results when they are
  material evidence;
- make the affected component, operator experience, and decision observable in
  the smallest useful human-readable form; and
- judge harness changes by maintainability, rollback cost, debugging burden,
  ownership clarity, and operator understanding as well as task results.

The context lifecycle is:

> live task context → worktree and files → tests, pull request, CI, and review
> → curated durable decision or evidence

The operating loop is:

> goal → plan → execute → observe or test → improve or stop

Evaluators, permissions, credentials, production systems, authority rules, and
acceptance logic remain outside every future improvement candidate. This
contract does not design or authorize a telemetry platform, event bus,
autonomous optimizer, or learning database.

## Minimal evidence contract

Create a harness evidence record only for:

- an evaluated pilot;
- a material failure;
- a recurring friction pattern; or
- a proposed harness change.

Routine successful tasks do not require a new record.

Each record contains only the smallest useful evidence:

| Section | Required content |
|---|---|
| Baseline | Date, repository, exact head, profile version, and skills used. |
| Goal and authority | Requested outcome, scope, and permission boundary. |
| Plan and action | Concise plan plus branch, worktree, and pull-request references. |
| Observation | Exact checks and a pass, fail, or stopped result. |
| Experience or failure | What the operator encountered, affected harness component, and evidence link. |
| Disposition | Stop, accept, or propose improvement, including risks and the operator decision. |

Link to existing diffs, CI, reviews, and logs rather than copying them into the
record.

Never store in a harness evidence record:

- credentials;
- secrets;
- client content;
- private insurance data;
- complete conversations; or
- hidden model reasoning.

## Human-governed harness improvement

The future improvement sequence is:

> recurring evidence → one bounded proposal → reproduction and held-out
> regression evaluation → operator acceptance or rejection

A proposal must identify:

- the editable component;
- the expected benefit;
- passing behavior that must be preserved;
- regression risks;
- maintenance cost;
- ownership; and
- rollback.

Rejection changes nothing. Acceptance does not install or activate a change.
An accepted proposal still requires a normal issue, worktree, pull request,
exact-head review, merge, and any separately required use or activation
authority.

The harness may never autonomously weaken or rewrite:

- evaluator independence;
- permission boundaries;
- credentials;
- production controls;
- operator authority; or
- acceptance logic.

## Assisted/manual v1 contract

Stage 3B v1 deliberately avoids an automated filesystem lifecycle. The
repository helper is:

> `<absolute-node> <absolute-repository>/scripts/ecc-lite.js <preview|verify> --home <absolute-home> --source-commit <expected-40-character-lowercase-commit>`

Both operations are read-only. The helper never creates a directory, copies a
file, writes state, repairs content, removes content, invokes the generic ECC
installer, or changes Codex configuration.

### Explicit inputs and sources

The operator must supply:

- an absolute non-root home path, without `.` or `..` segments; and
- the expected exact lowercase 40-character repository commit being inspected.

The helper does not infer a home from environment variables. It records the
actual commit derived from the checkout and reads the repository version from
`package.json`. The expected commit must equal the derived `HEAD`; a mismatch
fails closed. The operator should obtain the expected value from the same
checkout, normally with `git rev-parse HEAD`.

The source inventory is restricted to the complete regular-file contents of:

- `skills/intent-driven-development`; and
- `skills/agent-introspection-debugging`.

The inventory is sorted and records each repository-relative source path,
absolute source path, byte length, and SHA-256 hash. Symbolic links, special
filesystem objects, multiple hard links, missing skills, source escapes, or
source identity changes fail closed.

The helper uses closed, read-only Git commands in the fixed repository root to
derive `HEAD`, enumerate the relevant committed tree, and read its blobs. The
working `package.json` and complete contents of both source skill directories
must have exactly the same tracked paths and bytes as that commit. The relevant
index must equal `HEAD`, the relevant worktree must equal both the index and
`HEAD`, and no relevant untracked or ignored path may exist. A modified, staged,
deleted, untracked, ignored, linked, or otherwise additional relevant source
fails closed. Restoring working bytes cannot hide different staged bytes. The
receipt therefore binds `repoCommit`, repository version, inventory, and hashes
to the same exact `HEAD` source.

### Destination and preview

The only destination mapping is:

> `<absolute-home>/.agents/skills/<skill>/<source-relative-file>`

`preview` reports the profile, source version and commit, exact source
inventory, destination root, collisions, manual copy steps, verification
command, and manual removal guidance as deterministic JSON.

The emitted verification command records the absolute Node executable and
absolute helper path. It is safe to replay from another working directory
without resolving an unrelated local `scripts/ecc-lite.js`.

Exit status `0` means preview is `ready` or verification is `matching`. Exit
status `2` means a valid read-only report is blocked, missing, or drifted. Exit
status `1` means arguments, sources, paths, or inspection failed validation.

Both skill destinations must be absent before copying begins. Any existing
destination is a collision, including identical content. A symlink, junction,
non-directory ancestor, or path escape blocks the preview. The helper neither
adopts nor overwrites existing content.

When the preview status is `ready`, its `manualCopySteps` tell the operator
which directories to create and which exact source file to copy to each exact
destination. Every copy step carries the expected SHA-256 and specifies no
overwrite. The operator, not the helper, performs those steps using a trusted
local filesystem tool and only under separate authority.

### Read-only verification

After an assisted/manual copy, `verify` compares each expected destination
file with its source hash and reports it as:

- `matching` when it is a regular file with exactly one hard link and the
  expected SHA-256;
- `missing` when the expected file is absent; or
- `drifted` when its hash differs, it has multiple hard links, or its
  filesystem type is unsafe.

Unexpected files or directories inside either profile skill are also drift.
The complete status is `matching`, `missing`, or `drifted`; only `matching`
exits successfully. Verification does not create state and does not establish
ownership of pre-existing content.

### Manual removal

Every report includes exact manual removal guidance. The operator must first
run `verify`, then:

1. remove only a listed file that is still reported `matching` and whose
   link count is exactly one and whose SHA-256 still equals the listed required
   hash;
2. stop and review any missing, changed, linked, or otherwise unsafe file;
3. remove only the listed profile directory when it is empty; and
4. preserve every unrelated file, non-empty directory, legacy location, and
   Codex configuration file.

The helper does not remove files or directories. There is no ECC Lite v1
installed-state file, doctor operation, automatic repair, automatic uninstall,
rollback engine, adoption, migration, or automated activation.

### Legacy surfaces

Existing legacy locations, including `$HOME/.codex/skills`, generic ECC
install state, generated wrappers, plugin caches, and previous installations,
are outside the v1 helper. They are not inspected as authority and must not be
moved, adopted, overwritten, disabled, merged, or removed by this profile.

## Deferred and excluded capabilities

The following are explicitly deferred and excluded from ECC Lite:

- additional shared-core skills;
- Software Studio add-ons;
- Insurance Automation add-ons;
- project-specific testing and security skills;
- agents and subagents;
- backend workers;
- hooks;
- MCPs;
- connectors;
- browser automation;
- configuration merging;
- automatic skill evolution;
- self-editing loops;
- evolutionary search;
- telemetry platforms;
- automated installation or activation;
- install-state management;
- doctor, repair, or uninstall integration;
- legacy migration or cleanup;
- email automation;
- Outlook access;
- Power Automate;
- n8n;
- Work IQ;
- Obsidian REST API or MCP;
- Applied EPIC integration;
- Insurance Desk modification; and
- account-intelligence design.

## Stage 3B v1 implementation boundary

The accepted Stage 3B v1 repository slice contains only:

1. this contract and the corresponding current-state, decision, and roadmap
   updates;
2. one dependency-free Node.js helper with only `preview` and `verify`;
3. exact inventory and SHA-256 receipts for the two unchanged skill sources;
4. an explicit absolute-home input plus an expected source commit that must
   equal derived `HEAD`;
5. deterministic structured manual copy and removal guidance;
6. fail-closed source-tree, collision, path, symlink, and hard-link reporting;
7. read-only missing, matching, and drifted verification; and
8. temporary-home tests proving read-only behavior and the boundary above.

Stage 3B v1 excludes:

- skill-body changes or new skills;
- profile, manifest, schema, or generic-installer registration;
- automated copy, install, activation, repair, removal, or rollback;
- install state, doctor, repair, or uninstall integration;
- broad installer refactoring;
- agents, hooks, MCPs, connectors, or configuration merging;
- generated wrappers or new dependencies;
- telemetry or autonomous improvement;
- legacy migration or cleanup;
- real profile use as part of repository validation; and
- Insurance Desk, private data, email, or external-system work.

Any future automated lifecycle is a separate v2 architecture decision and
requires a new issue, threat model, exact implementation boundary, and explicit
authority. It is not the default next step.
