const axios = require('axios');
const requestService = require('../services/requestService');
const responseService = require('../services/responseService');

class WebhookController {
    async handleDynamicWebhook(req, res) {
        try {
            const { path } = req.params;

            // Get response configuration first
            const responseConfig = await responseService.executeResponse(path);
            
            let responseDetails = null;
            let finalResponse = {
                statusCode: responseConfig.statusCode,
                contentType: responseConfig.contentType,
                body: responseConfig.body
            };

            if (responseConfig.responseType === 'jumper') {
                // Handle jumper (proxy) mode
                const proxyResult = await this.handleJumperRequest(req, responseConfig);
                responseDetails = proxyResult.details;
                finalResponse = proxyResult.response;
            } else {
                // Handle custom response mode
                responseDetails = {
                    statusCode: responseConfig.statusCode,
                    contentType: responseConfig.contentType,
                    body: responseConfig.body
                };
            }

            // Save request with response details
            const savedRequest = await requestService.createRequestWithResponse(
                req, 
                path, 
                responseConfig.responseType,
                responseDetails
            );

            // Send the final response
            res.status(finalResponse.statusCode)
                .type(finalResponse.contentType)
                .send(finalResponse.body);

        } catch (error) {
            console.error('Error in handleDynamicWebhook:', error);
            
            if (error.message === 'Endpoint not found') {
                return res.status(404).json({ error: 'Endpoint not found' });
            }

            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async handleJumperRequest(req, responseConfig) {
        const targetUrl = responseConfig.targetUrl;
        
        try {
            // Prepare headers
            let headers = { ...req.headers };
            
            // Remove headers that shouldn't be forwarded
            delete headers.host;
            delete headers['content-length'];
            
            if (!responseConfig.preserveHeaders) {
                headers = {
                    'content-type': headers['content-type'],
                    'user-agent': 'Webhook-Jumper-Proxy/1.0'
                };
            }

            // Make the proxy request
            const proxyResponse = await axios({
                method: req.method,
                url: targetUrl,
                headers: headers,
                params: req.query,
                data: req.body,
                timeout: 30000, // 30 second timeout
                validateStatus: () => true // Accept all status codes
            });

            const responseDetails = {
                targetUrl: targetUrl,
                proxySuccess: true,
                targetStatusCode: proxyResponse.status,
                targetContentType: proxyResponse.headers['content-type'] || 'unknown',
                targetResponseBody: typeof proxyResponse.data === 'object' ? 
                    JSON.stringify(proxyResponse.data) : String(proxyResponse.data)
            };

            // Return the target's response as our response
            const finalResponse = {
                statusCode: proxyResponse.status,
                contentType: proxyResponse.headers['content-type'] || 'application/json',
                body: typeof proxyResponse.data === 'object' ? 
                    JSON.stringify(proxyResponse.data) : proxyResponse.data
            };

            return { details: responseDetails, response: finalResponse };

        } catch (error) {
            console.error('Jumper request failed:', error);

            const responseDetails = {
                targetUrl: targetUrl,
                proxySuccess: false,
                proxyError: error.message || 'Unknown error occurred'
            };

            // Return error response
            const finalResponse = {
                statusCode: 502,
                contentType: 'application/json',
                body: JSON.stringify({ 
                    error: 'Proxy request failed', 
                    details: error.message 
                })
            };

            return { details: responseDetails, response: finalResponse };
        }
    }
}

module.exports = new WebhookController();