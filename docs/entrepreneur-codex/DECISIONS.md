# Decisions

These decisions define the initial Entrepreneur Codex foundation:

- Codex Desktop and Codex CLI are the primary working surfaces.
- ECC is the shared lightweight capability layer.
- The fresh workspace root is `C:\DevV2`.
- Builder, `_desktop-coding-stack`, and Hermes are excluded from this setup.
- Software Studio and Internal Automation share a foundation but remain separate lanes, with separate repositories, data, credentials, and runtime permissions.
- Product repositories remain separate from ECC.
- Insurance operations live in a private repository and are assist-only initially; Jason reviews and performs every external action manually.
- Client emails, documents, PDFs, applications, account data, personal information, and credentials never enter Git.
- GitHub is authoritative for repositories, issues, branches, pull requests, and code.
- Each repository has one active implementation slice, and each branch or worktree has one writer.
- Paid spend and consequential actions require operator approval.
- Material from repositories under the old `C:\Dev` root is not copied or migrated into this workspace.
