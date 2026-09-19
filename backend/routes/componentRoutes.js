const express = require('express');
const { createBatch, listBatches, listClips } = require('../controllers/componentController');

const router = express.Router();

router.get('/batches', listBatches);
router.post('/batches', createBatch);
router.get('/clips', listClips);
router.get('/', listClips);

module.exports = router;
