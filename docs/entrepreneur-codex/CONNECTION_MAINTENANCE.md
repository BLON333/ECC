# Tool and Connection Maintenance Contract

A usable tool connection is more than an installed package:

> Connection + Permission + Workflow + Health check + Maintenance record

A connection may be a local instruction surface, CLI, private workspace, MCP server, or external application. Use ECC's native capability rule: prefer instructions, a skill, or a local CLI when they are enough; use MCP only when a long-lived structured connection is worth its cost.

The [ECC Lite Profile Contract](ECC_LITE_PROFILE.md) defines only a future
Codex skill profile. Stage 3A.2 creates no profile, manifest, install plan, or
connection.

## ECC Lite connection boundary

- ECC Lite installs no connector or MCP.
- ECC Lite grants no external-system access.
- Profile installation does not change connection authority.
- Later connections remain separately selected, health-checked, and authorized
  under this contract and the [Operator Contract](OPERATOR_CONTRACT.md).

The connection registry below is part of the larger Entrepreneur Codex
harness, not content installed by ECC Lite.

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

Registry entries do not authorize a connector, cloud synchronization, mailbox automation, external data transport, or an external action. The operator-designated private Insurance Desk at `C:\Insurance Desk\Insurance Desk` is the sole canonical insurance working vault and may be used locally for assist-only work under the boundaries in the [Insurance Knowledge Architecture](INSURANCE_KNOWLEDGE_ARCHITECTURE.md#active-local-use-and-approval-boundaries); broader connections and actions remain separately approval-gated.

Neither `C:\Dev\products\insurance-form-automation` (`BLON333/insurance-form-automation`), `C:\Dev\products\insurance-form-automation_VAULT`, nor `C:\Dev\Brain\Insurance Day` is a connection or fallback. The legacy repository and vault may be consulted only under separate explicit read authority; neither is current authority or a runtime dependency, and neither may be changed without separate explicit authority. `C:\Dev\Brain\Insurance Day` is not an insurance evidence or continuity source. `C:\Dev\Brain\CLAUDE.md` may supply read-only personal operating context but never insurance-vault authority.

## Initial registry: access contract

| Name | Purpose and use | Data it may access | Permission | Credential source |
|---|---|---|---|---|
| GitHub | Repository source control and review | Authorized repositories, issues, branches, PRs, and checks | Read; write only an authorized branch and draft PR. No merge by default. | Operator-managed GitHub CLI credential store |
| Codex instructions | Load Project and repository rules in Codex | `AGENTS.md`, approved Project config, and task context | Read instructions; update only through an authorized repository change | None |
| Playwright | Future browser testing for software projects | Approved test pages and test artifacts | Planned test-environment access only | Project-local setup; target credentials only if separately approved |
| Insurance Desk workspace | Sole canonical insurance working vault for Insurance Desk — Operate at `C:\Insurance Desk\Insurance Desk` | Intentionally placed account evidence, briefs, processes, drafts, and temporary ingestion sources | Operator-designated local assist-only read/write; never Git; no connector, legacy-vault access, or cloud access is granted here | Local filesystem; no connection credential configured |
| Google Drive | Optional future document source | Only explicitly approved files and folders | No access yet | Connector-managed OAuth if later approved |
| Work Outlook | Communication and documentary evidence; possible future manual work-packet source | No mailbox access in this slice; manually exported or pasted material may be intentionally placed in the Insurance Desk by the operator | Manual source handling only; no autonomous mailbox write, filing, flag, category, draft, or send | Operator's work sign-in remains in Outlook; no connection is configured here |
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
| Insurance Desk workspace | Active local/private; Obsidian and Codex Project configuration stabilization pending | When separately authorized, verify the selected content-tree boundary, source provenance, ingestion-register state, backup, and data boundaries without treating generated memory as official evidence | Stabilize local Obsidian and Project configuration separately; follow approved backup, retention, archive, and migration processes | Operator-designated 2026-07-20; not filesystem-inspected by this slice | Continue authorized manual work in Applied EPIC, Outlook, and original systems; stop ingestion when source identity, classification, or authority is unclear | Remove only separately granted access; archive or remove material only after verified disposition and applicable retention review; revoke any future connector separately |
| Google Drive | Deferred/optional | If approved, confirm scoped OAuth and read only the approved location | Update the optional connector after permission review | Not yet verified | Use uploaded documents or manual exports | Revoke OAuth and remove the connector |
| Work Outlook | Manual evidence source; no connection configured | The operator confirms the identity and currency of any deliberately selected manual export or pasted input | Maintain only the approved manual work-packet workflow; do not enable mailbox automation here | Not verified by this slice | Continue authorized work directly in Outlook; reconcile missed, duplicate, stale, or protected messages manually | Stop manual ingestion and separately revoke any future delegated access |
| Applied EPIC | Assist-only and manual action | Operator confirms access and the current account before consequential work | Organization-managed application update and access process | Not verified by this slice | Stop and reconcile manually in Applied EPIC | No connector exists; the organization controls user access |
| Sentry | Not required | None until a separately approved need exists | Not applicable | Not applicable | Use local logs and tests | No connection to revoke |
| Supabase/Vercel | Not required | None until a separately approved need exists | Not applicable | Not applicable | Use local storage and local builds | No connection to revoke |
| Stripe/Resend | Not required | None until a separately approved need exists | Not applicable | Not applicable | Keep billing and email delivery out of scope | No connection to revoke |

## Proposed future work-email architecture

Future work-email automation is expected to keep Microsoft 365 as the mailbox-monitoring and mailbox-action plane and the private Insurance Desk as the account-memory, organization-process, reasoning, and drafting plane. The planes may later communicate through an explicitly approved, provenance-preserving structured work queue or file bridge. Initial transport remains manual.

Work IQ remains a possible future direct connection but is currently blocked by Microsoft Entra tenant administration. Any service-principal provisioning or administrative consent is consequential and separately gated, so Work IQ remains parked and must not block the current system. Power Automate, Microsoft List or SharePoint, OneDrive for Business, and Copilot Studio remain candidate components pending a separate user-permission, tenant-policy, data-boundary, and reliability assessment.

This proposed architecture does not activate a connection or authorize mailbox access, cloud synchronization, automated flags, categories, drafts, sends, attachment transfer, or another external action. Detailed software queue, transport, connector, and reconciliation design remains a later Insurance Ops — Build task using synthetic fixtures. Any mailbox permission or Microsoft administration remains separately approval-gated, and any Insurance Desk storage, synchronization, attachment handling, or operating-process change remains separately authorized under Insurance Desk — Operate.

## Maintenance rhythm

- **Startup:** check critical required connections and fail closed when identity, scope, or authority is unclear.
- **Weekly:** review versions, authentication health, and configuration drift.
- **Monthly:** review permissions and remove unused optional connections.
- **Before consequential work:** verify the exact account, target, permission, and action authority.

Each check, update, failure, or revocation adds a maintenance entry with the date, connection, action, result, evidence reference, and next review. Maintenance records never contain credentials or client content.

## Future Entrepreneur ECC Doctor

Native `ecc doctor` remains the install-health check for ECC-managed state and drift. A future Entrepreneur ECC Doctor should compose that result with the registry above and report required connections as healthy, attention needed, or blocked, with the last verification and fallback.

It must remain a simple read-only operator workflow by default. It must not authenticate, enable a connector, broaden a permission, expose a secret, or act on a client system. This slice documents that future workflow; it does not implement it.
