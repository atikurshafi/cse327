import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorsAPI } from '../api/api';
import DeleteModal from '../components/DeleteModal';

function InstructorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', availability: '' });
  const queryClient = useQueryClient();

  const { data: instructors = [], isLoading } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => instructorsAPI.getAll().then(res => res.data),
    select: (data) => data.filter(instructor => instructor.type !== 'CLUB')
  });

  const createMutation = useMutation({
    mutationFn: (data) => instructorsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['instructors']);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', availability: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => instructorsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['instructors']);
      setIsModalOpen(false);
      setSelectedInstructor(null);
      setFormData({ name: '', email: '', availability: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => instructorsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['instructors']);
      setIsDeleteModalOpen(false);
      setSelectedInstructor(null);
    }
  });

  const handleOpenModal = (instructor = null) => {
    if (instructor) {
      setSelectedInstructor(instructor);
      setFormData({ name: instructor.name, email: instructor.email, availability: instructor.availability || '' });
    } else {
      setSelectedInstructor(null);
      setFormData({ name: '', email: '', availability: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedInstructor) {
      updateMutation.mutate({ id: selectedInstructor._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (instructor) => {
    setSelectedInstructor(instructor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedInstructor) {
      deleteMutation.mutate(selectedInstructor._id);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Instructors</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
        >
          Add Instructor
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {instructors.map((instructor) => (
              <tr key={instructor._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{instructor.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instructor.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instructor.availability || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(instructor)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(instructor)}
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
              {selectedInstructor ? 'Edit Instructor' : 'Add Instructor'}
            </h3>
            <form onSubmit={handleSubmit}>
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
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Availability (Optional)</label>
                <input
                  type="text"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., Mon-Fri 9AM-5PM"
                />
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
                  {selectedInstructor ? 'Update' : 'Create'}
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
        title="Delete Instructor"
        message={`Are you sure you want to delete instructor ${selectedInstructor?.name}?`}
      />
    </div>
  );
}

export default InstructorsPage;

