# GrowFlowAI — a case study

**The bet:** the reason action items from meetings get dropped is not that people lack a task manager, it is that capturing a task is friction at exactly the moment you are busy, so the winning move is to remove the capture step entirely and let people forward a messy note from where they already are and have the structure appear on its own. GrowFlowAI takes a meeting note from Telegram, the web, or email, pulls out who owes what by when, and renders each task as a plant that grows as you make progress, and I use it every day.

## The problem
I spend most of my day in meetings, and most of the things I commit to in them end up buried under notes I never reopen. Every tool I tried asked me to stop, open an app, and type a structured task, which is precisely the behaviour that does not survive a busy week. The real problem was never storage, it was the cost of capture and the cost of returning, so those were the two things worth attacking.

## The decisions that mattered most
The first was to live where I already work instead of asking for a new habit, so the product is Telegram-first and the web and Android apps are convenience layers rather than the front door, because adoption is the hard part of any personal tool and the surest way to lose it is to make someone learn a new place to go.

The second was to accept zero structured input, so you can paste a transcript, forward an email, send a voice note, or photograph a whiteboard, and Whisper, Vision, and the language model do the structuring, which is the whole point, because the user brings chaos and the system brings order.

The third was to make progress feel rewarding without being a gimmick, so a task's status maps to a plant's growth stage and the metaphor carries real state rather than being decoration painted over a checkbox.

The fourth was an architecture choice that looks ahead, keeping it an opinionated single-user build that I actually use while enforcing row-level security from day one, so the same code is ready for multiple tenants the moment that is worth doing.

## What I deliberately left out
I did not build it multi-tenant, add a team or sharing layer, or chase a billing surface, because the honest job was to prove the capture-to-structure loop on a real daily user, which is me, and everything else is a scaling decision that should wait until the core loop has earned it.

## What I'd do next
The next steps are opening it to a second user to test the multi-tenant path the row-level security already anticipates, deepening "the Gardener", which is the retrieval chat over past notes, so it can answer real questions across months of meetings, and tightening the daily digest so it nudges on the right tasks rather than simply the due ones.

---

*Built by [Akshey Walia](https://www.linkedin.com/in/aksheywalia/). The product: [GrowFlowAI](https://github.com/aksheyw/GrowFlowAI) · [live demo](https://grow-flow-ai.vercel.app).*
