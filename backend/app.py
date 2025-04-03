
import json
import os
import time
import uuid
import random
from datetime import datetime, timedelta
import asyncio
from quart import Quart, request
from quart_cors import cors
from typing import Optional
from contextlib import AsyncExitStack
from openai import AzureOpenAI
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from dotenv import load_dotenv

load_dotenv()  # load environment variables from .env

app = Quart(__name__)
app = cors(app, allow_origin="*")

# Sample data for demo purposes
CONFIG_FILE = "config.json"
DEFAULT_CONFIG = {
    "mcpServers": {
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
}

# Create default config file if it doesn't exist
if not os.path.exists(CONFIG_FILE):
    with open(CONFIG_FILE, "w") as f:
        json.dump(DEFAULT_CONFIG, f, indent=2)

# Chat session storage (in-memory for demo)
chat_sessions = {}

class MCPClient:
    def __init__(self):
        # Initialize session and client objects
        self.session: Optional[ClientSession] = None
        self.exit_stack = AsyncExitStack()
        self.client = AzureOpenAI(
                azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT"),
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                api_version="2024-05-01-preview"
                )
    # methods will go here
    async def connect_to_server(self):
        """Connect to an MCP server

        Args:
            server_script_path: Path to the server script (.py or .js)
        """
        with open('config.json', 'r') as f:
            file = f.read()
        config = json.loads(file)

        server_params = StdioServerParameters(
            command=config["mcpServers"]["mcp-server-datadog"]["command"],
            args= config["mcpServers"]["mcp-server-datadog"]["args"],
            env=config["mcpServers"]["mcp-server-datadog"]["env"],
        )

        stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
        self.stdio, self.write = stdio_transport
        self.session = await self.exit_stack.enter_async_context(ClientSession(self.stdio, self.write))

        await self.session.initialize()

        # List available tools
        response = await self.session.list_tools()
        tools = response.tools
        print("\nConnected to server with tools:", [tool.name for tool in tools])

    async def flatten(self, xss):
        return [x for xs in xss for x in xs]
        
    async def process_query(self, query: str) -> str:
        """Process a query using Claude and available tools"""
        messages = [
            {
                "role": "user",
                "content": query
            }
        ]
        deployment_name = "gpt4o"
        response = await self.session.list_tools()
        available_tools = [{
            "name": tool.name,
            "description": tool.description,
            "parameters": tool.inputSchema
        } for tool in response.tools]

        available_tools = [{"type": "function", "function": tool} for tool in available_tools]

        response = self.client.chat.completions.create(
            model=deployment_name,
            messages=messages,
            tools=available_tools,
            tool_choice="auto",
        )

        # Process response and handle tool calls
        final_text = []

        assistant_message_content = []
        if response.choices[0].message.tool_calls:
            for tool_call in response.choices[0].message.tool_calls:
                # Extract tool name and arguments
                tool_name = tool_call.function.name
                if tool_call.function.arguments:
                    # Parse JSON arguments
                    tool_args = json.loads(tool_call.function.arguments)
                else:
                    tool_args = {}

                # Execute tool call
                result = await self.session.call_tool(tool_name, tool_args)
                final_text.append(f"[Calling tool {tool_name} with args {tool_args}]")
                print("result", result.content)
                messages.append({
                    "role": "assistant",
                    "content": assistant_message_content,
                    "tool_calls": [
                        {
                            "id": tool_call.id,
                            "function": {
                                "name": tool_call.function.name,
                                "arguments": tool_call.function.arguments
                            },
                            "type": "function"
                        }
                    ]
                })
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": tool_name,
                    "content": result.content[0].text,
                })
                response = self.client.chat.completions.create(
                    model=deployment_name,
                    messages=messages,
                    tools=available_tools,
                    tool_choice="auto",
                )

                final_text.append(response.choices[0].message.content)

        return "\n".join(final_text)

# Initialize MCP client
mcp_client = MCPClient()

# Sample response generators
async def generate_text_response(query):
    responses = [
        f"You asked about '{query}'. This is a text response from the MCP server.",
        f"Processing your query: '{query}'. Here are some findings...",
        f"Analysis complete for '{query}'. See the following information."
    ]
    return {"type": "text", "content": random.choice(responses)}

async def generate_json_response(query):
    return {
        "type": "json",
        "content": {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "results": {
                "status": "success",
                "count": random.randint(1, 100),
                "data": [
                    {"id": str(uuid.uuid4()), "value": random.random() * 100, "category": "A"},
                    {"id": str(uuid.uuid4()), "value": random.random() * 100, "category": "B"},
                    {"id": str(uuid.uuid4()), "value": random.random() * 100, "category": "C"}
                ]
            }
        }
    }

async def generate_table_response(query):
    # Generate sample table data
    headers = ["ID", "Name", "Value", "Timestamp"]
    rows = []
    for i in range(5):
        rows.append([
            f"ROW-{i+1}",
            f"Item {chr(65 + i)}",
            round(random.random() * 1000, 2),
            (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d %H:%M:%S")
        ])
    
    return {
        "type": "table",
        "content": {
            "headers": headers,
            "rows": rows
        }
    }

async def generate_log_response(query):
    log_entries = []
    log_levels = ["info", "debug", "warning", "error"]
    
    for i in range(10):
        timestamp = datetime.now() - timedelta(minutes=i*5)
        log_entries.append({
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "level": random.choice(log_levels),
            "message": f"Log entry {i+1} related to '{query}': {'Error detected' if 'error' in log_levels[i % 4] else 'Normal operation'}"
        })
    
    return {
        "type": "log",
        "content": log_entries
    }

async def generate_dashboard_response(query):
    # Line chart data
    line_data = []
    for i in range(10):
        line_data.append({
            "name": f"Day {i+1}",
            "series1": round(random.random() * 100, 2),
            "series2": round(random.random() * 80, 2)
        })
    
    # Bar chart data
    bar_data = []
    for i in range(6):
        bar_data.append({
            "name": f"Category {chr(65 + i)}",
            "value1": random.randint(10, 100),
            "value2": random.randint(20, 90)
        })
    
    # Pie chart data
    pie_data = []
    total = 100
    for i in range(4):
        value = random.randint(10, total)
        total -= value
        pie_data.append({
            "name": f"Segment {chr(65 + i)}",
            "value": value
        })
    if total > 0:
        pie_data.append({"name": "Other", "value": total})
    
    # Area chart data
    area_data = []
    for i in range(7):
        area_data.append({
            "name": f"Week {i+1}",
            "series1": round(random.random() * 100, 2),
            "series2": round(random.random() * 100, 2)
        })
    
    return {
        "type": "dashboard",
        "content": {
            "title": f"Dashboard for '{query}'",
            "description": "This is a sample dashboard with various charts",
            "charts": [
                {
                    "type": "line",
                    "title": "Trend Analysis",
                    "data": line_data
                },
                {
                    "type": "bar",
                    "title": "Comparative Analysis",
                    "data": bar_data
                },
                {
                    "type": "pie",
                    "title": "Distribution",
                    "data": pie_data
                },
                {
                    "type": "area",
                    "title": "Cumulative Metrics",
                    "data": area_data
                }
            ]
        }
    }

async def generate_error_response(query):
    errors = [
        f"Failed to process query: '{query}'. Invalid syntax.",
        f"Query execution error: Service unavailable for '{query}'.",
        f"Permission denied when accessing data for '{query}'."
    ]
    return {"type": "error", "content": random.choice(errors)}

# API Routes
@app.route('/api/chat', methods=['POST'])
async def chat():
    try:
        data = await request.get_json()
        message = data.get('message', '')
        session_id = data.get('sessionId', str(uuid.uuid4()))
        
        # Create session if it doesn't exist
        if session_id not in chat_sessions:
            chat_sessions[session_id] = {
                "created_at": datetime.now().isoformat(),
                "messages": []
            }
        
        # Add message to session
        chat_sessions[session_id]["messages"].append({
            "role": "user",
            "content": message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Try to use MCP client first if it's ready
        try:
            if not mcp_client.session:
                # Connect to MCP server if not already connected
                await mcp_client.connect_to_server()
            
            mcp_response = await mcp_client.process_query(message)
            response = {"type": "text", "content": mcp_response}
        except Exception as e:
            print(f"MCP client error: {str(e)}. Falling back to demo responses.")
            
            # If MCP fails, fall back to the demo responses
            # Determine response type based on message content
            if "json" in message.lower() or "data" in message.lower():
                response = await generate_json_response(message)
            elif "table" in message.lower() or "list" in message.lower():
                response = await generate_table_response(message)
            elif "log" in message.lower() or "error" in message.lower():
                response = await generate_log_response(message)
            elif "dashboard" in message.lower() or "chart" in message.lower() or "graph" in message.lower():
                response = await generate_dashboard_response(message)
            elif "fail" in message.lower() or "break" in message.lower():
                response = await generate_error_response(message)
            else:
                response = await generate_text_response(message)
        
        # Add response to session
        chat_sessions[session_id]["messages"].append({
            "role": "assistant",
            "content": response["content"],
            "type": response["type"],
            "timestamp": datetime.now().isoformat()
        })
        
        # Simulate processing time
        await asyncio.sleep(0.5)
        
        # Return response with session ID
        response["sessionId"] = session_id
        return response
    
    except Exception as e:
        return {
            "type": "error",
            "content": f"Server error: {str(e)}",
            "sessionId": data.get('sessionId', str(uuid.uuid4()))
        }, 500

@app.route('/api/config', methods=['GET'])
async def get_config():
    try:
        with open(CONFIG_FILE, "r") as f:
            config = json.load(f)
        return config
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/api/config', methods=['PUT'])
async def update_config():
    try:
        new_config = await request.get_json()
        
        # Basic validation
        if "mcpServers" not in new_config:
            return {"error": "Invalid configuration: 'mcpServers' is required"}, 400
        
        # Save to file
        with open(CONFIG_FILE, "w") as f:
            json.dump(new_config, f, indent=2)
        
        # Reset MCP client to reconnect with new config
        global mcp_client
        if mcp_client.session:
            await mcp_client.exit_stack.aclose()
        mcp_client = MCPClient()
        
        return new_config
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/', methods=['GET'])
async def index():
    return {"status": "API running", "endpoints": ["/api/chat", "/api/config"]}

@app.before_serving
async def before_serving():
    # Try to initialize MCP client when app starts
    try:
        await mcp_client.connect_to_server()
        print("MCP client initialized successfully")
    except Exception as e:
        print(f"Warning: Could not initialize MCP client: {str(e)}")
        print("The application will fall back to demo responses until configuration is fixed")

if __name__ == '__main__':
    print("MCP Server starting...")
    print("Available endpoints:")
    print("  POST /api/chat - Send chat messages")
    print("  GET /api/config - Get current configuration")
    print("  PUT /api/config - Update configuration")
    print("\nTo test different response types, include these keywords in your messages:")
    print("  'json' or 'data' - Returns JSON data")
    print("  'table' or 'list' - Returns tabular data")
    print("  'log' or 'error' - Returns log entries")
    print("  'dashboard', 'chart', or 'graph' - Returns dashboard visualization data")
    print("  'fail' or 'break' - Returns an error message")
    print("  anything else - Returns a text response")
    
    app.run(host='0.0.0.0', port=5000, debug=True)

