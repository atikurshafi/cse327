import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { scheduleAPI, coursesAPI, sectionsAPI, instructorsAPI, roomsAPI, timeslotsAPI } from '../api/api';

function ClubActivitiesPage() {
    const [formData, setFormData] = useState({
        courseId: '',
        sectionId: '', // Clubs might not need sections, but schema requires it? We can use a dummy one or handle it.
        // Actually, seed data didn't create Sections for Clubs. 
        // We might need to auto-create a default section for Clubs or make it optional.
        // For now, let's assume we need to handle "Section" logic.
        // Or better yet, automatically finding/creating a "Default" section for the selected Club Course.
        instructorId: '',
        roomId: '',
        timeslotId: ''
    });

    // Note: If Clubs don't have sections seeded, this will fail.
    // Strategy: In this specific page, we might need to be smart about sections.
    // Or, we should have seeded sections for the club courses.
    // I'll check if I seeded sections. I didn't explicitly seed sections for CLUB courses in seed.js.
    // I should probably fix seed.js to add default "Section 1" for club courses, OR update this page to handle it.
    // Let's assume I'll fix seed.js in a moment if needed. For now, let's write the page.

    const [conflicts, setConflicts] = useState([]);
    const [isChecking, setIsChecking] = useState(false);
    const queryClient = useQueryClient();

    const { data: courses = [] } = useQuery({
        queryKey: ['courses'],
        queryFn: () => coursesAPI.getAll().then(res => res.data)
    });

    // Filter for Club Activities
    const clubCourses = courses.filter(c => c.type === 'CLUB');

    const { data: sections = [] } = useQuery({
        queryKey: ['sections', formData.courseId],
        queryFn: () => sectionsAPI.getByCourse(formData.courseId).then(res => res.data),
        enabled: !!formData.courseId
    });

    const { data: instructors = [] } = useQuery({
        queryKey: ['instructors'],
        queryFn: () => instructorsAPI.getAll().then(res => res.data)
    });

    // Filter for Club Instructors (Club Names)
    const clubInstructors = instructors.filter(i => i.type === 'CLUB');

    const { data: rooms = [] } = useQuery({
        queryKey: ['rooms'],
        queryFn: () => roomsAPI.getAll().then(res => res.data)
    });

    const { data: timeslots = [] } = useQuery({
        queryKey: ['timeslots'],
        queryFn: () => timeslotsAPI.getAll().then(res => res.data)
    });

    // Filter for Evening Timeslots (>= 17:50)
    const clubTimeslots = timeslots.filter(t => t.startTime >= "17:50");

    const createMutation = useMutation({
        mutationFn: (data) => scheduleAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['schedules']);
            setFormData({ courseId: '', sectionId: '', instructorId: '', roomId: '', timeslotId: '' });
            setConflicts([]);
            alert('Club Activity scheduled successfully!');
        },
        onError: (error) => {
            if (error.response?.data?.conflicts) {
                setConflicts(error.response.data.conflicts);
            } else {
                alert(error.response?.data?.error || 'Failed to schedule activity');
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
            alert('Please resolve conflicts before scheduling');
            return;
        }
        createMutation.mutate(formData);
    };

    return (
        <div className="px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Club Activities</h1>
                <Link to="/club-admin" className="bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 border border-orange-200 flex items-center gap-2">
                    <span>⚙️</span> Manage Clubs & Activities
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Book a Room</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Club Name (Instructor) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Club Name</label>
                            <select
                                value={formData.instructorId}
                                onChange={(e) => handleChange('instructorId', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select a Club</option>
                                {clubInstructors.map((instructor) => (
                                    <option key={instructor._id} value={instructor._id}>
                                        {instructor.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Activity Type (Course) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                            <select
                                value={formData.courseId}
                                onChange={(e) => handleChange('courseId', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select Activity</option>
                                {clubCourses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.code} - {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Section - Needed for Schema, even if hidden or dummy */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Group/Session</label>
                            <select
                                value={formData.sectionId}
                                onChange={(e) => handleChange('sectionId', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                                disabled={!formData.courseId}
                            >
                                <option value="">Select Session</option>
                                {sections.map((section) => (
                                    <option key={section._id} value={section._id}>
                                        {section.sectionNumber}
                                    </option>
                                ))}
                            </select>
                            {formData.courseId && sections.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">No sessions found for this activity. Please verify sections exist.</p>
                            )}
                        </div>

                        {/* Room */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                            <select
                                value={formData.roomId}
                                onChange={(e) => handleChange('roomId', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select a room</option>
                                {rooms.map((room) => (
                                    <option key={room._id} value={room._id}>
                                        {room.roomNumber} (Capacity: {room.capacity})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Timeslot - Filtered for Evening */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Timeslot (Evening Only)</label>
                            <select
                                value={formData.timeslotId}
                                onChange={(e) => handleChange('timeslotId', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select a timeslot</option>
                                {clubTimeslots.map((timeslot) => (
                                    <option key={timeslot._id} value={timeslot._id}>
                                        {timeslot.code} - {timeslot.dayPattern} ({timeslot.startTime} - {timeslot.endTime})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Only timeslots after 5:50 PM are available for Club Activities.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleCheckConflicts}
                                disabled={isChecking || !formData.courseId || !formData.sectionId || !formData.instructorId || !formData.roomId || !formData.timeslotId}
                                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isChecking ? 'Checking...' : 'Check Ability'}
                            </button>
                            <button
                                type="submit"
                                disabled={conflicts.length > 0}
                                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Book Room
                            </button>
                        </div>
                    </form>
                </div>

                {/* Conflicts Display */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Availability Check</h2>
                    {conflicts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No conflicts detected. Proceed with booking.</p>
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

export default ClubActivitiesPage;
