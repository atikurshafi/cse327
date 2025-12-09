import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleAPI, coursesAPI, sectionsAPI, instructorsAPI, roomsAPI, timeslotsAPI } from '../api/api';

function AddSchedulePage() {
  const [formData, setFormData] = useState({
    courseId: '',
    sectionId: '',
    instructorId: '',
    roomId: '',
    timeslotId: ''
  });
  const [conflicts, setConflicts] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.getAll().then(res => res.data)
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', formData.courseId],
    queryFn: () => sectionsAPI.getByCourse(formData.courseId).then(res => res.data),
    enabled: !!formData.courseId
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => instructorsAPI.getAll().then(res => res.data)
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsAPI.getAll().then(res => res.data)
  });

  const { data: timeslots = [] } = useQuery({
    queryKey: ['timeslots'],
    queryFn: () => timeslotsAPI.getAll().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => scheduleAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      setFormData({ courseId: '', sectionId: '', instructorId: '', roomId: '', timeslotId: '' });
      setConflicts([]);
      alert('Schedule created successfully!');
    },
    onError: (error) => {
      if (error.response?.data?.conflicts) {
        setConflicts(error.response.data.conflicts);
      } else {
        alert(error.response?.data?.error || 'Failed to create schedule');
      }
    }
  });

  const checkConflictsMutation = useMutation({
    mutationFn: (data) => scheduleAPI.checkConflicts(data),
    onSuccess: (response) => {
      setConflicts(response.data.conflicts || []);
      setIsChecking(false);
    },
    onError: () => {
      setIsChecking(false);
    }
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (field === 'courseId') {
      setFormData(prev => ({ ...prev, courseId: value, sectionId: '' }));
    }
    setConflicts([]);
  };

  const handleCheckConflicts = async () => {
    if (!formData.courseId || !formData.sectionId || !formData.instructorId || !formData.roomId || !formData.timeslotId) {
      alert('Please fill all fields before checking conflicts');
      return;
    }
    setIsChecking(true);
    checkConflictsMutation.mutate(formData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (conflicts.length > 0) {
      alert('Please resolve conflicts before creating schedule');
      return;
    }
    createMutation.mutate(formData);
  };

  // Filter rooms based on course type
  const filteredRooms = formData.courseId
    ? rooms.filter(room => {
        const course = courses.find(c => c._id === formData.courseId);
        return course && room.type === course.type;
      })
    : rooms;

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Schedule</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Schedule Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => handleChange('courseId', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name} ({course.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <select
                value={formData.sectionId}
                onChange={(e) => handleChange('sectionId', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={!formData.courseId}
              >
                <option value="">Select a section</option>
                {sections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.sectionNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
              <select
                value={formData.instructorId}
                onChange={(e) => handleChange('instructorId', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select an instructor</option>
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name} ({instructor.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
              <select
                value={formData.roomId}
                onChange={(e) => handleChange('roomId', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select a room</option>
                {filteredRooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.roomNumber} (Capacity: {room.capacity}, Type: {room.type})
                  </option>
                ))}
              </select>
              {formData.courseId && filteredRooms.length === 0 && (
                <p className="mt-1 text-sm text-red-600">No {courses.find(c => c._id === formData.courseId)?.type} rooms available</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeslot</label>
              <select
                value={formData.timeslotId}
                onChange={(e) => handleChange('timeslotId', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select a timeslot</option>
                {timeslots.map((timeslot) => (
                  <option key={timeslot._id} value={timeslot._id}>
                    {timeslot.code} - {timeslot.dayPattern} ({timeslot.startTime} - {timeslot.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCheckConflicts}
                disabled={isChecking || !formData.courseId || !formData.sectionId || !formData.instructorId || !formData.roomId || !formData.timeslotId}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isChecking ? 'Checking...' : 'Check Conflicts'}
              </button>
              <button
                type="submit"
                disabled={conflicts.length > 0}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Schedule
              </button>
            </div>
          </form>
        </div>

        {/* Conflicts Display */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Conflict Detection</h2>
          {conflicts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No conflicts detected. Click "Check Conflicts" to validate the schedule.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.map((conflict, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{conflict.type}</h3>
                      <p className="mt-1 text-sm text-red-700">{conflict.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddSchedulePage;

