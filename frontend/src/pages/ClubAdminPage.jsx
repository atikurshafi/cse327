import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesAPI, instructorsAPI, sectionsAPI } from '../api/api';
import { Link } from 'react-router-dom';
import DeleteModal from '../components/DeleteModal';

function ClubAdminPage() {
    const [activeTab, setActiveTab] = useState('clubs');
    const queryClient = useQueryClient();

    // --- CLUBS (Instructors) ---
    const [clubForm, setClubForm] = useState({ name: '', email: '' });
    const [editingClub, setEditingClub] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { data: instructors = [] } = useQuery({
        queryKey: ['instructors'],
        queryFn: () => instructorsAPI.getAll().then(res => res.data)
    });
    const clubs = instructors.filter(i => i.type === 'CLUB');

    const createClubMutation = useMutation({
        mutationFn: (data) => instructorsAPI.create({ ...data, type: 'CLUB' }),
        onSuccess: () => {
            queryClient.invalidateQueries(['instructors']);
            setClubForm({ name: '', email: '' });
            alert('Club added successfully!');
        },
        onError: (error) => {
            alert(error.response?.data?.error || 'Failed to add club');
        }
    });

    const updateClubMutation = useMutation({
        mutationFn: ({ id, data }) => instructorsAPI.update(id, { ...data, type: 'CLUB' }),
        onSuccess: () => {
            queryClient.invalidateQueries(['instructors']);
            setClubForm({ name: '', email: '' });
            setEditingClub(null);
            alert('Club updated successfully!');
        },
        onError: (error) => {
            alert(error.response?.data?.error || 'Failed to update club');
        }
    });

    const deleteClubMutation = useMutation({
        mutationFn: (id) => instructorsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['instructors']);
            setDeleteTarget(null);
            alert('Club deleted successfully!');
        },
        onError: (error) => {
            alert(error.response?.data?.error || 'Failed to delete club');
        }
    });

    const handleClubSubmit = (e) => {
        e.preventDefault();
        if (editingClub) {
            updateClubMutation.mutate({ id: editingClub._id, data: clubForm });
        } else {
            createClubMutation.mutate(clubForm);
        }
    };

    const startEditClub = (club) => {
        setEditingClub(club);
        setClubForm({ name: club.name, email: club.email });
    };

    const cancelEdit = () => {
        setEditingClub(null);
        setClubForm({ name: '', email: '' });
    };

    // --- ACTIVITIES (Courses) ---
    const [activityForm, setActivityForm] = useState({ code: '', name: '' });
    const { data: courses = [] } = useQuery({
        queryKey: ['courses'],
        queryFn: () => coursesAPI.getAll().then(res => res.data)
    });
    const clubActivities = courses.filter(c => c.type === 'CLUB');

    const createActivityMutation = useMutation({
        mutationFn: (data) => coursesAPI.create({ ...data, type: 'CLUB' }),
        onSuccess: (response) => {
            queryClient.invalidateQueries(['courses']);
            setActivityForm({ code: '', name: '' });

            // Auto-create a default session for this activity
            sectionsAPI.create({
                courseId: response.data._id,
                sectionNumber: 'Main Session'
            }).then(() => {
                queryClient.invalidateQueries(['sections']);
                alert('Activity type and default session added successfully!');
            }).catch(err => {
                console.error('Failed to create default session', err);
                alert('Activity added, but failed to create default session.');
            });
        },
        onError: (error) => {
            alert(error.response?.data?.error || 'Failed to add activity type');
        }
    });

    const handleActivitySubmit = (e) => {
        e.preventDefault();
        createActivityMutation.mutate(activityForm);
    };

    // --- SESSIONS (Sections) ---
    const [sessionForm, setSessionForm] = useState({ courseId: '', sectionNumber: '' });
    const { data: sections = [] } = useQuery({
        queryKey: ['sections'],
        queryFn: () => sectionsAPI.getAll().then(res => res.data)
    });
    const clubSessions = sections.filter(s => s.courseId && s.courseId.type === 'CLUB');

    const createSessionMutation = useMutation({
        mutationFn: (data) => sectionsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['sections']);
            setSessionForm({ courseId: '', sectionNumber: '' });
            alert('Session added successfully!');
        },
        onError: (error) => {
            alert(error.response?.data?.error || 'Failed to add session');
        }
    });

    const handleSessionSubmit = (e) => {
        e.preventDefault();
        createSessionMutation.mutate(sessionForm);
    };

    return (
        <div className="px-4 py-6">
            <div className="flex items-center mb-6">
                <Link to="/club-activities" className="text-orange-500 hover:text-orange-700 mr-4">
                    &larr; Back to Booking
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Club Administration</h1>
            </div>

            <p className="mb-6 text-gray-600">
                Use this page to register new Clubs, define Activity Types, and create Activity Sessions.
                Once created, these will be available for booking in the Club Activities page.
            </p>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'clubs'
                        ? 'border-b-2 border-orange-500 text-orange-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('clubs')}
                >
                    1. Manage Clubs
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'activities'
                        ? 'border-b-2 border-orange-500 text-orange-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('activities')}
                >
                    2. Manage Activities
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'sessions'
                        ? 'border-b-2 border-orange-500 text-orange-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('sessions')}
                >
                    3. Manage Sessions
                </button>
            </div>

            {/* Content */}
            <div className="bg-white shadow rounded-lg p-6">

                {/* CLUBS TAB */}
                {activeTab === 'clubs' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">{editingClub ? 'Edit Club' : 'Add New Club'}</h2>
                        <form onSubmit={handleClubSubmit} className="mb-8 p-4 bg-gray-50 rounded-md border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Club Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={clubForm.name}
                                        onChange={e => setClubForm({ ...clubForm, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="e.g. Robotics Club"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={clubForm.email}
                                        onChange={e => setClubForm({ ...clubForm, email: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="e.g. robotics@univ.edu"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    type="submit"
                                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                                >
                                    {editingClub ? 'Update Club' : 'Add Club'}
                                </button>
                                {editingClub && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>

                        <h3 className="text-lg font-medium mb-3">Existing Clubs</h3>
                        <ul className="divide-y divide-gray-200 border rounded-md">
                            {clubs.map(club => (
                                <li key={club._id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">{club.name}</p>
                                        <p className="text-sm text-gray-500">{club.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 h-fit">Club</span>
                                        <button
                                            onClick={() => startEditClub(club)}
                                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(club)}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {clubs.length === 0 && <li className="p-4 text-gray-500">No clubs found.</li>}
                        </ul>
                    </div>
                )}

                {/* ACTIVITIES TAB */}
                {activeTab === 'activities' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Add Activity Type</h2>
                        <form onSubmit={handleActivitySubmit} className="mb-8 p-4 bg-gray-50 rounded-md border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Activity Code (Unique)</label>
                                    <input
                                        type="text"
                                        required
                                        value={activityForm.code}
                                        onChange={e => setActivityForm({ ...activityForm, code: e.target.value.toUpperCase() })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="e.g. ROBO_WS"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Activity Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={activityForm.name}
                                        onChange={e => setActivityForm({ ...activityForm, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="e.g. Technical Workshop"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                            >
                                Add Activity Type
                            </button>
                        </form>

                        <h3 className="text-lg font-medium mb-3">Existing Activity Types</h3>
                        <ul className="divide-y divide-gray-200 border rounded-md">
                            {clubActivities.map(activity => (
                                <li key={activity._id} className="p-4 hover:bg-gray-50 flex justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{activity.code} - {activity.name}</p>
                                    </div>
                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 h-fit">CLUB Activity</span>
                                </li>
                            ))}
                            {clubActivities.length === 0 && <li className="p-4 text-gray-500">No activities found.</li>}
                        </ul>
                    </div>
                )}

                {/* SESSIONS TAB */}
                {activeTab === 'sessions' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Add Session / Group</h2>
                        <p className="text-sm text-gray-500 mb-4">Create a group or session for an activity if you need to schedule multiple instances.</p>
                        <form onSubmit={handleSessionSubmit} className="mb-8 p-4 bg-gray-50 rounded-md border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Activity Type</label>
                                    <select
                                        required
                                        value={sessionForm.courseId}
                                        onChange={e => setSessionForm({ ...sessionForm, courseId: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Activity</option>
                                        {clubActivities.map(c => (
                                            <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Session/Group Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={sessionForm.sectionNumber}
                                        onChange={e => setSessionForm({ ...sessionForm, sectionNumber: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="e.g. Group A"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                            >
                                Add Session
                            </button>
                        </form>

                        <h3 className="text-lg font-medium mb-3">Existing Sessions</h3>
                        <ul className="divide-y divide-gray-200 border rounded-md">
                            {clubSessions.map(session => (
                                <li key={session._id} className="p-4 hover:bg-gray-50">
                                    <p className="font-medium text-gray-900">
                                        {session.courseId?.name} ({session.courseId?.code})
                                    </p>
                                    <p className="text-sm text-gray-500">Session: {session.sectionNumber}</p>
                                </li>
                            ))}
                            {clubSessions.length === 0 && <li className="p-4 text-gray-500">No sessions found.</li>}
                        </ul>
                    </div>
                )}

            </div>

            <DeleteModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && deleteClubMutation.mutate(deleteTarget._id)}
                title="Delete Club"
                message={`Are you sure you want to delete club ${deleteTarget?.name}?`}
            />
        </div>
    );
}

export default ClubAdminPage;
