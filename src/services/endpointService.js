const Endpoint = require('../models/endpoint');
const Response = require('../models/response');
const endpointRepository = require('../repositories/endpointRepository');
const responseRepository = require('../repositories/responseRepository');
const socketService = require('./socketService');

class EndpointService {
    async getAllEndpoints() {
        try {
            const endpoints = await endpointRepository.findAll();
            return endpoints.map(endpoint => endpoint.toJSON());
        } catch (error) {
            console.error('Error fetching endpoints:', error);
            throw new Error('Failed to fetch endpoints');
        }
    }

    async getEndpointByPath(path) {
        try {
            const endpoint = await endpointRepository.findByPath(path);
            return endpoint ? endpoint.toJSON() : null;
        } catch (error) {
            console.error('Error fetching endpoint by path:', error);
            throw new Error('Failed to fetch endpoint');
        }
    }

    async createEndpoint(endpointData) {
        const validationErrors = Endpoint.validate(endpointData);
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }

        const sanitizedPath = Endpoint.sanitizePath(endpointData.path);

        try {
            const existsAlready = await endpointRepository.exists(sanitizedPath);
            if (existsAlready) {
                throw new Error('Endpoint already exists');
            }

            const endpoint = await endpointRepository.create({ path: sanitizedPath });
            
            const defaultResponse = Response.createDefault(endpoint.id);
            await responseRepository.create(defaultResponse);

            socketService.notifyEndpointCreated(endpoint.toJSON());

            return endpoint.toJSON();
        } catch (error) {
            if (error.message === 'Endpoint already exists') {
                throw error;
            }
            console.error('Error creating endpoint:', error);
            throw new Error('Failed to create endpoint');
        }
    }

    async deleteEndpoint(path) {
        try {
            const endpoint = await endpointRepository.findByPath(path);
            if (!endpoint) {
                throw new Error('Endpoint not found');
            }

            const deleted = await endpointRepository.deleteByPath(path);
            if (!deleted) {
                throw new Error('Failed to delete endpoint');
            }

            socketService.notifyEndpointDeleted({ path });

            return { message: 'Endpoint deleted successfully' };
        } catch (error) {
            if (error.message === 'Endpoint not found') {
                throw error;
            }
            console.error('Error deleting endpoint:', error);
            throw new Error('Failed to delete endpoint');
        }
    }

    async updateEndpoint(id, updateData) {
        const validationErrors = Endpoint.validate(updateData);
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }

        try {
            const updatedEndpoint = await endpointRepository.update(id, updateData);
            if (!updatedEndpoint) {
                throw new Error('Endpoint not found');
            }

            return updatedEndpoint.toJSON();
        } catch (error) {
            console.error('Error updating endpoint:', error);
            throw new Error('Failed to update endpoint');
        }
    }

    async endpointExists(path) {
        try {
            return await endpointRepository.exists(path);
        } catch (error) {
            console.error('Error checking endpoint existence:', error);
            return false;
        }
    }
}

module.exports = new EndpointService();