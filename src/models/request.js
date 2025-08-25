class Request {
    constructor(data) {
        this.id = data.id;
        this.endpointId = data.endpoint_id;
        this.method = data.method;
        this.headers = typeof data.headers === 'string' ? JSON.parse(data.headers) : data.headers;
        this.queryParams = data.query_params ? 
            (typeof data.query_params === 'string' ? JSON.parse(data.query_params) : data.query_params) 
            : null;
        this.body = data.body ? 
            (typeof data.body === 'string' ? this.tryParseJSON(data.body) : data.body) 
            : null;
        this.responseType = data.response_type || 'custom';
        this.responseDetails = data.response_details ? 
            (typeof data.response_details === 'string' ? this.tryParseJSON(data.response_details) : data.response_details)
            : null;
        this.timestamp = data.timestamp;
    }

    static fromDatabase(row) {
        return new Request(row);
    }

    static fromHttpRequest(req, endpointId) {
        return new Request({
            endpoint_id: endpointId,
            method: req.method,
            headers: req.headers,
            query_params: req.query,
            body: req.body,
            response_type: 'custom',
            timestamp: new Date().toISOString()
        });
    }

    static fromHttpRequestWithResponse(req, endpointId, responseType, responseDetails) {
        return new Request({
            endpoint_id: endpointId,
            method: req.method,
            headers: req.headers,
            query_params: req.query,
            body: req.body,
            response_type: responseType,
            response_details: responseDetails,
            timestamp: new Date().toISOString()
        });
    }

    toJSON() {
        return {
            id: this.id,
            endpointId: this.endpointId,
            method: this.method,
            headers: this.headers,
            queryParams: this.queryParams,
            body: this.body,
            responseType: this.responseType,
            responseDetails: this.responseDetails,
            timestamp: this.timestamp
        };
    }

    toDatabaseFormat() {
        return {
            endpoint_id: this.endpointId,
            method: this.method,
            headers: JSON.stringify(this.headers),
            query_params: this.queryParams ? JSON.stringify(this.queryParams) : null,
            body: this.body ? JSON.stringify(this.body) : null,
            response_type: this.responseType,
            response_details: this.responseDetails ? JSON.stringify(this.responseDetails) : null
        };
    }

    tryParseJSON(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return str;
        }
    }

    static validate(data) {
        const errors = [];

        if (!data.method || typeof data.method !== 'string') {
            errors.push('Method is required and must be a string');
        }

        if (!data.endpoint_id || typeof data.endpoint_id !== 'number') {
            errors.push('Endpoint ID is required and must be a number');
        }

        return errors;
    }
}

module.exports = Request;