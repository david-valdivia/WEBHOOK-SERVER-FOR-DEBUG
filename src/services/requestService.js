const Request = require('../models/request');
const requestRepository = require('../repositories/requestRepository');
const endpointRepository = require('../repositories/endpointRepository');
const socketService = require('./socketService');

class RequestService {
    async getAllRequests() {
        try {
            const requests = await requestRepository.findAll();
            return requests.map(request => request.toJSON());
        } catch (error) {
            console.error('Error fetching requests:', error);
            throw new Error('Failed to fetch requests');
        }
    }

    async getRequestsByEndpointPath(path) {
        try {
            const endpoint = await endpointRepository.findByPath(path);
            if (!endpoint) {
                throw new Error('Endpoint not found');
            }

            const requests = await requestRepository.findByEndpointId(endpoint.id);
            return requests.map(request => request.toJSON());
        } catch (error) {
            if (error.message === 'Endpoint not found') {
                throw error;
            }
            console.error('Error fetching requests for endpoint:', error);
            throw new Error('Failed to fetch requests');
        }
    }

    async createRequest(httpRequest, endpointPath) {
        try {
            const endpoint = await endpointRepository.findByPath(endpointPath);
            if (!endpoint) {
                throw new Error('Endpoint not found');
            }

            const request = Request.fromHttpRequest(httpRequest, endpoint.id);
            const validationErrors = Request.validate(request.toDatabaseFormat());
            
            if (validationErrors.length > 0) {
                throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
            }

            const savedRequest = await requestRepository.create(request);
            
            socketService.notifyRequestReceived({
                path: endpointPath,
                request: savedRequest.toJSON()
            });

            return savedRequest.toJSON();
        } catch (error) {
            if (error.message === 'Endpoint not found') {
                throw error;
            }
            console.error('Error creating request:', error);
            throw new Error('Failed to save request');
        }
    }

    async createRequestWithResponse(httpRequest, endpointPath, responseType, responseDetails) {
        try {
            const endpoint = await endpointRepository.findByPath(endpointPath);
            if (!endpoint) {
                throw new Error('Endpoint not found');
            }

            const request = Request.fromHttpRequestWithResponse(httpRequest, endpoint.id, responseType, responseDetails);
            const validationErrors = Request.validate(request.toDatabaseFormat());
            
            if (validationErrors.length > 0) {
                throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
            }

            const savedRequest = await requestRepository.create(request);
            
            socketService.notifyRequestReceived({
                path: endpointPath,
                request: savedRequest.toJSON()
            });

            return savedRequest.toJSON();
        } catch (error) {
            if (error.message === 'Endpoint not found') {
                throw error;
            }
            console.error('Error creating request with response:', error);
            throw new Error('Failed to save request');
        }
    }

    async deleteRequest(endpointPath, requestId) {
        try {
            const endpoint = await endpointRepository.findByPath(endpointPath);
            if (!endpoint) {
                throw new Error('Endpoint not found');
            }

            const deleted = await requestRepository.deleteByEndpointIdAndRequestId(endpoint.id, requestId);
            if (!deleted) {
                throw new Error('Request not found');
            }

            return { message: 'Request deleted successfully' };
        } catch (error) {
            if (error.message === 'Endpoint not found' || error.message === 'Request not found') {
                throw error;
            }
            console.error('Error deleting request:', error);
            throw new Error('Failed to delete request');
        }
    }

    async deleteAllRequestsForEndpoint(endpointPath) {
        try {
            const endpoint = await endpointRepository.findByPath(endpointPath);
            if (!endpoint) {
                throw new Error('Endpoint not found');
            }

            const deletedCount = await requestRepository.deleteByEndpointId(endpoint.id);
            
            return { 
                message: 'All requests deleted successfully',
                deletedCount 
            };
        } catch (error) {
            if (error.message === 'Endpoint not found') {
                throw error;
            }
            console.error('Error deleting requests:', error);
            throw new Error('Failed to delete requests');
        }
    }

    async getRequestCountForEndpoint(endpointPath) {
        try {
            const endpoint = await endpointRepository.findByPath(endpointPath);
            if (!endpoint) {
                return 0;
            }

            return await requestRepository.countByEndpointId(endpoint.id);
        } catch (error) {
            console.error('Error counting requests:', error);
            return 0;
        }
    }
}

module.exports = new RequestService();