import type { ReplyEvent } from '@/types/chat';

/**
 * NDJSON (newline-delimited JSON) framing for the /api/chat stream.
 * Not EventSource/SSE: we need POST bodies + AbortController-based
 * cancellation for barge-in, which EventSource doesn't support — so the
 * client already reads the response as a raw ReadableStream, and NDJSON
 * is the simplest framing on top of that.
 */

export function encodeEvent(event: ReplyEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

/**
 * Splits a growing text buffer into complete NDJSON lines plus any
 * trailing partial line to keep accumulating.
 */
export function extractEvents(buffer: string): { events: ReplyEvent[]; remainder: string } {
  const lines = buffer.split('\n');
  const remainder = lines.pop() ?? '';
  const events: ReplyEvent[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line) as ReplyEvent);
    } catch {
      // Ignore a malformed line rather than breaking the whole stream.
    }
  }

  return { events, remainder };
}
