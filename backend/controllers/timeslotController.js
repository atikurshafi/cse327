const Timeslot = require('../models/Timeslot');

// Get all timeslots
exports.getAllTimeslots = async (req, res) => {
  try {
    const timeslots = await Timeslot.find().sort({ code: 1 });
    res.json(timeslots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get timeslot by ID
exports.getTimeslotById = async (req, res) => {
  try {
    const timeslot = await Timeslot.findById(req.params.id);
    if (!timeslot) {
      return res.status(404).json({ error: 'Timeslot not found' });
    }
    res.json(timeslot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get timeslot by code
exports.getTimeslotByCode = async (req, res) => {
  try {
    const timeslot = await Timeslot.findOne({ code: req.params.code.toUpperCase() });
    if (!timeslot) {
      return res.status(404).json({ error: 'Timeslot not found' });
    }
    res.json(timeslot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new timeslot
exports.createTimeslot = async (req, res) => {
  try {
    const { code, dayPattern, startTime, endTime } = req.body;
    const timeslot = new Timeslot({ code, dayPattern, startTime, endTime });
    await timeslot.save();
    res.status(201).json(timeslot);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Timeslot code already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Update timeslot
exports.updateTimeslot = async (req, res) => {
  try {
    const { code, dayPattern, startTime, endTime } = req.body;
    const timeslot = await Timeslot.findByIdAndUpdate(
      req.params.id,
      { code, dayPattern, startTime, endTime },
      { new: true, runValidators: true }
    );
    if (!timeslot) {
      return res.status(404).json({ error: 'Timeslot not found' });
    }
    res.json(timeslot);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Timeslot code already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Delete timeslot
exports.deleteTimeslot = async (req, res) => {
  try {
    const timeslot = await Timeslot.findByIdAndDelete(req.params.id);
    if (!timeslot) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Timeslot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

