# Security

## Reporting a vulnerability

If you discover a security issue, please email the maintainer rather than opening a public GitHub issue.

## History note

The pre-2026-05-06 commit history of this repository (prior to open-sourcing) contained a Telegram bot token in the n8n workflow JSON files. That token has been **revoked and rotated**, and the git history has been rewritten with `git filter-repo` to remove all traces. If you cloned a private mirror of this repo before that date, please re-clone the public version.
