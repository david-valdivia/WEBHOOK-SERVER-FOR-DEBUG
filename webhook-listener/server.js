// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const path = require('path');

// Almacenamiento en memoria para las peticiones
let requests = [];

// Configuración de middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz que sirve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para recibir webhooks
app.all('/webhook', (req, res) => {
    const webhookData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        method: req.method,
        headers: req.headers,
        body: req.body,
        query: req.query
    };

    // Almacenar la petición
    requests.push(webhookData);

    // Emitir el evento a todos los clientes conectados
    io.emit('newWebhook', webhookData);

    res.status(200).send('Webhook recibido');
});

// Ruta para obtener todas las peticiones
app.get('/requests', (req, res) => {
    res.json(requests);
});

// Ruta para eliminar una petición específica
app.delete('/requests/:id', (req, res) => {
    const id = parseInt(req.params.id);
    requests = requests.filter(request => request.id !== id);
    io.emit('requestDeleted', id);
    res.status(200).send('Petición eliminada');
});

// Conexión de Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado');
    socket.emit('allRequests', requests);
});

const PORT = process.env.PORT || 1994;
http.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
    console.log(`Abre http://localhost:${PORT} en tu navegador`);
});