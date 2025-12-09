const Room = require('../models/Room');

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new room
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, capacity, type } = req.body;
    const room = new Room({ roomNumber, capacity, type });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Room number already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, capacity, type } = req.body;
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { roomNumber, capacity, type },
      { new: true, runValidators: true }
    );
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Room number already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

