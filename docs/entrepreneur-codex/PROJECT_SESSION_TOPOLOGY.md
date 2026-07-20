# Codex Project and Session Topology

This contract defines where work belongs before the lightweight Entrepreneur ECC profile is designed. It organizes existing Codex and ECC concepts; it does not add a runtime.

## Working units

| Unit | Plain-English meaning |
|---|---|
| Codex Project | The persistent room for one repository or operating area. It holds the relevant root, instructions, and task history. |
| Thread | One focused outcome inside a Project. A thread is temporary working context, not durable business memory. |
| Worktree | An isolated Git workbench for an authorized code or documentation change. It is not needed for read-only work or ordinary operating tasks. |
| Private knowledge layer | Durable business memory and evidence references kept outside Git. New task threads retrieve the relevant account history and Approved processes from it. |

ECC's native `ecc.session.v1` snapshots may later report runtime, worker, branch, and worktree status. They are execution telemetry, not a replacement for Codex Projects, focused threads, or durable business memory.

## Starting Projects

These are the intended Project boundaries. Naming a Project here does not create it or grant access to its systems.

| Project | Boundary | Purpose |
|---|---|---|
| ECC | `C:\DevV2\ECC` | Maintain the shared lightweight capability and operating contracts. |
| Insurance Ops — Build | `C:\DevV2\automations\insurance-ops` | Build, test, and improve the insurance-assistance software. It contains software, not live client working memory. |
| Insurance Desk — Operate | Future private local operating Project | Perform actual insurance work from source materials, account history, Approved processes, and generated drafts. It is not created by this slice. |
| Future Product | A separate repository and Project, only when a real product exists | Build that product without mixing it into ECC or insurance operations. |

**Insurance Ops — Build** and **Insurance Desk — Operate** are deliberately separate. Build changes the software. Operate uses approved software and private evidence to prepare real work. Build has no implied access to client data, and Operate has no implied authority to change software or perform an external action.

## Operating rules

- Keep one outcome per thread.
- Keep one active writer per repository.
- Use a worktree only for an authorized implementation change.
- Do not use one permanent client thread as account memory.
- Start a fresh task thread for a new outcome and retrieve the durable account history and Approved processes it needs.
- Record durable repository decisions in repository documentation. Repository memory is more authoritative than old chats.
- Treat conversations as working context. A conversation does not approve a process, change a system of record, or grant a connector permission.

## Authority boundaries

- GitHub is authoritative for repository code, branches, issues, pull requests, checks, and merges.
- Applied EPIC is authoritative for live insurance account and activity records.
- The private knowledge layer is an AI-readable operational history and evidence index; it does not replace Applied EPIC.
- Approved repository instructions and Approved organization processes govern workflows. Old conversations do not.
