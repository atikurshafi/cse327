import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionsAPI, coursesAPI } from '../api/api';
import DeleteModal from '../components/DeleteModal';

function SectionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [formData, setFormData] = useState({ courseId: '', sectionNumber: '' });
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: () => sectionsAPI.getAll().then(res => res.data)
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.getAll().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => sectionsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sections']);
      setIsModalOpen(false);
      setFormData({ courseId: '', sectionNumber: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sectionsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sections']);
      setIsModalOpen(false);
      setSelectedSection(null);
      setFormData({ courseId: '', sectionNumber: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => sectionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['sections']);
      setIsDeleteModalOpen(false);
      setSelectedSection(null);
    }
  });

  const handleOpenModal = (section = null) => {
    if (section) {
      setSelectedSection(section);
      setFormData({ courseId: section.courseId._id, sectionNumber: section.sectionNumber });
    } else {
      setSelectedSection(null);
      setFormData({ courseId: '', sectionNumber: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSection) {
      updateMutation.mutate({ id: selectedSection._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (section) => {
    setSelectedSection(section);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSection) {
      deleteMutation.mutate(selectedSection._id);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sections</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
        >
          Add Section
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sections.map((section) => (
              <tr key={section._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {section.courseId?.code} - {section.courseId?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{section.sectionNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(section)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(section)}
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
              {selectedSection ? 'Edit Section' : 'Add Section'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Course</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Section Number</label>
                <input
                  type="text"
                  value={formData.sectionNumber}
                  onChange={(e) => setFormData({ ...formData, sectionNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
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
                  {selectedSection ? 'Update' : 'Create'}
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
        title="Delete Section"
        message={`Are you sure you want to delete section ${selectedSection?.sectionNumber}?`}
      />
    </div>
  );
}

export default SectionsPage;

