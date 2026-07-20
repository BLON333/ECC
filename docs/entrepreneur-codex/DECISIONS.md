# Decisions

These decisions define the initial Entrepreneur Codex foundation:

- Codex Desktop and Codex CLI are the primary working surfaces.
- ECC is the shared lightweight capability layer.
- The fresh workspace root is `C:\DevV2`.
- Builder, `_desktop-coding-stack`, and Hermes are excluded from this setup.
- Software Studio and Internal Automation share a foundation but remain separate lanes, with separate repositories, data, credentials, and runtime permissions.
- Product repositories remain separate from ECC.
- Insurance-assistance software lives in a private repository; live insurance working data belongs only in a separately approved Insurance Desk workspace outside Git. Assistance is initially assist-only, and Jason reviews and performs every external action manually.
- Client emails, documents, PDFs, applications, account data, personal information, and credentials never enter Git.
- GitHub is authoritative for repositories, issues, branches, pull requests, and code.
- Keep one active writing thread and one writer per repository.
- Paid spend and consequential actions require operator approval.
- Material from repositories under the old `C:\Dev` root is not copied or migrated into this workspace.

## Operating architecture decisions

- A Codex Project is the persistent room for one repository or operating area.
- Keep one focused outcome per thread.
- Canonical repository folders are the durable Codex Projects.
- Any authorized task that will commit code, tests, configuration, scripts, skills, or documentation uses a Codex-managed worktree by default. Read-only planning, orientation, and review use the canonical Project without requiring a worktree.
- `C:\DevV2\_worktrees` is not a Codex Project. Manually managed worktrees under that folder are exceptional recovery, fixed-path, specialist-tool, or deliberately long-lived lanes.
- Completed worktrees are removed only after merge and verification.
- The starting Project boundaries are ECC, Insurance Ops — Build, Insurance Desk — Operate, and a separate Future Product only when one exists.
- Insurance Desk — Operate is a future approved private operating workspace. It is not an Insurance Ops — Build worktree or part of the software repository.
- Insurance Ops — Build changes the private software. If separately approved, Insurance Desk — Operate supports assist-only insurance work from private evidence, account history, Approved processes, and reviewed drafts.
- Tool connections are governed as connection, permission, workflow, health check, and maintenance record. Technical access never grants operating authority.
- MCP is used only when a persistent structured connection is justified; ordinary instructions, skills, and CLI workflows remain the lighter default.
- Applied EPIC remains the official account and activity record. Outlook and original documents are communication and documentary evidence; curated operational memory does not replace either authority surface.
- Account memory is anchored to the business account rather than an email thread, and conversations are not durable authority.
- Only Approved organization process knowledge may drive a workflow.
- A future Entrepreneur ECC Doctor may compose native ECC install health with connection checks, but it is not implemented in this slice.

## Proposed directions — not accepted decisions

- Subject to separate organization approval for storage, backup, retention, device security, and AI handling, the proposed starting direction is an Obsidian-first, human-readable Insurance Desk workspace outside the private software repository and outside Git.
- The proposed configurable root is `INSURANCE_DESK_HOME`, with `C:\InsuranceDesk` as a provisional local default. The exact final storage location remains approval-dependent.
- SQLite is deferred to an optional, generated, and rebuildable `State/index.sqlite`; it is not the initial editable authority.
- These proposals do not authorize workspace creation, real client-data use, a connector, or the next implementation slice.
