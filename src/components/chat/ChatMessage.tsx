
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatMessage as ChatMessageType } from '@/types';
import ContentRenderer from '../content/ContentRenderer';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-mcp-secondary text-white">
            <Bot size={16} />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div className="mb-1 text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
        
        <div className={`rounded-lg p-4 ${
          isUser 
            ? 'bg-mcp-primary text-white' 
            : 'bg-muted'
        }`}>
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            <ContentRenderer 
              type={message.contentType} 
              content={message.content} 
            />
          )}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 order-3">
          <AvatarFallback className="bg-mcp-accent text-white">
            <User size={16} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
