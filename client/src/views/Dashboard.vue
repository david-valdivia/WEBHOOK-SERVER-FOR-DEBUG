<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 border-l-4 border-l-blue-600">
        <h3 class="text-sm font-medium text-gray-600 mb-1">Requests</h3>
        <p class="text-3xl font-bold text-gray-900">{{ webhookStore.requestCount }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-sm font-medium text-gray-600 mb-3">Endpoint URL</h3>
        <div class="flex">
          <input 
            type="text" 
            class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-700 text-sm"
            :value="webhookStore.endpointUrl"
            readonly
          >
          <button 
            class="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
            type="button" 
            @click="copyEndpointUrl"
            :disabled="!webhookStore.activeEndpoint"
          >
            <ClipboardDocumentIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs for requests and configuration -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="border-b border-gray-200">
        <nav class="flex px-6 -mb-px">
          <button 
            :class="activeTab === 'requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="px-4 py-3 border-b-2 font-medium text-sm transition duration-200 flex items-center space-x-2 mr-8"
            @click="setActiveTab('requests')"
          >
            <ClockIcon class="h-4 w-4" />
            <span>Requests</span>
          </button>
          <button 
            :class="activeTab === 'response' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="px-4 py-3 border-b-2 font-medium text-sm transition duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:border-transparent"
            @click="setActiveTab('response')"
            :disabled="!webhookStore.activeEndpoint"
          >
            <CogIcon class="h-4 w-4" />
            <span>Response</span>
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- Requests Tab -->
        <div v-if="activeTab === 'requests'">
          <RequestsPanel />
        </div>

        <!-- Response Tab -->
        <div v-else-if="activeTab === 'response'">
          <ResponseConfigPanel />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useWebhookStore } from '@/stores/webhookStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { 
  ClipboardDocumentIcon, 
  ClockIcon, 
  CogIcon 
} from '@heroicons/vue/24/outline'

// Components
import RequestsPanel from '@/components/RequestsPanel.vue'
import ResponseConfigPanel from '@/components/ResponseConfigPanel.vue'

const route = useRoute()
const webhookStore = useWebhookStore()
const notificationStore = useNotificationStore()
const activeTab = ref('requests')

const setActiveTab = (tab) => {
  activeTab.value = tab
}

function copyEndpointUrl() {
  if (!webhookStore.endpointUrl) {
    notificationStore.showToast('No endpoint selected', 'error')
    return
  }

  navigator.clipboard.writeText(webhookStore.endpointUrl)
    .then(() => {
      notificationStore.showToast('URL copied to clipboard', 'success')
    })
    .catch(() => {
      notificationStore.showToast('Failed to copy URL', 'error')
    })
}

// Watch for route changes to select endpoint
watch(() => route.params.path, async (newPath) => {
  if (newPath && newPath !== webhookStore.activeEndpoint) {
    try {
      await webhookStore.selectEndpoint(newPath)
    } catch (error) {
      notificationStore.showToast('Failed to load endpoint', 'error')
    }
  }
}, { immediate: true })

onMounted(() => {
  // Handle custom endpoint navigation events from notifications
  window.addEventListener('navigate-to-endpoint', (event) => {
    const path = event.detail.path
    if (path) {
      webhookStore.selectEndpoint(path)
    }
  })
})
</script>