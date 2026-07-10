'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/design';
import { useChatAssistant } from '@/hooks/useChatAssistant';
import ChatFab from '@/components/chat/ChatFab';

const ChatPanel = dynamic(() => import('@/components/chat/ChatPanel'), { ssr: false });

export default function ChatWidget() {
  const chat = useChatAssistant();
  const { uiMode, unreadCount, humanMode } = chat.state;
  const isFullscreen = uiMode === 'fullscreen';

  return (
    <div className={cn('fixed z-fixed', isFullscreen ? 'inset-0' : 'bottom-6 right-6')}>
      {uiMode !== 'closed' && <ChatPanel chat={chat} />}
      {!isFullscreen && (
        <ChatFab uiMode={uiMode} unreadCount={unreadCount} humanMode={humanMode} onOpen={chat.open} onClose={chat.close} />
      )}
    </div>
  );
}
