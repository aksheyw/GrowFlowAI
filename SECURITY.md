# Security

## Reporting a vulnerability

If you discover a security issue, please email the maintainer rather than opening a public GitHub issue.

## History notes

### 2026-05-06 — Telegram bot token (revoked, history rewritten)

The pre-2026-05-06 commit history of this repository (prior to open-sourcing) contained a Telegram bot token in the n8n workflow JSON files. That token has been **revoked and rotated**, and the git history has been rewritten with `git filter-repo` to remove all traces. If you cloned a private mirror of this repo before that date, please re-clone the public version.

### 2026-05-09 — Internal Claude Code wiki (`.claude/wiki/`) removed

Earlier commits exposed an internal `.claude/wiki/` directory used for personal session notes. Contents were not active credentials but documented past credential rotations. The directory has been removed via `git rm --cached`, `.claude/` is now in `.gitignore`, and history was rewritten via `git filter-repo` to remove the directory from all reachable commits.

## Dependency advisories — accepted risk (dev-only)

After running `npm audit` (2026-05-09), the production dependency tree is **clean of high-severity advisories**. Five MODERATE advisories remain in `vite` / `esbuild` / `vitest` / `vite-node` / `@vitest/mocker`. All are:

- **Dev-only dependencies** (used by `npm run dev`, `npm run build`, `npm test` — never bundled into the production app)
- Related to GHSA-67mh-4wv8-2f99 — esbuild's dev server allowing cross-origin requests during local development. Does not affect deployed application.
- Resolution would require a `vite@5 → vite@8` major upgrade, which carries plugin-compatibility risk against `vite-plugin-pwa`, `@vitejs/plugin-react`, and other loaded plugins.

**Decision:** documented + accepted as dev-only risk. To be re-evaluated when upstream fixes land in vite 5.x or when a coordinated vite 8 upgrade is scheduled.

## Dependency overrides

To eliminate transitive vulnerabilities without major-version upgrades, `package.json` pins:

- `tar@^7.5.14` — patches CVE in older tar transitively pulled
- `minimatch@^3.1.5` — patches ReDoS advisories in v3 chain (used by `replace` → `@trapezedev/project` → `@capacitor/assets`)
- `fast-uri@^3.1.0` — patches host-confusion advisory
