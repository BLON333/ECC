# Insurance Knowledge Architecture

This contract defines the operator-designated sole canonical Insurance Desk working vault for assist-only insurance work. It separates local live working data from insurance-assistance software, ECC, and Git. This documentation correction does not create, inspect, migrate, reorganize, or configure the workspace, its contents, a database, a connector, or an ingestion runtime.

## Status and location

- Sole canonical insurance working vault and active private content tree: `C:\Insurance Desk\Insurance Desk`
- Selected boundary for Insurance Desk — Operate: `C:\Insurance Desk\Insurance Desk`
- Possible future Codex Project boundary: the same content tree, after local Obsidian and Project configuration is stabilized

The `.obsidian` directory currently located at `C:\Insurance Desk\.obsidian` is a configuration-placement issue to reconcile separately; it does not invalidate the selected content tree. `C:\Insurance Desk\Vault` is an empty placeholder, not the intended active vault. This contract records the operator's designation and does not claim employer, regulatory, insurer, or third-party approval that has not been evidenced.

Insurance Automation owns the software workflow; Insurance Desk owns private insurance working material; ECC owns neither and records only the cross-domain contract. `C:\Dev\products\insurance-form-automation_VAULT` is retained legacy state, not current authority. It may be consulted as reference material only under separate explicit read authority, and it must not be written, migrated, merged, or deleted without separate explicit authority. `C:\Dev\Brain\Insurance Day` is legacy and is not an insurance evidence or continuity source; no insurance working notes belong there. `C:\Dev\Brain\CLAUDE.md` is only a read-only personal operating profile, not an insurance vault or system of record.

## Authority

| Source | Authority |
|---|---|
| Applied EPIC | Official account and activity record. The operator performs and confirms every live action there. |
| Outlook and original documents | Communication and documentary evidence whose identity, date, and provenance must be retained. |
| Canonical Insurance Desk vault | Curated human-readable and AI-readable operating memory at `C:\Insurance Desk\Insurance Desk` for retrieval, drafting, and review. It does not replace Applied EPIC, Outlook, or original source evidence. |
| Generated state | Optional derived indexes for retrieval. Generated state is rebuildable and is never an editable source of authority. |
| Conversations | Temporary working context, not durable account memory or process approval. |
| GitHub | Authority for software and repository documentation only; it never stores private client material. |

Every material fact must retain its source reference, observed or confirmed date, and verification status. Verified facts must remain distinguishable from AI interpretation, generated summaries, and recommendations. Memory updates are proposed for operator review rather than silently overwriting or replacing account history.

## A. Account and client memory

Memory is anchored to the business account, not an email thread. Each account record must support:

- verified identity;
- contacts;
- locations;
- operations;
- policies and renewals;
- submissions and quotes;
- source documents;
- communication timeline;
- open commitments;
- tasks;
- current strategy; and
- evidence references.

A new task thread retrieves the relevant account brief and evidence; it does not depend on finding an old conversation.

## B. Organization process knowledge

Process knowledge records how the organization has decided work should be performed. Each process has one of four states:

| State | Meaning |
|---|---|
| Approved | Reviewed, current, and permitted to drive a workflow. |
| Pending review | Awaiting operator review; it may support review but cannot drive a workflow. |
| Superseded | Retained for history and linked to its replacement; it cannot drive a workflow. |
| Draft | An unapproved proposal or working note; it cannot drive a workflow. |

Only **Approved** process knowledge may drive a workflow. Each process should record its owner, reviewer, effective date, evidence, version, and any process it supersedes.

## Current knowledge model

The permanent knowledge model is account-centred and uses these top-level areas inside `C:\Insurance Desk\Insurance Desk`:

| Area | Purpose |
|---|---|
| `Accounts` | Current account briefs; client and prospect history; contacts, locations, operations, policies, renewals, submissions, quotes, commitments, strategy, and evidence references. |
| `Events` | Dated emails, calls, documents, decisions, quotes, submissions, commitments, and material changes. |
| `Organization` | Approved and pending processes, forms, carrier guidance, standards, and reference material. |
| `Drafts` | Proposed Applied EPIC notes, email drafts, recommendations, follow-up lists, and checklists awaiting human review. |
| `System` | Vault contract, data boundaries, ingestion register, and current operating state. |
| `Raw Data` | Intentionally placed temporary ingestion sources—including historical client context, organization procedures, documents, and other source material—awaiting classification, incorporation, and verification. It is not the permanent memory architecture. |

This model describes the intended organization; this documentation slice does not create, enumerate, or change any of these areas.

## Raw Data ingestion lifecycle

Each source or source folder moves through a controlled lifecycle:

```text
Unreviewed
→ Processing
→ Incorporated
→ Verified
→ Safe to Remove or Archive
```

- **Unreviewed** identifies intentionally placed material whose contents and classification have not yet been assessed.
- **Processing** means incorporation is underway and the source remains temporary evidence.
- **Incorporated** means permanent account, event, organization, draft, or system notes have been created or updated with provenance.
- **Verified** means the resulting knowledge, source references, and classification have been reviewed.
- **Safe to Remove or Archive** is a reviewed disposition recorded after verification; it is not deletion authority by itself.

Incorporation is recorded in `System\INGESTION_REGISTER.md`. For each source or source folder, the register identifies:

- the source or source folder;
- its account, process, or knowledge classification;
- permanent notes created or updated;
- verification status;
- whether the original evidence remains available in Outlook, Applied EPIC, or another authoritative source; and
- whether the temporary local copy may be removed or archived.

The register is part of the intended operating model but is not created by this documentation slice. Original sources remain available until verification and an explicit reviewed disposition establish that a temporary copy may be removed or archived.

## Software-development fixture standard

Synthetic fixtures are the default for testing and developing the first insurance-assistance software pilot in Git. This fixture restriction does not prohibit operator-designated private assist-only use of real working material inside the active Insurance Desk. Synthetic fixtures are invented from scratch, are not derived by lightly editing a real client file, and contain no real client, prospect, employee, insurer, underwriter, account, policy, claim, quote, submission, location, project, credential, or communication data.

A source-derived fixture may be called sanitized only after a documented human review. Merely replacing the client name is not sufficient. Sanitization must remove or fictionalize:

- names;
- email addresses;
- phone numbers;
- mailing and risk addresses;
- account, policy, quote, claim, submission, activity, and application numbers;
- exact identifiers and credentials;
- hidden document metadata;
- filenames containing client information;
- unique locations, operations, project descriptions, dates, amounts, or combinations of facts that could reasonably identify the source account;
- embedded comments, tracked changes, attachments, and document properties; and
- any re-identification key or crosswalk.

The reviewer must confirm that the fixture cannot reasonably be traced back to the source account using the fixture alone or ordinary public or contextual information. No source-derived sanitized fixture may enter Git until that review is completed and recorded without including the original client content.

Each fixture record must state whether the fixture is synthetic or sanitized, its preparer and preparation date, its human reviewer and review date when sanitized, its review disposition, and its source category when source-derived. The record must not include original client content, a re-identification key, or a crosswalk.

When there is doubt, use a fully synthetic fixture instead. No real or source-derived fixture is created, copied, opened, or added during this PR.

## Active local use and approval boundaries

The operator has designated `C:\Insurance Desk\Insurance Desk` as the sole canonical location for private, local, assist-only work with intentionally placed real insurance material. Local real-data use is not blocked merely because the workspace is under `C:\Insurance Desk`. This operator designation does not imply unevidenced organization, regulatory, insurer, or third-party approval, and it grants no access to either excluded legacy location.

The following remain prohibited without separate exact authority:

- client or private insurance data entering Git;
- unapproved cloud synchronization or external data transport;
- autonomous email sending, filing, flags, categories, or mailbox changes;
- autonomous Applied EPIC writes;
- autonomous binding or coverage advice;
- silent overwriting or replacement of account history; and
- treating generated summaries, drafts, or recommendations as official evidence.

Applied EPIC remains the official account and activity record. Outlook and original documents remain communication and documentary evidence. The Insurance Desk remains curated operating memory and a drafting surface, not a replacement for those sources.

## Proposed future work-email architecture

Future work-email automation is expected to use a two-plane architecture:

- Microsoft 365 is the mailbox-monitoring and mailbox-action plane.
- The private Insurance Desk is the account-memory, organization-process, reasoning, and drafting plane.
- The planes may later communicate through an explicitly approved, provenance-preserving structured work queue or file bridge.
- Work IQ remains a possible future direct connection, but it is currently blocked by Microsoft Entra tenant administration and must not block the current system.
- Power Automate, Microsoft List or SharePoint, OneDrive for Business, and Copilot Studio remain candidate Microsoft-side components pending separate user-permission, tenant-policy, data-boundary, and reliability assessment.
- Initial transport remains manual.

This proposed architecture does not authorize mailbox access, a connector, cloud synchronization, automated flags, categories, drafts, sends, attachment transfer, or any external action. Detailed software queue, transport, connector, and reconciliation design belongs to a later Insurance Automation — Build slice using synthetic fixtures. Any mailbox permission or Microsoft administration remains separately approval-gated, and any Insurance Desk storage, synchronization, attachment handling, or operating-process change remains separately authorized under Insurance Desk — Operate.

## Deferred generated retrieval state

SQLite remains optional, generated, rebuildable, and deferred. Any future index must remain derived from the human-readable knowledge and source references, never become editable authority, and receive its own separately authorized design. No database is created or configured by this documentation slice.
