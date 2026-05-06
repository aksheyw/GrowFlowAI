# Tests

Regression tests for `src/utils/*` and (future) `supabase/functions/*` Edge Functions.

## Run

```bash
npm install      # first time only
npm test         # one-shot run
npm run test:watch   # watch mode
```

## Pattern

This test suite follows the **AI regression testing** pattern: write tests for bugs that were found, not for code that works. Initial coverage targets pure utility functions in `src/utils/` — they're fast to test, have no React dependencies, and tend to be the layer where logic-bug regressions hide.

When a bug is found:

1. Write a failing test that reproduces it (named after the bug, e.g. `BUG-R1`)
2. Fix the code until the test passes
3. The test stays as a regression guard — that exact bug cannot return

## Current scope

- `__tests__/utils/textAnalysis.test.ts` — pure-function tests for character/word counting + task-count heuristic + note validation

## Future scope

### Component tests
React Testing Library is not yet wired in. Add when component bugs surface — `vitest.config.ts` would need `environment: 'jsdom'` and `@testing-library/react` as a dev dep.

### Edge Function tests
The three Supabase Edge Functions (`update-task-status`, `webhook-telegram-note`, `process-ai-notes`) run in Deno and aren't covered by Vitest directly. Two options when bugs land there:

**Option A — Deno test runner** (recommended for parity with production runtime)
```bash
deno test supabase/functions/<name>/<test>.ts
```

**Option B — Vitest with Deno-shim** (faster CI, weaker realism)
Mock `Deno.env.get` and `serve` from `https://deno.land/std`, then import the handler.

Recommendation: defer until first Edge Function bug. The skill's principle: don't speculate on coverage; bug-driven coverage compounds.

## Adding a test

1. Identify the bug or invariant you want to lock in.
2. Add a `.test.ts` file under `__tests__/` mirroring the source path.
3. Assert on observable behavior (return values, response shapes), not implementation internals.
