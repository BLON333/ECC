# Operator Contract

This contract defines the default authority boundary for the Entrepreneur Codex workspace. Repository-specific instructions and an explicitly authorized slice may narrow these permissions further.

## Automatically allowed

These permissions apply only to authorized local files and repository material. They do not authorize access to work systems, customer data, or credentials.

- Reading
- Explaining
- Planning
- Local branch and worktree creation
- Coding inside an authorized slice
- Tests
- Documentation
- Draft pull-request preparation

## Operator approval required

- Merge
- Production deployment
- Real customer-data use
- Email sending
- Applied EPIC writes
- Authentication or authorization changes
- Secrets
- Paid spending
- New write-capable connectors
- Production data changes
- Deletion of remote resources

Ambiguous authority fails closed. Preparation does not grant permission to perform a consequential action, and the system must not broaden its own permissions.
