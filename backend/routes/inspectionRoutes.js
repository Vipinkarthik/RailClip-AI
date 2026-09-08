const express = require('express');
const { lookupComponent, createInspection, listInspections } = require('../controllers/inspectionController');

const router = express.Router();

router.post('/lookup', lookupComponent);
router.get('/lookup', lookupComponent);
router.post('/', createInspection);
router.get('/', listInspections);

module.exports = router;
