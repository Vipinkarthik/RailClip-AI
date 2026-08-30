const express = require('express');
const { createBatch, listBatches } = require('../controllers/componentController');

const router = express.Router();

router.get('/batches', listBatches);
router.post('/batches', createBatch);

module.exports = router;
