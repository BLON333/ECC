# Tool and Connection Maintenance Contract

A usable tool connection is more than an installed package:

> Connection + Permission + Workflow + Health check + Maintenance record

A connection may be a local instruction surface, CLI, private workspace, MCP server, or external application. Use ECC's native capability rule: prefer instructions, a skill, or a local CLI when they are enough; use MCP only when a long-lived structured connection is worth its cost.

A future Entrepreneur profile should declare capabilities through ECC's native selective-install modules and profiles, then preview the resolved install plan before mutation. This slice creates no profile, manifest, or install plan.

## Required record

Every connection record must state:

- name and purpose;
- where it is used and the data it may access;
- read and write permissions;
- credential source, without copying the credential;
- required or optional state;
- health check method and update method;
- last verified date;
- failure and fallback procedure; and
- revocation procedure.

The technical ability to write never grants operating authority. The Operator Contract and the exact task remain controlling.

Registry entries do not authorize real client-data ingestion or AI processing. Those remain blocked by the separate approval gate in the [Insurance Knowledge Architecture](INSURANCE_KNOWLEDGE_ARCHITECTURE.md#future-ingestion-and-connections).

## Initial registry: access contract

| Name | Purpose and use | Data it may access | Permission | Credential source |
|---|---|---|---|---|
| GitHub | Repository source control and review | Authorized repositories, issues, branches, PRs, and checks | Read; write only an authorized branch and draft PR. No merge by default. | Operator-managed GitHub CLI credential store |
| Codex instructions | Load Project and repository rules in Codex | `AGENTS.md`, approved Project config, and task context | Read instructions; update only through an authorized repository change | None |
| Playwright | Future browser testing for software projects | Approved test pages and test artifacts | Planned test-environment access only | Project-local setup; target credentials only if separately approved |
| Insurance Desk workspace | Future approved workspace for Insurance Desk — Operate | Approved account evidence, briefs, processes, and drafts; no real client data before the separate approval gate | Planned local read/write; never Git | None configured; future storage and access controls require separate approval |
| Google Drive | Optional future document source | Only explicitly approved files and folders | No access yet | Connector-managed OAuth if later approved |
| Work Outlook | Future manual ingestion and draft assistance | No access in this slice; later, only separately approved exported emails, pasted messages, and draft inputs | Planned assist-only; no autonomous mailbox write, filing, or send | Operator's work sign-in remains in Outlook; no connection is configured here |
| Applied EPIC | Official insurance account and activity record | Records the operator opens or confirms | Assist-only; every read or action is manual | Organization-managed Applied EPIC sign-in |
| Sentry | Potential software observability | None in the starting profile | No access | None |
| Supabase/Vercel | Potential hosted data and deployment | None in the starting profile | No access | None |
| Stripe/Resend | Potential billing and email delivery | None in the starting profile | No access | None |

## Initial registry: lifecycle contract

| Name | State | Health check | Update method | Last verified | Failure and fallback | Revocation |
|---|---|---|---|---|---|---|
| GitHub | Required and active | Confirm CLI authentication, repository identity, and a read of current GitHub state | Update CLI/config deliberately; re-authenticate only when required | 2026-07-19 | Stop remote writes; continue safe local work and preserve the branch | Log out locally and revoke the GitHub credential |
| Codex instructions | Required and active | Confirm the closest `AGENTS.md` and Project instructions are loaded and precedence is clear | Review and change repository or Project instructions through their normal authority path | 2026-07-19 | Stop mutation and read the authoritative files directly | Remove optional local overrides or sync; repository instructions remain authoritative |
| Playwright | Planned | Once configured, check the pinned version and run a small approved smoke test | Update the project-local dependency and test workflow | Not yet verified | Use manual browser testing | Remove the project-local setup and any target credential |
| Insurance Desk workspace | Planned | If approved and created, check vault access, source provenance, generated-index rebuildability when present, backup, and data boundaries | Follow the separately approved storage, backup, retention, and migration process | Not yet verified | Continue authorized manual work in Applied EPIC and original systems; use only packets that meet the [fixture standard](INSURANCE_KNOWLEDGE_ARCHITECTURE.md#synthetic-and-sanitized-fixture-standard) until the real-data gate is approved | Remove access, archive safely under approved retention, and revoke any future connector |
| Google Drive | Deferred/optional | If approved, confirm scoped OAuth and read only the approved location | Update the optional connector after permission review | Not yet verified | Use uploaded documents or manual exports | Revoke OAuth and remove the connector |
| Work Outlook | Planned/manual only | If separately approved, the operator confirms the selected manual export or pasted input is current | Maintain only the approved manual ingestion workflow; do not enable mailbox automation here | Not verified by this slice | Continue authorized work in Outlook without this tooling; use only inputs that meet the [fixture standard](INSURANCE_KNOWLEDGE_ARCHITECTURE.md#synthetic-and-sanitized-fixture-standard) until the real-data gate is approved | Stop ingestion and remove any future delegated access |
| Applied EPIC | Assist-only and manual action | Operator confirms access and the current account before consequential work | Organization-managed application update and access process | Not verified by this slice | Stop and reconcile manually in Applied EPIC | No connector exists; the organization controls user access |
| Sentry | Not required | None until a separately approved need exists | Not applicable | Not applicable | Use local logs and tests | No connection to revoke |
| Supabase/Vercel | Not required | None until a separately approved need exists | Not applicable | Not applicable | Use local storage and local builds | No connection to revoke |
| Stripe/Resend | Not required | None until a separately approved need exists | Not applicable | Not applicable | Keep billing and email delivery out of scope | No connection to revoke |

## Maintenance rhythm

- **Startup:** check critical required connections and fail closed when identity, scope, or authority is unclear.
- **Weekly:** review versions, authentication health, and configuration drift.
- **Monthly:** review permissions and remove unused optional connections.
- **Before consequential work:** verify the exact account, target, permission, and action authority.

Each check, update, failure, or revocation adds a maintenance entry with the date, connection, action, result, evidence reference, and next review. Maintenance records never contain credentials or client content.

## Future Entrepreneur ECC Doctor

Native `ecc doctor` remains the install-health check for ECC-managed state and drift. A future Entrepreneur ECC Doctor should compose that result with the registry above and report required connections as healthy, attention needed, or blocked, with the last verification and fallback.

It must remain a simple read-only operator workflow by default. It must not authenticate, enable a connector, broaden a permission, expose a secret, or act on a client system. This slice documents that future workflow; it does not implement it.
