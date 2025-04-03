
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ChatInterface from '@/components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="w-full h-[calc(100vh-120px)]">
        <h1 className="text-2xl font-bold mb-6">MCP Chat Assistant</h1>
        <p className="text-muted-foreground mb-4">
          Chat with this assistant to query Datadog dashboards, view metrics, or analyze logs. 
          Try asking for dashboards, metrics, or logs data.
        </p>
        <ChatInterface />
      </div>
    </MainLayout>
  );
};

export default ChatPage;
