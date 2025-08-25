# Vue.js Frontend for Webhook Testing Server

This is the Vue.js frontend application for the Webhook Testing Server, providing a modern, reactive user interface for managing webhook endpoints and monitoring requests.

## Architecture

### Technology Stack
- **Vue 3** - Progressive JavaScript framework
- **Pinia** - State management library
- **Vue Router** - Client-side routing
- **Vite** - Build tool and development server
- **Bootstrap 5** - UI framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client

### Project Structure
```
src/
├── components/          # Reusable Vue components
│   ├── CreateEndpointModal.vue
│   ├── EndpointSidebar.vue
│   ├── NavigationHeader.vue
│   ├── NotificationSettingsModal.vue
│   ├── RequestCard.vue
│   ├── RequestsPanel.vue
│   ├── ResponseConfigPanel.vue
│   └── ToastNotification.vue
├── views/              # Page-level components
│   └── Dashboard.vue
├── stores/             # Pinia state management
│   ├── webhookStore.js
│   └── notificationStore.js
├── services/           # Business logic services
│   ├── api.js
│   ├── browserNotificationService.js
│   └── socketService.js
├── App.vue             # Root component
└── main.js             # Application entry point
```

## Features

### ✅ Component-Based Architecture
- **Modular Design**: Reusable, testable components
- **Single File Components**: HTML, CSS, and JavaScript in one file
- **Reactive Data**: Automatic UI updates when data changes
- **Computed Properties**: Efficient derived state management

### ✅ State Management (Pinia)
- **Webhook Store**: Manages endpoints, requests, and response configurations
- **Notification Store**: Handles browser notifications and toast messages
- **Real-time Updates**: Automatic state synchronization with Socket.IO events

### ✅ Routing (Vue Router)
- **Client-side Navigation**: Fast page transitions without full reloads
- **Dynamic Routes**: `/endpoint/:path` for direct endpoint access
- **History Mode**: Clean URLs without hash fragments

### ✅ Real-time Features
- **Socket.IO Integration**: Live updates for new requests and endpoint changes
- **Browser Notifications**: Desktop alerts when tab is inactive
- **Toast Notifications**: In-app feedback messages

## Development

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build
```

### Development Server
The Vite development server runs on `http://localhost:3000` and includes:
- **Hot Module Replacement (HMR)**: Instant updates during development
- **Proxy Configuration**: API calls forwarded to backend server
- **Source Maps**: Easy debugging with original source code

### Build Process
Production build creates optimized files in `../public-vue/`:
- **Code Splitting**: Separate chunks for better loading performance
- **Tree Shaking**: Remove unused code
- **Minification**: Compressed assets for faster loading
- **Asset Optimization**: Compressed images and fonts

## Components Guide

### Core Components

#### NavigationHeader.vue
- Displays application title and connection status
- Notification controls and settings
- Real-time connection indicator

#### EndpointSidebar.vue  
- Lists all available endpoints
- Create and delete endpoint actions
- Quick URL copy functionality
- Active endpoint highlighting

#### Dashboard.vue (Main View)
- Stats cards showing request count and endpoint URL
- Tab navigation between requests and configuration
- Route parameter handling for direct endpoint access

#### RequestsPanel.vue
- Displays list of received requests
- Clear all requests functionality  
- Empty state handling

#### RequestCard.vue
- Individual request display with collapsible details
- HTTP method badges with color coding
- Headers and query parameters toggle
- Delete individual request action

#### ResponseConfigPanel.vue
- Response configuration form
- JSON validation for response body
- Real-time form validation
- Content-type specific formatting

### Modal Components

#### CreateEndpointModal.vue
- Form for creating new endpoints
- Input validation and error handling
- Bootstrap modal integration

#### NotificationSettingsModal.vue
- Browser notification preferences
- Settings persistence to localStorage
- Real-time settings updates

#### ToastNotification.vue
- In-app notification system
- Different types: success, error, warning, info
- Auto-hide functionality

## State Management

### Webhook Store (webhookStore.js)
Manages all webhook-related data and operations:

```javascript
// State
- endpoints: Array of available endpoints
- activeEndpoint: Currently selected endpoint path
- requests: Array of requests for active endpoint
- responseConfig: Response configuration for active endpoint
- isConnected: Socket.IO connection status

// Actions  
- initialize(): Set up store and socket listeners
- loadEndpoints(): Fetch all endpoints from API
- createEndpoint(path): Create new endpoint
- deleteEndpoint(path): Remove endpoint
- selectEndpoint(path): Load endpoint data and requests
- updateResponseConfig(): Save response settings
```

### Notification Store (notificationStore.js)
Handles all notification-related functionality:

```javascript
// State
- toastMessage/Type/Visible: Toast notification state
- browserNotificationService: Browser notification instance
- notificationEnabled: Current notification status

// Actions
- initialize(): Set up browser notification service
- toggleNotifications(): Enable/disable notifications
- showToast(): Display in-app notification
- showBrowserNotification(): Trigger desktop notification
```

## API Integration

### HTTP Client (api.js)
Axios-based API client with:
- **Base Configuration**: Timeout, headers, base URL
- **Request/Response Interceptors**: Error handling and logging  
- **Endpoint Methods**: RESTful API calls for all operations

### WebSocket Client (socketService.js)
Socket.IO client wrapper providing:
- **Connection Management**: Auto-reconnect and error handling
- **Event Listeners**: Real-time updates from server
- **Singleton Pattern**: Single connection instance across app

## Browser Notification Integration

The Vue frontend seamlessly integrates the browser notification system:

1. **Service Integration**: `browserNotificationService.js` imported and initialized
2. **Store Management**: Notification state managed in Pinia store
3. **Settings Persistence**: User preferences saved to localStorage
4. **Event Handling**: Custom events for cross-tab navigation

## Best Practices

### Code Organization
- **Single Responsibility**: Each component has one clear purpose
- **Composition API**: Modern Vue 3 syntax with better TypeScript support
- **Reactive References**: Proper use of `ref()` and `computed()`
- **Event Handling**: Clear parent-child communication patterns

### Performance
- **Lazy Loading**: Route-based code splitting
- **Computed Caching**: Efficient derived state calculations
- **Event Listener Cleanup**: Proper component lifecycle management
- **Optimized Builds**: Production builds with tree shaking and minification

### Accessibility
- **Semantic HTML**: Proper heading hierarchy and form labels
- **ARIA Labels**: Screen reader support for interactive elements
- **Keyboard Navigation**: Tab order and keyboard shortcuts
- **Color Contrast**: Bootstrap's accessibility-compliant color scheme

## Testing

### Unit Testing Setup
```bash
# Add testing dependencies
npm install -D @vue/test-utils vitest jsdom

# Run tests
npm run test
```

### Component Testing
- **Vue Test Utils**: Official testing utilities for Vue components
- **Pinia Testing**: Mock stores for isolated component testing
- **Socket.IO Mocking**: Test real-time features without server dependency

## Deployment

### Production Build
```bash
# Build optimized production assets
npm run build

# Preview production build locally
npm run preview
```

### Server Integration
The built assets are automatically served by the Express server:
- **Static Files**: Served from `../public-vue/`
- **SPA Routing**: All routes fall back to `index.html`
- **API Proxy**: Backend API calls handled correctly

## Migration Benefits

### From Vanilla JavaScript
- **Better Organization**: Clear component boundaries and responsibilities
- **Reactive Updates**: No more manual DOM manipulation
- **Type Safety**: Better IDE support and error catching
- **Scalability**: Easy to add new features and components

### Developer Experience
- **Hot Reload**: Instant feedback during development
- **DevTools**: Vue DevTools for debugging state and components
- **IDE Support**: Better autocomplete and error detection
- **Modern Syntax**: ES6+ features and composition API

## Future Enhancements

### Potential Improvements
- **TypeScript**: Add type safety across the application
- **Component Library**: Extract reusable components for other projects  
- **PWA**: Add service worker for offline functionality
- **Testing**: Comprehensive unit and integration test suite
- **Internationalization**: Multi-language support
- **Theme Support**: Dark/light mode toggle