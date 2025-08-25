import axios from 'axios'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.status, response.config.url, response.data)
    return response
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred'
    console.error('API Error:', message, error)
    return Promise.reject(new Error(message))
  }
)

// Webhook API endpoints
export const webhookApi = {
  // Endpoints
  getEndpoints: () => apiClient.get('/endpoints'),
  createEndpoint: (data) => apiClient.post('/endpoints', data),
  deleteEndpoint: (path) => apiClient.delete(`/endpoints/${encodeURIComponent(path)}`),
  
  // Requests
  getEndpointRequests: (path) => apiClient.get(`/endpoints/${encodeURIComponent(path)}/requests`),
  deleteRequest: (path, requestId) => apiClient.delete(`/endpoints/${encodeURIComponent(path)}/requests/${requestId}`),
  clearEndpointRequests: (path) => apiClient.delete(`/endpoints/${encodeURIComponent(path)}/requests`),
  
  // Response Configuration
  getResponseConfig: (path) => apiClient.get(`/endpoints/${encodeURIComponent(path)}/response`),
  updateResponseConfig: (path, config) => apiClient.put(`/endpoints/${encodeURIComponent(path)}/response`, config),
  
  // Health check
  ping: () => apiClient.get('/health').catch(() => ({ data: { status: 'error' } }))
}

export default apiClient