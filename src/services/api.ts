
import { toast } from "sonner";

// Types for our API requests and responses
export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  type: 'text' | 'table' | 'json' | 'log' | 'dashboard' | 'error';
  content: any;
  sessionId: string;
}

export interface ConfigData {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env: Record<string, string>;
  }>;
}

// Base API URL - this should be configurable in a real app
const API_BASE_URL = 'http://localhost:5000/api';

// API error handling
class APIError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
  }
}

// Generic request function
async function makeRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new APIError(responseData.message || 'An error occurred', response.status);
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof APIError) {
      toast.error(`API Error (${error.statusCode}): ${error.message}`);
      throw error;
    } else {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Network Error: ${message}`);
      throw new APIError(message, 0);
    }
  }
}

// API functions
export const apiService = {
  // Chat API
  sendChatMessage: (data: ChatRequest) => 
    makeRequest<ChatResponse>('/chat', 'POST', data),
  
  // Config API
  getConfig: () => 
    makeRequest<ConfigData>('/config', 'GET'),
  
  updateConfig: (data: ConfigData) => 
    makeRequest<ConfigData>('/config', 'PUT', data)
};

export default apiService;
