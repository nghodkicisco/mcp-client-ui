
# MCP Flask Backend

This is a simple Flask backend for the Model Context Protocol (MCP) client application.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python app.py
   ```

## API Endpoints

The server will run on http://localhost:5000 and provides the following endpoints:

- `POST /api/chat` - Send chat messages and receive responses
- `GET /api/config` - Get current MCP server configuration
- `PUT /api/config` - Update MCP server configuration

## Demo Features

To test different response types in the chat, include these keywords in your messages:

- "json" or "data" - Returns JSON data
- "table" or "list" - Returns tabular data
- "log" or "error" - Returns log entries
- "dashboard", "chart", or "graph" - Returns dashboard visualization data
- "fail" or "break" - Returns an error message
- Anything else - Returns a text response

## Configuration

The server stores configuration in a file called `config.json` in the same directory as the application.
If the file doesn't exist, a default configuration will be created.
