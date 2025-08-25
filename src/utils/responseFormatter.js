class ResponseFormatter {
    static success(data, message = 'Success') {
        return {
            success: true,
            message,
            data
        };
    }

    static error(message, details = null) {
        const response = {
            success: false,
            error: message
        };

        if (details) {
            response.details = details;
        }

        return response;
    }

    static validationError(errors) {
        return {
            success: false,
            error: 'Validation failed',
            details: errors
        };
    }

    static notFound(resource = 'Resource') {
        return {
            success: false,
            error: `${resource} not found`
        };
    }

    static created(data, message = 'Created successfully') {
        return {
            success: true,
            message,
            data
        };
    }

    static updated(data, message = 'Updated successfully') {
        return {
            success: true,
            message,
            data
        };
    }

    static deleted(message = 'Deleted successfully') {
        return {
            success: true,
            message
        };
    }

    static formatEndpoint(endpoint) {
        return {
            id: endpoint.id,
            path: endpoint.path,
            createdAt: endpoint.createdAt,
            requestCount: endpoint.requestCount || 0
        };
    }

    static formatRequest(request) {
        return {
            id: request.id,
            method: request.method,
            headers: request.headers,
            queryParams: request.queryParams,
            body: request.body,
            timestamp: request.timestamp
        };
    }

    static formatResponseConfig(config) {
        return {
            statusCode: config.statusCode,
            contentType: config.contentType,
            body: config.body,
            delay: config.delay
        };
    }

    static paginate(data, page, limit, total) {
        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }
}

module.exports = ResponseFormatter;