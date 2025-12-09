const Schedule = require('../models/Schedule');
const { checkAllConflicts } = require('../utils/conflicts');

// Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('courseId', 'code name type')
      .populate('sectionId', 'sectionNumber')
      .populate('instructorId', 'name email')
      .populate('roomId', 'roomNumber capacity type')
      .populate('timeslotId', 'code dayPattern startTime endTime')
      .sort({ 'timeslotId.code': 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('courseId', 'code name type')
      .populate('sectionId', 'sectionNumber')
      .populate('instructorId', 'name email')
      .populate('roomId', 'roomNumber capacity type')
      .populate('timeslotId', 'code dayPattern startTime endTime');
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new schedule
exports.createSchedule = async (req, res) => {
  try {
    const { courseId, sectionId, instructorId, roomId, timeslotId } = req.body;
    
    // Check for conflicts
    const conflicts = await checkAllConflicts({
      courseId,
      sectionId,
      instructorId,
      roomId,
      timeslotId
    });
    
    if (conflicts.length > 0) {
      return res.status(400).json({
        error: 'Schedule conflicts detected',
        conflicts: conflicts
      });
    }
    
    const schedule = new Schedule({
      courseId,
      sectionId,
      instructorId,
      roomId,
      timeslotId
    });
    
    await schedule.save();
    await schedule.populate('courseId', 'code name type');
    await schedule.populate('sectionId', 'sectionNumber');
    await schedule.populate('instructorId', 'name email');
    await schedule.populate('roomId', 'roomNumber capacity type');
    await schedule.populate('timeslotId', 'code dayPattern startTime endTime');
    
    res.status(201).json(schedule);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Duplicate schedule entry already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { courseId, sectionId, instructorId, roomId, timeslotId } = req.body;
    
    // Check for conflicts (excluding current schedule)
    const conflicts = await checkAllConflicts({
      courseId,
      sectionId,
      instructorId,
      roomId,
      timeslotId
    }, req.params.id);
    
    if (conflicts.length > 0) {
      return res.status(400).json({
        error: 'Schedule conflicts detected',
        conflicts: conflicts
      });
    }
    
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { courseId, sectionId, instructorId, roomId, timeslotId },
      { new: true, runValidators: true }
    )
      .populate('courseId', 'code name type')
      .populate('sectionId', 'sectionNumber')
      .populate('instructorId', 'name email')
      .populate('roomId', 'roomNumber capacity type')
      .populate('timeslotId', 'code dayPattern startTime endTime');
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json(schedule);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Duplicate schedule entry already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check conflicts for a schedule entry
exports.checkConflicts = async (req, res) => {
  try {
    const { courseId, sectionId, instructorId, roomId, timeslotId, excludeScheduleId } = req.body;
    
    const conflicts = await checkAllConflicts({
      courseId,
      sectionId,
      instructorId,
      roomId,
      timeslotId
    }, excludeScheduleId || null);
    
    res.json({
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedules by instructor
exports.getSchedulesByInstructor = async (req, res) => {
  try {
    const schedules = await Schedule.find({ instructorId: req.params.id })
      .populate('courseId', 'code name type')
      .populate('sectionId', 'sectionNumber')
      .populate('instructorId', 'name email')
      .populate('roomId', 'roomNumber capacity type')
      .populate('timeslotId', 'code dayPattern startTime endTime')
      .sort({ 'timeslotId.code': 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedules by room
exports.getSchedulesByRoom = async (req, res) => {
  try {
    const schedules = await Schedule.find({ roomId: req.params.id })
      .populate('courseId', 'code name type')
      .populate('sectionId', 'sectionNumber')
      .populate('instructorId', 'name email')
      .populate('roomId', 'roomNumber capacity type')
      .populate('timeslotId', 'code dayPattern startTime endTime')
      .sort({ 'timeslotId.code': 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedules by timeslot
exports.getSchedulesByTimeslot = async (req, res) => {
  try {
    const timeslot = await require('../models/Timeslot').findOne({ code: req.params.code.toUpperCase() });
    if (!timeslot) {
      return res.status(404).json({ error: 'Timeslot not found' });
    }
    
    const schedules = await Schedule.find({ timeslotId: timeslot._id })
      .populate('courseId', 'code name type')
      .populate('sectionId', 'sectionNumber')
      .populate('instructorId', 'name email')
      .populate('roomId', 'roomNumber capacity type')
      .populate('timeslotId', 'code dayPattern startTime endTime')
      .sort({ 'courseId.code': 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

