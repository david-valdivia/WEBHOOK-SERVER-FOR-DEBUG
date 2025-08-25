<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Response Configuration</h2>
      <p class="text-sm text-gray-600 mt-2">Configure how your webhook endpoint responds to incoming requests</p>
    </div>

    <!-- Response Type Selector -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">Response Type</label>
      <div class="grid grid-cols-2 gap-4">
        <div 
          @click="config.responseType = 'custom'"
          :class="config.responseType === 'custom' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'"
          class="border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200"
        >
          <div class="flex items-center">
            <input 
              type="radio" 
              name="responseType" 
              value="custom"
              v-model="config.responseType"
              class="text-blue-600 focus:ring-blue-500"
            >
            <div class="ml-3">
              <h3 class="text-sm font-medium text-gray-900">Custom Response</h3>
              <p class="text-xs text-gray-500">Return a custom static response</p>
            </div>
          </div>
        </div>
        
        <div 
          @click="config.responseType = 'jumper'"
          :class="config.responseType === 'jumper' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'"
          class="border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200"
        >
          <div class="flex items-center">
            <input 
              type="radio" 
              name="responseType" 
              value="jumper"
              v-model="config.responseType"
              class="text-blue-600 focus:ring-blue-500"
            >
            <div class="ml-3">
              <h3 class="text-sm font-medium text-gray-900">Jumper (Proxy)</h3>
              <p class="text-xs text-gray-500">Forward request and return target response</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="saveConfiguration" class="space-y-6">
      <!-- Jumper Configuration -->
      <div v-if="config.responseType === 'jumper'" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Jumper Configuration</h3>
        <div>
          <label for="targetUrl" class="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
          <input 
            type="url" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            id="targetUrl" 
            v-model="config.targetUrl"
            placeholder="https://api.example.com/webhook"
            required
            :disabled="loading"
          >
          <p class="text-sm text-gray-500 mt-2">The request will be forwarded to this URL with identical headers, body, and query parameters</p>
        </div>
        
        <div class="mt-4">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="config.preserveHeaders"
              class="text-blue-600 focus:ring-blue-500 rounded"
              :disabled="loading"
            >
            <span class="ml-2 text-sm text-gray-700">Preserve original headers</span>
          </label>
          <p class="text-xs text-gray-500 ml-6 mt-1">Forward all headers from the original request to the target URL</p>
        </div>
      </div>

      <!-- Custom Response Configuration -->
      <div v-if="config.responseType === 'custom'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="statusCode" class="block text-sm font-medium text-gray-700 mb-2">HTTP Status Code</label>
            <input 
              type="number" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              id="statusCode" 
              v-model.number="config.statusCode"
              min="100" 
              max="599" 
              required
              :disabled="loading"
            >
          </div>
          <div>
            <label for="contentType" class="block text-sm font-medium text-gray-700 mb-2">Content-Type</label>
            <select 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              id="contentType" 
              v-model="config.contentType"
              @change="onContentTypeChange"
              :disabled="loading"
            >
              <option value="application/json">application/json</option>
              <option value="text/plain">text/plain</option>
              <option value="text/html">text/html</option>
              <option value="application/xml">application/xml</option>
            </select>
          </div>
        </div>

        <div>
          <label for="responseDelay" class="block text-sm font-medium text-gray-700 mb-2">Response Delay (ms)</label>
          <input 
            type="number" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            id="responseDelay" 
            v-model.number="config.delay"
            min="0" 
            max="10000"
            :disabled="loading"
          >
          <p class="text-sm text-gray-500 mt-2">Simulate network latency (maximum 10 seconds)</p>
        </div>

        <div>
          <label for="responseBody" class="block text-sm font-medium text-gray-700 mb-2">Response Body</label>
          <textarea 
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            :class="bodyValidationError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'"
            id="responseBody" 
            v-model="config.body"
            rows="8"
            :disabled="loading"
          ></textarea>
          <div v-if="bodyValidationError" class="text-red-600 text-sm mt-2">
            {{ bodyValidationError }}
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button 
          type="submit" 
          class="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          :disabled="loading || !canSave"
        >
          <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <CloudArrowUpIcon class="h-5 w-5 mr-2" />
          Save Configuration
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { CloudArrowUpIcon } from '@heroicons/vue/24/outline'
import { useWebhookStore } from '@/stores/webhookStore'
import { useNotificationStore } from '@/stores/notificationStore'

const webhookStore = useWebhookStore()
const notificationStore = useNotificationStore()

const loading = ref(false)
const config = ref({
  responseType: 'custom',
  statusCode: 200,
  contentType: 'application/json',
  body: JSON.stringify({ message: 'OK' }, null, 2),
  delay: 0,
  targetUrl: '',
  preserveHeaders: true
})

const bodyValidationError = ref('')

const canSave = computed(() => {
  const isValidCustom = config.value.responseType === 'custom' &&
                       config.value.statusCode >= 100 && 
                       config.value.statusCode <= 599 &&
                       !bodyValidationError.value

  const isValidJumper = config.value.responseType === 'jumper' &&
                       config.value.targetUrl &&
                       config.value.targetUrl.startsWith('http')

  return webhookStore.activeEndpoint && (isValidCustom || isValidJumper)
})

// Watch for response config changes from store
watch(() => webhookStore.responseConfig, (newConfig) => {
  if (newConfig) {
    config.value = {
      responseType: newConfig.responseType || 'custom',
      statusCode: newConfig.statusCode || 200,
      contentType: newConfig.contentType || 'application/json',
      body: formatBody(newConfig.body, newConfig.contentType),
      delay: newConfig.delay || 0,
      targetUrl: newConfig.targetUrl || '',
      preserveHeaders: newConfig.preserveHeaders !== undefined ? newConfig.preserveHeaders : true
    }
  }
}, { immediate: true })

// Watch for body changes to validate JSON
watch(() => config.value.body, () => {
  validateBody()
})

// Watch for content type changes to validate body
watch(() => config.value.contentType, () => {
  validateBody()
})

function formatBody(body, contentType) {
  if (contentType === 'application/json' && body) {
    try {
      const parsed = typeof body === 'string' ? JSON.parse(body) : body
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return body || ''
    }
  }
  return body || ''
}

function validateBody() {
  bodyValidationError.value = ''
  
  if (config.value.contentType === 'application/json' && config.value.body) {
    try {
      JSON.parse(config.value.body)
    } catch (e) {
      bodyValidationError.value = 'Invalid JSON format'
    }
  }
}

function onContentTypeChange() {
  // If changing to JSON, try to format existing content
  if (config.value.contentType === 'application/json') {
    try {
      const content = config.value.body.trim()
      if (content) {
        const parsed = JSON.parse(content)
        config.value.body = JSON.stringify(parsed, null, 2)
      }
    } catch (e) {
      // If it's not valid JSON, leave as is
    }
  }
}

async function saveConfiguration() {
  if (!webhookStore.activeEndpoint) {
    notificationStore.showToast('No endpoint selected', 'error')
    return
  }

  if (config.value.responseType === 'custom' && bodyValidationError.value) {
    notificationStore.showToast('Please fix validation errors', 'error')
    return
  }

  if (config.value.responseType === 'jumper' && (!config.value.targetUrl || !config.value.targetUrl.startsWith('http'))) {
    notificationStore.showToast('Please enter a valid target URL', 'error')
    return
  }

  try {
    loading.value = true
    
    const configData = {
      response_type: config.value.responseType,
      status_code: config.value.statusCode,
      content_type: config.value.contentType,
      body: config.value.body,
      delay: config.value.delay,
      target_url: config.value.targetUrl,
      preserve_headers: config.value.preserveHeaders
    }

    await webhookStore.updateResponseConfig(webhookStore.activeEndpoint, configData)
    notificationStore.showToast('Response configuration saved successfully', 'success')
  } catch (error) {
    notificationStore.showToast('Failed to save configuration', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  validateBody()
})
</script>