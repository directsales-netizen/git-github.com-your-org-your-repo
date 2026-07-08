# Chat Assistant Architecture

Voice + text AI assistant widget (floating action button → chat panel), covering the requirements in the Prompt 18 brief. This doc explains how it's built, why, and what a future upgrade to a real hosted LLM / premium voice provider would involve.

## Why a rule-based engine instead of a real LLM

This repo has no backend, no auth, no order/appointment system, and no AI SDK installed, and no API key was authorized for this build. Rather than leave voice/AI features non-functional, the assistant's "brain" is a real, working rule-based/retrieval engine — intent classification + a knowledge base transcribed from `AI_ASSISTANT_SPECS.md`/`CLAUDE.md` + product search against the existing mock catalog. It streams real responses, supports barge-in, and is fully testable today with zero cost or secrets.

It is intentionally isolated behind one function so upgrading to a real LLM later is a small, localized change:

```ts
// src/lib/chat/generateAssistantReply.ts
export async function* generateAssistantReply(
  conversation: ConversationTurn[],
  context: ConversationContext,
  signal: AbortSignal
): AsyncGenerator<ReplyEvent>
```

**To upgrade to a real hosted LLM** (e.g. Anthropic Claude): replace the body of this function with a streaming call to the provider's Messages API, keeping the same `AsyncGenerator<ReplyEvent>` contract — no caller (the route handler, `useChatAssistant`) needs to change. You'd add `@anthropic-ai/sdk` as a dependency and an `ANTHROPIC_API_KEY` environment variable (not required today; the mock engine needs no secrets). The system prompt should be built from `AI_ASSISTANT_SPECS.md` + `CLAUDE.md` directly. Product search / order lookup / appointment booking would become tool calls instead of regex-driven intents, but the `ReplyEvent` union (product cards, order status, appointment confirmations, escalation) already models the structured outputs an LLM tool-use flow would need.

## Voice I/O: Web Speech API, with a documented swap seam

`useSpeechRecognition` (STT) and `useSpeechSynthesis` (TTS) wrap the browser-native `SpeechRecognition`/`speechSynthesis` APIs — zero cost, zero new dependencies, works today in Chromium browsers. Their return shapes are defined as standalone contracts in `src/types/voice.ts` (`SpeechRecognitionHookResult`, `SpeechSynthesisHookResult`), not tied to the Web Speech API — a future hosted provider (e.g. streaming STT/TTS from a paid API) can be implemented as a drop-in replacement hook satisfying the same contract, with no changes needed in `VoicePanel.tsx` or `useVoiceController.ts`.

Browser support varies: Chrome/Edge have full support, Safari is partial, Firefox has no `SpeechRecognition` at all. The mic button feature-detects and hides/disables itself gracefully — this is expected behavior, not a bug, for visitors on unsupported browsers.

## Streaming protocol

`POST /api/chat` streams **NDJSON** (newline-delimited JSON), not `EventSource`/SSE — `EventSource` can't send a POST body or be cancelled via `AbortController`, both required for barge-in (stopping generation when a user interrupts). The client already reads the response as a raw `ReadableStream`, so NDJSON adds structure with minimal complexity: each line is one `ReplyEvent` (`text-delta`, `products`, `order-status`, `appointment-confirmed`, `quick-replies`, `escalate`, `context`, `done`, `error`). See `src/lib/chat/formatSSE.ts` for the shared encode/parse helpers, and `src/hooks/useChatAssistant.ts` for the client-side read loop + `AbortController` wiring.

Response text is deliberately chunked into small word groups with short delays (`generateAssistantReply`'s `say()` helper) so the streaming/typing-animation UI has real incremental content to render — this is intentional pacing for a synchronous rule-based engine, not a hack; a real LLM integration would stream naturally instead.

## Conversation state across turns (appointments, order lookup)

The server is stateless — `ConversationContext` (pending appointment/order-lookup slot-filling state, unresolved-exchange counter) is threaded through as a `context` event on every response and sent back by the client on the next request (`useChatAssistant` stores it in its reducer). This avoids needing a session store while still supporting multi-turn flows like appointment booking.

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

None today. If upgraded to a real LLM per above: `ANTHROPIC_API_KEY` (or equivalent for whichever provider).
