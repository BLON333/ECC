# Insurance Knowledge Architecture

This contract defines a future private knowledge layer for assist-only insurance work. No directory, database, connector, or ingestion runtime is created by this slice.

## Authority

| Source | Authority |
|---|---|
| Applied EPIC | Official account and activity record. The operator performs and confirms every live action there. |
| Private insurance memory | AI-readable operational history and evidence index. It supports retrieval and drafting but does not replace Applied EPIC. |
| Source documents and messages | Evidence inputs whose identity, date, and provenance must be retained. |
| Conversations | Temporary working context, not durable account memory or process approval. |
| GitHub | Authority for software and repository documentation only; it never stores private client material. |

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

Every material fact should retain its source reference, observed or confirmed date, and verification status. A new task thread retrieves the relevant account brief and evidence; it does not depend on finding an old conversation.

## B. Organization process knowledge

Process knowledge records how the organization has decided work should be performed. Each process has one of four states:

| State | Meaning |
|---|---|
| Approved | Reviewed, current, and permitted to drive a workflow. |
| Pending review | Awaiting operator review; it may support review but cannot drive a workflow. |
| Superseded | Retained for history and linked to its replacement; it cannot drive a workflow. |
| Draft | An unapproved proposal or working note; it cannot drive a workflow. |

Only **Approved** process knowledge may drive a workflow. Each process should record its owner, reviewer, effective date, evidence, version, and any process it supersedes.

## Proposed future private structure

```text
C:\DevV2\_private-data\insurance-ops\
├── sources\
│   └── accounts\
├── knowledge\
│   ├── accounts.db
│   ├── account-briefs\
│   └── processes\
├── drafts\
└── archive\
```

This is a proposed layout. This slice does not create or modify any directory or database, including any private path that already exists. None of it enters Git. SQLite plus structured files and ordinary search is enough initially; no vector database is required.

- `sources/accounts/` retains ingested evidence with provenance.
- `knowledge/accounts.db` holds structured account facts and indexes.
- `knowledge/account-briefs/` holds readable derived summaries linked to evidence.
- `knowledge/processes/` holds versioned organization processes and their approval state.
- `drafts/` holds generated work awaiting human review.
- `archive/` retains superseded or closed material according to an approved retention process.

## Initial ingestion and future connections

The first ingestion routes are exported emails, pasted messages, uploaded documents, and manually confirmed outcomes. Ingestion must preserve the business-account anchor, source provenance, received or confirmed date, and any verification uncertainty.

Future permitted connectors must preserve this architecture: evidence lands as a source, structured memory points back to it, only Approved processes drive workflows, and Applied EPIC remains the official account and activity record. A connector may reduce manual transport; it may not silently change authority or approval.
