const express = require('express');
const endpointController = require('../controllers/endpointController');
const requestController = require('../controllers/requestController');
const responseController = require('../controllers/responseController');

const router = express.Router();

router.get('/endpoints', endpointController.getAllEndpoints);
router.post('/endpoints', endpointController.createEndpoint);
router.get('/endpoints/:path/exists', endpointController.checkEndpointExists);
router.delete('/endpoints/:path', endpointController.deleteEndpoint);
router.put('/endpoints/:id', endpointController.updateEndpoint);

router.get('/endpoints/:path/requests', requestController.getRequestsByEndpoint);
router.delete('/endpoints/:path/requests/:id', requestController.deleteRequest);
router.delete('/endpoints/:path/requests', requestController.deleteAllRequestsForEndpoint);
router.get('/endpoints/:path/requests/count', requestController.getRequestCount);

router.get('/endpoints/:path/response', responseController.getResponseConfig);
router.put('/endpoints/:path/response', responseController.updateResponseConfig);

router.get('/requests', requestController.getAllRequests);

module.exports = router;