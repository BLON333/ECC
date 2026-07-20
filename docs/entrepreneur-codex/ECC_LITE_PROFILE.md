# ECC Lite Profile Contract

This document is the normative contract for ECC Lite inside Entrepreneur
Codex. Stage 3A.2 accepts the design only. It does not implement, install, or
activate a profile, and it grants no implementation or external-action
authority.

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

ECC Lite is only the small ECC-managed installable profile inside that larger
harness. It is not the harness itself.

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
| Installation state | Not implemented, installed, or activated by Stage 3A.2 |

No other skill belongs in the initial shared profile.

### Skill boundaries

| Single-skill module ID | Existing unchanged skill |
|---|---|
| `skill-intent-driven-development` | `intent-driven-development` |
| `skill-agent-introspection-debugging` | `agent-introspection-debugging` |

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
exact-head review, merge, installation, and activation authority.

The harness may never autonomously weaken or rewrite:

- evaluator independence;
- permission boundaries;
- credentials;
- production controls;
- operator authority; or
- acceptance logic.

## Safe install and lifecycle contract

This section freezes the intended later Stage 3B lifecycle. It does not
authorize any lifecycle operation.

### Destinations

New ECC-managed Codex user skills belong under:

> `$HOME/.agents/skills`

The ECC installed-state file may remain at:

> `$HOME/.codex/ecc-install-state.json`

These are separate trusted roots. Stage 3B must enforce canonical containment
for both, and no managed path may escape the approved skill root or the exact
installed-state location.

### Read-only operations

The following operations remain read-only:

- plan;
- inspection;
- list-installed;
- doctor; and
- every dry-run mode.

### New-install collision policy

A new installation must fail closed when:

- either intended skill destination already exists;
- the ECC installed-state file already exists;
- an intended destination is a symlink, junction, or path escape; or
- state is missing, malformed, or inconsistent.

Identical existing content must not be silently adopted.

### Legacy surfaces

Existing legacy locations, including:

- `$HOME/.codex/skills`;
- generated wrappers;
- plugin caches;
- previous installations; and
- quarantined artifacts;

may be reported but must not be moved, adopted, overwritten, disabled, merged,
or deleted. Legacy migration or coexistence remains a separate future design.

### Repair and uninstall

Repair and uninstall must:

- require valid matching ECC state;
- begin with dry-run;
- touch only recorded ECC-managed files;
- preserve unrelated files;
- block destructive removal when managed content has drifted; and
- refuse path or symlink escapes.

Actual install, repair, uninstall, or migration remains separately authorized.

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
- autonomous installation or activation;
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

## Stage 3B implementation boundary

Stage 3B is a possible later implementation slice. It is recommended, not
authorized or started. A separate, exact authority grant is required.

A separately authorized Stage 3B may implement only:

1. One Codex-only `entrepreneur-codex` profile selecting the two existing
   single-skill modules.
2. The smallest manifest, schema, or resolver adjustment required to enforce
   Codex-only targeting.
3. Safe Codex destination mapping under `$HOME/.agents/skills`.
4. Canonical containment across the approved skill root and the ECC
   installed-state file.
5. New-install collision refusal.
6. Unmanaged legacy-surface reporting without migration or adoption.
7. Safe state creation.
8. Failure rollback affecting only newly created ECC-managed files.
9. Fail-closed doctor, repair, and uninstall.
10. Temporary-home tests covering exact profile resolution, Codex-only
    targeting, dry-run non-mutation, destination mapping, collisions,
    malformed state, missing state, drift, symlinks, junctions, path escapes,
    repair, uninstall, unrelated-file preservation, and rollback after partial
    failure.
11. Narrow selective-install documentation.

Stage 3B must exclude:

- skill-body changes;
- new skills;
- broad installer refactoring;
- agents;
- hooks;
- MCPs;
- connectors;
- configuration merging;
- generated wrappers;
- dependencies unrelated to the bounded implementation;
- telemetry;
- autonomous improvement;
- legacy migration;
- real installation;
- profile activation; and
- Insurance Desk or email work.
