# Development Setup Guide

## Quick Start Commands

### Option 1: Manual (Recommended)

**Terminal 1 - Backend Server:**
```bash
npm run dev
```
- ✅ Server runs on **port 1995**
- ✅ Auto-reload with nodemon
- ✅ API available at `http://localhost:1995/api`
- ✅ WebSocket server for real-time updates

**Terminal 2 - Frontend Client:**
```bash
npm run client:dev
```  
- ✅ Client runs on **port 1994**
- ✅ Hot reload with Vite
- ✅ Access at `http://localhost:1994`
- ✅ Auto-proxy to backend server

### Option 2: Use Concurrently (Install First)
```bash
# Install concurrently globally
npm install -g concurrently

# Run both servers simultaneously
concurrently "npm run dev" "npm run client:dev"
```

## Port Configuration

| Service | Port | Purpose |
|---------|------|---------|
| **Backend** | 1995 | Node.js server + WebSocket + API |
| **Frontend** | 1994 | Vue.js dev server with proxy |
| **Webhooks** | 1995 | Actual webhook endpoints for external calls |

## Important Notes

### ✅ Webhook URLs
- **Correct**: `http://localhost:1995/my-endpoint` 
- **Wrong**: `http://localhost:1994/my-endpoint`

The frontend automatically generates correct webhook URLs pointing to port **1995** (server), not port **1994** (client).

### ✅ Development Flow
1. Frontend requests go to `http://localhost:1994`
2. Vite proxy forwards API calls to `http://localhost:1995`
3. External webhook calls go directly to `http://localhost:1995`
4. Real-time updates via WebSocket on port 1995

### ✅ Environment Variables
The client uses these environment variables:

**Development (`.env.development`):**
```env
VITE_SERVER_PORT=1995
VITE_CLIENT_PORT=1994
VITE_SERVER_HOST=localhost
```

**Production (`.env.production`):**
```env
VITE_SERVER_PORT=1995
VITE_SERVER_HOST=localhost
```

## Troubleshooting

### Problem: Endpoints not loading
- ✅ Check both servers are running
- ✅ Verify ports 1994 and 1995 are available
- ✅ Check browser console for API errors

### Problem: WebSocket not connecting
- ✅ Ensure backend server is running on port 1995
- ✅ Check proxy configuration in `vite.config.js`

### Problem: Wrong webhook URLs
- ✅ URLs should point to port 1995, not 1994
- ✅ Check `VITE_SERVER_PORT` environment variable

### Problem: CORS errors
- ✅ Proxy should handle this automatically
- ✅ Check Vite proxy configuration

## Testing the Setup

1. **Start both servers** (backend on 1995, frontend on 1994)
2. **Open** `http://localhost:1994`
3. **Create endpoint** called "test"
4. **Copy webhook URL** - should be `http://localhost:1995/test`
5. **Send test request:**
   ```bash
   curl -X POST http://localhost:1995/test \
     -H "Content-Type: application/json" \
     -d '{"message": "hello world"}'
   ```
6. **Verify** request appears in real-time on the frontend

## File Watching

### Backend Files (Auto-restart with nodemon):
- `src/**/*.js`
- `app.js`
- `package.json`

### Frontend Files (Hot reload with Vite):
- `client/src/**/*.vue`
- `client/src/**/*.js`
- `client/index.html`
- `client/vite.config.js`