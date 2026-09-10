const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
	res.json({ message: 'AI route is ready.' });
});

module.exports = router;
