# Decisions

These decisions define the initial Entrepreneur Codex foundation:

- Codex Desktop and Codex CLI are the primary working surfaces.
- ECC is the shared lightweight capability layer.
- The fresh workspace root is `C:\DevV2`.
- Builder, `_desktop-coding-stack`, and Hermes are excluded from this setup.
- Software Studio and Internal Automation share a foundation but remain separate lanes, with separate repositories, data, credentials, and runtime permissions.
- Product repositories remain separate from ECC.
- Insurance-assistance software lives in a private repository; local live insurance working data belongs in the operator-designated private Insurance Desk at `C:\Insurance Desk\Insurance Desk`, outside Git. Assistance remains assist-only, and Jason reviews and performs every external action manually.
- Client emails, documents, PDFs, applications, account data, personal information, and credentials never enter Git.
- GitHub is authoritative for repositories, issues, branches, pull requests, and code.
- Paid spend and consequential actions require operator approval.
- Material from repositories under the old `C:\Dev` root is not copied or migrated into this workspace.

## Operating architecture decisions

- The [Codex Project and Session Topology](PROJECT_SESSION_TOPOLOGY.md) is the accepted normative source for Project, thread, canonical repository, active-writer, worktree, exception, and post-merge cleanup mechanics.
- The starting Project boundaries are ECC, Insurance Ops — Build, Insurance Desk — Operate, and a separate Future Product only when one exists.
- `C:\Insurance Desk\Insurance Desk` is the active private Insurance Desk content tree, the selected boundary for Insurance Desk — Operate, and the intended Obsidian operating vault. It is not an Insurance Ops — Build worktree or part of the software repository.
- Insurance Ops — Build changes and tests the private software using permitted fixtures. Insurance Desk — Operate supports operator-designated assist-only insurance work from private evidence, account history, Approved processes, and reviewed drafts.
- The active content tree may become the Insurance Desk — Operate Codex Project after local Obsidian and Project configuration is stabilized.
- The permanent knowledge model is account-centred and uses `Accounts`, `Events`, `Organization`, `Drafts`, and `System`. `Raw Data` is a temporary ingestion queue, not permanent memory.
- Raw Data sources move through `Unreviewed → Processing → Incorporated → Verified → Safe to Remove or Archive`, with incorporation and disposition recorded in `System\INGESTION_REGISTER.md` before a temporary copy is removed or archived.
- Operator-designated local real-data use in the private Insurance Desk is active and assist-only. This designation does not claim unevidenced employer, regulatory, insurer, or third-party approval and does not authorize cloud synchronization, a connector, or an external action.
- `C:\Insurance Desk\.obsidian` is a pending configuration-placement issue rather than a storage migration. The empty `C:\Insurance Desk\Vault` placeholder is not the active vault.
- The accepted target architecture for future work-email automation has Microsoft 365 as the mailbox plane and the private Insurance Desk as the account-memory, process, reasoning, and drafting plane, joined only by an approved provenance-preserving structured work-packet bridge. Initial transport remains manual, and this direction grants no mailbox, connector, cloud, draft, send, or external-action authority.
- The [Tool and Connection Maintenance Contract](CONNECTION_MAINTENANCE.md) is the accepted normative source for capability selection, connection permissions, health checks, maintenance, fallback, revocation, and future Entrepreneur Doctor composition.
- The [Insurance Knowledge Architecture](INSURANCE_KNOWLEDGE_ARCHITECTURE.md) is the accepted normative source for insurance evidence and memory authority, account anchoring, process states, data boundaries, and fixture rules.

## Proposed directions — not accepted implementation decisions

- Detailed Microsoft 365 queue, transport, permissions, storage, synchronization, connector, reconciliation, and revocation design belongs to a later private Insurance Ops slice using synthetic fixtures for software development.
- SQLite remains deferred as optional, generated, rebuildable retrieval state. It is not editable authority, and its location and schema are not decided here.
- These directions do not authorize Insurance Desk changes, a Codex Project or Obsidian configuration change, mailbox access, a connector, cloud synchronization, an external action, or the next implementation slice.
