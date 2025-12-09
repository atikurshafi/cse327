const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.get('/', scheduleController.getAllSchedules);
router.get('/check-conflicts', scheduleController.checkConflicts);
router.get('/by-instructor/:id', scheduleController.getSchedulesByInstructor);
router.get('/by-room/:id', scheduleController.getSchedulesByRoom);
router.get('/by-timeslot/:code', scheduleController.getSchedulesByTimeslot);
router.get('/:id', scheduleController.getScheduleById);
router.post('/', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;

