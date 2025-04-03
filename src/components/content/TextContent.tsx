
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TextContentProps {
  content: string;
}

const TextContent: React.FC<TextContentProps> = ({ content }) => {
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-4">
        <div className="whitespace-pre-wrap">
          {content}
        </div>
      </CardContent>
    </Card>
  );
};

export default TextContent;
