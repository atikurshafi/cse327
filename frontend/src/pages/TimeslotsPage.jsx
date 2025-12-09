import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeslotsAPI } from '../api/api';
import DeleteModal from '../components/DeleteModal';

function TimeslotsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTimeslot, setSelectedTimeslot] = useState(null);
  const [formData, setFormData] = useState({ code: '', dayPattern: 'ST', startTime: '', endTime: '' });
  const queryClient = useQueryClient();

  const { data: timeslots = [], isLoading } = useQuery({
    queryKey: ['timeslots'],
    queryFn: () => timeslotsAPI.getAll().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => timeslotsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['timeslots']);
      setIsModalOpen(false);
      setFormData({ code: '', dayPattern: 'ST', startTime: '', endTime: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => timeslotsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['timeslots']);
      setIsModalOpen(false);
      setSelectedTimeslot(null);
      setFormData({ code: '', dayPattern: 'ST', startTime: '', endTime: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => timeslotsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['timeslots']);
      setIsDeleteModalOpen(false);
      setSelectedTimeslot(null);
    }
  });

  const handleOpenModal = (timeslot = null) => {
    if (timeslot) {
      setSelectedTimeslot(timeslot);
      setFormData({ code: timeslot.code, dayPattern: timeslot.dayPattern, startTime: timeslot.startTime, endTime: timeslot.endTime });
    } else {
      setSelectedTimeslot(null);
      setFormData({ code: '', dayPattern: 'ST', startTime: '', endTime: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTimeslot) {
      updateMutation.mutate({ id: selectedTimeslot._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (timeslot) => {
    setSelectedTimeslot(timeslot);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTimeslot) {
      deleteMutation.mutate(selectedTimeslot._id);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Timeslots</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
        >
          Add Timeslot
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day Pattern</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeslots.map((timeslot) => (
              <tr key={timeslot._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{timeslot.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {timeslot.dayPattern}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{timeslot.startTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{timeslot.endTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(timeslot)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(timeslot)}
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
              {selectedTimeslot ? 'Edit Timeslot' : 'Add Timeslot'}
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
                <label className="block text-sm font-medium text-gray-700">Day Pattern</label>
                <select
                  value={formData.dayPattern}
                  onChange={(e) => setFormData({ ...formData, dayPattern: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="ST">ST (Sunday + Tuesday)</option>
                  <option value="MW">MW (Monday + Wednesday)</option>
                  <option value="RA">RA (Thursday + Saturday)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
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
                  {selectedTimeslot ? 'Update' : 'Create'}
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
        title="Delete Timeslot"
        message={`Are you sure you want to delete timeslot ${selectedTimeslot?.code}?`}
      />
    </div>
  );
}

export default TimeslotsPage;

