const express = require('express');
const { createWorkerAccount, getMyWorkerProfile } = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', protect, createWorkerAccount);
router.get('/me', protect, getMyWorkerProfile);

module.exports = router;
