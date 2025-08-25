class SocketService {
    constructor() {
        this.io = null;
    }

    initialize(socketIOInstance) {
        this.io = socketIOInstance;
        
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    notifyEndpointCreated(endpoint) {
        if (this.io) {
            this.io.emit('endpointCreated', endpoint);
        }
    }

    notifyEndpointDeleted(data) {
        if (this.io) {
            this.io.emit('endpointDeleted', data);
        }
    }

    notifyRequestReceived(data) {
        if (this.io) {
            this.io.emit('requestReceived', data);
        }
    }

    notifyEndpointUpdated(endpoint) {
        if (this.io) {
            this.io.emit('endpointUpdated', endpoint);
        }
    }

    notifyResponseConfigUpdated(data) {
        if (this.io) {
            this.io.emit('responseConfigUpdated', data);
        }
    }

    broadcastMessage(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }

    sendToClient(clientId, event, data) {
        if (this.io) {
            this.io.to(clientId).emit(event, data);
        }
    }

    getConnectedClientsCount() {
        return this.io ? this.io.sockets.sockets.size : 0;
    }
}

module.exports = new SocketService();