const errorHandler = (err, req, res, next) => {
    console.error('Error caught by middleware:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.message
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID format',
            details: err.message
        });
    }

    if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({
            error: 'Database constraint violation',
            details: 'Resource already exists or constraint failed'
        });
    }

    if (err.status) {
        return res.status(err.status).json({
            error: err.message || 'An error occurred'
        });
    }

    res.status(500).json({
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};