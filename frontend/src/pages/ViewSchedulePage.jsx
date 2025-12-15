import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleAPI, instructorsAPI, roomsAPI, timeslotsAPI } from '../api/api';
import DeleteModal from '../components/DeleteModal';

function ViewSchedulePage() {
  const [filterType, setFilterType] = useState('all');
  const [subFilterType, setSubFilterType] = useState('room_only');
  const [filterValue, setFilterValue] = useState('');
  const [secondFilterValue, setSecondFilterValue] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => scheduleAPI.getAll().then(res => res.data)
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

  const deleteMutation = useMutation({
    mutationFn: (id) => scheduleAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      setIsDeleteModalOpen(false);
      setSelectedSchedule(null);
    }
  });

  const handleDelete = (schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSchedule) {
      deleteMutation.mutate(selectedSchedule._id);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (filterType === 'all') return true;
    if (filterType === 'instructor') {
      return schedule.instructorId?._id === filterValue;
    }
    if (filterType === 'room') {
      if (subFilterType === 'room_and_timeslot') {
        if (!filterValue || !secondFilterValue) return true; // Show all until fully selected (or maybe show nothing?) -> Let's show matching, if partially selected maybe just filter by what's there?
        // User requirement: "both(room number, and timeslot) will be required"
        // So if one is missing, maybe we shouldn't show anything or show everything?
        // Usually filtering implies "show matches". If I select Room X, I see Room X. If I select Room X AND Time Y, I see that intersection.
        if (filterValue && !secondFilterValue) return schedule.roomId?._id === filterValue;
        if (filterValue && secondFilterValue) {
          return schedule.roomId?._id === filterValue && schedule.timeslotId?._id === secondFilterValue;
        }
        return true;
      }
      return schedule.roomId?._id === filterValue;
    }
    if (filterType === 'timeslot') {
      return schedule.timeslotId?._id === filterValue;
    }
    return true;
  });

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">View Schedule</h1>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter By</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue('');
                setSubFilterType('room_only'); // Reset sub-filter
                setSecondFilterValue('');
              }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Schedules</option>
              <option value="instructor">By Instructor</option>
              <option value="room">By Room</option>
              <option value="timeslot">By Timeslot</option>
            </select>
          </div>

          {filterType === 'room' && (
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Filter Type</label>
                <select
                  value={subFilterType}
                  onChange={(e) => {
                    setSubFilterType(e.target.value);
                    // Keep room selection if possible, reset second value
                    setSecondFilterValue('');
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="room_only">By Room Number</option>
                  <option value="room_and_timeslot">Check Availability (Room + Timeslot)</option>
                </select>
              </div>
            </div>
          )}

          {filterType !== 'all' && (
            <div className={filterType === 'room' && subFilterType === 'room_and_timeslot' ? "col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4" : ""}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filterType === 'instructor' && "Select Instructor"}
                  {filterType === 'timeslot' && "Select Timeslot"}
                  {filterType === 'room' && "Select Room"}
                </label>
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select...</option>
                  {filterType === 'instructor' && instructors.map(instructor => (
                    <option key={instructor._id} value={instructor._id}>{instructor.name}</option>
                  ))}
                  {filterType === 'room' && rooms.map(room => (
                    <option key={room._id} value={room._id}>{room.roomNumber}</option>
                  ))}
                  {filterType === 'timeslot' && timeslots.map(timeslot => (
                    <option key={timeslot._id} value={timeslot._id}>{timeslot.code}</option>
                  ))}
                </select>
              </div>

              {filterType === 'room' && subFilterType === 'room_and_timeslot' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Timeslot</label>
                  <select
                    value={secondFilterValue}
                    onChange={(e) => setSecondFilterValue(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Timeslot...</option>
                    {timeslots.map(timeslot => (
                      <option key={timeslot._id} value={timeslot._id}>{timeslot.code} ({timeslot.dayPattern} {timeslot.startTime}-{timeslot.endTime})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeslot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No schedules found
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{schedule.courseId?.code}</div>
                      <div className="text-sm text-gray-500">{schedule.courseId?.name}</div>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${schedule.courseId?.type === 'LAB' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {schedule.courseId?.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schedule.sectionId?.sectionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{schedule.instructorId?.name}</div>
                      <div className="text-sm text-gray-500">{schedule.instructorId?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{schedule.roomId?.roomNumber}</div>
                      <div className="text-sm text-gray-500">Capacity: {schedule.roomId?.capacity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{schedule.timeslotId?.code}</div>
                      <div className="text-sm text-gray-500">{schedule.timeslotId?.dayPattern}</div>
                      <div className="text-sm text-gray-500">{schedule.timeslotId?.startTime} - {schedule.timeslotId?.endTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(schedule)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Schedule"
        message={`Are you sure you want to delete this schedule entry?`}
      />
    </div>
  );
}

export default ViewSchedulePage;






