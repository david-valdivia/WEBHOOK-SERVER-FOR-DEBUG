const Response = require('../models/response');
const responseRepository = require('../repositories/responseRepository');
const endpointRepository = require('../repositories/endpointRepository');

class ResponseService {
    async getResponseConfigForEndpoint(endpointPath) {
        try {
            const endpoint = await endpointRepository.findByPath(endpointPath);
            if (!endpoint) {
                throw new Error('Endpoint not found');
            }

            const response = await responseRepository.findByEndpointId(endpoint.id);
            if (!response) {
                const defaultResponse = Response.createDefault(endpoint.id);
                const created = await responseRepository.create(defaultResponse);
                return created.toJSON();
            }

            return response.toJSON();
        } catch (error) {
            if (error.message === 'Endpoint not found') {
                throw error;
            }
            console.error('Error fetching response config:', error);
            throw new Error('Failed to fetch response configuration');
        }
    }

    async updateResponseConfigForEndpoint(endpointPath, configData) {
        const validationErrors = Response.validate(configData);
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }

        try {
            const endpoint = await endpointRepository.findByPath(endpointPath);
            if (!endpoint) {
                throw new Error('Endpoint not found');
            }

            const updatedResponse = await responseRepository.update(endpoint.id, configData);
            if (!updatedResponse) {
                const newResponse = new Response({
                    endpoint_id: endpoint.id,
                    ...configData
                });
                const created = await responseRepository.create(newResponse);
                return created.toJSON();
            }

            return updatedResponse.toJSON();
        } catch (error) {
            if (error.message === 'Endpoint not found') {
                throw error;
            }
            console.error('Error updating response config:', error);
            throw new Error('Failed to update response configuration');
        }
    }

    async executeResponse(endpointPath) {
        try {
            const endpoint = await endpointRepository.findByPath(endpointPath);
            if (!endpoint) {
                throw new Error('Endpoint not found');
            }

            const responseConfig = await responseRepository.findByEndpointId(endpoint.id);
            if (!responseConfig) {
                return Response.createDefault(endpoint.id);
            }

            if (responseConfig.delay > 0) {
                await new Promise(resolve => setTimeout(resolve, responseConfig.delay));
            }

            return responseConfig;
        } catch (error) {
            if (error.message === 'Endpoint not found') {
                throw error;
            }
            console.error('Error executing response:', error);
            throw new Error('Failed to execute response');
        }
    }

    async createDefaultResponseForEndpoint(endpointId) {
        try {
            const defaultResponse = Response.createDefault(endpointId);
            const created = await responseRepository.create(defaultResponse);
            return created.toJSON();
        } catch (error) {
            console.error('Error creating default response:', error);
            throw new Error('Failed to create default response');
        }
    }
}

module.exports = new ResponseService();