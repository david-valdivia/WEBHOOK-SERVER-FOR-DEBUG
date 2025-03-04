# Webhook Tester

A modern application for testing, debugging, and monitoring webhooks and APIs with dynamic endpoints and customizable responses.
![Endpoints Panel](webhook1.png) ![Response Configuration](webhook2.png)

## Features

- ✨ Create custom endpoints on demand
- 🔄 Real-time visualization of incoming requests
- ⚙️ Configure responses per endpoint
- ⏱️ Simulate network latency
- 🔎 Detailed inspection of requests and headers
- 💾 Data persistence with SQLite
- 🌐 Interactive web interface

## Installation

### With Docker (recommended)

1. Make sure you have Docker installed

2. Build the Docker image:
   ```bash
   docker build -t webhook-tester .
   ```

3. Run the container:
   ```bash
   docker run -p 1994:1994 -v webhookdata:/app/data webhook-tester
   ```

4. Access the application in your browser:
   ```
   http://localhost:1994
   ```

### Manual Installation

1. Make sure you have Node.js installed (v14 or higher)

2. Clone this repository or download the files

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the application:
   ```bash
   npm start
   ```

5. Access the application in your browser:
   ```
   http://localhost:1994
   ```

## Usage

### Create a New Endpoint

1. Click the `+` button in the Endpoints section
2. Enter the endpoint name (e.g., `payments`)
3. Click "Create"

This will create a new endpoint available at `http://localhost:1994/payments`

### Configure Custom Responses

1. Select an endpoint from the list
2. Go to the "Configuration" tab
3. Configure:
    - HTTP status code (e.g., 200, 201, 400, 500)
    - Response Content-Type
    - Response delay (in milliseconds)
    - Response body (JSON, text, HTML, etc.)
4. Click "Save Configuration"

### View Received Requests

1. Select an endpoint from the list
2. Go to the "Requests" tab
3. All received requests will be displayed sorted by date
4. Click "View Headers" to see additional details

### Test the Endpoint

You can send requests to the created endpoint using tools like curl, Postman, or from your application:

```bash
# Example with curl
curl -X POST http://localhost:1994/payments \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "USD"}'
```

### Integration with Your Application

1. Configure your application to send requests to the endpoint URL (example: `http://localhost:1994/payments`)
2. Received requests will automatically appear in the interface

## Use Cases

- Development and testing of payment integrations
- Third-party webhook debugging
- Testing notification systems
- API simulation for frontend development
- Education and demonstration of APIs

## License

MIT