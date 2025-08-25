const express = require('express');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

router.all('/:path', (req, res) => webhookController.handleDynamicWebhook(req, res));

module.exports = router;