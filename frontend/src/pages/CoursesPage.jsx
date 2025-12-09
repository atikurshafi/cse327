import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesAPI } from '../api/api';
import DeleteModal from '../components/DeleteModal';

function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', type: 'THEORY' });
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.getAll().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => coursesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      setIsModalOpen(false);
      setFormData({ code: '', name: '', type: 'THEORY' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => coursesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      setIsModalOpen(false);
      setSelectedCourse(null);
      setFormData({ code: '', name: '', type: 'THEORY' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => coursesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      setIsDeleteModalOpen(false);
      setSelectedCourse(null);
    }
  });

  const handleOpenModal = (course = null) => {
    if (course) {
      setSelectedCourse(course);
      setFormData({ code: course.code, name: course.name, type: course.type });
    } else {
      setSelectedCourse(null);
      setFormData({ code: '', name: '', type: 'THEORY' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCourse) {
      updateMutation.mutate({ id: selectedCourse._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCourse) {
      deleteMutation.mutate(selectedCourse._id);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
        >
          Add Course
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 text-xs rounded-full ${course.type === 'LAB' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {course.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(course)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedCourse ? 'Edit Course' : 'Add Course'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="THEORY">THEORY</option>
                  <option value="LAB">LAB</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  {selectedCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Course"
        message={`Are you sure you want to delete course ${selectedCourse?.code}?`}
      />
    </div>
  );
}

export default CoursesPage;

