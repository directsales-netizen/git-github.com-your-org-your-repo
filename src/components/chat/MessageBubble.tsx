import { Paperclip, UserRound } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';
import { cn } from '@/design';
import ProductCardCompact from './ProductCardCompact';
import OrderStatusCard from './OrderStatusCard';
import AppointmentConfirmationCard from './AppointmentConfirmationCard';
import SuggestedQuestions from './SuggestedQuestions';

interface MessageBubbleProps {
  message: ChatMessage;
  onQuickReply: (option: string) => void;
  disabled?: boolean;
}

export default function MessageBubble({ message, onQuickReply, disabled }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <div
          aria-hidden="true"
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-primary/15 text-accent-primary"
        >
          <UserRound size={16} />
        </div>
      )}

      <div className={cn('max-w-[85%]', isUser ? 'items-end' : 'items-start', 'flex flex-col gap-2')}>
        {message.authoredBy === 'human' && (
          <p className="text-caption font-body text-accent-primary">Live agent</p>
        )}

        {message.text && (
          <div
            className={cn(
              'whitespace-pre-wrap rounded-lg px-4 py-2.5 text-body-sm font-body',
              isUser ? 'bg-accent-primary text-bg-primary' : 'bg-bg-secondary text-neutral-light-gray'
            )}
          >
            {message.text}
            {message.streaming && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-current align-middle" aria-hidden="true" />}
          </div>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-col gap-1">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.name}
                className="flex items-center gap-2 rounded-md border border-neutral-titanium/30 bg-bg-primary px-3 py-2 text-caption font-body text-neutral-silver"
              >
                <Paperclip size={14} aria-hidden="true" />
                {attachment.name}
              </div>
            ))}
          </div>
        )}

        {message.aborted && (
          <p className="text-caption font-body text-neutral-gray">Generation stopped.</p>
        )}

        {message.blocks.map((block, index) => {
          switch (block.kind) {
            case 'products':
              return (
                <div key={index} className="flex flex-col gap-2">
                  {block.heading && <p className="text-caption font-body text-neutral-silver">{block.heading}</p>}
                  {block.products.map((product) => (
                    <ProductCardCompact key={product.id} product={product} />
                  ))}
                </div>
              );
            case 'order-status':
              return <OrderStatusCard key={index} order={block.order} />;
            case 'appointment-confirmed':
              return <AppointmentConfirmationCard key={index} appointment={block.appointment} />;
            case 'quick-replies':
              return (
                <SuggestedQuestions
                  key={index}
                  options={block.options}
                  onSelect={onQuickReply}
                  disabled={disabled}
                />
              );
            case 'escalate':
              return (
                <div
                  key={index}
                  className="rounded-md border border-secondary-primary/40 bg-secondary-primary/10 px-3 py-2 text-caption font-body text-neutral-light-gray"
                >
                  A specialist will follow up shortly. You can also reach us any time at{' '}
                  <a href="mailto:directsales@premiumtechnoir.org" className="text-accent-primary underline">
                    directsales@premiumtechnoir.org
                  </a>
                  .
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
