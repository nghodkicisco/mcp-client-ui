
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface JsonContentProps {
  content: any;
}

const JsonContent: React.FC<JsonContentProps> = ({ content }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  let jsonData = content;
  if (typeof content === 'string') {
    try {
      jsonData = JSON.parse(content);
    } catch (e) {
      jsonData = { error: "Invalid JSON" };
    }
  }
  
  const toggleExpand = (path: string) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  const copyToClipboard = () => {
    const jsonString = typeof content === 'string' 
      ? content 
      : JSON.stringify(content, null, 2);
    
    navigator.clipboard.writeText(jsonString)
      .then(() => toast.success("JSON copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };
  
  const renderValue = (value: any, path: string, depth: number = 0): JSX.Element => {
    if (value === null) return <span className="null">null</span>;
    if (typeof value === 'boolean') return <span className="boolean">{value.toString()}</span>;
    if (typeof value === 'number') return <span className="number">{value}</span>;
    if (typeof value === 'string') return <span className="string">"{value}"</span>;
    
    if (Array.isArray(value)) {
      const isExpanded = expanded[path] !== false;
      
      return (
        <div>
          <span 
            onClick={() => toggleExpand(path)} 
            className="cursor-pointer inline-flex items-center"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Array({value.length})</span>
          </span>
          {isExpanded && (
            <div style={{ marginLeft: '20px' }}>
              {value.map((item, index) => (
                <div key={`${path}-${index}`}>
                  <span className="key">[{index}]:</span>{' '}
                  {renderValue(item, `${path}-${index}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const isExpanded = expanded[path] !== false;
      const keys = Object.keys(value);
      
      return (
        <div>
          <span 
            onClick={() => toggleExpand(path)} 
            className="cursor-pointer inline-flex items-center"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Object({keys.length})</span>
          </span>
          {isExpanded && (
            <div style={{ marginLeft: '20px' }}>
              {keys.map((key) => (
                <div key={`${path}-${key}`}>
                  <span className="key">"{key}":</span>{' '}
                  {renderValue(value[key], `${path}-${key}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };
  
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyToClipboard}
            className="flex items-center gap-1"
          >
            <Copy size={14} />
            <span>Copy</span>
          </Button>
        </div>
        <div className="mcp-json-viewer overflow-auto">
          {renderValue(jsonData, 'root')}
        </div>
      </CardContent>
    </Card>
  );
};

export default JsonContent;
