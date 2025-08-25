<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Received Requests</h2>
      <button 
        class="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
        @click="clearAllRequests"
        :disabled="webhookStore.requestCount === 0"
      >
        <TrashIcon class="h-4 w-4 mr-2" />
        Clear All
      </button>
    </div>

    <!-- Requests List -->
    <div v-if="webhookStore.requests.length > 0" class="space-y-4">
      <RequestCard 
        v-for="request in webhookStore.requests" 
        :key="request.id"
        :request="request"
        @delete="deleteRequest"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <InboxIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 text-lg">{{ emptyStateMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWebhookStore } from '@/stores/webhookStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { TrashIcon, InboxIcon } from '@heroicons/vue/24/outline'
import RequestCard from './RequestCard.vue'
import Swal from 'sweetalert2'

const webhookStore = useWebhookStore()
const notificationStore = useNotificationStore()

const emptyStateMessage = computed(() => {
  return webhookStore.activeEndpoint 
    ? 'No requests for this endpoint'
    : 'Select an endpoint to view its requests'
})

async function deleteRequest(requestId) {
  try {
    await webhookStore.deleteRequest(requestId)
    notificationStore.showToast('Request deleted successfully', 'success')
  } catch (error) {
    notificationStore.showToast('Failed to delete request', 'error')
  }
}

async function clearAllRequests() {
  Swal.fire({
    title: 'Are you sure?',
    text: `Are you sure you want to delete all requests?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    preConfirm: async () => {
      try {
        await webhookStore.clearAllRequests()
      } catch (error) {
        notificationStore.showToast('Failed to clear requests', 'error')
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      notificationStore.showToast('All requests have been deleted', 'success')
    }
  })
}
</script>