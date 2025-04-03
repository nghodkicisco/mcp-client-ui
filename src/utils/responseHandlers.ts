
import { ChartData, LogEntry, TableData } from "@/types";

export function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export function isMarkdownTable(str: string): boolean {
  // Check if the string contains markdown table patterns
  const tablePattern = /\|.*\|.*\n\|[\s-:]+\|[\s-:]+\|/;
  return tablePattern.test(str);
}

export function detectContentType(content: any): 'text' | 'table' | 'json' | 'log' | 'dashboard' | 'error' | 'markdown' {
  if (typeof content === 'string') {
    if (isMarkdownTable(content)) {
      return 'table';
    }
    
    // Check if the content is markdown (containing markdown syntax)
    if (content.includes('##') || content.includes('**') || 
        content.includes('![') || content.includes('[') && content.includes('](')) {
      return 'markdown';
    }
    
    if (isJsonString(content)) {
      try {
        const parsedJson = JSON.parse(content);
        if (Array.isArray(parsedJson) && parsedJson.length > 0 && parsedJson[0].timestamp && parsedJson[0].level) {
          return 'log';
        }
        return 'json';
      } catch {
        return 'text';
      }
    }
    return 'text';
  }
  
  if (typeof content === 'object') {
    if (content === null) return 'text';
    
    if (Array.isArray(content)) {
      if (content.length > 0 && content[0].timestamp && content[0].level) {
        return 'log';
      }
      return 'json';
    }
    
    if (content.headers && content.rows && Array.isArray(content.rows)) {
      return 'table';
    }
    
    if (content.title && content.charts && Array.isArray(content.charts)) {
      return 'dashboard';
    }
    
    return 'json';
  }
  
  return 'text';
}

export function parseMarkdownTable(markdown: string): TableData {
  if (!isMarkdownTable(markdown)) {
    return { headers: ['Content'], rows: [[markdown]] };
  }

  const lines = markdown.trim().split('\n');
  
  // Extract headers (first row)
  const headerLine = lines[0];
  const headers = headerLine
    .split('|')
    .map(h => h.trim())
    .filter(h => h !== '');
  
  // Skip the separator line (second row)
  
  // Extract data rows (third row onwards)
  const rows = lines.slice(2).map(line => {
    return line
      .split('|')
      .map(cell => cell.trim())
      .filter((_, index) => index > 0 && index <= headers.length);
  });
  
  return { headers, rows };
}

export function parseTableData(content: any): TableData {
  if (typeof content === 'string') {
    if (isMarkdownTable(content)) {
      return parseMarkdownTable(content);
    }
    
    try {
      return JSON.parse(content) as TableData;
    } catch {
      return { headers: ['Content'], rows: [[content]] };
    }
  }
  
  if (content.headers && content.rows) {
    return content as TableData;
  }
  
  return { headers: ['Content'], rows: [[typeof content === 'object' ? JSON.stringify(content) : String(content)]] };
}

export function parseLogData(content: any): LogEntry[] {
  if (typeof content === 'string') {
    try {
      return JSON.parse(content) as LogEntry[];
    } catch {
      return [{ timestamp: new Date().toISOString(), level: 'error', message: 'Could not parse log data' }];
    }
  }
  
  if (Array.isArray(content)) {
    return content as LogEntry[];
  }
  
  return [{ timestamp: new Date().toISOString(), level: 'error', message: 'Invalid log data' }];
}

export function parseChartData(content: any): ChartData[] {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (parsed.charts) {
        return parsed.charts as ChartData[];
      }
      return [];
    } catch {
      return [];
    }
  }
  
  if (content.charts && Array.isArray(content.charts)) {
    return content.charts as ChartData[];
  }
  
  return [];
}
