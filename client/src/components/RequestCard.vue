<template>
  <div class="request-card bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="p-4">
      <!-- Request Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3" :class="methodBadgeColor">
            {{ request.method }}
          </span>
          <span class="text-sm text-gray-500">
            {{ formattedTimestamp }}
          </span>
        </div>
        <!-- Delete Button -->
        <button 
          @click="$emit('delete', request.id)" 
          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
          title="Delete request"
        >
          <TrashIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- Tabs Navigation -->
      <div class="border-b border-gray-200 mb-4">
        <nav class="flex -mb-px justify-between">
          <!-- Left side tabs (Request data) -->
          <div class="flex">
            <button 
              :class="activeTab === 'body' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="px-4 py-2 border-b-2 font-medium text-sm transition duration-200 flex items-center space-x-2 mr-6"
              @click="setActiveTab('body')"
            >
              <DocumentTextIcon class="h-4 w-4" />
              <span>Body</span>
            </button>
            <button 
              :class="activeTab === 'headers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="px-4 py-2 border-b-2 font-medium text-sm transition duration-200 flex items-center space-x-2 mr-6"
              @click="setActiveTab('headers')"
            >
              <InformationCircleIcon class="h-4 w-4" />
              <span>Headers</span>
            </button>
            <button 
              v-if="hasQueryParams"
              :class="activeTab === 'params' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="px-4 py-2 border-b-2 font-medium text-sm transition duration-200 flex items-center space-x-2"
              @click="setActiveTab('params')"
            >
              <QuestionMarkCircleIcon class="h-4 w-4" />
              <span>Query Params</span>
            </button>
          </div>
          
          <!-- Right side tab (Response) -->
          <div class="flex">
            <button 
              :class="activeTab === 'response' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="px-4 py-2 border-b-2 font-medium text-sm transition duration-200 flex items-center space-x-2"
              @click="setActiveTab('response')"
            >
              <ArrowUturnLeftIcon class="h-4 w-4" />
              <span>Response</span>
            </button>
          </div>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Body Tab -->
        <div v-if="activeTab === 'body'">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-700">Request Body</h4>
            <button 
              @click="copyCurrentContent('body')"
              class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
              title="Copy request body"
            >
              <ClipboardDocumentIcon class="h-4 w-4" />
            </button>
          </div>
          
          <!-- Sub-tabs for Body -->
          <div class="border-b border-gray-100 mb-3">
            <nav class="flex -mb-px">
              <button 
                :class="bodySubTab === 'pretty' ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 mr-4 rounded-t"
                @click="bodySubTab = 'pretty'"
              >
                Pretty
              </button>
              <button 
                :class="bodySubTab === 'text' ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 mr-4 rounded-t"
                @click="bodySubTab = 'text'"
              >
                Text
              </button>
              <button 
                :class="bodySubTab === 'html' ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 rounded-t"
                @click="bodySubTab = 'html'"
              >
                HTML
              </button>
            </nav>
          </div>
          
          <!-- Sub-tab Content for Body -->
          <div v-if="bodySubTab === 'pretty'" class="json-container" ref="bodyContainer"></div>
          <div v-if="bodySubTab === 'text'" class="text-container">
            <pre class="text-sm text-gray-800 whitespace-pre-wrap break-words p-4 bg-gray-50 rounded border font-mono">{{ bodyContent }}</pre>
          </div>
          <div v-if="bodySubTab === 'html'" class="html-container">
            <div v-if="isHtmlContent" v-html="bodyHtmlContent"></div>
            <div v-else v-html="bodyHtmlContent"></div>
          </div>
        </div>

        <!-- Headers Tab -->
        <div v-if="activeTab === 'headers'">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-700">Headers</h4>
            <button 
              @click="copyCurrentContent('headers')"
              class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
              title="Copy headers"
            >
              <ClipboardDocumentIcon class="h-4 w-4" />
            </button>
          </div>
          
          <!-- Sub-tabs for Headers -->
          <div class="border-b border-gray-100 mb-3">
            <nav class="flex -mb-px">
              <button 
                :class="headersSubTab === 'pretty' ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 mr-4 rounded-t"
                @click="headersSubTab = 'pretty'"
              >
                Pretty
              </button>
              <button 
                :class="headersSubTab === 'text' ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 mr-4 rounded-t"
                @click="headersSubTab = 'text'"
              >
                Text
              </button>
              <button 
                :class="headersSubTab === 'html' ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 rounded-t"
                @click="headersSubTab = 'html'"
              >
                HTML
              </button>
            </nav>
          </div>
          
          <!-- Sub-tab Content for Headers -->
          <div v-if="headersSubTab === 'pretty'" class="json-container" ref="headersContainer"></div>
          <div v-if="headersSubTab === 'text'" class="text-container">
            <pre class="text-sm text-gray-800 whitespace-pre-wrap break-words p-4 bg-gray-50 rounded border font-mono">{{ formattedHeaders }}</pre>
          </div>
          <div v-if="headersSubTab === 'html'" class="html-container" v-html="headersHtmlContent"></div>
        </div>

        <!-- Query Parameters Tab -->
        <div v-if="activeTab === 'params' && hasQueryParams">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-700">Query Parameters</h4>
            <button 
              @click="copyCurrentContent('params')"
              class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
              title="Copy query parameters"
            >
              <ClipboardDocumentIcon class="h-4 w-4" />
            </button>
          </div>
          
          <!-- Sub-tabs for Query Parameters -->
          <div class="border-b border-gray-100 mb-3">
            <nav class="flex -mb-px">
              <button 
                :class="paramsSubTab === 'pretty' ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 mr-4 rounded-t"
                @click="paramsSubTab = 'pretty'"
              >
                Pretty
              </button>
              <button 
                :class="paramsSubTab === 'text' ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 mr-4 rounded-t"
                @click="paramsSubTab = 'text'"
              >
                Text
              </button>
              <button 
                :class="paramsSubTab === 'html' ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 rounded-t"
                @click="paramsSubTab = 'html'"
              >
                HTML
              </button>
            </nav>
          </div>
          
          <!-- Sub-tab Content for Query Parameters -->
          <div v-if="paramsSubTab === 'pretty'" class="json-container" ref="paramsContainer"></div>
          <div v-if="paramsSubTab === 'text'" class="text-container">
            <pre class="text-sm text-gray-800 whitespace-pre-wrap break-words p-4 bg-gray-50 rounded border font-mono">{{ formattedQueryParams }}</pre>
          </div>
          <div v-if="paramsSubTab === 'html'" class="html-container" v-html="paramsHtmlContent"></div>
        </div>

        <!-- Response Tab -->
        <div v-if="activeTab === 'response'">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-700">Response Body</h4>
            <button 
              @click="copyCurrentContent('response')"
              class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200"
              title="Copy response body"
            >
              <ClipboardDocumentIcon class="h-4 w-4" />
            </button>
          </div>
          
          <!-- Sub-tabs for Response -->
          <div class="border-b border-gray-100 mb-3" v-if="responseDetails">
            <nav class="flex -mb-px">
              <button 
                :class="responseSubTab === 'pretty' ? 'border-green-400 text-green-600 bg-green-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 mr-4 rounded-t"
                @click="responseSubTab = 'pretty'"
              >
                Pretty
              </button>
              <button 
                :class="responseSubTab === 'text' ? 'border-green-400 text-green-600 bg-green-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 mr-4 rounded-t"
                @click="responseSubTab = 'text'"
              >
                Text
              </button>
              <button 
                :class="responseSubTab === 'html' ? 'border-green-400 text-green-600 bg-green-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 border-b-2 text-xs font-medium transition duration-200 rounded-t"
                @click="responseSubTab = 'html'"
              >
                HTML
              </button>
            </nav>
          </div>
          
          <!-- Sub-tab Content for Response -->
          <div v-if="responseSubTab === 'pretty'" class="json-container" ref="responseContainer"></div>
          <div v-if="responseSubTab === 'text'" class="text-container">
            <pre class="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">{{ responseBodyContent }}</pre>
          </div>
          <div v-if="responseSubTab === 'html'" class="html-container" v-html="responseHtmlContent"></div>

          <!-- No Response Data -->
          <div v-if="!responseDetails" class="text-center py-8">
            <div class="text-gray-400 mb-2">
              <ArrowUturnLeftIcon class="h-8 w-8 mx-auto" />
            </div>
            <p class="text-sm text-gray-500">No response body available</p>
            <p class="text-xs text-gray-400 mt-1">Response body will appear here after the request is processed</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { 
  TrashIcon, 
  InformationCircleIcon, 
  QuestionMarkCircleIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  ArrowUturnLeftIcon 
} from '@heroicons/vue/24/outline'
import { useNotificationStore } from '@/stores/notificationStore'
import JSONFormatter from 'json-formatter-js'

// Props
const props = defineProps({
  request: {
    type: Object,
    required: true
  }
})

// Emits
defineEmits(['delete'])

// Store
const notificationStore = useNotificationStore()

// State
const activeTab = ref('body')

// Sub-tab states - will be set dynamically based on content type
const bodySubTab = ref('text') // default to text
const headersSubTab = ref('pretty') 
const paramsSubTab = ref('pretty')
const responseSubTab = ref('pretty') // default to pretty

// Template refs for JSON containers
const bodyContainer = ref(null)
const headersContainer = ref(null)
const paramsContainer = ref(null)
const responseContainer = ref(null)

// Computed properties
const formattedTimestamp = computed(() => {
  return new Date(props.request.timestamp).toLocaleString()
})

const methodBadgeColor = computed(() => {
  const colors = {
    'GET': 'bg-green-100 text-green-800',
    'POST': 'bg-blue-100 text-blue-800',
    'PUT': 'bg-yellow-100 text-yellow-800',
    'DELETE': 'bg-red-100 text-red-800',
    'PATCH': 'bg-purple-100 text-purple-800'
  }
  return colors[props.request.method] || 'bg-gray-100 text-gray-800'
})

const bodyContent = computed(() => {
  if (!props.request.body) {
    return 'No body in request'
  }
  
  try {
    return JSON.stringify(props.request.body, null, 2)
  } catch (e) {
    return String(props.request.body)
  }
})

const formattedHeaders = computed(() => {
  try {
    return JSON.stringify(props.request.headers, null, 2)
  } catch (e) {
    return String(props.request.headers)
  }
})

const hasQueryParams = computed(() => {
  return props.request.queryParams && 
         Object.keys(props.request.queryParams).length > 0
})

const formattedQueryParams = computed(() => {
  try {
    return JSON.stringify(props.request.queryParams, null, 2)
  } catch (e) {
    return String(props.request.queryParams)
  }
})

// Content type detection
const contentType = computed(() => {
  const headers = props.request.headers || {}
  const ctHeader = Object.keys(headers).find(key => 
    key.toLowerCase() === 'content-type'
  )
  return ctHeader ? headers[ctHeader].toLowerCase() : ''
})

const isHtmlContent = computed(() => {
  return contentType.value.includes('text/html') || 
         contentType.value.includes('application/xhtml')
})

const isJsonContent = computed(() => {
  return contentType.value.includes('application/json') || 
         contentType.value.includes('text/json')
})

// HTML content computed properties
const bodyHtmlContent = computed(() => {
  if (isHtmlContent.value) {
    return formatBodyAsHtmlFrame(props.request.body)
  }
  return formatAsHtml(props.request.body, 'No body content')
})

const headersHtmlContent = computed(() => {
  return formatAsHtml(props.request.headers, 'No headers')
})

const paramsHtmlContent = computed(() => {
  return formatAsHtml(props.request.queryParams, 'No query parameters')
})

// Response details computed properties
const responseType = computed(() => {
  return props.request.responseType || 'custom'
})

const responseDetails = computed(() => {
  return props.request.responseDetails || null
})

// Response content computed properties
const responseBodyContent = computed(() => {
  if (!responseDetails.value) {
    return 'No response details available'
  }
  
  // For jumper responses, use targetResponseBody
  if (responseType.value === 'jumper' && responseDetails.value.targetResponseBody) {
    try {
      const parsedBody = JSON.parse(responseDetails.value.targetResponseBody)
      return JSON.stringify(parsedBody, null, 2)
    } catch (e) {
      return responseDetails.value.targetResponseBody
    }
  }
  
  // For custom responses, use the body field
  if (responseType.value === 'custom' && responseDetails.value.body) {
    try {
      const parsedBody = JSON.parse(responseDetails.value.body)
      return JSON.stringify(parsedBody, null, 2)
    } catch (e) {
      return responseDetails.value.body
    }
  }
  
  return 'No response body available'
})

const responseHtmlContent = computed(() => {
  let bodyData = null
  
  if (responseType.value === 'jumper' && responseDetails.value?.targetResponseBody) {
    try {
      bodyData = JSON.parse(responseDetails.value.targetResponseBody)
    } catch (e) {
      bodyData = responseDetails.value.targetResponseBody
    }
  } else if (responseType.value === 'custom' && responseDetails.value?.body) {
    try {
      bodyData = JSON.parse(responseDetails.value.body)
    } catch (e) {
      bodyData = responseDetails.value.body
    }
  }
  
  return formatAsHtml(bodyData, 'No response body available')
})

// Methods
function setActiveTab(tab) {
  activeTab.value = tab
  nextTick(() => {
    renderJSON()
  })
}

function renderJSON() {
  // Only render if we're on pretty sub-tab
  if (activeTab.value === 'body' && bodySubTab.value === 'pretty') {
    renderJSONInContainer(props.request.body || 'No body in request', bodyContainer.value)
  } else if (activeTab.value === 'headers' && headersSubTab.value === 'pretty') {
    renderJSONInContainer(props.request.headers, headersContainer.value)
  } else if (activeTab.value === 'params' && paramsSubTab.value === 'pretty' && hasQueryParams.value) {
    renderJSONInContainer(props.request.queryParams, paramsContainer.value)
  } else if (activeTab.value === 'response' && responseSubTab.value === 'pretty' && responseDetails.value) {
    let bodyData = null
    if (responseType.value === 'jumper' && responseDetails.value.targetResponseBody) {
      try {
        bodyData = JSON.parse(responseDetails.value.targetResponseBody)
      } catch (e) {
        bodyData = responseDetails.value.targetResponseBody
      }
    } else if (responseType.value === 'custom' && responseDetails.value.body) {
      try {
        bodyData = JSON.parse(responseDetails.value.body)
      } catch (e) {
        bodyData = responseDetails.value.body
      }
    }
    renderJSONInContainer(bodyData || 'No response body', responseContainer.value)
  }
}

function renderJSONInContainer(data, container) {
  if (!container) return
  
  // Clear previous content
  container.innerHTML = ''
  
  try {
    if (typeof data === 'string' && data === 'No body in request') {
      container.innerHTML = `<div class="text-gray-500 italic p-4 text-center">${data}</div>`
      return
    }

    const formatter = new JSONFormatter(data, {
      hoverPreviewEnabled: true,
      hoverPreviewArrayCount: 100,
      hoverPreviewFieldCount: 5,
      animateOpen: true,
      animateClose: true,
      theme: 'light',
    })
    formatter.openAtDepth(5);

    container.appendChild(formatter.render())
  } catch (error) {
    container.innerHTML = `<pre class="text-sm text-gray-800 whitespace-pre-wrap break-words p-4 bg-gray-50 rounded border">${String(data)}</pre>`
  }
}

function formatBodyAsHtmlFrame(data) {
  if (!data) {
    return `<div class="text-gray-500 italic p-4 text-center">No HTML content</div>`
  }
  
  let htmlContent = ''
  if (typeof data === 'string') {
    htmlContent = data
  } else if (typeof data === 'object') {
    htmlContent = JSON.stringify(data, null, 2)
  } else {
    htmlContent = String(data)
  }
  
  // Create a safe iframe with the HTML content
  const encodedHtml = encodeURIComponent(htmlContent)
  const iframeSrc = `data:text/html;charset=utf-8,${encodedHtml}`
  
  return `<div class="p-4 bg-gray-50 rounded border max-h-64 overflow-hidden">
            <iframe 
              src="${iframeSrc}" 
              class="w-full h-56 border border-gray-300 rounded bg-white" 
              sandbox="allow-scripts allow-same-origin"
              frameborder="0">
            </iframe>
          </div>`
}

function formatAsHtml(data, fallback) {
  if (!data) {
    return `<div class="text-gray-500 italic p-4 text-center">${fallback}</div>`
  }
  
  try {
    const jsonString = JSON.stringify(data, null, 2)
    return `<div class="p-4 bg-gray-50 rounded border max-h-64 overflow-y-auto">
              <table class="min-w-full text-sm">
                <tbody>
                  ${Object.entries(data).map(([key, value]) => 
                    `<tr class="border-b border-gray-100">
                       <td class="py-2 pr-4 font-medium text-gray-700 align-top">${key}:</td>
                       <td class="py-2 text-gray-600 break-words">${
                         typeof value === 'object' ? 
                         `<pre class="whitespace-pre-wrap font-mono text-xs">${JSON.stringify(value, null, 2)}</pre>` : 
                         String(value)
                       }</td>
                     </tr>`
                  ).join('')}
                </tbody>
              </table>
            </div>`
  } catch (error) {
    return `<div class="p-4 bg-gray-50 rounded border">
              <pre class="text-sm text-gray-800 whitespace-pre-wrap break-words">${String(data)}</pre>
            </div>`
  }
}

function setDefaultBodySubTab() {
  if (isHtmlContent.value) {
    bodySubTab.value = 'html'
  } else if (isJsonContent.value) {
    bodySubTab.value = 'pretty'
  } else {
    bodySubTab.value = 'text'
  }
}

function copyCurrentContent(section) {
  let content = ''
  let contentType = ''
  
  if (section === 'body') {
    contentType = 'Request body'
    if (bodySubTab.value === 'pretty' || bodySubTab.value === 'text') {
      content = bodyContent.value
    } else {
      content = JSON.stringify(props.request.body, null, 2)
    }
  } else if (section === 'headers') {
    contentType = 'Headers'
    if (headersSubTab.value === 'pretty' || headersSubTab.value === 'text') {
      content = formattedHeaders.value
    } else {
      content = JSON.stringify(props.request.headers, null, 2)
    }
  } else if (section === 'params') {
    contentType = 'Query parameters'
    if (paramsSubTab.value === 'pretty' || paramsSubTab.value === 'text') {
      content = formattedQueryParams.value
    } else {
      content = JSON.stringify(props.request.queryParams, null, 2)
    }
  } else if (section === 'response') {
    contentType = 'Response body'
    content = responseBodyContent.value
  }

  navigator.clipboard.writeText(content)
    .then(() => {
      notificationStore.showToast(`${contentType} copied to clipboard`, 'success')
    })
    .catch(() => {
      notificationStore.showToast(`Failed to copy ${contentType.toLowerCase()}`, 'error')
    })
}

function copyCurrentResponseContent() {
  let content = ''
  
  if (responseType.value === 'custom') {
    const details = responseDetails.value
    content = `Custom Response Details:
Status Code: ${details?.statusCode || 'N/A'}
Content-Type: ${details?.contentType || 'N/A'}
Body: ${details?.body || 'No body'}`
  } else if (responseType.value === 'jumper') {
    const details = responseDetails.value
    content = `Jumper (Proxy) Response Details:
Target URL: ${details?.targetUrl || 'N/A'}
Proxy Status: ${details?.proxySuccess ? 'Success' : 'Failed'}
${details?.proxySuccess ? `Target Status: ${details?.targetStatusCode || 'N/A'}
Target Content-Type: ${details?.targetContentType || 'N/A'}
Target Response Body: ${details?.targetResponseBody || 'No body'}` : `Error: ${details?.proxyError || 'Unknown error'}`}`
  } else {
    content = 'No response details available'
  }

  navigator.clipboard.writeText(content)
    .then(() => {
      notificationStore.showToast('Response details copied to clipboard', 'success')
    })
    .catch(() => {
      notificationStore.showToast('Failed to copy response details', 'error')
    })
}

// Lifecycle
onMounted(() => {
  setDefaultBodySubTab()
  renderJSON()
})

watch(activeTab, () => {
  nextTick(() => {
    renderJSON()
  })
})

// Watch sub-tabs for re-rendering
watch(bodySubTab, () => {
  if (activeTab.value === 'body' && bodySubTab.value === 'pretty') {
    nextTick(() => {
      renderJSONInContainer(props.request.body || 'No body in request', bodyContainer.value)
    })
  }
})

watch(headersSubTab, () => {
  if (activeTab.value === 'headers' && headersSubTab.value === 'pretty') {
    nextTick(() => {
      renderJSONInContainer(props.request.headers, headersContainer.value)
    })
  }
})

watch(paramsSubTab, () => {
  if (activeTab.value === 'params' && paramsSubTab.value === 'pretty' && hasQueryParams.value) {
    nextTick(() => {
      renderJSONInContainer(props.request.queryParams, paramsContainer.value)
    })
  }
})

watch(responseSubTab, () => {
  if (activeTab.value === 'response' && responseSubTab.value === 'pretty' && responseDetails.value) {
    nextTick(() => {
      let bodyData = null
      if (responseType.value === 'jumper' && responseDetails.value.targetResponseBody) {
        try {
          bodyData = JSON.parse(responseDetails.value.targetResponseBody)
        } catch (e) {
          bodyData = responseDetails.value.targetResponseBody
        }
      } else if (responseType.value === 'custom' && responseDetails.value.body) {
        try {
          bodyData = JSON.parse(responseDetails.value.body)
        } catch (e) {
          bodyData = responseDetails.value.body
        }
      }
      renderJSONInContainer(bodyData || 'No response body', responseContainer.value)
    })
  }
})

// Watch for changes in request props to reset default tab
watch(() => props.request, () => {
  setDefaultBodySubTab()
  nextTick(() => {
    renderJSON()
  })
}, { deep: true })
</script>

<style scoped>
.json-container {
  @apply bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto p-2;
}

.text-container {
  @apply max-h-64 overflow-y-auto;
}

.html-container {
  @apply max-h-64 overflow-y-auto;
}

/* JSON Formatter custom styles */
:deep(.json-formatter-row) {
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

:deep(.json-formatter-key) {
  color: #d73a49;
  font-weight: 600;
}

:deep(.json-formatter-string) {
  color: #032f62;
}

:deep(.json-formatter-number) {
  color: #005cc5;
}

:deep(.json-formatter-boolean) {
  color: #d73a49;
}

:deep(.json-formatter-null) {
  color: #6f42c1;
}

:deep(.json-formatter-bracket) {
  color: #24292e;
}

:deep(.json-formatter-row .json-formatter-toggler-link) {
  color: #586069;
}

:deep(.json-formatter-row .json-formatter-toggler-link:hover) {
  color: #0366d6;
}

:deep(.json-formatter-row > a > .json-formatter-preview-text) {
  color: #6a737d;
  font-style: italic;
}

:deep(.json-formatter-row.json-formatter-constructor-name) {
  color: #6f42c1;
}
</style>