# Decisions

## [2026-10-20] Chinese models allowed for GrowFlow
**Context:** The shared infra rule bans Chinese models (GLM/Qwen/DeepSeek) on personal data. GrowFlow handles meeting notes. | **Decision:** Akshey allowed cheap Chinese models for GrowFlow as a deliberate exception (his call, 2026-10-20). | **Alternatives:** US/EU-only models (rejected on cost). | **Consequences:** Applies to GrowFlow only. Other projects keep the ban.

## [2026-10-20] Sign-up stays open
**Context:** The app is open-sourced so GitHub visitors can try it. | **Decision:** Keep public sign-up (his call). | **Consequences:** Every table must assume strangers are logged in. Row Level Security must stay owner-only.

## [2026-10-21] Cross-account task assignment kept
**Context:** Task extraction can assign a task to any account by name. | **Decision:** Keep it for now; the app is an open-source proof of concept with no real users (his call). | **Alternatives:** Limit assignment to self (deferred). | **Consequences:** Revisit before real users join.

## [2026-10-21] Move every n8n model to cheap Chinese models
**Context:** The project goes quiet for a while. | **Decision:** Replace OpenAI models mapped in n8n with cheap Chinese models that do the job and are not near deprecation (his call). | **Consequences:** Pick stable model ids; re-check on return.
