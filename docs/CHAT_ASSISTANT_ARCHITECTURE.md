# Chat Assistant Architecture

Voice + text AI assistant widget (floating action button → chat panel), covering the requirements in the Prompt 18 brief. This doc explains how it's built and why.

## Real LLM: Claude Fable 5, with tool use

The assistant's "brain" is a real call to Anthropic's Messages API (`src/lib/chat/generateAssistantReply.ts`), model `claude-fable-5` (Anthropic's most capable widely released model), with automatic server-side fallback to `claude-opus-4-8` if a request is declined by Fable 5's safety classifiers (`fallbacks` param, beta `server-side-fallback-2026-06-01`).

The function signature is unchanged from the original mock, so no caller (the route handler, `useChatAssistant`) needed to change:

```ts
// src/lib/chat/generateAssistantReply.ts
export async function* generateAssistantReply(
  conversation: ConversationTurn[],
  context: ConversationContext,
  signal: AbortSignal
): AsyncGenerator<ReplyEvent>
```

**System prompt:** built inline from `CLAUDE.md` (brand voice, grading system, policies, safety rules) and `AI_ASSISTANT_SPECS.md` (escalation triggers, tone).

**Tool use:** product search, order lookup, appointment booking, quick-reply suggestions, and human escalation are all Claude tool calls (`search_products`, `lookup_order`, `book_appointment`, `suggest_quick_replies`, `escalate_to_human`), executed by a manual streaming tool-use loop (max 6 round trips per turn) inside `generateAssistantReply`. Each tool's side effect (looking up a mock order, booking a mock appointment) is the same underlying data-layer call the old rule-based engine used (`src/lib/chat/orders.ts`, `src/lib/chat/appointments.ts`, `getProducts` from `src/lib/api.ts`), so the admin dashboard and storefront order history stay consistent with what the chatbot tells customers. Each tool execution also emits the matching `ReplyEvent` (`products`, `order-status`, `appointment-confirmed`, `quick-replies`, `escalate`) so the existing UI/route-handler side effects (admin notifications, escalation handoff) keep working unchanged.

**Multi-turn state:** the client resends the full plain-text conversation transcript on every request (see `ConversationTurn[]`), so Claude re-derives any in-progress slot-filling (e.g. "what's your order number?" → "PTN-48213") from the transcript itself — no server-side session or tool-call history needs to persist across HTTP requests, only within a single turn's tool loop.

**Missing API key:** if `ANTHROPIC_API_KEY` is unset, `generateAssistantReply` fails open — it immediately escalates the conversation to a human specialist with a friendly message, rather than throwing. Same "disabled until configured" convention as the Vonage SMS integration.

**Refusals:** Fable 5 (and its Opus 4.8 fallback) can return `stop_reason: "refusal"` for requests its safety classifiers decline. That path also escalates to a human rather than erroring.

## Voice I/O: Web Speech API, with a documented swap seam

`useSpeechRecognition` (STT) and `useSpeechSynthesis` (TTS) wrap the browser-native `SpeechRecognition`/`speechSynthesis` APIs — zero cost, zero new dependencies, works today in Chromium browsers. Their return shapes are defined as standalone contracts in `src/types/voice.ts` (`SpeechRecognitionHookResult`, `SpeechSynthesisHookResult`), not tied to the Web Speech API — a future hosted provider (e.g. streaming STT/TTS from a paid API) can be implemented as a drop-in replacement hook satisfying the same contract, with no changes needed in `VoicePanel.tsx` or `useVoiceController.ts`.

Browser support varies: Chrome/Edge have full support, Safari is partial, Firefox has no `SpeechRecognition` at all. The mic button feature-detects and hides/disables itself gracefully — this is expected behavior, not a bug, for visitors on unsupported browsers.

## Streaming protocol

`POST /api/chat` streams **NDJSON** (newline-delimited JSON), not `EventSource`/SSE — `EventSource` can't send a POST body or be cancelled via `AbortController`, both required for barge-in (stopping generation when a user interrupts). The client already reads the response as a raw `ReadableStream`, so NDJSON adds structure with minimal complexity: each line is one `ReplyEvent` (`text-delta`, `products`, `order-status`, `appointment-confirmed`, `quick-replies`, `escalate`, `context`, `done`, `error`). See `src/lib/chat/formatSSE.ts` for the shared encode/parse helpers, and `src/hooks/useChatAssistant.ts` for the client-side read loop + `AbortController` wiring.

Claude's own text streams naturally as `text-delta` events. The `sayEvents()` helper (small word-group chunks with short delays) is only used for the two non-model fallback messages — missing API key and safety-classifier refusal — so those paths still render with the same typing-animation pacing as a real streamed response.

## Conversation state across turns (appointments, order lookup)

The server is stateless — `ConversationContext` is threaded through as a `context` event on every response and echoed back by the client on the next request (`useChatAssistant` stores it in its reducer), but `generateAssistantReply` no longer reads or writes slot-filling fields on it: since Claude sees the full plain-text transcript on every request, it re-derives any in-progress booking/lookup state (e.g. "what's your order number?" → "PTN-48213") from the conversation itself via tool use. The `context` round-trip is kept only for wire-format compatibility with the client's reducer.

## Mock data

`src/lib/chat/orders.ts` and `src/lib/chat/appointments.ts` follow `src/lib/api.ts`'s existing conventions (in-memory arrays, async functions) so the call signatures won't need to change if/when a real backend exists. Appointments booked during a session are stored in-memory only and reset on server restart — this is a demo data store, not persistence.

## Lazy loading

- `ChatWidget.tsx` (FAB) is always in the initial bundle — small, fast.
- `ChatPanel.tsx` (message list, composer, everything else) is `next/dynamic(..., { ssr: false })`-loaded only once the widget is opened.
- `VoicePanel.tsx` (the component that actually calls `useSpeechRecognition`/`useSpeechSynthesis`) is a second, nested dynamic import inside `Composer.tsx`, only mounted after the user taps the mic button once. Before that tap, only a cheap feature-detect (`VoiceMicButton`) ships.

Net effect: browsing the site with the widget closed loads none of the chat/voice code; opening it loads text chat only; tapping the mic loads voice.

## Explicitly out of scope (see plan for full rationale)

- Real file-content analysis (attachment only, no vision backend).
- Real calendar/date parsing for appointments (free-text preferred window, human confirms later).
- Cross-session chat history persistence (no auth system exists).
- A true echo-cancellation for hands-free mode — the mic is simply muted while the assistant is speaking (mutual exclusion), not real audio echo cancellation.

## Required environment variables

`ANTHROPIC_API_KEY` — required for the assistant to call Claude Fable 5. Without it, the assistant fails open to a human-escalation message (see above) rather than being non-functional.
