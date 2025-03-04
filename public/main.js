// main.js
// Script principal para la interfaz del Webhook Tester

const socket = io();
let activeEndpoint = null;
let endpoints = [];

// Elementos del DOM
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

// Inicializar toasts
const toastEl = document.getElementById('notificationToast');
const toast = new bootstrap.Toast(toastEl);

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    document.getElementById('toastMessage').textContent = message;

    if (type === 'error') {
        toastEl.classList.add('bg-danger', 'text-white');
    } else {
        toastEl.classList.remove('bg-danger', 'text-white');
    }

    toast.show();
}

// Función para crear un nuevo endpoint
function createEndpoint() {
    const pathInput = document.getElementById('path');
    const path = pathInput.value.trim();

    if (!path) {
        showNotification('La ruta del endpoint no puede estar vacía', 'error');
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
                return response.json().then(err => { throw new Error(err.error || 'Error al crear endpoint') });
            }
            return response.json();
        })
        .then(data => {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createEndpointModal'));
            modal.hide();

            // Limpiar el formulario
            pathInput.value = '';

            showNotification(`Endpoint /${data.path} creado correctamente`);
            loadEndpoints();
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Función para eliminar un endpoint
function deleteEndpoint(path) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el endpoint /${path}?`)) {
        return;
    }

    fetch(`/api/endpoints/${encodeURIComponent(path)}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error al eliminar endpoint') });
            }
            return response.json();
        })
        .then(() => {
            if (activeEndpoint === path) {
                activeEndpoint = null;
                updateUI();
            }
            showNotification(`Endpoint /${path} eliminado correctamente`);
            loadEndpoints();
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Función para seleccionar un endpoint
function selectEndpoint(path) {
    activeEndpoint = path;
    updateUI();

    // Cargar peticiones del endpoint
    fetch(`/api/endpoints/${encodeURIComponent(path)}/requests`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error al cargar peticiones') });
            }
            return response.json();
        })
        .then(requests => {
            requestsContainer.innerHTML = '';
            totalRequestsElement.textContent = requests.length;
            clearBtn.disabled = requests.length === 0;

            if (requests.length === 0) {
                emptyState.textContent = 'No hay peticiones para este endpoint';
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
                requests.forEach(addRequestToUI);
            }
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });

    // Cargar configuración de respuesta
    fetch(`/api/endpoints/${encodeURIComponent(path)}/response`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error al cargar configuración') });
            }
            return response.json();
        })
        .then(responseConfig => {
            statusCodeInput.value = responseConfig.status_code;
            contentTypeInput.value = responseConfig.content_type;
            responseDelayInput.value = responseConfig.delay || 0;
            try {
                // Intentar formatear JSON si es posible
                if (responseConfig.content_type === 'application/json' && responseConfig.body) {
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

// Función para guardar la configuración de respuesta
function saveResponseConfig() {
    if (!activeEndpoint) {
        showNotification('Ningún endpoint seleccionado', 'error');
        return;
    }

    let body = responseBodyInput.value;

    // Si el content-type es JSON, validar que sea un JSON válido
    if (contentTypeInput.value === 'application/json') {
        try {
            JSON.parse(body);
        } catch (e) {
            showNotification('El cuerpo de la respuesta no es un JSON válido', 'error');
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
                return response.json().then(err => { throw new Error(err.error || 'Error al guardar configuración') });
            }
            return response.json();
        })
        .then(() => {
            showNotification('Configuración guardada correctamente');
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Función para añadir una petición a la UI
function addRequestToUI(requestData) {
    const element = document.createElement('div');
    element.id = `request-${requestData.id}`;
    element.className = 'request-card border-bottom p-3';

    const timestamp = new Date(requestData.timestamp).toLocaleString();
    const methodBadgeColor = getMethodBadgeColor(requestData.method);

    // Preparar el contenido del cuerpo para mostrarse en la UI
    let bodyContent = 'No hay cuerpo en la petición';
    if (requestData.body) {
        try {
            bodyContent = JSON.stringify(requestData.body, null, 2);
        } catch (e) {
            bodyContent = String(requestData.body);
        }
    }

    // Preparar parámetros de query
    let queryContent = '';
    if (requestData.query_params && Object.keys(requestData.query_params).length > 0) {
        queryContent = `
        <div class="mt-2">
            <button class="btn btn-sm btn-outline-secondary" 
                    onclick="toggleQueryParams('${requestData.id}')">
                <i class="bi bi-question-circle me-1"></i>
                Ver Query Params
            </button>
            <div id="query-${requestData.id}" class="mt-2 d-none">
                <pre class="language-json"><code>${JSON.stringify(requestData.query_params, null, 2)}</code></pre>
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
                        Ver Headers
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

// Función para alternar la visibilidad de los query params
function toggleQueryParams(id) {
    const queryDiv = document.getElementById(`query-${id}`);
    queryDiv.classList.toggle('d-none');
}

// Función para eliminar una petición
function deleteRequest(id) {
    if (!activeEndpoint) return;

    fetch(`/api/endpoints/${encodeURIComponent(activeEndpoint)}/requests/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error al eliminar petición') });
            }
            return response.json();
        })
        .then(() => {
            const element = document.getElementById(`request-${id}`);
            if (element) {
                element.remove();
            }

            // Actualizar contador de peticiones
            const count = parseInt(totalRequestsElement.textContent, 10) - 1;
            totalRequestsElement.textContent = count;
            clearBtn.disabled = count === 0;

            if (count === 0) {
                emptyState.textContent = 'No hay peticiones para este endpoint';
                emptyState.style.display = 'block';
            }

            showNotification('Petición eliminada correctamente');
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Función para limpiar todas las peticiones
function clearAllRequests() {
    if (!activeEndpoint || !confirm('¿Estás seguro de que deseas eliminar todas las peticiones?')) {
        return;
    }

    fetch(`/api/endpoints/${encodeURIComponent(activeEndpoint)}/requests`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error al limpiar peticiones') });
            }
            return response.json();
        })
        .then(() => {
            requestsContainer.innerHTML = '';
            totalRequestsElement.textContent = '0';
            clearBtn.disabled = true;
            emptyState.textContent = 'No hay peticiones para este endpoint';
            emptyState.style.display = 'block';
            showNotification('Todas las peticiones han sido eliminadas');
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Función para copiar la URL del endpoint
function copyEndpointUrl() {
    if (!activeEndpoint) {
        showNotification('Ningún endpoint seleccionado', 'error');
        return;
    }

    navigator.clipboard.writeText(endpointUrlInput.value)
        .then(() => showNotification('URL copiada al portapapeles'))
        .catch(() => showNotification('Error al copiar URL', 'error'));
}

// Función para actualizar la UI
function updateUI() {
    // Actualizar lista de endpoints
    updateEndpointsList();

    // Actualizar URL del endpoint
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

        // Mostrar tab de peticiones
        const requestsTab = document.querySelector('#requests-tab');
        bootstrap.Tab.getOrCreateInstance(requestsTab).show();

        // Limpiar contenedor de peticiones
        requestsContainer.innerHTML = '';
        totalRequestsElement.textContent = '0';
        clearBtn.disabled = true;
        emptyState.textContent = 'Selecciona un endpoint para ver sus peticiones';
        emptyState.style.display = 'block';
    }
}

// Función para actualizar la lista de endpoints
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
                        <small class="text-muted">${endpoint.request_count || 0} peticiones</small>
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

    // Si no hay endpoints, mostrar mensaje
    if (endpoints.length === 0) {
        endpointList.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="bi bi-plus-circle" style="font-size: 2rem;"></i>
                <p class="mt-2">No hay endpoints creados</p>
            </div>
        `;
    }
}

// Función para copiar la URL de un endpoint específico
function copyEndpointUrlToClipboard(path) {
    const url = `${window.location.origin}/${path}`;
    navigator.clipboard.writeText(url)
        .then(() => showNotification('URL copiada al portapapeles'))
        .catch(() => showNotification('Error al copiar URL', 'error'));
}

// Función para cargar los endpoints
function loadEndpoints() {
    fetch('/api/endpoints')
        .then(response => response.json())
        .then(data => {
            endpoints = data;
            updateEndpointsList();
        })
        .catch(error => {
            console.error('Error al cargar endpoints:', error);
            showNotification('Error al cargar endpoints', 'error');
        });
}

// Event Listeners para Socket.io
socket.on('endpointCreated', ({ id, path }) => {
    loadEndpoints();
    showNotification(`Endpoint /${path} creado`);
});

socket.on('endpointDeleted', ({ path }) => {
    loadEndpoints();

    if (activeEndpoint === path) {
        activeEndpoint = null;
        updateUI();
    }

    showNotification(`Endpoint /${path} eliminado`);
});

socket.on('requestReceived', ({ path, request }) => {
    // Actualizar la lista de endpoints para reflejar el nuevo conteo
    loadEndpoints();

    // Si es el endpoint activo, añadir la petición a la UI
    if (activeEndpoint === path) {
        addRequestToUI(request);

        // Actualizar contador de peticiones
        const count = parseInt(totalRequestsElement.textContent, 10) + 1;
        totalRequestsElement.textContent = count;
        clearBtn.disabled = false;
        emptyState.style.display = 'none';
    }

    showNotification(`Nueva petición en /${path}`);
});

// Manejo de conexión
socket.on('connect', () => {
    document.getElementById('connectionStatus').innerHTML =
        '<i class="bi bi-circle-fill text-success me-1"></i> Conectado';
    loadEndpoints();
});

socket.on('disconnect', () => {
    document.getElementById('connectionStatus').innerHTML =
        '<i class="bi bi-circle-fill text-danger me-1"></i> Desconectado';
});

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Event listener para formulario de creación de endpoint
    document.getElementById('createEndpointModal').addEventListener('shown.bs.modal', () => {
        document.getElementById('path').focus();
    });

    document.getElementById('endpointForm').addEventListener('submit', event => {
        event.preventDefault();
        createEndpoint();
    });

    // Event listener para el formulario de configuración de respuesta
    document.getElementById('responseConfigForm').addEventListener('submit', event => {
        event.preventDefault();
        saveResponseConfig();
    });

    // Event listener para cambios en el content-type
    contentTypeInput.addEventListener('change', () => {
        // Si cambia a JSON, intentar formatear el contenido
        if (contentTypeInput.value === 'application/json') {
            try {
                const content = responseBodyInput.value.trim();
                if (content) {
                    responseBodyInput.value = JSON.stringify(JSON.parse(content), null, 2);
                }
            } catch (e) {
                // Si no es un JSON válido, no hacer nada
            }
        }
    });

    // Cargar endpoints
    loadEndpoints();
});