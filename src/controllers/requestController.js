const requestService = require('../services/requestService');

class RequestController {
    async getAllRequests(req, res) {
        try {
            const requests = await requestService.getAllRequests();
            res.json(requests);
        } catch (error) {
            console.error('Error in getAllRequests:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch requests' });
        }
    }

    async getRequestsByEndpoint(req, res) {
        try {
            const { path } = req.params;
            const requests = await requestService.getRequestsByEndpointPath(path);
            res.json(requests);
        } catch (error) {
            console.error('Error in getRequestsByEndpoint:', error);
            
            if (error.message === 'Endpoint not found') {
                return res.status(404).json({ error: error.message });
            }

            res.status(500).json({ error: 'Failed to fetch requests' });
        }
    }

    async deleteRequest(req, res) {
        try {
            const { path, id } = req.params;
            const requestId = parseInt(id, 10);
            
            if (isNaN(requestId)) {
                return res.status(400).json({ error: 'Invalid request ID' });
            }

            const result = await requestService.deleteRequest(path, requestId);
            res.json(result);
        } catch (error) {
            console.error('Error in deleteRequest:', error);
            
            if (error.message === 'Endpoint not found' || error.message === 'Request not found') {
                return res.status(404).json({ error: error.message });
            }

            res.status(500).json({ error: 'Failed to delete request' });
        }
    }

    async deleteAllRequestsForEndpoint(req, res) {
        try {
            const { path } = req.params;
            const result = await requestService.deleteAllRequestsForEndpoint(path);
            res.json(result);
        } catch (error) {
            console.error('Error in deleteAllRequestsForEndpoint:', error);
            
            if (error.message === 'Endpoint not found') {
                return res.status(404).json({ error: error.message });
            }

            res.status(500).json({ error: 'Failed to delete requests' });
        }
    }

    async getRequestCount(req, res) {
        try {
            const { path } = req.params;
            const count = await requestService.getRequestCountForEndpoint(path);
            res.json({ count });
        } catch (error) {
            console.error('Error in getRequestCount:', error);
            res.status(500).json({ error: 'Failed to get request count' });
        }
    }
}

module.exports = new RequestController();