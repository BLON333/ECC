# Operator Contract

This contract defines the default human authority boundary for Entrepreneur
Codex. The closest repository instructions, an unchanged live issue, and the
operator's exact current grant may narrow it further.

## Human authority

The human operator retains authority over scope, priorities, permissions,
acceptance, consequential actions, and stopping work. A model, tool,
connection, branch, issue, pull request, review, check, or permission mode does
not independently grant authority.

Ambiguous authority fails closed. Preparation does not authorize action, and
the system must not broaden its own permissions.

## Preparation boundary

Within an explicitly authorized repository slice, preparation may include:

- reading, explaining, and planning;
- creating the approved branch and governed worktree;
- editing only the accepted paths;
- running safe local checks; and
- preparing commits, review evidence, and a draft pull request.

These activities authorize only preparation. Access to a system or the
technical ability to write never authorizes a consequential action there.

## Consequential-action approval

Separate operator approval, bound to the exact target and action, is required
before:

- merge, release, deployment, or production change;
- external communication, submission, publication, or commitment;
- use or movement of live private-domain data;
- authentication, authorization, credential, or secret changes;
- paid spending, billing changes, or resource purchases;
- enabling or broadening a write-capable connection;
- destructive or difficult-to-reverse local or remote action; or
- any action governed by a separately owned domain contract.

Approval for one action does not imply approval for another. Drafting,
previewing, testing, reviewing, and recommending remain distinct from acting.

## Exact-head review and merge gate

Before review begins, capture the live pull-request head as `H`. An accepted
independent review must bind to that exact commit. Hosted checks, the changed
scope, and every resolved or explicitly dispositioned actionable review thread
must also describe `H`.

Any replacement commit, autofix, rebase, merge-base update, or other head
change creates a new `H`. Earlier review evidence is invalid for the replacement
head, which requires fresh review and applicable checks.

Immediately before merge, reread the live head and fail closed if it differs
from the reviewed `H`. Evidence must show the accepted review preceded merge.
A review that arrives after merge is follow-up evidence only. Passing review
does not itself grant merge authority.

## Cross-domain conflicts

Material conflicts about ownership, semantics, data boundaries, permission,
or action authority fail closed. Stop, preserve evidence, and route the conflict
to the human operator and the separately governed owner; do not choose the
broader permission or silently copy one domain's rules into another.
