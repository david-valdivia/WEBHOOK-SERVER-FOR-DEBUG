const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    
    if (req.query && Object.keys(req.query).length > 0) {
        console.log('Query params:', JSON.stringify(req.query, null, 2));
    }

    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
        
        if (res.statusCode >= 400) {
            console.log('Error response:', data);
        }
        
        originalSend.call(this, data);
    };

    next();
};

const apiRequestLogger = (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        requestLogger(req, res, next);
    } else {
        next();
    }
};

module.exports = {
    requestLogger,
    apiRequestLogger
};