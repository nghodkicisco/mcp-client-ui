
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MCPConfig } from '@/types';
import { apiService } from '@/services/api';
import { Loader2 } from 'lucide-react';

interface ConfigEditorProps {
  initialConfig: MCPConfig;
  onConfigUpdate: (config: MCPConfig) => void;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({ initialConfig, onConfigUpdate }) => {
  const [configText, setConfigText] = useState<string>(
    JSON.stringify(initialConfig, null, 2)
  );
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleUpdate = async () => {
    try {
      // Validate JSON
      const parsedConfig = JSON.parse(configText);
      
      // Validate structure
      if (!parsedConfig.mcpServers) {
        toast.error("Configuration must have an 'mcpServers' object");
        return;
      }
      
      setIsUpdating(true);
      
      // Send to API
      await apiService.updateConfig(parsedConfig);
      
      // Update parent component
      onConfigUpdate(parsedConfig);
      
      toast.success("Configuration updated successfully");
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON format");
      } else {
        toast.error(`Failed to update configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>MCP Server Configuration</CardTitle>
        <CardDescription>
          Edit the JSON configuration for your MCP servers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          className="font-mono h-[400px] resize-none"
          value={configText}
          onChange={(e) => setConfigText(e.target.value)}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleUpdate} 
          disabled={isUpdating}
          className="gap-2"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Configuration
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConfigEditor;
