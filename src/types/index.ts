
// Server configuration types
export interface ServerEnv {
  [key: string]: string;
}

export interface MCPServer {
  command: string;
  args: string[];
  env: ServerEnv;
}

export interface MCPConfig {
  mcpServers: {
    [key: string]: MCPServer;
  };
}

// Chat message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: any;
  contentType: 'text' | 'table' | 'json' | 'log' | 'dashboard' | 'error';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Table data type
export interface TableData {
  headers: string[];
  rows: any[][];
}

// Log data type
export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
}

// Dashboard data type
export interface DashboardData {
  title: string;
  description?: string;
  charts: ChartData[];
}

export interface ChartData {
  type: 'line' | 'bar' | 'area' | 'pie';
  title: string;
  data: any;
  config?: any;
}
