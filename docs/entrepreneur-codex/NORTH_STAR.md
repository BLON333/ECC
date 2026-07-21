# Entrepreneur Codex North Star

ECC is the lightweight shared capability layer for Jason's Codex-first workspace. Codex Desktop and Codex CLI are the primary surfaces for executing work and explaining its state.

The workspace supports two lanes:

- **Software Studio** builds separate software products for users and customers.
- **Internal Automation** improves Jason's own personal and work processes, beginning with private commercial-insurance assistance owned by the separate Insurance Automation domain.

The lanes may share a simple ECC-based operating foundation, but products and automation software remain in separate repositories. Their code, credentials, runtime permissions, and domain ownership also remain separate. ECC owns the shared capability and these operating contracts; it does not own insurance software or insurance working material. Local live insurance working data belongs only in the operator-designated private Insurance Desk workspace at `C:\Insurance Desk\Insurance Desk`, outside Git; it never belongs in a software repository, worktree, the retained legacy `C:\Dev\products\insurance-form-automation_VAULT`, or `C:\Dev\Brain\Insurance Day`.

The system grows one understandable, testable slice at a time. Committed repository work follows the [Codex Project and Session Topology](PROJECT_SESSION_TOPOLOGY.md), the normative source for Project, thread, active-writer, and worktree mechanics.

Repository memory is more authoritative than old chats. GitHub is authoritative for repositories, issues, branches, pull requests, and code.

At every checkpoint, the operator must be able to understand:

- what is active;
- why it is active;
- what changed;
- how it was tested; and
- how it can be stopped or reversed.
