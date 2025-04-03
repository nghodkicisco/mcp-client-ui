
import React from 'react';
import TextContent from './TextContent';
import JsonContent from './JsonContent';
import TableContent from './TableContent';
import LogContent from './LogContent';
import DashboardContent from './DashboardContent';
import ImageContent from './ImageContent';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ContentRendererProps {
  type: 'text' | 'table' | 'json' | 'log' | 'dashboard' | 'error' | 'image' | 'markdown';
  content: any;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ type, content }) => {
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
    
    case 'image':
      return <ImageContent content={content} />;
    
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
