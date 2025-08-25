<template>
  <SimpleModal :is-open="isOpen" @close="closeModal">
    <div class="sm:flex sm:items-start">
      <div class="w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Create New Endpoint</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        
        <form @submit.prevent="createEndpoint">
          <div class="mb-4">
            <label for="endpointPath" class="block text-sm font-medium text-gray-700 mb-2">
              Endpoint Path
            </label>
            <div class="flex">
              <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                /
              </span>
              <input 
                ref="pathInput"
                type="text" 
                class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                id="endpointPath" 
                v-model="endpointPath"
                placeholder="my-endpoint"
                required
                :disabled="loading"
              >
            </div>
            <p class="mt-2 text-sm text-gray-500">
              Example: "payments" will create the endpoint at /payments
            </p>
          </div>
        </form>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            type="button" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click="closeModal" 
            :disabled="loading"
          >
            Cancel
          </button>
          <button 
            type="button" 
            class="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click="createEndpoint"
            :disabled="loading || !endpointPath.trim()"
          >
            <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Create
          </button>
        </div>
      </div>
    </div>
  </SimpleModal>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useWebhookStore } from '@/stores/webhookStore'
import { useNotificationStore } from '@/stores/notificationStore'
import SimpleModal from './SimpleModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const webhookStore = useWebhookStore()
const notificationStore = useNotificationStore()
const pathInput = ref(null)

const endpointPath = ref('')
const loading = ref(false)

const closeModal = () => {
  endpointPath.value = ''
  emit('close')
}

async function createEndpoint() {
  if (!endpointPath.value.trim()) {
    notificationStore.showToast('Endpoint path cannot be empty', 'error')
    return
  }

  try {
    loading.value = true
    const endpoint = await webhookStore.createEndpoint(endpointPath.value.trim())
    
    notificationStore.showToast(`Endpoint /${endpoint.path} created successfully`, 'success')
    closeModal()
  } catch (error) {
    notificationStore.showToast(error.message, 'error')
  } finally {
    loading.value = false
  }
}

// Focus input when modal opens
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      if (pathInput.value) {
        pathInput.value.focus()
      }
    })
  }
})
</script>