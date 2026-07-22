# Project and Session Topology

This contract defines how Entrepreneur Codex separates durable authority from
temporary execution. It organizes existing Codex and Git concepts and adds no
runtime.

## Working units

| Unit | Responsibility |
|---|---|
| Codex Project | Persistent boundary for one repository or operating area, with its root, instructions, and task history. |
| Focused thread | Temporary context for one accepted outcome; it is not durable repository or business memory. |
| Canonical repository | Durable source and read/dispatch checkout used to reconcile instructions, main, GitHub, and current evidence. |
| Governed worktree | Isolated execution checkout for one authorized writing task, branch, concern, and writer. |
| Connection | Controlled capability to another system; it does not merge ownership or grant action authority. |

## Topology rules

- Keep one focused outcome per thread.
- Keep one confirmed writer per repository and worktree lane.
- Use one issue, one narrowly named branch, one concern, and one governed
  worktree for an authorized repository-writing slice.
- Use the canonical repository for reconciliation, read-only planning,
  orientation, dispatch, and review.
- Do not use the canonical checkout as the writing lane when a governed
  worktree is required.
- Bind the worktree to the current trusted base and record relevant base, head,
  tree, branch, upstream, status, owner, and pull-request evidence.
- Preserve unrelated changes and occupied worktrees. Their existence grants no
  reuse, cleanup, or successor authority.
- A Project, thread, branch, worktree, task, or permission mode never creates
  scope or action authority by itself.

Canonical and execution checkouts have different jobs:

```text
canonical Project and repository -> reconcile, read, dispatch, review
governed issue worktree           -> edit, validate, commit, push
GitHub pull request               -> changed scope, checks, exact-head review
```

## Worktree lifecycle

1. Confirm an open, unchanged issue and an explicit implementation grant.
2. Reconcile the canonical repository, remote base, competing owners, branches,
   worktrees, pull requests, locks, and protected evidence.
3. Create the approved worktree and branch from the exact trusted base.
4. Reconfirm identity and mutation capability before editing.
5. Change only the allowlist, validate locally, and publish only within the
   granted boundary.
6. Keep the worktree while its pull request, review, checks, or correction work
   remains active.
7. Clean up only after merge and verification, after confirming no preserved,
   unmerged, staged, or otherwise owned work would be lost.

If a lane stops or is superseded before merge, leave it preserved or park it
under explicit authority. Do not silently reuse it for a later outcome.

## Ownership separation

Projects and repositories may share ECC capabilities without sharing source,
credentials, data, runtime permission, or domain authority. Separately governed
domain systems retain their own semantics and working material. Material
cross-domain conflicts follow the fail-closed rule in the
[Operator Contract](OPERATOR_CONTRACT.md).
