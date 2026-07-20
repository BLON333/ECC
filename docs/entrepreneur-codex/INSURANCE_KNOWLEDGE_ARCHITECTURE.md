# Insurance Knowledge Architecture

This contract defines a proposed future Insurance Desk workspace for assist-only insurance work. It separates live working data from the private insurance-assistance software repository. No directory, database, connector, or ingestion runtime is created or configured by this slice.

## Status and location

The workspace root must be configurable through `INSURANCE_DESK_HOME`.

- Provisional local default: `C:\InsuranceDesk`
- Final location: subject to organization-approved storage and AI handling

The default and structure below are a proposed starting direction, not an accepted final storage decision. This slice does not create `C:\InsuranceDesk`, set `INSURANCE_DESK_HOME`, or modify `C:\DevV2\_private-data`.

## Authority

| Source | Authority |
|---|---|
| Applied EPIC | Official account and activity record. The operator performs and confirms every live action there. |
| Outlook and original documents | Communication and documentary evidence whose identity, date, and provenance must be retained. |
| Obsidian Vault | Curated operational memory for retrieval, drafting, and review. It does not replace Applied EPIC or original source evidence. |
| Generated state | Optional derived indexes for retrieval. Generated state is rebuildable and is never an editable source of authority. |
| Conversations | Temporary working context, not durable account memory or process approval. |
| GitHub | Authority for software and repository documentation only; it never stores private client material. |

Every material fact must retain its source reference, observed or confirmed date, and verification status. Verified facts must remain distinguishable from AI interpretation and recommendations. Memory updates are proposed for operator review rather than silently accepted.

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

## Synthetic and sanitized fixture standard

Synthetic fixtures are the default for the first insurance pilot. They are invented from scratch, are not derived by lightly editing a real client file, and contain no real client, prospect, employee, insurer, underwriter, account, policy, claim, quote, submission, location, project, credential, or communication data.

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

## Proposed Insurance Desk structure

```text
C:\InsuranceDesk\
├── Vault\
│   ├── Accounts\
│   ├── Events\
│   ├── Processes\
│   ├── Work Queue\
│   ├── Drafts\
│   └── Templates\
├── Sources\
│   └── Accounts\
├── State\
│   └── index.sqlite
├── Exports\
└── Archive\
```

- `Vault/` is an Obsidian-first, human-readable working-memory cockpit. Its account notes, events, processes, work queue, drafts, and templates remain curated views linked to evidence rather than an official system of record.
- `Sources/` holds original evidence outside the vault, organized by account and retaining source provenance.
- `State/index.sqlite` is optional, generated, and rebuildable later. It is not the initial editable authority, and its absence does not block the human-readable workspace.
- `Exports/` holds operator-approved work packages prepared for an authorized downstream action.
- `Archive/` retains superseded or closed material only under an approved retention process.

## Future ingestion and connections

No real client data may be used until storage, backup, retention, device security, AI-processing arrangements, permissions, and operating controls are separately approved. Any earlier pilot uses only fixtures that meet the synthetic and sanitized fixture standard above.

If real-data ingestion is later approved, possible routes include exported emails, pasted messages, uploaded documents, and manually confirmed outcomes. Ingestion must preserve the business-account anchor, source provenance, received or confirmed date, and any verification uncertainty.

Future permitted connectors must preserve this architecture: evidence lands as a source, curated memory points back to it, only Approved processes drive workflows, and Applied EPIC remains the official account and activity record. A connector may reduce manual transport; it may not silently change authority, verification status, or approval.
