
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ChatInterface from '@/components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="w-full h-[calc(100vh-120px)]">
        <h1 className="text-2xl font-bold mb-6">MCP Chat Assistant</h1>
        <p className="text-muted-foreground mb-4">Send messages or images to get intelligent responses</p>
        <ChatInterface />
      </div>
    </MainLayout>
  );
};

export default ChatPage;
