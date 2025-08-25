class Validator {
    static isValidHttpStatusCode(code) {
        return Number.isInteger(code) && code >= 100 && code <= 599;
    }

    static isValidDelay(delay) {
        return Number.isInteger(delay) && delay >= 0 && delay <= 10000;
    }

    static isValidJson(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    static isValidContentType(contentType) {
        const validTypes = [
            'application/json',
            'text/plain',
            'text/html',
            'application/xml',
            'application/x-www-form-urlencoded'
        ];
        return validTypes.includes(contentType);
    }

    static isValidPath(path) {
        if (!path || typeof path !== 'string') {
            return false;
        }
        
        const sanitized = path.trim();
        if (sanitized === '') {
            return false;
        }
        
        const invalidChars = /[<>:"\\|?*]/;
        return !invalidChars.test(sanitized);
    }

    static sanitizePathInput(path) {
        if (!path || typeof path !== 'string') {
            return '';
        }
        
        return path.trim().replace(/^\/+/, '').replace(/\/+$/, '');
    }

    static isValidHttpMethod(method) {
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
        return validMethods.includes(method.toUpperCase());
    }

    static validateEndpointData(data) {
        const errors = [];

        if (!data.path) {
            errors.push('Path is required');
        } else if (!this.isValidPath(data.path)) {
            errors.push('Invalid path format');
        }

        return errors;
    }

    static validateResponseConfig(data) {
        const errors = [];

        if (data.status_code !== undefined && !this.isValidHttpStatusCode(data.status_code)) {
            errors.push('Status code must be between 100 and 599');
        }

        if (data.delay !== undefined && !this.isValidDelay(data.delay)) {
            errors.push('Delay must be between 0 and 10000 milliseconds');
        }

        if (data.content_type && !this.isValidContentType(data.content_type)) {
            errors.push('Invalid content type');
        }

        if (data.content_type === 'application/json' && data.body && !this.isValidJson(data.body)) {
            errors.push('Body must be valid JSON when content type is application/json');
        }

        return errors;
    }
}

module.exports = Validator;