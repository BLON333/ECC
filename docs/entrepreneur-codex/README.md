# Entrepreneur Codex

This directory defines Entrepreneur Codex, the human-governed operating
harness for using Codex with ECC. It is public and contains no private working
material or private-system operating instructions.

## Three-layer architecture

| Layer | Responsibility |
|---|---|
| ECC | The complete shared capability platform and source repository. |
| Entrepreneur Codex | The human-governed harness around Codex, repository instructions, Git and GitHub evidence, Projects, focused threads, governed worktrees, permissions, connections, and ECC Lite. |
| ECC Lite | The small personal Codex profile inside Entrepreneur Codex, containing exactly two unchanged skills. |

ECC is not reduced to ECC Lite, and ECC Lite is not another repository,
runtime, agent suite, orchestration platform, hook bundle, MCP bundle, or
connector bundle.

## Ownership boundary

ECC owns its public source, shared capability mechanics, and the contracts in
this directory. Separately governed domain systems own their domain-specific
software, semantics, data boundaries, operating contracts, and working
material. Exact private routing belongs in applicable operator and repository
instructions, not in this public documentation.

ECC does not copy or reinterpret private-domain authority. A material conflict
between ECC and a domain authority fails closed until the human operator
resolves it.

## Reading order

1. This landing page for architecture, ownership, evidence, and supersession.
2. [Operator Contract](OPERATOR_CONTRACT.md) for human authority and approvals.
3. [Project and Session Topology](PROJECT_SESSION_TOPOLOGY.md) for Projects,
   threads, repositories, writers, and worktrees.
4. [Connection Maintenance](CONNECTION_MAINTENANCE.md) for capability and
   connection lifecycle controls.
5. [ECC Lite Profile](ECC_LITE_PROFILE.md) for the sole ECC Lite v1 contract.

## Live authority and evidence

No document, plan, task name, or technical capability authorizes its own use.
GitHub issues own accepted scope, dependencies, authorization, and activation;
creating an issue alone does not authorize implementation. Pull requests own
the changed scope and exact-head review evidence. Actions own hosted CI
evidence. Git history owns deleted and superseded prose. Code and tests own
exact runtime behavior. Private domain systems own their own semantics and
working material.

At each checkpoint, evidence should make clear what is active, why it is
active, what changed, how it was checked, and how it can stop or reverse.
Historical receipts remain in GitHub and Git history rather than active prose.

## Supersession map

| Superseded document | Canonical home |
|---|---|
| `NORTH_STAR.md` | `README.md` |
| `CURRENT.md` | Live GitHub issue and pull-request state |
| `DECISIONS.md` | The owning retained contract plus Git history |
| `ROADMAP.md` | Live GitHub issues |
| `INSURANCE_KNOWLEDGE_ARCHITECTURE.md` | Separately governed private Insurance Ops authority; ECC retains no normative insurance semantics |
