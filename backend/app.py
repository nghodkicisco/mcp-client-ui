
from flask import Flask, request, jsonify
import json
import os
import time
import uuid
import random
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

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

# Sample response generators
def generate_text_response(query):
    responses = [
        f"You asked about '{query}'. This is a text response from the MCP server.",
        f"Processing your query: '{query}'. Here are some findings...",
        f"Analysis complete for '{query}'. See the following information."
    ]
    return {"type": "text", "content": random.choice(responses)}

def generate_json_response(query):
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

def generate_table_response(query):
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

def generate_log_response(query):
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

def generate_dashboard_response(query):
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

def generate_error_response(query):
    errors = [
        f"Failed to process query: '{query}'. Invalid syntax.",
        f"Query execution error: Service unavailable for '{query}'.",
        f"Permission denied when accessing data for '{query}'."
    ]
    return {"type": "error", "content": random.choice(errors)}

# API Routes
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
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
        
        # Determine response type based on message content
        response_type = "text"  # default
        
        if "json" in message.lower() or "data" in message.lower():
            response = generate_json_response(message)
        elif "table" in message.lower() or "list" in message.lower():
            response = generate_table_response(message)
        elif "log" in message.lower() or "error" in message.lower():
            response = generate_log_response(message)
        elif "dashboard" in message.lower() or "chart" in message.lower() or "graph" in message.lower():
            response = generate_dashboard_response(message)
        elif "fail" in message.lower() or "break" in message.lower():
            response = generate_error_response(message)
        else:
            response = generate_text_response(message)
        
        # Add response to session
        chat_sessions[session_id]["messages"].append({
            "role": "assistant",
            "content": response["content"],
            "type": response["type"],
            "timestamp": datetime.now().isoformat()
        })
        
        # Simulate processing time
        time.sleep(0.5)
        
        # Return response with session ID
        response["sessionId"] = session_id
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            "type": "error",
            "content": f"Server error: {str(e)}",
            "sessionId": data.get('sessionId', str(uuid.uuid4()))
        }), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    try:
        with open(CONFIG_FILE, "r") as f:
            config = json.load(f)
        return jsonify(config)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/config', methods=['PUT'])
def update_config():
    try:
        new_config = request.json
        
        # Basic validation
        if "mcpServers" not in new_config:
            return jsonify({"error": "Invalid configuration: 'mcpServers' is required"}), 400
        
        # Save to file
        with open(CONFIG_FILE, "w") as f:
            json.dump(new_config, f, indent=2)
        
        return jsonify(new_config)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("MCP Flask Server starting...")
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
