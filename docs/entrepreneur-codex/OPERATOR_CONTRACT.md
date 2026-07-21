# Operator Contract

This contract defines the default authority boundary for the Entrepreneur Codex workspace. Repository-specific instructions and an explicitly authorized slice may narrow these permissions further.

## Automatically allowed

These permissions apply only to authorized local files and repository material. They do not authorize access to work systems, customer data, or credentials.

- Reading
- Explaining
- Planning
- Local branch creation
- Coding inside an authorized slice
- Tests
- Documentation
- Draft pull-request preparation

Automatic permission to prepare repository changes remains subject to the [Codex Project and Session Topology](PROJECT_SESSION_TOPOLOGY.md). It does not bypass that contract or grant merge authority.

## Operator approval required

- Merge
- Production deployment
- Real customer-data use, subject to the separate approval gate in the [Insurance Knowledge Architecture](INSURANCE_KNOWLEDGE_ARCHITECTURE.md)
- Email sending
- Writes to [Applied EPIC](INSURANCE_KNOWLEDGE_ARCHITECTURE.md#authority), the insurance agency management system used as the official account and activity record
- Authentication or authorization changes
- Secrets
- Paid spending
- New write-capable connectors
- Production data changes
- Deletion of remote resources

## Review and merge gate

For a pull-request head `H`, an accepted pre-merge review must satisfy
`review.commit_id == H` and must be submitted before the merge. Every
actionable review thread against `H` must be resolved or explicitly
dispositioned before merge. A replacement commit, autofix, rebase, or other
head change creates a new `H` and restarts the review gate; review of an earlier
head is not reusable.

Immediately before merge, reread the live pull-request head and fail closed if
it differs from the reviewed `H`. The closeout evidence must prove
`review.submitted_at < PR.merged_at`. A review that arrives after merge is
follow-up evidence only and may create correction debt; it never proves that
review gated the merge. Passing this review gate does not itself grant merge
authority.

Ambiguous authority fails closed. Preparation does not grant permission to perform a consequential action, and the system must not broaden its own permissions.
