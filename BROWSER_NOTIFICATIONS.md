# Browser Notifications Feature

## Overview
The Webhook Testing Server now includes real-time browser notifications that alert you when new webhook requests are received, even when the browser tab is not active.

## Features

### ✅ Smart Notification System
- **Tab-aware**: Only shows notifications when the browser tab is inactive
- **Endpoint-specific**: Configure notifications for active endpoint only or all endpoints
- **Request preview**: Shows HTTP method, endpoint path, and request body preview
- **Click to focus**: Click notification to bring the browser tab to focus and switch to the endpoint

### ✅ Configurable Settings
- **Notification scope**: Choose between active endpoint only or all endpoints
- **Request details**: Toggle request body preview in notifications
- **Sound**: Enable/disable notification sound
- **Persistent settings**: All preferences are saved in browser local storage

### ✅ Permission Management
- **Easy activation**: One-click permission request
- **Status indicator**: Clear visual indication of notification status
- **Fallback support**: Graceful handling when notifications are not supported

## How to Use

### 1. Enable Notifications
1. Open the application in your browser: `http://localhost:1995`
2. Look for the notification controls in the top navigation bar
3. Click "Enable Notifications" button
4. Allow notifications when prompted by your browser

### 2. Configure Settings
1. Click the gear icon (⚙️) next to the notification toggle
2. Choose your notification preferences:
   - **Active endpoint only**: Get notifications only for the currently selected endpoint
   - **All endpoints**: Get notifications for requests to any endpoint
   - **Show request body preview**: Include request data in notification
   - **Play notification sound**: Enable audio alerts
3. Click "Save Settings"

### 3. Test Notifications
1. Create a test endpoint (e.g., "test")
2. Switch to another browser tab or minimize the window
3. Send a request to your endpoint:
   ```bash
   curl -X POST http://localhost:1995/test \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello from webhook!"}'
   ```
4. You should receive a browser notification with request details

## Notification Types

### Request Received Notification
- **Title**: "New [METHOD] Request"
- **Body**: Shows endpoint path and request body preview
- **Click action**: Focuses browser tab and switches to the endpoint

### Endpoint Created Notification  
- **Title**: "New Endpoint Created"
- **Body**: Shows the newly created endpoint path
- **Auto-dismiss**: Closes automatically after 4 seconds

## Technical Implementation

### Browser Notification Service
- **Class**: `BrowserNotificationService`
- **Features**: Permission management, settings persistence, smart filtering
- **Storage**: Uses `localStorage` for settings persistence

### Integration Points
- **Socket.IO events**: Real-time updates trigger notifications
- **Main application**: Seamlessly integrated with existing UI
- **Fallback handling**: Works gracefully when notifications are blocked or unsupported

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Chromium 50+
- ✅ Firefox 44+
- ✅ Safari 13+
- ✅ Edge 79+

### Fallback Behavior
- If notifications are not supported: Feature is disabled gracefully
- If permissions are denied: Shows appropriate status message
- If tab is active: Notifications are suppressed (only in-app toasts shown)

## Settings Storage

All notification preferences are stored in browser `localStorage`:
```javascript
{
  "enabled": true,
  "showForActiveEndpoint": true,
  "showForAllEndpoints": false,
  "showRequestDetails": true,
  "playSound": true
}
```

## Best Practices

1. **Test with tab inactive**: Notifications only appear when the tab is not focused
2. **Configure appropriately**: Use "active endpoint only" to reduce notification noise
3. **Check browser settings**: Ensure site notifications are allowed in browser settings
4. **Use request preview**: Enable body preview for debugging complex payloads

## Troubleshooting

### Notifications Not Appearing
1. Check browser permissions for the site
2. Ensure the browser tab is not active/focused
3. Verify notification settings are enabled
4. Check browser's "Do Not Disturb" or "Focus" mode

### Notifications Blocked
1. Click the notification icon in browser address bar
2. Select "Allow" for notifications
3. Refresh the page and try enabling again

### Settings Not Saving
1. Check if localStorage is enabled in browser
2. Ensure not in incognito/private mode
3. Clear site data and reconfigure if needed

## Architecture Benefits

- **Non-intrusive**: Only shows when needed (tab inactive)
- **Configurable**: Flexible settings for different use cases  
- **Persistent**: Settings survive browser sessions
- **Responsive**: Click notifications to quickly navigate to endpoints
- **Robust**: Graceful fallback when features unavailable