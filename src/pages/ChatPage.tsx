
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ChatInterface from '@/components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="w-full h-[calc(100vh-120px)]">
        <h1 className="text-2xl font-bold mb-6">MCP Chat Assistant</h1>
        <ChatInterface />
      </div>
    </MainLayout>
  );
};

export default ChatPage;
