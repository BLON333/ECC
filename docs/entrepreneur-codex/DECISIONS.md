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
- Paid spend and consequential actions require operator approval.
- Material from repositories under the old `C:\Dev` root is not copied or migrated into this workspace.

## Operating architecture decisions

- The [Codex Project and Session Topology](PROJECT_SESSION_TOPOLOGY.md) is the accepted normative source for Project, thread, canonical repository, active-writer, worktree, exception, and post-merge cleanup mechanics.
- The starting Project boundaries are ECC, Insurance Ops — Build, Insurance Desk — Operate, and a separate Future Product only when one exists.
- Insurance Desk — Operate is a future approved private operating workspace. It is not an Insurance Ops — Build worktree or part of the software repository.
- Insurance Ops — Build changes the private software. If separately approved, Insurance Desk — Operate supports assist-only insurance work from private evidence, account history, Approved processes, and reviewed drafts.
- The [Tool and Connection Maintenance Contract](CONNECTION_MAINTENANCE.md) is the accepted normative source for capability selection, connection permissions, health checks, maintenance, fallback, revocation, and future Entrepreneur Doctor composition.
- The [Insurance Knowledge Architecture](INSURANCE_KNOWLEDGE_ARCHITECTURE.md) is the accepted normative source for insurance evidence and memory authority, account anchoring, process states, data boundaries, and fixture rules.

## Proposed directions — not accepted decisions

- Subject to separate organization approval for storage, backup, retention, device security, and AI handling, the proposed starting direction is an Obsidian-first, human-readable Insurance Desk workspace outside the private software repository and outside Git.
- The proposed configurable root is `INSURANCE_DESK_HOME`, with `C:\InsuranceDesk` as a provisional local default. The exact final storage location remains approval-dependent.
- SQLite is deferred to an optional, generated, and rebuildable `State/index.sqlite`; it is not the initial editable authority.
- These proposals do not authorize workspace creation, real client-data use, a connector, or the next implementation slice.
