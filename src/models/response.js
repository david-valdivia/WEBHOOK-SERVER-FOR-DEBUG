class Response {
    constructor(data) {
        this.id = data.id;
        this.endpointId = data.endpoint_id;
        this.responseType = data.response_type || 'custom';
        this.statusCode = data.status_code || 200;
        this.contentType = data.content_type || 'application/json';
        this.body = data.body;
        this.delay = data.delay || 0;
        this.targetUrl = data.target_url;
        this.preserveHeaders = data.preserve_headers !== undefined ? Boolean(data.preserve_headers) : true;
    }

    static fromDatabase(row) {
        return new Response(row);
    }

    toJSON() {
        return {
            id: this.id,
            endpointId: this.endpointId,
            responseType: this.responseType,
            statusCode: this.statusCode,
            contentType: this.contentType,
            body: this.body,
            delay: this.delay,
            targetUrl: this.targetUrl,
            preserveHeaders: this.preserveHeaders
        };
    }

    toDatabaseFormat() {
        return {
            endpoint_id: this.endpointId,
            response_type: this.responseType,
            status_code: this.statusCode,
            content_type: this.contentType,
            body: this.body,
            delay: this.delay,
            target_url: this.targetUrl,
            preserve_headers: this.preserveHeaders
        };
    }

    static validate(data) {
        const errors = [];

        if (data.response_type && !['custom', 'jumper'].includes(data.response_type)) {
            errors.push('Response type must be either "custom" or "jumper"');
        }

        if (data.status_code && (data.status_code < 100 || data.status_code > 599)) {
            errors.push('Status code must be between 100 and 599');
        }

        if (data.delay && (data.delay < 0 || data.delay > 10000)) {
            errors.push('Delay must be between 0 and 10000 milliseconds');
        }

        if (data.response_type === 'jumper') {
            if (!data.target_url) {
                errors.push('Target URL is required for jumper response type');
            } else if (!data.target_url.startsWith('http')) {
                errors.push('Target URL must be a valid HTTP/HTTPS URL');
            }
        }

        if (data.content_type === 'application/json' && data.body && data.response_type === 'custom') {
            try {
                JSON.parse(data.body);
            } catch (e) {
                errors.push('Response body must be valid JSON when content type is application/json');
            }
        }

        return errors;
    }

    static createDefault(endpointId) {
        return new Response({
            endpoint_id: endpointId,
            response_type: 'custom',
            status_code: 200,
            content_type: 'application/json',
            body: JSON.stringify({ message: 'OK' }),
            delay: 0,
            target_url: null,
            preserve_headers: true
        });
    }
}

module.exports = Response;