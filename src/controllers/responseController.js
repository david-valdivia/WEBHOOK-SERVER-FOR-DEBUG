const responseService = require('../services/responseService');

class ResponseController {
    async getResponseConfig(req, res) {
        try {
            const { path } = req.params;
            const responseConfig = await responseService.getResponseConfigForEndpoint(path);
            res.json(responseConfig);
        } catch (error) {
            console.error('Error in getResponseConfig:', error);
            
            if (error.message === 'Endpoint not found') {
                return res.status(404).json({ error: error.message });
            }

            res.status(500).json({ error: 'Failed to fetch response configuration' });
        }
    }

    async updateResponseConfig(req, res) {
        try {
            const { path } = req.params;
            const { 
                response_type, 
                status_code, 
                content_type, 
                body, 
                delay, 
                target_url, 
                preserve_headers 
            } = req.body;

            const configData = {
                response_type: response_type || 'custom',
                status_code: parseInt(status_code, 10) || 200,
                content_type: content_type || 'application/json',
                body: body || '',
                delay: parseInt(delay, 10) || 0,
                target_url: target_url || null,
                preserve_headers: preserve_headers !== undefined ? Boolean(preserve_headers) : true
            };

            // Validate jumper configuration
            if (configData.response_type === 'jumper') {
                if (!configData.target_url || !configData.target_url.startsWith('http')) {
                    return res.status(400).json({ 
                        error: 'Validation failed: target_url is required for jumper response type and must be a valid URL' 
                    });
                }
            }

            const updatedConfig = await responseService.updateResponseConfigForEndpoint(path, configData);
            res.json(updatedConfig);
        } catch (error) {
            console.error('Error in updateResponseConfig:', error);
            
            if (error.message === 'Endpoint not found') {
                return res.status(404).json({ error: error.message });
            }
            
            if (error.message.startsWith('Validation failed:')) {
                return res.status(400).json({ error: error.message });
            }

            res.status(500).json({ error: 'Failed to update response configuration' });
        }
    }
}

module.exports = new ResponseController();