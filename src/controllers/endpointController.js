const endpointService = require('../services/endpointService');

class EndpointController {
    async getAllEndpoints(req, res) {
        try {
            const endpoints = await endpointService.getAllEndpoints();
            res.json(endpoints);
        } catch (error) {
            console.error('Error in getAllEndpoints:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch endpoints' });
        }
    }

    async getEndpointByPath(req, res) {
        try {
            const { path } = req.params;
            const endpoint = await endpointService.getEndpointByPath(path);
            
            if (!endpoint) {
                return res.status(404).json({ error: 'Endpoint not found' });
            }

            res.json(endpoint);
        } catch (error) {
            console.error('Error in getEndpointByPath:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch endpoint' });
        }
    }

    async createEndpoint(req, res) {
        try {
            const { path } = req.body;

            if (!path || path.trim() === '') {
                return res.status(400).json({ error: 'Endpoint path is required' });
            }

            const endpoint = await endpointService.createEndpoint({ path });
            res.status(201).json(endpoint);
        } catch (error) {
            console.error('Error in createEndpoint:', error);
            
            if (error.message === 'Endpoint already exists') {
                return res.status(409).json({ error: error.message });
            }
            
            if (error.message.startsWith('Validation failed:')) {
                return res.status(400).json({ error: error.message });
            }

            res.status(500).json({ error: 'Failed to create endpoint' });
        }
    }

    async updateEndpoint(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const endpoint = await endpointService.updateEndpoint(parseInt(id, 10), updateData);
            res.json(endpoint);
        } catch (error) {
            console.error('Error in updateEndpoint:', error);
            
            if (error.message === 'Endpoint not found') {
                return res.status(404).json({ error: error.message });
            }
            
            if (error.message.startsWith('Validation failed:')) {
                return res.status(400).json({ error: error.message });
            }

            res.status(500).json({ error: 'Failed to update endpoint' });
        }
    }

    async deleteEndpoint(req, res) {
        try {
            const { path } = req.params;
            const result = await endpointService.deleteEndpoint(path);
            res.json(result);
        } catch (error) {
            console.error('Error in deleteEndpoint:', error);
            
            if (error.message === 'Endpoint not found') {
                return res.status(404).json({ error: error.message });
            }

            res.status(500).json({ error: 'Failed to delete endpoint' });
        }
    }

    async checkEndpointExists(req, res) {
        try {
            const { path } = req.params;
            const exists = await endpointService.endpointExists(path);
            res.json({ exists });
        } catch (error) {
            console.error('Error in checkEndpointExists:', error);
            res.status(500).json({ error: 'Failed to check endpoint existence' });
        }
    }
}

module.exports = new EndpointController();