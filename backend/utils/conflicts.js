const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const Room = require('../models/Room');

/**
 * Conflict Detection Utility
 * 
 * This module implements all schedule conflict detection rules:
 * 1. Instructor cannot teach two classes in same timeslot
 * 2. Room cannot have two classes in same timeslot
 * 3. Lab course must be assigned to LAB room
 * 4. Duplicate schedule entry is not allowed (handled by unique index)
 */

/**
 * Check if instructor has a conflict in the same timeslot
 * @param {ObjectId} instructorId - The instructor ID
 * @param {ObjectId} timeslotId - The timeslot ID
 * @param {ObjectId} excludeScheduleId - Optional: exclude this schedule ID (for updates)
 * @returns {Promise<Object|null>} Conflict object or null
 */
async function checkInstructorConflict(instructorId, timeslotId, excludeScheduleId = null) {
  const query = {
    instructorId: instructorId,
    timeslotId: timeslotId
  };
  
  if (excludeScheduleId) {
    query._id = { $ne: excludeScheduleId };
  }
  
  const conflict = await Schedule.findOne(query)
    .populate('courseId', 'code name')
    .populate('sectionId', 'sectionNumber')
    .populate('timeslotId', 'code dayPattern startTime endTime');
  
  if (conflict) {
    return {
      type: 'INSTRUCTOR_CONFLICT',
      message: `Instructor already has a class scheduled in timeslot ${conflict.timeslotId.code}`,
      conflictingSchedule: conflict
    };
  }
  
  return null;
}

/**
 * Check if room has a conflict in the same timeslot
 * @param {ObjectId} roomId - The room ID
 * @param {ObjectId} timeslotId - The timeslot ID
 * @param {ObjectId} excludeScheduleId - Optional: exclude this schedule ID (for updates)
 * @returns {Promise<Object|null>} Conflict object or null
 */
async function checkRoomConflict(roomId, timeslotId, excludeScheduleId = null) {
  const query = {
    roomId: roomId,
    timeslotId: timeslotId
  };
  
  if (excludeScheduleId) {
    query._id = { $ne: excludeScheduleId };
  }
  
  const conflict = await Schedule.findOne(query)
    .populate('courseId', 'code name')
    .populate('sectionId', 'sectionNumber')
    .populate('timeslotId', 'code dayPattern startTime endTime');
  
  if (conflict) {
    return {
      type: 'ROOM_CONFLICT',
      message: `Room already has a class scheduled in timeslot ${conflict.timeslotId.code}`,
      conflictingSchedule: conflict
    };
  }
  
  return null;
}

/**
 * Check if lab course is assigned to a LAB room
 * @param {ObjectId} courseId - The course ID
 * @param {ObjectId} roomId - The room ID
 * @returns {Promise<Object|null>} Conflict object or null
 */
async function checkLabRoomMatch(courseId, roomId) {
  const course = await Course.findById(courseId);
  const room = await Room.findById(roomId);
  
  if (!course || !room) {
    return {
      type: 'INVALID_DATA',
      message: 'Course or Room not found'
    };
  }
  
  if (course.type === 'LAB' && room.type !== 'LAB') {
    return {
      type: 'LAB_ROOM_MISMATCH',
      message: `Lab course ${course.code} must be assigned to a LAB room, but ${room.roomNumber} is a ${room.type} room`
    };
  }
  
  if (course.type === 'THEORY' && room.type !== 'THEORY') {
    return {
      type: 'THEORY_ROOM_MISMATCH',
      message: `Theory course ${course.code} must be assigned to a THEORY room, but ${room.roomNumber} is a ${room.type} room`
    };
  }
  
  return null;
}

/**
 * Check all conflicts for a schedule entry
 * @param {Object} scheduleData - Schedule data object
 * @param {ObjectId} excludeScheduleId - Optional: exclude this schedule ID (for updates)
 * @returns {Promise<Array>} Array of conflict objects
 */
async function checkAllConflicts(scheduleData, excludeScheduleId = null) {
  const conflicts = [];
  
  // Check instructor conflict
  const instructorConflict = await checkInstructorConflict(
    scheduleData.instructorId,
    scheduleData.timeslotId,
    excludeScheduleId
  );
  if (instructorConflict) {
    conflicts.push(instructorConflict);
  }
  
  // Check room conflict
  const roomConflict = await checkRoomConflict(
    scheduleData.roomId,
    scheduleData.timeslotId,
    excludeScheduleId
  );
  if (roomConflict) {
    conflicts.push(roomConflict);
  }
  
  // Check lab room match
  const labRoomConflict = await checkLabRoomMatch(
    scheduleData.courseId,
    scheduleData.roomId
  );
  if (labRoomConflict) {
    conflicts.push(labRoomConflict);
  }
  
  return conflicts;
}

module.exports = {
  checkInstructorConflict,
  checkRoomConflict,
  checkLabRoomMatch,
  checkAllConflicts
};

