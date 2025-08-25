<template>
  <div class="fixed bottom-4 w-[400px] right-4" style="z-index: 10000;">
    <div
      v-if="notificationStore.toastVisible"
      :class="toastClasses"
      class="max-w-sm w-full bg-white rounded-lg overflow-hidden transition-all duration-300"
      style="box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;"
    >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component :is="toastIcon" class="h-6 w-6" :class="iconColor" />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">{{ toastTitle }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ notificationStore.toastMessage }}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                @click="notificationStore.hideToast()"
              >
                <span class="sr-only">Close</span>
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const notificationStore = useNotificationStore()

const toastIcon = computed(() => {
  const type = notificationStore.toastType
  const icons = {
    error: ExclamationTriangleIcon,
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }
  return icons[type] || icons.info
})

const iconColor = computed(() => {
  const type = notificationStore.toastType
  const colors = {
    error: 'text-red-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }
  return colors[type] || colors.info
})

const toastClasses = computed(() => {
  const type = notificationStore.toastType
  return {
    'border-l-4 border-red-400': type === 'error',
    'border-l-4 border-green-400': type === 'success',
    'border-l-4 border-yellow-400': type === 'warning',
    'border-l-4 border-blue-400': type === 'info'
  }
})

const toastTitle = computed(() => {
  const type = notificationStore.toastType
  const titles = {
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Notification'
  }
  return titles[type] || titles.info
})

// Auto-hide toast after 4 seconds
watch(() => notificationStore.toastVisible, (isVisible) => {
  if (isVisible) {
    setTimeout(() => {
      notificationStore.hideToast()
    }, 4000)
  }
})
</script>