import { generateAssistantReply, type ConversationTurn } from '@/lib/chat/generateAssistantReply';
import { encodeEvent } from '@/lib/chat/formatSSE';
import { createEmptyContext, type ConversationContext } from '@/types/chat';

export const runtime = 'nodejs';

interface ChatRequestBody {
  messages: ConversationTurn[];
  context?: ConversationContext;
}

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ type: 'error', message: 'Invalid request body.' }), { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const context = body.context ?? createEmptyContext();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of generateAssistantReply(messages, context, request.signal)) {
          if (request.signal.aborted) break;
          controller.enqueue(encodeEvent(event));
        }
      } catch {
        if (!request.signal.aborted) {
          controller.enqueue(encodeEvent({ type: 'error', message: 'Something went wrong.' }));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
