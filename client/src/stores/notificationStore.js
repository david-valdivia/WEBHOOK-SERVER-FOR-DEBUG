import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BrowserNotificationService } from '@/services/browserNotificationService'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const toastMessage = ref('')
  const toastType = ref('info')
  const toastVisible = ref(false)
  const browserNotificationService = ref(null)
  const notificationPermission = ref('default')
  const notificationEnabled = ref(false)

  // Getters
  const notificationStatus = computed(() => {
    if (!browserNotificationService.value) return 'unsupported'
    
    switch (notificationPermission.value) {
      case 'granted':
        return notificationEnabled.value ? 'enabled' : 'available'
      case 'denied':
        return 'blocked'
      default:
        return 'not-requested'
    }
  })

  const notificationStatusText = computed(() => {
    switch (notificationStatus.value) {
      case 'enabled': return 'Enabled'
      case 'available': return 'Available'
      case 'blocked': return 'Blocked'
      case 'not-requested': return 'Not requested'
      case 'unsupported': return 'Not supported'
      default: return 'Unknown'
    }
  })

  const notificationStatusClass = computed(() => {
    switch (notificationStatus.value) {
      case 'enabled': return 'text-success'
      case 'available': return 'text-warning'
      case 'blocked': return 'text-danger'
      default: return 'text-muted'
    }
  })

  // Actions
  function initialize() {
    try {
      if (typeof BrowserNotificationService !== 'undefined') {
        browserNotificationService.value = new BrowserNotificationService()
        updateNotificationState()
        
        // Handle custom endpoint focus events
        window.addEventListener('focusEndpoint', (event) => {
          // Emit custom event for router navigation
          const customEvent = new CustomEvent('navigate-to-endpoint', {
            detail: { path: event.detail.path }
          })
          window.dispatchEvent(customEvent)
        })
      }
    } catch (error) {
      console.error('Failed to initialize notification service:', error)
    }
  }

  async function requestNotificationPermission() {
    if (!browserNotificationService.value) return false
    
    try {
      const granted = await browserNotificationService.value.requestPermission()
      updateNotificationState()
      return granted
    } catch (error) {
      showToast(error.message, 'error')
      return false
    }
  }

  function toggleNotifications() {
    if (!browserNotificationService.value) return
    
    if (notificationEnabled.value) {
      browserNotificationService.value.disable()
      showToast('Browser notifications disabled', 'warning')
    } else {
      if (notificationPermission.value === 'granted') {
        browserNotificationService.value.enable()
        showToast('Browser notifications enabled', 'success')
      } else {
        requestNotificationPermission()
      }
    }
    updateNotificationState()
  }

  function updateNotificationSettings(settings) {
    if (!browserNotificationService.value) return
    browserNotificationService.value.updateSettings(settings)
  }

  function getNotificationSettings() {
    if (!browserNotificationService.value) return {}
    return browserNotificationService.value.getSettings()
  }

  function updateNotificationState() {
    if (!browserNotificationService.value) return
    
    notificationPermission.value = browserNotificationService.value.getPermissionStatus()
    notificationEnabled.value = browserNotificationService.value.isEnabled()
  }

  function showToast(message, type = 'info') {
    toastMessage.value = message
    toastType.value = type
    toastVisible.value = true
  }

  function hideToast() {
    toastVisible.value = false
  }

  function showBrowserNotification(type, data) {
    if (!browserNotificationService.value) return

    switch (type) {
      case 'request-received':
        browserNotificationService.value.showRequestNotification(
          data.path,
          data.request,
          data.isActiveEndpoint
        )
        break
      case 'endpoint-created':
        browserNotificationService.value.showEndpointCreatedNotification(data.path)
        break
    }
  }

  return {
    // State
    toastMessage,
    toastType,
    toastVisible,
    notificationPermission,
    notificationEnabled,
    
    // Getters
    notificationStatus,
    notificationStatusText,
    notificationStatusClass,
    
    // Actions
    initialize,
    requestNotificationPermission,
    toggleNotifications,
    updateNotificationSettings,
    getNotificationSettings,
    updateNotificationState,
    showToast,
    hideToast,
    showBrowserNotification
  }
})