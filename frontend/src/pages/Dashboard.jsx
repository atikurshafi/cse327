import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesAPI, sectionsAPI, instructorsAPI, roomsAPI, scheduleAPI } from '../api/api';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: () => coursesAPI.getAll().then(res => res.data) });
  const { data: sections } = useQuery({ queryKey: ['sections'], queryFn: () => sectionsAPI.getAll().then(res => res.data) });
  const { data: instructors } = useQuery({ queryKey: ['instructors'], queryFn: () => instructorsAPI.getAll().then(res => res.data) });
  const { data: rooms } = useQuery({ queryKey: ['rooms'], queryFn: () => roomsAPI.getAll().then(res => res.data) });
  const { data: schedules } = useQuery({ queryKey: ['schedules'], queryFn: () => scheduleAPI.getAll().then(res => res.data) });

  const stats = [
    { name: 'Total Courses', value: courses?.length || 0, link: '/courses', color: 'bg-blue-500' },
    { name: 'Total Sections', value: sections?.length || 0, link: '/sections', color: 'bg-green-500' },
    { name: 'Total Instructors', value: instructors?.length || 0, link: '/instructors', color: 'bg-purple-500' },
    { name: 'Total Rooms', value: rooms?.length || 0, link: '/rooms', color: 'bg-yellow-500' },
    { name: 'Scheduled Classes', value: schedules?.length || 0, link: '/schedule/view', color: 'bg-indigo-500' },
  ];

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of the Class Schedule Management System</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <dt>
              <div className={`absolute ${stat.color} rounded-md p-3`}>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/schedule/add"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Schedule</h3>
            <p className="text-gray-600">Create a new class schedule entry</p>
          </Link>
          <Link
            to="/schedule/view"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Schedule</h3>
            <p className="text-gray-600">View and filter class schedules</p>
          </Link>
          <Link
            to="/conflicts"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Conflicts</h3>
            <p className="text-gray-600">View schedule conflicts and warnings</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

