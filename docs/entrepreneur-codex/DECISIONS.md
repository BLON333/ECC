# Decisions

These decisions define the initial Entrepreneur Codex foundation:

- Codex Desktop and Codex CLI are the primary working surfaces.
- ECC is the shared lightweight capability layer.
- The fresh workspace root is `C:\DevV2`.
- Builder, `_desktop-coding-stack`, and Hermes are excluded from this setup.
- Software Studio and Internal Automation share a foundation but remain separate lanes, with separate repositories, data, credentials, and runtime permissions.
- Product repositories remain separate from ECC.
- Insurance operations live in a private repository and are assist-only initially; Jason reviews and performs every external action manually.
- Client emails, documents, PDFs, applications, account data, personal information, and credentials never enter Git.
- GitHub is authoritative for repositories, issues, branches, pull requests, and code.
- Each repository has one active implementation slice, and each branch or worktree has one writer.
- Paid spend and consequential actions require operator approval.
- Material from repositories under the old `C:\Dev` root is not copied or migrated into this workspace.

## Operating architecture decisions

- A Codex Project is the persistent room for one repository or operating area; each thread owns one focused outcome.
- Worktrees are reserved for authorized implementation changes, and each repository has only one active writer.
- The starting Project boundaries are ECC, Insurance Ops — Build, Insurance Desk — Operate, and a separate Future Product only when one exists.
- Insurance Ops — Build changes the software. Insurance Desk — Operate performs assist-only insurance work from private evidence, account history, Approved processes, and reviewed drafts.
- Tool connections are governed as connection, permission, workflow, health check, and maintenance record. Technical access never grants operating authority.
- MCP is used only when a persistent structured connection is justified; ordinary instructions, skills, and CLI workflows remain the lighter default.
- Applied EPIC remains the official account and activity record. Private insurance memory is a separate AI-readable operational history and evidence index.
- Account memory is anchored to the business account rather than an email thread, and conversations are not durable authority.
- Only Approved organization process knowledge may drive a workflow.
- The future private knowledge layer remains outside Git and begins with SQLite, structured files, and search; no vector database is required initially.
- A future Entrepreneur ECC Doctor may compose native ECC install health with connection checks, but it is not implemented in this slice.
