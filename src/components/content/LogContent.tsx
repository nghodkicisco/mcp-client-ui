
import React from 'react';
import { LogEntry } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { parseLogData } from '@/utils/responseHandlers';

interface LogContentProps {
  content: LogEntry[] | string;
}

const LogContent: React.FC<LogContentProps> = ({ content }) => {
  const logEntries = parseLogData(content);
  
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-4">
        <ScrollArea className="h-[300px] w-full">
          <div className="mcp-log-viewer">
            {logEntries.map((entry, index) => {
              const timestamp = new Date(entry.timestamp).toLocaleTimeString();
              return (
                <div key={index} className={entry.level}>
                  <span className="font-semibold">[{timestamp}]</span> {entry.level.toUpperCase()}: {entry.message}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LogContent;
