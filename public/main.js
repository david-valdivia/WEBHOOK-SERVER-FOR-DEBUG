// main.js
// Main script for Webhook Tester interface

const socket = io();
let activeEndpoint = null;
let endpoints = [];

// Initialize browser notification service
let notificationService = null;

// DOM elements
const endpointList = document.getElementById('endpointList');
const requestsContainer = document.getElementById('requests');
const endpointUrlInput = document.getElementById('endpointUrl');
const emptyState = document.getElementById('emptyState');
const clearBtn = document.getElementById('clearBtn');
const totalRequestsElement = document.getElementById('totalRequests');
const statusCodeInput = document.getElementById('statusCode');
const contentTypeInput = document.getElementById('contentType');
const responseDelayInput = document.getElementById('responseDelay');
const responseBodyInput = document.getElementById('responseBody');

// Initialize toasts
const toastEl = document.getElementById('notificationToast');
const toast = new bootstrap.Toast(toastEl);

// Function to show notifications
function showNotification(message, type = 'info') {
    document.getElementById('toastMessage').textContent = message;

    if (type === 'error') {
        toastEl.classList.add('bg-danger', 'text-white');
    } else {
        toastEl.classList.remove('bg-danger', 'text-white');
    }

    toast.show();
}

// Function to create a new endpoint
function createEndpoint() {
    const pathInput = document.getElementById('path');
    const path = pathInput.value.trim();

    if (!path) {
        showNotification('Endpoint path cannot be empty', 'error');
        return;
    }

    fetch('/api/endpoints', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error creating endpoint') });
            }
            return response.json();
        })
        .then(data => {
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createEndpointModal'));
            modal.hide();

            // Clear the form
            pathInput.value = '';

            showNotification(`Endpoint /${data.path} created successfully`);
            loadEndpoints();
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Function to delete an endpoint
function deleteEndpoint(path) {
    if (!confirm(`Are you sure you want to delete the endpoint /${path}?`)) {
        return;
    }

    fetch(`/api/endpoints/${encodeURIComponent(path)}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error deleting endpoint') });
            }
            return response.json();
        })
        .then(() => {
            if (activeEndpoint === path) {
                activeEndpoint = null;
                updateUI();
            }
            showNotification(`Endpoint /${path} deleted successfully`);
            loadEndpoints();
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Function to select an endpoint
function selectEndpoint(path) {
    activeEndpoint = path;
    updateUI();

    // Load endpoint requests
    fetch(`/api/endpoints/${encodeURIComponent(path)}/requests`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error loading requests') });
            }
            return response.json();
        })
        .then(requests => {
            requestsContainer.innerHTML = '';
            totalRequestsElement.textContent = requests.length;
            clearBtn.disabled = requests.length === 0;

            if (requests.length === 0) {
                emptyState.textContent = 'No requests for this endpoint';
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
                requests.forEach(addRequestToUI);
            }
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });

    // Load response configuration
    fetch(`/api/endpoints/${encodeURIComponent(path)}/response`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error loading configuration') });
            }
            return response.json();
        })
        .then(responseConfig => {
            statusCodeInput.value = responseConfig.statusCode;
            contentTypeInput.value = responseConfig.contentType;
            responseDelayInput.value = responseConfig.delay || 0;
            try {
                // Try to format JSON if possible
                if (responseConfig.contentType === 'application/json' && responseConfig.body) {
                    responseBodyInput.value = JSON.stringify(JSON.parse(responseConfig.body), null, 2);
                } else {
                    responseBodyInput.value = responseConfig.body || '';
                }
            } catch (e) {
                responseBodyInput.value = responseConfig.body || '';
            }
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Function to save response configuration
function saveResponseConfig() {
    if (!activeEndpoint) {
        showNotification('No endpoint selected', 'error');
        return;
    }

    let body = responseBodyInput.value;

    // If content-type is JSON, validate that it's valid JSON
    if (contentTypeInput.value === 'application/json') {
        try {
            JSON.parse(body);
        } catch (e) {
            showNotification('Response body is not valid JSON', 'error');
            return;
        }
    }

    const config = {
        status_code: parseInt(statusCodeInput.value, 10),
        content_type: contentTypeInput.value,
        body: body,
        delay: parseInt(responseDelayInput.value, 10)
    };

    fetch(`/api/endpoints/${encodeURIComponent(activeEndpoint)}/response`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error saving configuration') });
            }
            return response.json();
        })
        .then(() => {
            showNotification('Configuration saved successfully');
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Function to add a request to the UI
function addRequestToUI(requestData) {
    const element = document.createElement('div');
    element.id = `request-${requestData.id}`;
    element.className = 'request-card border-bottom p-3';

    const timestamp = new Date(requestData.timestamp).toLocaleString();
    const methodBadgeColor = getMethodBadgeColor(requestData.method);

    // Prepare body content for display in the UI
    let bodyContent = 'No body in request';
    if (requestData.body) {
        try {
            bodyContent = JSON.stringify(requestData.body, null, 2);
        } catch (e) {
            bodyContent = String(requestData.body);
        }
    }

    // Prepare query parameters
    let queryContent = '';
    if (requestData.queryParams && Object.keys(requestData.queryParams).length > 0) {
        queryContent = `
        <div class="mt-2">
            <button class="btn btn-sm btn-outline-secondary" 
                    onclick="toggleQueryParams('${requestData.id}')">
                <i class="bi bi-question-circle me-1"></i>
                View Query Params
            </button>
            <div id="query-${requestData.id}" class="mt-2 d-none">
                <pre class="language-json"><code>${JSON.stringify(requestData.queryParams, null, 2)}</code></pre>
            </div>
        </div>
        `;
    }

    element.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
                <div class="d-flex align-items-center mb-2">
                    <span class="badge ${methodBadgeColor} me-2">${requestData.method}</span>
                    <span class="timestamp text-muted">${timestamp}</span>
                </div>
                <pre class="language-json"><code>${bodyContent}</code></pre>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-secondary" 
                            onclick="toggleHeaders('${requestData.id}')">
                        <i class="bi bi-info-circle me-1"></i>
                        View Headers
                    </button>
                    <div id="headers-${requestData.id}" class="mt-2 d-none">
                        <pre class="language-json"><code>${JSON.stringify(requestData.headers, null, 2)}</code></pre>
                    </div>
                </div>
                ${queryContent}
            </div>
            <button onclick="deleteRequest(${requestData.id})" 
                    class="btn btn-outline-danger btn-sm ms-3">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    requestsContainer.insertBefore(element, requestsContainer.firstChild);
}

// Function to get badge color based on HTTP method
function getMethodBadgeColor(method) {
    const colors = {
        'GET': 'bg-success',
        'POST': 'bg-primary',
        'PUT': 'bg-warning',
        'DELETE': 'bg-danger',
        'PATCH': 'bg-info'
    };
    return colors[method] || 'bg-secondary';
}

// Function to toggle headers visibility
function toggleHeaders(id) {
    const headersDiv = document.getElementById(`headers-${id}`);
    headersDiv.classList.toggle('d-none');
}

// Function to toggle query params visibility
function toggleQueryParams(id) {
    const queryDiv = document.getElementById(`query-${id}`);
    queryDiv.classList.toggle('d-none');
}

// Function to delete a request
function deleteRequest(id) {
    if (!activeEndpoint) return;

    fetch(`/api/endpoints/${encodeURIComponent(activeEndpoint)}/requests/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error deleting request') });
            }
            return response.json();
        })
        .then(() => {
            const element = document.getElementById(`request-${id}`);
            if (element) {
                element.remove();
            }

            // Update request counter
            const count = parseInt(totalRequestsElement.textContent, 10) - 1;
            totalRequestsElement.textContent = count;
            clearBtn.disabled = count === 0;

            if (count === 0) {
                emptyState.textContent = 'No requests for this endpoint';
                emptyState.style.display = 'block';
            }

            showNotification('Request deleted successfully');
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Function to clear all requests
function clearAllRequests() {
    if (!activeEndpoint || !confirm('Are you sure you want to delete all requests?')) {
        return;
    }

    fetch(`/api/endpoints/${encodeURIComponent(activeEndpoint)}/requests`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error clearing requests') });
            }
            return response.json();
        })
        .then(() => {
            requestsContainer.innerHTML = '';
            totalRequestsElement.textContent = '0';
            clearBtn.disabled = true;
            emptyState.textContent = 'No requests for this endpoint';
            emptyState.style.display = 'block';
            showNotification('All requests have been deleted');
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Function to copy endpoint URL
function copyEndpointUrl() {
    if (!activeEndpoint) {
        showNotification('No endpoint selected', 'error');
        return;
    }

    navigator.clipboard.writeText(endpointUrlInput.value)
        .then(() => showNotification('URL copied to clipboard'))
        .catch(() => showNotification('Error copying URL', 'error'));
}

// Function to update the UI
function updateUI() {
    // Update endpoints list
    updateEndpointsList();

    // Update endpoint URL
    if (activeEndpoint) {
        endpointUrlInput.value = `${window.location.origin}/${activeEndpoint}`;
        document.querySelectorAll('#mainTabs button').forEach(tab => {
            tab.disabled = false;
        });
    } else {
        endpointUrlInput.value = '';
        document.querySelectorAll('#mainTabs button').forEach(tab => {
            if (tab.id !== 'requests-tab') {
                tab.disabled = true;
            }
        });

        // Show requests tab
        const requestsTab = document.querySelector('#requests-tab');
        bootstrap.Tab.getOrCreateInstance(requestsTab).show();

        // Clear requests container
        requestsContainer.innerHTML = '';
        totalRequestsElement.textContent = '0';
        clearBtn.disabled = true;
        emptyState.textContent = 'Select an endpoint to view its requests';
        emptyState.style.display = 'block';
    }
}

// Function to update endpoints list
function updateEndpointsList() {
    endpointList.innerHTML = '';

    endpoints.forEach(endpoint => {
        const endpointElement = document.createElement('div');
        endpointElement.className = `endpoint-item ${activeEndpoint === endpoint.path ? 'active' : ''}`;
        endpointElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
                <div class="d-flex align-items-center cursor-pointer" onclick="selectEndpoint('${endpoint.path}')">
                    <i class="bi bi-link-45deg me-2"></i>
                    <div>
                        <div class="fw-bold">/${endpoint.path}</div>
                        <small class="text-muted">${endpoint.requestCount || 0} requests</small>
                    </div>
                </div>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); copyEndpointUrlToClipboard('${endpoint.path}')">
                        <i class="bi bi-clipboard"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteEndpoint('${endpoint.path}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        endpointList.appendChild(endpointElement);
    });

    // If no endpoints, show message
    if (endpoints.length === 0) {
        endpointList.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="bi bi-plus-circle" style="font-size: 2rem;"></i>
                <p class="mt-2">No endpoints created</p>
            </div>
        `;
    }
}

// Function to copy a specific endpoint URL
function copyEndpointUrlToClipboard(path) {
    const url = `${window.location.origin}/${path}`;
    navigator.clipboard.writeText(url)
        .then(() => showNotification('URL copied to clipboard'))
        .catch(() => showNotification('Error copying URL', 'error'));
}

// Function to load endpoints
function loadEndpoints() {
    fetch('/api/endpoints')
        .then(response => response.json())
        .then(data => {
            endpoints = data;
            updateEndpointsList();
        })
        .catch(error => {
            console.error('Error loading endpoints:', error);
            showNotification('Error loading endpoints', 'error');
        });
}

// Browser notification functions
async function requestNotificationPermission() {
    if (!notificationService) return false;
    
    try {
        const granted = await notificationService.requestPermission();
        updateNotificationUI();
        return granted;
    } catch (error) {
        showNotification(error.message, 'error');
        return false;
    }
}

function toggleNotifications() {
    if (!notificationService) return;
    
    if (notificationService.isEnabled()) {
        notificationService.disable();
        showNotification('Browser notifications disabled');
    } else {
        if (notificationService.getPermissionStatus() === 'granted') {
            notificationService.enable();
            showNotification('Browser notifications enabled');
        } else {
            requestNotificationPermission();
        }
    }
    updateNotificationUI();
}

function updateNotificationSettings(settings) {
    if (!notificationService) return;
    notificationService.updateSettings(settings);
}

function saveNotificationSettings() {
    if (!notificationService) return;
    
    const showForActive = document.getElementById('showForActive').checked;
    const showRequestDetails = document.getElementById('showRequestDetails').checked;
    const playSound = document.getElementById('playSound').checked;
    
    const settings = {
        showForActiveEndpoint: showForActive,
        showForAllEndpoints: !showForActive,
        showRequestDetails: showRequestDetails,
        playSound: playSound
    };
    
    notificationService.updateSettings(settings);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('notificationSettingsModal'));
    modal.hide();
    
    showNotification('Notification settings saved');
}

function loadNotificationSettings() {
    if (!notificationService) return;
    
    const settings = notificationService.getSettings();
    
    document.getElementById('showForActive').checked = settings.showForActiveEndpoint;
    document.getElementById('showForAll').checked = settings.showForAllEndpoints;
    document.getElementById('showRequestDetails').checked = settings.showRequestDetails;
    document.getElementById('playSound').checked = settings.playSound;
}

function updateNotificationUI() {
    const notificationBtn = document.getElementById('notificationToggle');
    const notificationStatus = document.getElementById('notificationStatus');
    
    if (!notificationService) return;
    
    const isEnabled = notificationService.isEnabled();
    const permission = notificationService.getPermissionStatus();
    
    if (notificationBtn) {
        notificationBtn.textContent = isEnabled ? 'Disable Notifications' : 'Enable Notifications';
        notificationBtn.className = `btn btn-sm ${isEnabled ? 'btn-warning' : 'btn-success'}`;
    }
    
    if (notificationStatus) {
        let statusText = '';
        let statusClass = '';
        
        switch (permission) {
            case 'granted':
                statusText = isEnabled ? 'Enabled' : 'Available';
                statusClass = isEnabled ? 'text-success' : 'text-warning';
                break;
            case 'denied':
                statusText = 'Blocked';
                statusClass = 'text-danger';
                break;
            default:
                statusText = 'Not requested';
                statusClass = 'text-muted';
        }
        
        notificationStatus.innerHTML = `<i class="bi bi-bell"></i> ${statusText}`;
        notificationStatus.className = `${statusClass} me-2`;
    }
}

// Socket.io Event Listeners
socket.on('endpointCreated', ({ id, path }) => {
    loadEndpoints();
    showNotification(`Endpoint /${path} created`);
    
    // Show browser notification
    if (notificationService) {
        notificationService.showEndpointCreatedNotification(path);
    }
});

socket.on('endpointDeleted', ({ path }) => {
    loadEndpoints();

    if (activeEndpoint === path) {
        activeEndpoint = null;
        updateUI();
    }

    showNotification(`Endpoint /${path} deleted`);
});

socket.on('requestReceived', ({ path, request }) => {
    // Update endpoints list to reflect new count
    loadEndpoints();

    const isActiveEndpoint = activeEndpoint === path;

    // If it's the active endpoint, add request to UI
    if (isActiveEndpoint) {
        addRequestToUI(request);

        // Update request counter
        const count = parseInt(totalRequestsElement.textContent, 10) + 1;
        totalRequestsElement.textContent = count;
        clearBtn.disabled = false;
        emptyState.style.display = 'none';
    }

    showNotification(`New request on /${path}`);
    
    // Show browser notification
    if (notificationService) {
        notificationService.showRequestNotification(path, request, isActiveEndpoint);
    }
});

// Connection handling
socket.on('connect', () => {
    document.getElementById('connectionStatus').innerHTML =
        '<i class="bi bi-circle-fill text-success me-1"></i> Connected';
    loadEndpoints();
});

socket.on('disconnect', () => {
    document.getElementById('connectionStatus').innerHTML =
        '<i class="bi bi-circle-fill text-danger me-1"></i> Disconnected';
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Event listener for endpoint creation form
    document.getElementById('createEndpointModal').addEventListener('shown.bs.modal', () => {
        document.getElementById('path').focus();
    });

    document.getElementById('endpointForm').addEventListener('submit', event => {
        event.preventDefault();
        createEndpoint();
    });

    // Event listener for response configuration form
    document.getElementById('responseConfigForm').addEventListener('submit', event => {
        event.preventDefault();
        saveResponseConfig();
    });

    // Event listener for content-type changes
    contentTypeInput.addEventListener('change', () => {
        // If changing to JSON, try to format the content
        if (contentTypeInput.value === 'application/json') {
            try {
                const content = responseBodyInput.value.trim();
                if (content) {
                    responseBodyInput.value = JSON.stringify(JSON.parse(content), null, 2);
                }
            } catch (e) {
                // If it's not valid JSON, do nothing
            }
        }
    });

    // Initialize browser notification service
    if (typeof BrowserNotificationService !== 'undefined') {
        notificationService = new BrowserNotificationService();
        updateNotificationUI();
        
        // Handle custom endpoint focus events
        window.addEventListener('focusEndpoint', (event) => {
            selectEndpoint(event.detail.path);
        });
    }
    
    // Event listener for notification settings modal
    document.getElementById('notificationSettingsModal').addEventListener('shown.bs.modal', () => {
        loadNotificationSettings();
    });

    // Load endpoints
    loadEndpoints();
});