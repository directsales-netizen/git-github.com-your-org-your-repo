'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import type {
  ChatMessage,
  ChatUIMode,
  ConversationContext,
  ContentBlock,
  MessageAttachment,
  ReplyEvent,
} from '@/types/chat';
import { createEmptyContext } from '@/types/chat';
import { extractEvents } from '@/lib/chat/formatSSE';

export const GREETING =
  "Hi! Welcome to Premium TechNoir. I'm here to help you find the right device, answer questions about our inventory, or assist with your order. What can I help you with today?";

export const INITIAL_SUGGESTIONS = [
  'Find a MacBook under $800',
  'Track my order',
  "What's your warranty?",
  'Book a repair',
];

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface ChatState {
  uiMode: ChatUIMode;
  messages: ChatMessage[];
  status: 'idle' | 'sending' | 'streaming' | 'error';
  context: ConversationContext;
  unreadCount: number;
  /** A SuperAdmin has taken this conversation over — the bot won't reply again; admin replies arrive via polling. */
  humanMode: boolean;
  /** Set once this conversation escalates, so polling for admin replies can start even before a takeover lands. */
  escalated: boolean;
}

type ChatAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'MINIMIZE' }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'SEND_START'; userMessage: ChatMessage; assistantMessageId: string }
  | { type: 'TEXT_DELTA'; id: string; delta: string }
  | { type: 'BLOCK'; id: string; block: ContentBlock }
  | { type: 'CONTEXT'; context: ConversationContext }
  | { type: 'STREAM_DONE'; id: string }
  | { type: 'STREAM_ABORTED'; id: string }
  | { type: 'STREAM_ERROR'; id: string; message: string }
  | { type: 'ADD_UNREAD_MESSAGE'; message: ChatMessage }
  | { type: 'HUMAN_TAKEOVER'; assistantMessageId: string };

function updateMessage(messages: ChatMessage[], id: string, update: (m: ChatMessage) => ChatMessage): ChatMessage[] {
  return messages.map((message) => (message.id === id ? update(message) : message));
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, uiMode: 'open', unreadCount: 0 };
    case 'CLOSE':
      return { ...state, uiMode: 'closed' };
    case 'MINIMIZE':
      return { ...state, uiMode: state.uiMode === 'minimized' ? 'open' : 'minimized' };
    case 'TOGGLE_FULLSCREEN':
      return { ...state, uiMode: state.uiMode === 'fullscreen' ? 'open' : 'fullscreen' };
    case 'SEND_START':
      return {
        ...state,
        status: 'streaming',
        messages: [
          ...state.messages,
          action.userMessage,
          { id: action.assistantMessageId, role: 'assistant', text: '', blocks: [], createdAt: Date.now(), streaming: true },
        ],
      };
    case 'TEXT_DELTA':
      return {
        ...state,
        messages: updateMessage(state.messages, action.id, (m) => ({ ...m, text: m.text + action.delta })),
      };
    case 'BLOCK':
      return {
        ...state,
        escalated: state.escalated || action.block.kind === 'escalate',
        messages: updateMessage(state.messages, action.id, (m) => ({ ...m, blocks: [...m.blocks, action.block] })),
      };
    case 'CONTEXT':
      return { ...state, context: action.context };
    case 'STREAM_DONE':
      return {
        ...state,
        status: 'idle',
        messages: updateMessage(state.messages, action.id, (m) => ({ ...m, streaming: false })),
      };
    case 'STREAM_ABORTED':
      return {
        ...state,
        status: 'idle',
        messages: updateMessage(state.messages, action.id, (m) => ({ ...m, streaming: false, aborted: true })),
      };
    case 'STREAM_ERROR':
      return {
        ...state,
        status: 'error',
        messages: updateMessage(state.messages, action.id, (m) => ({
          ...m,
          streaming: false,
          text: m.text || action.message,
        })),
      };
    case 'ADD_UNREAD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.message],
        unreadCount: state.uiMode === 'closed' ? state.unreadCount + 1 : state.unreadCount,
      };
    case 'HUMAN_TAKEOVER':
      return {
        ...state,
        humanMode: true,
        status: 'idle',
        // Drop the empty placeholder bubble SEND_START speculatively added for
        // this turn — no bot reply is coming, so there's nothing to fill it.
        messages: action.assistantMessageId
          ? state.messages.filter((m) => m.id !== action.assistantMessageId || m.text || m.blocks.length > 0)
          : state.messages,
      };
    default:
      return state;
  }
}

function initialState(): ChatState {
  return {
    uiMode: 'closed',
    messages: [
      { id: newId(), role: 'assistant', text: GREETING, blocks: [{ kind: 'quick-replies', options: INITIAL_SUGGESTIONS }], createdAt: Date.now() },
    ],
    status: 'idle',
    context: createEmptyContext(),
    unreadCount: 0,
    humanMode: false,
    escalated: false,
  };
}

export function useChatAssistant() {
  const [state, dispatch] = useReducer(chatReducer, undefined, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string, attachments?: MessageAttachment[]) => {
      const trimmed = text.trim();
      if (!trimmed || state.status === 'streaming') return;

      const userMessage: ChatMessage = {
        id: newId(),
        role: 'user',
        text: trimmed,
        blocks: [],
        attachments,
        createdAt: Date.now(),
      };
      const assistantMessageId = newId();
      dispatch({ type: 'SEND_START', userMessage, assistantMessageId });

      const conversation = [...state.messages, userMessage]
        .filter((m) => m.text.trim().length > 0)
        .map((m) => ({ role: m.role, text: m.text }));

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: conversation, context: state.context }),
          signal: controller.signal,
        });

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const { events, remainder } = extractEvents(buffer);
          buffer = remainder;

          for (const event of events) {
            applyEvent(event, assistantMessageId, dispatch);
          }
        }

        dispatch({ type: 'STREAM_DONE', id: assistantMessageId });
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          dispatch({ type: 'STREAM_ABORTED', id: assistantMessageId });
        } else {
          dispatch({ type: 'STREAM_ERROR', id: assistantMessageId, message: "Sorry, something went wrong. Please try again." });
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [state.messages, state.context, state.status]
  );

  const stopGenerating = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Once a conversation escalates or is taken over, a SuperAdmin's replies
  // no longer arrive via sendMessage's response stream (that only fires in
  // response to this visitor's own turns) — poll for them instead. Scoped to
  // the panel being open so a closed widget doesn't poll in the background.
  const lastAdminSeenRef = useRef(0);
  useEffect(() => {
    if (state.uiMode === 'closed') return;
    if (!state.humanMode && !state.escalated) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/live?after=${lastAdminSeenRef.current}`);
        if (!res.ok) return;
        const data: { mode: 'bot' | 'human'; escalated: boolean; messages: { id: string; text: string; createdAt: number }[] } =
          await res.json();

        if (data.mode === 'human') dispatch({ type: 'HUMAN_TAKEOVER', assistantMessageId: '' });

        for (const m of data.messages) {
          lastAdminSeenRef.current = Math.max(lastAdminSeenRef.current, m.createdAt);
          dispatch({
            type: 'ADD_UNREAD_MESSAGE',
            message: { id: m.id, role: 'assistant', text: m.text, blocks: [], createdAt: m.createdAt, authoredBy: 'human' },
          });
        }
      } catch {
        // Best-effort — a missed poll tick just gets retried on the next one.
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [state.uiMode, state.humanMode, state.escalated]);

  return {
    state,
    sendMessage,
    stopGenerating,
    open: () => dispatch({ type: 'OPEN' }),
    close: () => dispatch({ type: 'CLOSE' }),
    minimize: () => dispatch({ type: 'MINIMIZE' }),
    toggleFullscreen: () => dispatch({ type: 'TOGGLE_FULLSCREEN' }),
  };
}

function applyEvent(
  event: ReplyEvent,
  assistantMessageId: string,
  dispatch: React.Dispatch<ChatAction>
) {
  switch (event.type) {
    case 'text-delta':
      dispatch({ type: 'TEXT_DELTA', id: assistantMessageId, delta: event.delta });
      break;
    case 'products':
      dispatch({ type: 'BLOCK', id: assistantMessageId, block: { kind: 'products', products: event.products, heading: event.heading } });
      break;
    case 'order-status':
      dispatch({ type: 'BLOCK', id: assistantMessageId, block: { kind: 'order-status', order: event.order } });
      break;
    case 'appointment-confirmed':
      dispatch({ type: 'BLOCK', id: assistantMessageId, block: { kind: 'appointment-confirmed', appointment: event.appointment } });
      break;
    case 'quick-replies':
      dispatch({ type: 'BLOCK', id: assistantMessageId, block: { kind: 'quick-replies', options: event.options } });
      break;
    case 'escalate':
      dispatch({ type: 'BLOCK', id: assistantMessageId, block: { kind: 'escalate', reason: event.reason } });
      break;
    case 'human-takeover':
      dispatch({ type: 'HUMAN_TAKEOVER', assistantMessageId });
      break;
    case 'context':
      dispatch({ type: 'CONTEXT', context: event.context });
      break;
    case 'error':
      dispatch({ type: 'STREAM_ERROR', id: assistantMessageId, message: event.message });
      break;
    case 'done':
    default:
      break;
  }
}
