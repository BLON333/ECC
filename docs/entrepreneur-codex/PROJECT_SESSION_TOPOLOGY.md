# Codex Project and Session Topology

This contract defines where work belongs alongside the lightweight
[Entrepreneur ECC profile](ECC_LITE_PROFILE.md). It organizes existing Codex
and ECC concepts; it does not add a runtime. Canonical repository folders are
the durable Codex Projects. Worktrees are temporary execution spaces attached
to those Projects.

## Document responsibilities

Each contract has one normative responsibility. Summaries and cross-references do not create a second source of policy; if wording conflicts, the document assigned below controls its subject.

| Document | Normative responsibility |
|---|---|
| [North Star](NORTH_STAR.md) | Purpose, outcomes, and enduring principles only. |
| [Roadmap](ROADMAP.md) | Planned sequence only; it never authorizes a slice. |
| [Current State](CURRENT.md) | Last completed slice, active authorization, current state, and the recommended next slice only. |
| [Decisions](DECISIONS.md) | Accepted decisions and clearly separated proposed directions; it records decisions rather than full operating procedures. |
| [Operator Contract](OPERATOR_CONTRACT.md) | Authority, approvals, consequential actions, and fail-closed behavior. |
| Codex Project and Session Topology (this document) | Codex Projects, threads, canonical repositories, Codex-managed worktrees, exceptional manual worktrees, active-writer rules, and post-merge cleanup. |
| [Tool and Connection Maintenance Contract](CONNECTION_MAINTENANCE.md) | Connectors, permissions, health checks, maintenance, fallback, and revocation. |
| [Insurance Knowledge Architecture](INSURANCE_KNOWLEDGE_ARCHITECTURE.md) | Insurance Desk memory, evidence, authority, organization-process states, data boundaries, and fixture rules. |
| [ECC Lite Profile Contract](ECC_LITE_PROFILE.md) | Full-harness versus ECC Lite distinction, profile and non-goals, seven-phase operator model, safe lifecycle, minimal evidence, human-governed improvement, deferred capabilities, and Stage 3B boundary. |

## Working units

| Unit | Plain-English meaning |
|---|---|
| Codex Project | The persistent room for one repository or operating area. It holds the relevant root, instructions, and task history. |
| Thread | One focused outcome inside a Project. A thread is temporary working context, not durable business memory. |
| Worktree | An isolated Git workbench for an authorized writing task. It is temporary execution space, not a Codex Project. |
| ECC Skill | A repeatable workflow loaded when a task needs it. The durable workflow belongs in ECC's native `skills/` surface. |
| MCP or connector | Controlled access to another system. It supplies tools or data but does not grant authority to act. |
| Insurance Desk workspace | Sole canonical insurance working vault and active private operating area at `C:\Insurance Desk\Insurance Desk`. It is outside Git and is not a repository, worktree, or system of record. |

ECC's native `ecc.session.v1` snapshots may later report runtime, worker, branch, and worktree status. They are execution telemetry, not a replacement for Codex Projects, focused threads, or durable business memory.

## Starting Projects

These are the intended Project boundaries. Naming a Project here does not create it or grant access to its systems.

| Project | Boundary | Purpose |
|---|---|---|
| ECC | `C:\DevV2\ECC` | Maintain the shared lightweight capability and operating contracts. |
| Insurance Ops — Build | `C:\DevV2\automations\insurance-ops` | Own, build, test, and improve the insurance-assistance software in `BLON333/operator-insurance-ops`. It contains software, not live client working memory. Governed writes use that repository's authorized worktree lane. |
| Insurance Desk — Operate | `C:\Insurance Desk\Insurance Desk` | Sole canonical insurance working vault and active private operating area for assist-only insurance work from source materials, account history, Approved processes, and generated drafts. It may become the Codex Project boundary after local Obsidian and Project configuration is stabilized. |
| Future Product | A separate repository and Project, only when a real product exists | Build that product without mixing it into ECC or insurance operations. |

**ECC**, **Insurance Ops — Build**, and **Insurance Desk — Operate** have separate ownership. ECC maintains shared capability and these contracts. Build owns and changes the insurance software. Operate uses approved software and private evidence to prepare real work. Build has no implied access to client data, and Operate has no implied authority to change software or perform an external action.

`C:\Insurance Desk\Insurance Desk` is the operator-designated sole canonical insurance working vault and active private Insurance Desk content tree. It is not an Insurance Ops — Build worktree or part of the software repository. `C:\Dev\products\insurance-form-automation` (`BLON333/insurance-form-automation`) is a legacy/inactive repository, not current build authority or a runtime dependency. It may be consulted as reference material only under separate explicit read authority and must not be written, migrated, merged, or reactivated without separate explicit authority. `C:\Dev\products\insurance-form-automation_VAULT` is retained legacy state, not current authority. It may be consulted as reference material only under separate explicit read authority, and it must not be written, migrated, merged, or deleted without separate explicit authority. `C:\Dev\Brain\Insurance Day` is legacy and is not an insurance evidence or continuity source; insurance working notes must not be created, read, or updated there. `C:\Dev\Brain\CLAUDE.md` remains only a read-only personal operating profile, not an insurance vault. This documentation correction does not inspect, configure, or modify any of those locations.

## Operating rules

- Keep one focused outcome per thread.
- Keep one active writing thread and one writer per repository.
- Any authorized task that will commit code, tests, configuration, scripts, skills, or documentation uses a Codex-managed worktree by default. Read-only planning, orientation, and review use the canonical Project without requiring a worktree.
- `C:\DevV2\_worktrees` is not a Codex Project. Manually managed worktrees under that folder are exceptional recovery, fixed-path, specialist-tool, or deliberately long-lived lanes.
- Completed worktrees are removed only after merge and verification.
- Record durable repository decisions in repository documentation. Repository memory is more authoritative than old chats.

## Related authority contracts

- Authority, approvals, consequential actions, and fail-closed behavior are defined in the [Operator Contract](OPERATOR_CONTRACT.md).
- Connector permissions, health checks, maintenance, fallback, and revocation are defined in the [Tool and Connection Maintenance Contract](CONNECTION_MAINTENANCE.md).
- Insurance record, evidence, memory, process-state, and data-boundary authority are defined in the [Insurance Knowledge Architecture](INSURANCE_KNOWLEDGE_ARCHITECTURE.md).
- ECC Lite profile scope, lifecycle safety, evidence, improvement, exclusions, and the Stage 3B boundary are defined in the [ECC Lite Profile Contract](ECC_LITE_PROFILE.md).
