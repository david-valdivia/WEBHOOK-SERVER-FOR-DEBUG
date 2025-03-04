// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Inicialización de la base de datos
let db;

async function initializeDatabase() {
    db = await open({
        filename: './webhooks.db',
        driver: sqlite3.Database
    });

    // Crear tablas si no existen
    await db.exec(`
        CREATE TABLE IF NOT EXISTS endpoints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            endpoint_id INTEGER NOT NULL,
            status_code INTEGER DEFAULT 200,
            content_type TEXT DEFAULT 'application/json',
            body TEXT,
            delay INTEGER DEFAULT 0,
            FOREIGN KEY (endpoint_id) REFERENCES endpoints (id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            endpoint_id INTEGER NOT NULL,
            method TEXT NOT NULL,
            headers TEXT NOT NULL,
            query_params TEXT,
            body TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (endpoint_id) REFERENCES endpoints (id) ON DELETE CASCADE
        );
    `);

    console.log('Base de datos inicializada correctamente');
}

// Configuración de middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.raw());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz que sirve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API para gestionar endpoints
app.get('/api/endpoints', async (req, res) => {
    try {
        const endpoints = await db.all(`
            SELECT e.id, e.path, COUNT(r.id) as request_count
            FROM endpoints e
            LEFT JOIN requests r ON e.id = r.endpoint_id
            GROUP BY e.id
        `);

        res.json(endpoints);
    } catch (error) {
        console.error('Error al obtener endpoints:', error);
        res.status(500).json({ error: 'Error al obtener endpoints' });
    }
});

app.post('/api/endpoints', async (req, res) => {
    const { path } = req.body;

    if (!path || path.trim() === '') {
        return res.status(400).json({ error: 'La ruta del endpoint es requerida' });
    }

    const sanitizedPath = path.trim().replace(/^\/+/, '');

    try {
        // Comprobar si el endpoint ya existe
        const existing = await db.get('SELECT id FROM endpoints WHERE path = ?', sanitizedPath);
        if (existing) {
            return res.status(409).json({ error: 'El endpoint ya existe' });
        }

        // Insertar nuevo endpoint
        const result = await db.run('INSERT INTO endpoints (path) VALUES (?)', sanitizedPath);
        const endpoint = await db.get('SELECT * FROM endpoints WHERE id = ?', result.lastID);

        // Crear respuesta por defecto
        await db.run(`
            INSERT INTO responses (endpoint_id, status_code, content_type, body) 
            VALUES (?, ?, ?, ?)
        `, [result.lastID, 200, 'application/json', JSON.stringify({ message: 'OK' })]);

        // Notificar a todos los clientes
        io.emit('endpointCreated', { id: endpoint.id, path: endpoint.path });

        res.status(201).json(endpoint);
    } catch (error) {
        console.error('Error al crear endpoint:', error);
        res.status(500).json({ error: 'Error al crear endpoint' });
    }
});

app.delete('/api/endpoints/:path', async (req, res) => {
    const { path } = req.params;

    try {
        const endpoint = await db.get('SELECT id FROM endpoints WHERE path = ?', path);

        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint no encontrado' });
        }

        await db.run('DELETE FROM endpoints WHERE id = ?', endpoint.id);

        // Notificar a todos los clientes
        io.emit('endpointDeleted', { path });

        res.status(200).json({ message: 'Endpoint eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar endpoint:', error);
        res.status(500).json({ error: 'Error al eliminar endpoint' });
    }
});

// API para gestionar respuestas de endpoints
app.get('/api/endpoints/:path/response', async (req, res) => {
    const { path } = req.params;

    try {
        const endpoint = await db.get('SELECT id FROM endpoints WHERE path = ?', path);

        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint no encontrado' });
        }

        const response = await db.get('SELECT * FROM responses WHERE endpoint_id = ?', endpoint.id);

        res.json(response);
    } catch (error) {
        console.error('Error al obtener respuesta:', error);
        res.status(500).json({ error: 'Error al obtener respuesta' });
    }
});

app.put('/api/endpoints/:path/response', async (req, res) => {
    const { path } = req.params;
    const { status_code, content_type, body, delay } = req.body;

    try {
        const endpoint = await db.get('SELECT id FROM endpoints WHERE path = ?', path);

        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint no encontrado' });
        }

        await db.run(`
            UPDATE responses 
            SET status_code = ?, content_type = ?, body = ?, delay = ? 
            WHERE endpoint_id = ?
        `, [status_code, content_type, body, delay || 0, endpoint.id]);

        const updatedResponse = await db.get('SELECT * FROM responses WHERE endpoint_id = ?', endpoint.id);

        res.json(updatedResponse);
    } catch (error) {
        console.error('Error al actualizar respuesta:', error);
        res.status(500).json({ error: 'Error al actualizar respuesta' });
    }
});

// API para gestionar peticiones
app.get('/api/endpoints/:path/requests', async (req, res) => {
    const { path } = req.params;

    try {
        const endpoint = await db.get('SELECT id FROM endpoints WHERE path = ?', path);

        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint no encontrado' });
        }

        const requests = await db.all('SELECT * FROM requests WHERE endpoint_id = ? ORDER BY timestamp DESC', endpoint.id);

        // Parsear JSON almacenado como texto
        const parsedRequests = requests.map(req => ({
            ...req,
            headers: JSON.parse(req.headers),
            body: req.body ? JSON.parse(req.body) : null,
            query_params: req.query_params ? JSON.parse(req.query_params) : null
        }));

        res.json(parsedRequests);
    } catch (error) {
        console.error('Error al obtener peticiones:', error);
        res.status(500).json({ error: 'Error al obtener peticiones' });
    }
});

app.delete('/api/endpoints/:path/requests/:id', async (req, res) => {
    const { path, id } = req.params;

    try {
        const endpoint = await db.get('SELECT id FROM endpoints WHERE path = ?', path);

        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint no encontrado' });
        }

        await db.run('DELETE FROM requests WHERE id = ? AND endpoint_id = ?', [id, endpoint.id]);

        res.json({ message: 'Petición eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar petición:', error);
        res.status(500).json({ error: 'Error al eliminar petición' });
    }
});

app.delete('/api/endpoints/:path/requests', async (req, res) => {
    const { path } = req.params;

    try {
        const endpoint = await db.get('SELECT id FROM endpoints WHERE path = ?', path);

        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint no encontrado' });
        }

        await db.run('DELETE FROM requests WHERE endpoint_id = ?', endpoint.id);

        res.json({ message: 'Todas las peticiones eliminadas correctamente' });
    } catch (error) {
        console.error('Error al eliminar peticiones:', error);
        res.status(500).json({ error: 'Error al eliminar peticiones' });
    }
});

// Manejador de endpoints dinámicos
app.all('/:path', async (req, res) => {
    const { path } = req.params;

    try {
        const endpoint = await db.get('SELECT id FROM endpoints WHERE path = ?', path);

        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint no encontrado' });
        }

        // Guardar la petición en la base de datos
        const requestData = {
            endpoint_id: endpoint.id,
            method: req.method,
            headers: JSON.stringify(req.headers),
            query_params: JSON.stringify(req.query),
            body: req.body ? JSON.stringify(req.body) : null
        };

        const result = await db.run(`
            INSERT INTO requests (endpoint_id, method, headers, query_params, body)
            VALUES (?, ?, ?, ?, ?)
        `, [requestData.endpoint_id, requestData.method, requestData.headers, requestData.query_params, requestData.body]);

        // Obtener la petición completa
        const savedRequest = await db.get('SELECT * FROM requests WHERE id = ?', result.lastID);
        const parsedRequest = {
            ...savedRequest,
            headers: JSON.parse(savedRequest.headers),
            body: savedRequest.body ? JSON.parse(savedRequest.body) : null,
            query_params: savedRequest.query_params ? JSON.parse(savedRequest.query_params) : null
        };

        // Notificar a todos los clientes
        io.emit('requestReceived', {
            path,
            request: parsedRequest
        });

        // Obtener la respuesta configurada
        const responseConfig = await db.get('SELECT * FROM responses WHERE endpoint_id = ?', endpoint.id);

        // Aplicar delay si está configurado
        if (responseConfig.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, responseConfig.delay));
        }

        // Enviar respuesta configurada
        res.status(responseConfig.status_code)
            .type(responseConfig.content_type)
            .send(responseConfig.body);

    } catch (error) {
        console.error('Error al procesar petición:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Conexión de Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado');
});

// Iniciar el servidor
const PORT = process.env.PORT || 1994;
(async () => {
    try {
        await initializeDatabase();
        http.listen(PORT, () => {
            console.log(`Servidor escuchando en puerto ${PORT}`);
            console.log(`Abre http://localhost:${PORT} en tu navegador`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
})();