// Este código va dentro de un tag <script> en el HTML, después de cargar Socket.io y Bootstrap
const socket = io();
let activeEndpoint = null;
let endpoints = new Map();

// Elementos del DOM
const endpointList = document.getElementById('endpointList');
const requestsContainer = document.getElementById('requests');
const webhookUrlInput = document.getElementById('webhookUrl');
const emptyState = document.getElementById('emptyState');
const clearBtn = document.getElementById('clearBtn');
const totalRequestsElement = document.getElementById('totalRequests');
const endpointForm = document.getElementById('endpointForm');

// Inicializar toasts
const toastElList = [].slice.call(document.querySelectorAll('.toast'));
const toasts = toastElList.map(function(toastEl) {
    return new bootstrap.Toast(toastEl);
});

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    const toastBody = document.getElementById('toastMessage');
    toast.className = `toast ${type === 'error' ? 'bg-danger text-white' : ''}`;
    toastBody.textContent = message;
    bootstrap.Toast.getInstance(toast).show();
}

// Función para crear un nuevo endpoint
async function createEndpoint(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const path = formData.get('path').trim();

    try {
        const response = await fetch('/api/endpoints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        showNotification(`Endpoint /${path} creado correctamente`);
        event.target.reset();

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Función para eliminar un endpoint
async function deleteEndpoint(path) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el endpoint /${path}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/endpoints/${encodeURIComponent(path)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el endpoint');
        }

        showNotification(`Endpoint /${path} eliminado correctamente`);

        if (activeEndpoint === path) {
            activeEndpoint = null;
            updateRequestsView();
        }

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Función para actualizar la vista de endpoints
function updateEndpointsList(endpointData) {
    endpointList.innerHTML = '';

    endpointData.forEach(({ path, requestCount }) => {
        const endpointElement = document.createElement('div');
        endpointElement.className = `endpoint-item ${activeEndpoint === path ? 'active' : ''}`;
        endpointElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
                <div class="d-flex align-items-center cursor-pointer" onclick="selectEndpoint('${path}')">
                    <i class="bi bi-link-45deg me-2"></i>
                    <div>
                        <div class="fw-bold">/${path}</div>
                        <small class="text-muted">${requestCount} peticiones</small>
                    </div>
                </div>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" onclick="copyEndpointUrl('${path}')">
                        <i class="bi bi-clipboard"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEndpoint('${path}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        endpointList.appendChild(endpointElement);
    });
}

// Función para seleccionar un endpoint activo
function selectEndpoint(path) {
    activeEndpoint = path;
    updateRequestsView();
    updateEndpointsList(Array.from(endpoints.entries()).map(([path, requests]) => ({
        path,
        requestCount: requests.length
    })));
}

// Función para copiar la URL del endpoint
function copyEndpointUrl(path) {
    const url = `${window.location.origin}/${path}`;
    navigator.clipboard.writeText(url).then(() => {
        showNotification('URL copiada al portapapeles');
    });
}

// Función para actualizar la vista de peticiones
function updateRequestsView() {
    requestsContainer.innerHTML = '';

    if (!activeEndpoint) {
        emptyState.textContent = 'Selecciona un endpoint para ver sus peticiones';
        emptyState.style.display = 'block';
        clearBtn.disabled = true;
        totalRequestsElement.textContent = '0';
        return;
    }

    const requests = endpoints.get(activeEndpoint) || [];
    totalRequestsElement.textContent = requests.length;
    clearBtn.disabled = requests.length === 0;

    if (requests.length === 0) {
        emptyState.textContent = 'No hay peticiones para este endpoint';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    requests.forEach(addRequestToUI);
}

// Función para añadir una petición a la UI
function addRequestToUI(webhookData) {
    const element = document.createElement('div');
    element.id = `request-${webhookData.id}`;
    element.className = 'request-card border-bottom p-3';

    const timestamp = new Date(webhookData.timestamp).toLocaleString();
    const methodBadgeColor = getMethodBadgeColor(webhookData.method);

    element.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
                <div class="d-flex align-items-center mb-2">
                    <span class="badge ${methodBadgeColor} me-2">${webhookData.method}</span>
                    <span class="timestamp text-muted">${timestamp}</span>
                </div>
                <pre class="language-json"><code>${JSON.stringify(webhookData.body, null, 2)}</code></pre>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-secondary" 
                            onclick="toggleHeaders('${webhookData.id}')">
                        <i class="bi bi-info-circle me-1"></i>
                        Ver Headers
                    </button>
                    <div id="headers-${webhookData.id}" class="mt-2 d-none">
                        <pre class="language-json"><code>${JSON.stringify(webhookData.headers, null, 2)}</code></pre>
                    </div>
                </div>
            </div>
            <button onclick="deleteRequest('${webhookData.id}')" 
                    class="btn btn-outline-danger btn-sm ms-3">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    requestsContainer.insertBefore(element, requestsContainer.firstChild);
}

// Función para obtener el color del badge según el método HTTP
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

// Función para alternar la visibilidad de los headers
function toggleHeaders(id) {
    const headersDiv = document.getElementById(`headers-${id}`);
    headersDiv.classList.toggle('d-none');
}

// Función para eliminar una petición
async function deleteRequest(id) {
    if (!activeEndpoint) return;

    try {
        const response = await fetch(`/api/endpoints/${encodeURIComponent(activeEndpoint)}/requests/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar la petición');
        }

        const element = document.getElementById(`request-${id}`);
        if (element) {
            element.remove();
        }

        const requests = endpoints.get(activeEndpoint) || [];
        endpoints.set(activeEndpoint, requests.filter(req => req.id !== id));
        updateRequestsView();
        showNotification('Petición eliminada correctamente');

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Función para limpiar todas las peticiones del endpoint activo
async function clearAllRequests() {
    if (!activeEndpoint || !confirm('¿Estás seguro de que deseas eliminar todas las peticiones?')) {
        return;
    }

    try {
        const response = await fetch(`/api/endpoints/${encodeURIComponent(activeEndpoint)}/requests`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al limpiar las peticiones');
        }

        endpoints.set(activeEndpoint, []);
        updateRequestsView();
        showNotification('Todas las peticiones han sido eliminadas');

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Event Listeners
endpointForm.addEventListener('submit', createEndpoint);

// Socket.io event handlers
socket.on('endpointCreated', ({ path }) => {
    endpoints.set(path, []);
    updateEndpointsList(Array.from(endpoints.entries()).map(([path, requests]) => ({
        path,
        requestCount: requests.length
    })));
});

socket.on('endpointDeleted', ({ path }) => {
    endpoints.delete(path);
    updateEndpointsList(Array.from(endpoints.entries()).map(([path, requests]) => ({
        path,
        requestCount: requests.length
    })));
});

socket.on('requestReceived', ({ path, request }) => {
    const requests = endpoints.get(path) || [];
    requests.unshift(request);
    endpoints.set(path, requests);

    if (activeEndpoint === path) {
        addRequestToUI(request);
        totalRequestsElement.textContent = requests.length;
    }

    updateEndpointsList(Array.from(endpoints.entries()).map(([path, requests]) => ({
        path,
        requestCount: requests.length
    })));

    showNotification(`Nueva petición recibida en /${path}`);
});

// Manejo de conexión
socket.on('connect', () => {
    document.getElementById('connectionStatus').innerHTML =
        '<i class="bi bi-circle-fill text-success me-1"></i> Conectado';

    // Cargar endpoints existentes al conectar
    fetch('/api/endpoints')
        .then(response => response.json())
        .then(endpointsData => {
            endpoints.clear();
            endpointsData.forEach(({ path, requests }) => {
                endpoints.set(path, requests);
            });
            updateEndpointsList(endpointsData);
        });
});

socket.on('disconnect', () => {
    document.getElementById('connectionStatus').innerHTML =
        '<i class="bi bi-circle-fill text-danger me-1"></i> Desconectado';
});