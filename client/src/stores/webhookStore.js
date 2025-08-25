import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { webhookApi } from '@/services/api'
import { socketService } from '@/services/socketService'
import { useNotificationStore } from './notificationStore'

export const useWebhookStore = defineStore('webhook', () => {
  // State
  const endpoints = ref([])
  const activeEndpoint = ref(null)
  const requests = ref([])
  const responseConfig = ref(null)
  const isConnected = ref(false)
  const loading = ref(false)

  // Getters
  const activeEndpointData = computed(() => {
    return endpoints.value.find(ep => ep.path === activeEndpoint.value)
  })

  const requestCount = computed(() => {
    return requests.value.length
  })

  const endpointUrl = computed(() => {
    if (!activeEndpoint.value) return ''
    // Use server port for webhook URLs (defined in env vars)
    const serverPort = import.meta.env.VITE_SERVER_PORT || '1995'
    const serverHost = import.meta.env.VITE_SERVER_HOST || window.location.hostname
    const protocol = window.location.protocol
    const serverOrigin = `${protocol}//${serverHost}:${serverPort}`
    return `${serverOrigin}/${activeEndpoint.value}`
  })

  // Actions
  async function initialize() {
    try {
      console.log('Initializing webhook store...')
      await loadEndpoints()
      setupSocketListeners()
      console.log('Webhook store initialized successfully')
    } catch (error) {
      console.error('Failed to initialize webhook store:', error)
    }
  }

  async function loadEndpoints() {
    try {
      loading.value = true
      console.log('Making API call to /api/endpoints...')
      const response = await webhookApi.getEndpoints()
      console.log('API response:', response)
      endpoints.value = response.data
      console.log('Endpoints loaded:', endpoints.value)
    } catch (error) {
      console.error('Failed to load endpoints:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createEndpoint(path) {
    try {
      const response = await webhookApi.createEndpoint({ path })
      await loadEndpoints()
      return response.data
    } catch (error) {
      console.error('Failed to create endpoint:', error)
      throw error
    }
  }

  async function deleteEndpoint(path) {
    try {
      await webhookApi.deleteEndpoint(path)
      
      if (activeEndpoint.value === path) {
        activeEndpoint.value = null
        requests.value = []
        responseConfig.value = null
      }
      
      await loadEndpoints()
    } catch (error) {
      console.error('Failed to delete endpoint:', error)
      throw error
    }
  }

  async function selectEndpoint(path) {
    try {
      activeEndpoint.value = path
      await Promise.all([
        loadEndpointRequests(path),
        loadResponseConfig(path)
      ])
    } catch (error) {
      console.error('Failed to select endpoint:', error)
      throw error
    }
  }

  async function loadEndpointRequests(path) {
    try {
      const response = await webhookApi.getEndpointRequests(path)
      requests.value = response.data
    } catch (error) {
      console.error('Failed to load requests:', error)
      throw error
    }
  }

  async function loadResponseConfig(path) {
    try {
      const response = await webhookApi.getResponseConfig(path)
      responseConfig.value = response.data
    } catch (error) {
      console.error('Failed to load response config:', error)
      throw error
    }
  }

  async function updateResponseConfig(path, config) {
    try {
      const response = await webhookApi.updateResponseConfig(path, config)
      responseConfig.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to update response config:', error)
      throw error
    }
  }

  async function deleteRequest(requestId) {
    try {
      if (!activeEndpoint.value) return
      
      await webhookApi.deleteRequest(activeEndpoint.value, requestId)
      requests.value = requests.value.filter(req => req.id !== requestId)
    } catch (error) {
      console.error('Failed to delete request:', error)
      throw error
    }
  }

  async function clearAllRequests() {
    try {
      if (!activeEndpoint.value) return
      
      await webhookApi.clearEndpointRequests(activeEndpoint.value)
      requests.value = []
    } catch (error) {
      console.error('Failed to clear requests:', error)
      throw error
    }
  }

  function addRequest(request) {
    requests.value.unshift(request)
  }

  function setupSocketListeners() {
    const notificationStore = useNotificationStore()

    socketService.on('connect', () => {
      isConnected.value = true
    })

    socketService.on('disconnect', () => {
      isConnected.value = false
    })

    socketService.on('endpointCreated', ({ path }) => {
      loadEndpoints()
      notificationStore.showToast(`Endpoint /${path} created`, 'success')
      notificationStore.showBrowserNotification('endpoint-created', { path })
    })

    socketService.on('endpointDeleted', ({ path }) => {
      if (activeEndpoint.value === path) {
        activeEndpoint.value = null
        requests.value = []
        responseConfig.value = null
      }
      
      loadEndpoints()
      notificationStore.showToast(`Endpoint /${path} deleted`, 'info')
    })

    socketService.on('requestReceived', ({ path, request }) => {
      const isActiveEndpoint = activeEndpoint.value === path
      
      // Update endpoints list (for request count)
      loadEndpoints()
      
      // Add request to UI if it's the active endpoint
      if (isActiveEndpoint) {
        addRequest(request)
      }
      
      notificationStore.showToast(`New request on /${path}`, 'info')
      notificationStore.showBrowserNotification('request-received', { 
        path, 
        request, 
        isActiveEndpoint 
      })
    })
  }

  return {
    // State
    endpoints,
    activeEndpoint,
    requests,
    responseConfig,
    isConnected,
    loading,
    
    // Getters
    activeEndpointData,
    requestCount,
    endpointUrl,
    
    // Actions
    initialize,
    loadEndpoints,
    createEndpoint,
    deleteEndpoint,
    selectEndpoint,
    loadEndpointRequests,
    loadResponseConfig,
    updateResponseConfig,
    deleteRequest,
    clearAllRequests,
    addRequest
  }
})