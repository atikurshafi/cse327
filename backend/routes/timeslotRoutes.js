const express = require('express');
const router = express.Router();
const timeslotController = require('../controllers/timeslotController');

router.get('/', timeslotController.getAllTimeslots);
router.get('/code/:code', timeslotController.getTimeslotByCode);
router.get('/:id', timeslotController.getTimeslotById);
router.post('/', timeslotController.createTimeslot);
router.put('/:id', timeslotController.updateTimeslot);
router.delete('/:id', timeslotController.deleteTimeslot);

module.exports = router;

