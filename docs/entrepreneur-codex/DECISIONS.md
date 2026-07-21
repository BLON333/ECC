# Decisions

These decisions define the initial Entrepreneur Codex foundation:

- Codex Desktop and Codex CLI are the primary working surfaces.
- ECC Lite is the small ECC-managed capability profile inside Entrepreneur Codex; it is not the larger harness.
- The fresh workspace root is `C:\DevV2`.
- Builder, `_desktop-coding-stack`, and Hermes are excluded from this setup.
- Software Studio and Internal Automation share a foundation but remain separate lanes, with separate repositories, data, credentials, and runtime permissions.
- Product repositories remain separate from ECC.
- Insurance-assistance software is owned by the separate Insurance Automation domain; local live insurance working data belongs only in the operator-designated private Insurance Desk at `C:\Insurance Desk\Insurance Desk`, outside Git. ECC owns neither. Assistance remains assist-only, and Jason reviews and performs every external action manually.
- Client emails, documents, PDFs, applications, account data, personal information, and credentials never enter Git.
- GitHub is authoritative for repositories, issues, branches, pull requests, and code.
- Paid spend and consequential actions require operator approval.
- Material from repositories under the old `C:\Dev` root is not copied or migrated into this workspace.

## Operating architecture decisions

- The [Codex Project and Session Topology](PROJECT_SESSION_TOPOLOGY.md) is the accepted normative source for Project, thread, canonical repository, active-writer, worktree, exception, and post-merge cleanup mechanics.
- The starting Project boundaries are ECC, Insurance Automation — Build, Insurance Desk — Operate, and a separate Future Product only when one exists.
- `C:\Insurance Desk\Insurance Desk` is the sole canonical insurance working vault, active private Insurance Desk content tree, and selected boundary for Insurance Desk — Operate. It is not an Insurance Automation — Build worktree or part of the software repository.
- Insurance Automation — Build owns, changes, and tests the private software using permitted fixtures. Insurance Desk — Operate owns private insurance working material and supports operator-designated assist-only work from private evidence, account history, Approved processes, and reviewed drafts. ECC owns only its shared capability and cross-domain contracts.
- `C:\Dev\products\insurance-form-automation_VAULT` is retained legacy/reference-only state and must not be read, written, migrated, merged, or deleted without separate explicit authority.
- `C:\Dev\Brain\Insurance Day` is legacy and is not an insurance evidence or continuity source; insurance working notes must not be created, read, or updated there. `C:\Dev\Brain\CLAUDE.md` remains only a read-only personal operating profile, not an insurance vault.
- The active content tree may become the Insurance Desk — Operate Codex Project after local Obsidian and Project configuration is stabilized.
- The permanent knowledge model is account-centred and uses `Accounts`, `Events`, `Organization`, `Drafts`, and `System`. `Raw Data` is a temporary ingestion queue, not permanent memory.
- Raw Data sources move through `Unreviewed → Processing → Incorporated → Verified → Safe to Remove or Archive`, with incorporation and disposition recorded in `System\INGESTION_REGISTER.md` before a temporary copy is removed or archived.
- Operator-designated local real-data use in the private Insurance Desk is active and assist-only. This designation does not claim unevidenced employer, regulatory, insurer, or third-party approval and does not authorize cloud synchronization, a connector, or an external action.
- `C:\Insurance Desk\.obsidian` is a pending configuration-placement issue rather than a storage migration. The empty `C:\Insurance Desk\Vault` placeholder is not the active vault.
- The [Tool and Connection Maintenance Contract](CONNECTION_MAINTENANCE.md) is the accepted normative source for capability selection, connection permissions, health checks, maintenance, fallback, revocation, and future Entrepreneur Doctor composition.
- The [Insurance Knowledge Architecture](INSURANCE_KNOWLEDGE_ARCHITECTURE.md) is the accepted normative source for insurance evidence and memory authority, account anchoring, process states, data boundaries, and fixture rules.
- The [ECC Lite Profile Contract](ECC_LITE_PROFILE.md) is the accepted normative source for the full-harness versus ECC Lite distinction, initial profile, seven-phase operator model, assisted/manual v1 boundary, minimal evidence, human-governed improvement, and deferred capabilities.

## ECC Lite design decisions

- The accepted profile ID is `entrepreneur-codex`, and its only target is Codex.
- The initial shared core contains exactly the unchanged `skill-intent-driven-development` and `skill-agent-introspection-debugging` single-skill modules. No other skill belongs in the profile.
- Explore, Shape, Plan, Build, Review, Release, and Recover are a human operating model, not seven installed skills.
- V1 uses no automated installer or installed state. Its dependency-free helper is strictly read-only and supports only `preview` and `verify` for an explicitly supplied absolute home and expected source commit.
- V1 maps the two complete unchanged skill directories only to `<absolute-home>/.agents/skills`. Existing destinations fail closed as collisions; identical content is not adopted or overwritten.
- Preview derives the actual repository `HEAD`, requires it to equal the expected commit, and byte-binds `package.json` plus both complete skill sources to that exact committed tree. The scoped index must equal `HEAD`, the worktree must equal the index and `HEAD`, and no scoped untracked or ignored path may exist; relevant drift and source hard links fail closed.
- Preview records the repository version, derived source commit, exact source paths, byte lengths, SHA-256 hashes, manual copy steps, an absolute cwd-independent verification command, and exact manual removal guidance as deterministic JSON.
- Verification reports expected destination files as matching, missing, or drifted and treats unexpected content or multiple hard links as drift. It writes no state and grants no ownership of existing content.
- Copying and removal are explicit operator-performed filesystem actions under separate authority. Removal is limited to still-matching listed files followed by empty listed profile directories.
- V1 is not registered with the generic installer and adds no profile manifest, schema, install state, doctor, repair, uninstall, rollback, activation, dependency, or skill-body change.
- Existing and legacy surfaces may be reported but are not adopted, migrated, merged, overwritten, disabled, or removed.
- Harness evidence records are reserved for evaluated pilots, material failures, recurring friction patterns, and proposed harness changes.
- Harness improvement remains human-governed and bounded. Rejection changes nothing; acceptance still passes through normal issue, worktree, pull-request, exact-head review, merge, installation, and activation authority.
- ECC Lite contains no agent, hook, MCP, connector, or autonomous runtime.

## Proposed directions — not accepted implementation decisions

- The proposed future work-email architecture has Microsoft 365 as the mailbox plane and the private Insurance Desk as the account-memory, organization-process, reasoning, and drafting plane. The planes may later communicate through an approved provenance-preserving structured work queue or file bridge, with initial transport remaining manual.
- Work IQ remains a possible future direct connection but is currently blocked by Microsoft Entra tenant administration. It remains parked and must not block the current system; any service-principal provisioning or administrative consent requires separate consequential-action authority.
- Power Automate, Microsoft List or SharePoint, OneDrive for Business, and Copilot Studio remain candidate Microsoft-side components pending separate user-permission, tenant-policy, data-boundary, and reliability assessment. No specific component, queue schema, folder structure, permission, attachment flow, or synchronization mechanism is selected here.
- Detailed Microsoft 365 queue, transport, permissions, storage, synchronization, connector, reconciliation, and revocation design belongs to a later private Insurance Ops slice using synthetic fixtures for software development.
- SQLite remains deferred as optional, generated, rebuildable retrieval state. It is not editable authority, and its location and schema are not decided here.
- Any automated ECC Lite install, state, doctor, repair, uninstall, rollback, or activation lifecycle is deferred to a separately designed and authorized v2. It is not the default next slice.
- These directions do not authorize Insurance Desk changes, a Codex Project or Obsidian configuration change, mailbox access, a connector, cloud synchronization, automated flags, categories, drafts, sends, attachment transfer, an external action, or the next implementation slice.
