<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <NavigationHeader />
    
    <!-- Main Content -->
    <div class="flex">
      <!-- Sidebar -->
      <EndpointSidebar />
      
      <!-- Main Content Area -->
      <div class="flex-1 p-6">
        <router-view />
      </div>
    </div>

    <!-- Modals -->
    <CreateEndpointModal />
    <NotificationSettingsModal />
    
    <!-- Toast Notifications -->
    <ToastNotification />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useWebhookStore } from './stores/webhookStore'
import { useNotificationStore } from './stores/notificationStore'

// Components
import NavigationHeader from './components/NavigationHeader.vue'
import EndpointSidebar from './components/EndpointSidebar.vue'
import CreateEndpointModal from './components/CreateEndpointModal.vue'
import NotificationSettingsModal from './components/NotificationSettingsModal.vue'
import ToastNotification from './components/ToastNotification.vue'

// Stores
const webhookStore = useWebhookStore()
const notificationStore = useNotificationStore()

onMounted(async () => {
  try {
    console.log('App mounting, initializing stores...')
    // Initialize stores
    await webhookStore.initialize()
    await notificationStore.initialize()
    console.log('Stores initialized successfully')
  } catch (error) {
    console.error('Failed to initialize stores:', error)
  }
})
</script>

<style>
/* Custom utility classes for specific needs */
.request-card {
  transition: all 0.3s ease;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.endpoint-item.active {
  @apply bg-blue-50 border-l-4 border-l-blue-500;
}

.endpoint-item.active .endpoint-indicator {
  @apply bg-blue-500;
}

pre {
  @apply bg-gray-100 rounded-lg p-4 m-0 max-h-80 overflow-y-auto font-mono text-sm;
}

.response-editor {
  @apply font-mono min-h-36;
}
</style>