# Decisions

## [2026-10-20] Chinese models allowed for GrowFlow
**Context:** The shared infra rule bans Chinese models (GLM/Qwen/DeepSeek) on personal data. GrowFlow handles meeting notes. | **Decision:** Akshey allowed cheap Chinese models for GrowFlow as a deliberate exception (his call, 2026-10-20). | **Alternatives:** US/EU-only models (rejected on cost). | **Consequences:** Applies to GrowFlow only. Other projects keep the ban.

## [2026-10-20] Sign-up stays open
**Context:** The app is open-sourced so GitHub visitors can try it. | **Decision:** Keep public sign-up (his call). | **Consequences:** Every table must assume strangers are logged in. Row Level Security must stay owner-only.
