const express = require('express');
const { predictClipPriority, listAiPredictions, checkAiHealth } = require('../controllers/aiController');

const router = express.Router();

router.get('/', (req, res) => {
	res.json({ message: 'RailClip service routes ready.' });
});

router.get('/health', checkAiHealth);
router.get('/predictions', listAiPredictions);
router.post('/predict', predictClipPriority);

module.exports = router;


