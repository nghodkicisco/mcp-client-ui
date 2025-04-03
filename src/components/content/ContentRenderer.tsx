
import React from 'react';
import TextContent from './TextContent';
import JsonContent from './JsonContent';
import TableContent from './TableContent';
import LogContent from './LogContent';
import DashboardContent from './DashboardContent';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isJsonString, isMarkdownTable } from '@/utils/responseHandlers';

interface ContentRendererProps {
  type: 'text' | 'table' | 'json' | 'log' | 'dashboard' | 'error' | 'markdown';
  content: any;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ type, content }) => {
  // For string content, try to detect if it's actually JSON or a markdown table
  if (typeof content === 'string') {
    if (isMarkdownTable(content) && type !== 'error') {
      return <TableContent content={content} />;
    }
    
    if (isJsonString(content) && type !== 'error' && type !== 'text') {
      try {
        const parsedContent = JSON.parse(content);
        return <JsonContent content={parsedContent} />;
      } catch {
        // If parsing fails, continue with the original type
      }
    }
  }

  switch (type) {
    case 'text':
      return <TextContent content={String(content)} />;
    
    case 'json':
      return <JsonContent content={content} />;
    
    case 'table':
      return <TableContent content={content} />;
    
    case 'log':
      return <LogContent content={content} />;
    
    case 'dashboard':
      return <DashboardContent content={content} />;
    
    case 'error':
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {typeof content === 'string' ? content : JSON.stringify(content)}
          </AlertDescription>
        </Alert>
      );
    
    default:
      return <TextContent content={String(content)} />;
  }
};

export default ContentRenderer;
