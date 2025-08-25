<template>
  <div class="w-80 bg-white border-r border-gray-200 h-screen flex flex-col overflow-hidden">
    <div class="flex-shrink-0 px-4 py-4 border-b border-gray-100">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Endpoints</h2>
          <p class="text-xs text-gray-500 mt-1">{{ webhookStore.endpoints.length }} endpoint{{ webhookStore.endpoints.length !== 1 ? 's' : '' }}</p>
        </div>
        <button 
          class="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md" 
          @click="openCreateEndpointModal"
          title="Create new endpoint"
        >
          <PlusIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto">

      <!-- Loading State -->
      <div v-if="webhookStore.loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Endpoints List -->
      <div v-else-if="webhookStore.endpoints.length > 0" class="py-2">
        <div 
          v-for="endpoint in webhookStore.endpoints" 
          :key="endpoint.id"
          class="endpoint-item group mx-2 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          :class="{ active: webhookStore.activeEndpoint === endpoint.path }"
          @click="selectEndpoint(endpoint.path)"
        >
          <div class="flex items-center justify-between px-3 py-3">
            <div class="flex items-center flex-1 min-w-0">
              <div class="flex-shrink-0 mr-3">
                <div class="w-2 h-2 rounded-full endpoint-indicator bg-gray-300"></div>
              </div>
              <LinkIcon class="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">/{{ endpoint.path }}</div>
                <div class="text-xs text-gray-500 flex items-center mt-1">
                  <div class="flex items-center">
                    <div class="w-1 h-1 bg-gray-400 rounded-full mr-1"></div>
                    {{ endpoint.requestCount || 0 }} {{ (endpoint.requestCount || 0) === 1 ? 'request' : 'requests' }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button 
                class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200" 
                @click.stop="copyEndpointUrl(endpoint.path)"
                :title="'Copy URL for /' + endpoint.path"
              >
                <ClipboardDocumentIcon class="h-3.5 w-3.5" />
              </button>
              <button 
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200" 
                @click.stop="confirmDeleteEndpoint(endpoint.path)"
                :title="'Delete /' + endpoint.path"
              >
                <TrashIcon class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 px-4">
        <PlusCircleIcon class="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500 font-medium">No endpoints created</p>
        <p class="text-gray-400 text-sm mt-2">Click the + button to create your first endpoint</p>
      </div>
    </div>
    
    <!-- Create Endpoint Modal -->
    <CreateEndpointModal 
      :is-open="isCreateModalOpen" 
      @close="closeCreateEndpointModal" 
    />
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import { useWebhookStore } from '@/stores/webhookStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useRouter } from 'vue-router'
import {
  PlusIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  PlusCircleIcon
} from '@heroicons/vue/24/outline'
import CreateEndpointModal from './CreateEndpointModal.vue'
import Swal from 'sweetalert2'


const webhookStore = useWebhookStore()
const notificationStore = useNotificationStore()
const router = useRouter()

onMounted(() => {
  console.log('EndpointSidebar mounted')
  console.log('Endpoints:', webhookStore.endpoints)
  console.log('Loading:', webhookStore.loading)
})

watch(() => webhookStore.endpoints, (newEndpoints) => {
  console.log('Endpoints changed:', newEndpoints)
}, { immediate: true, deep: true })

watch(() => webhookStore.loading, (newLoading) => {
  console.log('Loading state changed:', newLoading)
}, { immediate: true })

const isCreateModalOpen = ref(false)

const openCreateEndpointModal = () => {
  isCreateModalOpen.value = true
}

const closeCreateEndpointModal = () => {
  isCreateModalOpen.value = false
}

async function selectEndpoint(path) {
  try {
    await webhookStore.selectEndpoint(path)
    // Update URL without full page reload
    router.push(`/endpoint/${path}`)
  } catch (error) {
    notificationStore.showToast('Failed to select endpoint', 'error')
  }
}

function copyEndpointUrl(path) {
  // Use server port for webhook URLs (defined in env vars)
  const serverPort = import.meta.env.VITE_SERVER_PORT || '1995'
  const serverHost = import.meta.env.VITE_SERVER_HOST || window.location.hostname
  const protocol = window.location.protocol
  const serverOrigin = `${protocol}//${serverHost}:${serverPort}`
  const url = `${serverOrigin}/${path}`
  
  navigator.clipboard.writeText(url)
    .then(() => {
      notificationStore.showToast('URL copied to clipboard', 'success')
    })
    .catch(() => {
      notificationStore.showToast('Failed to copy URL', 'error')
    })
}

async function confirmDeleteEndpoint(path) {
  Swal.fire({
    title: 'Are you sure?',
    text: `This will delete the endpoint /${path} and all its requests.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    preConfirm: async () => {
      try {
        await webhookStore.deleteEndpoint(path)

        if (webhookStore.activeEndpoint === null) {
          router.push('/')
        }
      } catch (error) {
        notificationStore.showToast('Failed to delete endpoint', 'error')
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      notificationStore.showToast(`Endpoint /${path} deleted successfully`, 'success')
    }
  })
}
</script>