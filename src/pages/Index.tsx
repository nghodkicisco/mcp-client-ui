
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the chat page
    navigate('/chat');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Loading MCP Client...</h1>
        <div className="animate-pulse-slow">Redirecting to chat interface</div>
      </div>
    </div>
  );
};

export default Index;
