class Endpoint {
    constructor(data) {
        this.id = data.id;
        this.path = data.path;
        this.createdAt = data.created_at;
        this.requestCount = data.request_count || 0;
    }

    static fromDatabase(row) {
        return new Endpoint(row);
    }

    toJSON() {
        return {
            id: this.id,
            path: this.path,
            createdAt: this.createdAt,
            requestCount: this.requestCount
        };
    }

    static validate(data) {
        const errors = [];

        if (!data.path || typeof data.path !== 'string') {
            errors.push('Path is required and must be a string');
        }

        if (data.path && data.path.trim() === '') {
            errors.push('Path cannot be empty');
        }

        return errors;
    }

    static sanitizePath(path) {
        return path.trim().replace(/^\/+/, '');
    }
}

module.exports = Endpoint;