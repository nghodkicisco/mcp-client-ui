
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConfigEditor from '@/components/ConfigEditor';
import { MCPConfig } from '@/types';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const defaultConfig: MCPConfig = {
  mcpServers: {
    "mcp-server-datadog": {
      "command": "npx",
      "args": ["-y", "@winor30/mcp-server-datadog"],
      "env": {
        "DATADOG_API_KEY": "XXXXXXX",
        "DATADOG_APP_KEY": "XXXXXXXXX",
        "DATADOG_SITE": "datadoghq.com"
      }
    }
  }
};

const ConfigPage: React.FC = () => {
  const [config, setConfig] = useState<MCPConfig>(defaultConfig);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await apiService.getConfig();
        setConfig(data);
      } catch (error) {
        toast.error("Failed to load configuration");
        console.error("Failed to load configuration:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleConfigUpdate = (newConfig: MCPConfig) => {
    setConfig(newConfig);
  };

  return (
    <MainLayout>
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-6">MCP Server Configuration</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ConfigEditor 
            initialConfig={config} 
            onConfigUpdate={handleConfigUpdate} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ConfigPage;
