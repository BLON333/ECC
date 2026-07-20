# Codex Project and Session Topology

This contract defines where work belongs before the lightweight Entrepreneur ECC profile is designed. It organizes existing Codex and ECC concepts; it does not add a runtime. Canonical repository folders are the durable Codex Projects. Worktrees are temporary execution spaces attached to those Projects.

## Working units

| Unit | Plain-English meaning |
|---|---|
| Codex Project | The persistent room for one repository or operating area. It holds the relevant root, instructions, and task history. |
| Thread | One focused outcome inside a Project. A thread is temporary working context, not durable business memory. |
| Worktree | An isolated Git workbench for an authorized writing task. It is temporary execution space, not a Codex Project. |
| ECC Skill | A repeatable workflow loaded when a task needs it. The durable workflow belongs in ECC's native `skills/` surface. |
| MCP or connector | Controlled access to another system. It supplies tools or data but does not grant authority to act. |
| Insurance Desk workspace | Proposed Obsidian-first curated operational memory and evidence references outside Git. It is not a repository, worktree, or system of record. |

ECC's native `ecc.session.v1` snapshots may later report runtime, worker, branch, and worktree status. They are execution telemetry, not a replacement for Codex Projects, focused threads, or durable business memory.

## Starting Projects

These are the intended Project boundaries. Naming a Project here does not create it or grant access to its systems.

| Project | Boundary | Purpose |
|---|---|---|
| ECC | `C:\DevV2\ECC` | Maintain the shared lightweight capability and operating contracts. |
| Insurance Ops — Build | `C:\DevV2\automations\insurance-ops` | Build, test, and improve the insurance-assistance software. It contains software, not live client working memory. |
| Insurance Desk — Operate | Future approved private operating workspace | Support assist-only insurance work from source materials, account history, Approved processes, and generated drafts. |
| Future Product | A separate repository and Project, only when a real product exists | Build that product without mixing it into ECC or insurance operations. |

**Insurance Ops — Build** and **Insurance Desk — Operate** are deliberately separate. Build changes the software. Operate uses approved software and private evidence to prepare real work. Build has no implied access to client data, and Operate has no implied authority to change software or perform an external action.

Insurance Desk — Operate is a future approved private operating workspace. It is not an Insurance Ops — Build worktree or part of the software repository. It is not created by this slice.

## Operating rules

- Keep one focused outcome per thread.
- Keep one active writing thread and one writer per repository.
- Any authorized task that will commit code, tests, configuration, scripts, skills, or documentation uses a Codex-managed worktree by default. Read-only planning, orientation, and review use the canonical Project without requiring a worktree.
- `C:\DevV2\_worktrees` is not a Codex Project. Manually managed worktrees under that folder are exceptional recovery, fixed-path, specialist-tool, or deliberately long-lived lanes.
- Completed worktrees are removed only after merge and verification.
- Do not use one permanent client thread as account memory.
- Start a fresh task thread for a new outcome and retrieve the durable account history and Approved processes it needs.
- Record durable repository decisions in repository documentation. Repository memory is more authoritative than old chats.
- Treat conversations as working context. A conversation does not approve a process, change a system of record, or grant a connector permission.

## Authority boundaries

- GitHub is authoritative for repository code, branches, issues, pull requests, checks, and merges.
- Applied EPIC is authoritative for live insurance account and activity records.
- The proposed Insurance Desk Vault is curated operational memory; it does not replace Applied EPIC, Outlook, or original evidence, and generated state has no independent authority.
- Approved repository instructions and Approved organization processes govern workflows. Old conversations do not.
