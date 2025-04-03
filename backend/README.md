
# MCP Flask Backend

This is a Flask backend for the Model Context Protocol (MCP) client application that connects to MCP servers like Datadog.

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

4. Create a `.env` file with your Azure OpenAI credentials:
   ```
   AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
   AZURE_OPENAI_API_KEY=your-api-key
   ```

5. Run the application:
   ```
   python app.py
   ```

## API Endpoints

The server will run on http://localhost:5000 and provides the following endpoints:

- `POST /api/chat` - Send chat messages and receive responses
- `GET /api/config` - Get current MCP server configuration
- `PUT /api/config` - Update MCP server configuration

## MCP Integration

The backend integrates with Model Context Protocol (MCP) servers, allowing AI models to call tools provided by these servers. The application will:

1. Connect to the MCP server specified in `config.json`
2. Use Azure OpenAI's GPT models to process queries
3. Execute tool calls as needed based on the model's decisions
4. Return the results to the frontend

If the MCP connection fails, the application will fall back to demo responses.

## Demo Features

To test different response types in the chat (when in demo mode), include these keywords in your messages:

- "json" or "data" - Returns JSON data
- "table" or "list" - Returns tabular data
- "log" or "error" - Returns log entries
- "dashboard", "chart", or "graph" - Returns dashboard visualization data
- "fail" or "break" - Returns an error message
- Anything else - Returns a text response

## Configuration

The server stores configuration in a file called `config.json` in the same directory as the application.
If the file doesn't exist, a default configuration will be created.

Example configuration:
```json
{
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
```
