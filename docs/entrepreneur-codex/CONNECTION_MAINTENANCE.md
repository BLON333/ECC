# Connection Maintenance

A usable connection is more than an installed package:

> Connection + Permission + Workflow + Health check + Maintenance record

A connection supplies capability, not authority. Its use remains bounded by
the [Operator Contract](OPERATOR_CONTRACT.md), repository instructions, and the
exact active task.

## Capability selection

Use the smallest sufficient surface:

1. repository instructions and native Codex behavior;
2. an existing focused skill;
3. a local CLI or library; then
4. a long-lived structured connection such as MCP only when its value justifies
   its permission and maintenance cost.

Domain-specific connection design belongs to the separately governed domain.
Do not place private routing, data semantics, or operating procedures in this
public shared contract.

## Least privilege

- Grant only the minimum system, account, data, operation, and duration needed.
- Prefer read-only access; add write access only for an explicitly approved
  action that cannot be completed more safely another way.
- Keep required and optional connections distinguishable.
- Treat identity, target, and permission ambiguity as blocked.
- Never copy credentials, secrets, tokens, or private payloads into a registry,
  task receipt, log, or repository.
- A successful health check proves technical availability only.

## Required permission record

Each maintained connection record states:

- name, owner, purpose, and where it is used;
- systems and data classes it may access;
- exact read and write permissions;
- credential source without the credential itself;
- required or optional state;
- health check, update method, and last verified date;
- failure condition and least-capability fallback; and
- revocation owner and procedure.

The record is evidence, not authorization to enable or use the connection.

## Health, fallback, and maintenance

- At startup, check required connections and fail closed on unclear identity,
  scope, health, or authority.
- On a regular cadence, review versions, authentication health, configuration
  drift, permissions, and continued need.
- Before consequential work, verify the exact account, target, permission,
  action, and current approval.
- On failure, stop affected writes and use only a documented fallback that
  reduces or preserves capability; never broaden access to keep moving.
- Record checks, updates, failures, and revocations with date, result, evidence,
  and next review, without private content.

Revoke unused optional access promptly. Revocation must remove the granted
permission or credential through its owning system, preserve required evidence,
and confirm that fallback behavior does not silently reconnect.

## ECC Lite boundary

ECC Lite installs no connector or MCP, grants no external-system access, and
does not change connection authority. A future combined health report may read
connection records and classify health, but it must not authenticate, enable,
repair, broaden, or revoke a connection without separate authority.
