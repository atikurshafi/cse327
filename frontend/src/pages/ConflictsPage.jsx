import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { scheduleAPI } from '../api/api';

function ConflictsPage() {
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => scheduleAPI.getAll().then(res => res.data)
  });

  const [conflictChecks, setConflictChecks] = useState([]);

  const checkAllConflicts = async () => {
    const conflicts = [];

    // Instructor conflicts
    const instructorMap = new Map();
    schedules.forEach(schedule => {
      const key = `${schedule.instructorId?._id}-${schedule.timeslotId?._id}`;
      if (!instructorMap.has(key)) instructorMap.set(key, []);
      instructorMap.get(key).push(schedule);
    });
    instructorMap.forEach((list) => {
      if (list.length > 1) {
        conflicts.push({
          type: 'INSTRUCTOR_CONFLICT',
          message: `Instructor ${list[0].instructorId?.name} has ${list.length} classes in timeslot ${list[0].timeslotId?.code}`,
          schedules: list
        });
      }
    });

    // Room conflicts
    const roomMap = new Map();
    schedules.forEach(schedule => {
      const key = `${schedule.roomId?._id}-${schedule.timeslotId?._id}`;
      if (!roomMap.has(key)) roomMap.set(key, []);
      roomMap.get(key).push(schedule);
    });
    roomMap.forEach((list) => {
      if (list.length > 1) {
        conflicts.push({
          type: 'ROOM_CONFLICT',
          message: `Room ${list[0].roomId?.roomNumber} has ${list.length} classes in timeslot ${list[0].timeslotId?.code}`,
          schedules: list
        });
      }
    });

    // Lab/Theory mismatches
    schedules.forEach(schedule => {
      if (schedule.courseId?.type === 'LAB' && schedule.roomId?.type !== 'LAB') {
        conflicts.push({
          type: 'LAB_ROOM_MISMATCH',
          message: `Lab course ${schedule.courseId?.code} is assigned to ${schedule.roomId?.type} room ${schedule.roomId?.roomNumber}`,
          schedules: [schedule]
        });
      }
      if (schedule.courseId?.type === 'THEORY' && schedule.roomId?.type !== 'THEORY') {
        conflicts.push({
          type: 'THEORY_ROOM_MISMATCH',
          message: `Theory course ${schedule.courseId?.code} is assigned to ${schedule.roomId?.type} room ${schedule.roomId?.roomNumber}`,
          schedules: [schedule]
        });
      }
    });

    setConflictChecks(conflicts);
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Conflict Detection</h1>
        <button
          onClick={checkAllConflicts}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
        >
          Check All Conflicts
        </button>
      </div>

      {conflictChecks.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No conflicts detected. Click "Check All Conflicts" to scan the schedule.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conflictChecks.map((conflict, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-red-800">{conflict.type}</h3>
                  <p className="mt-1 text-sm text-red-700">{conflict.message}</p>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Affected Schedules:</h4>
                    <div className="bg-white rounded-md p-4">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timeslot</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {conflict.schedules.map((schedule) => (
                            <tr key={schedule._id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{schedule.courseId?.code}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{schedule.sectionId?.sectionNumber}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{schedule.instructorId?.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{schedule.roomId?.roomNumber}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{schedule.timeslotId?.code}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConflictsPage;

