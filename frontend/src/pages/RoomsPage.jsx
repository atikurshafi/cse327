import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsAPI } from '../api/api';
import DeleteModal from '../components/DeleteModal';

function RoomsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({ roomNumber: '', capacity: '', type: 'THEORY' });
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsAPI.getAll().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => roomsAPI.create({ ...data, capacity: parseInt(data.capacity) }),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      setIsModalOpen(false);
      setFormData({ roomNumber: '', capacity: '', type: 'THEORY' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => roomsAPI.update(id, { ...data, capacity: parseInt(data.capacity) }),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      setIsModalOpen(false);
      setSelectedRoom(null);
      setFormData({ roomNumber: '', capacity: '', type: 'THEORY' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roomsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      setIsDeleteModalOpen(false);
      setSelectedRoom(null);
    }
  });

  const handleOpenModal = (room = null) => {
    if (room) {
      setSelectedRoom(room);
      setFormData({ roomNumber: room.roomNumber, capacity: room.capacity.toString(), type: room.type });
    } else {
      setSelectedRoom(null);
      setFormData({ roomNumber: '', capacity: '', type: 'THEORY' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRoom) {
      updateMutation.mutate({ id: selectedRoom._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (room) => {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRoom) {
      deleteMutation.mutate(selectedRoom._id);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
        >
          Add Room
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr key={room._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.roomNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.capacity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 text-xs rounded-full ${room.type === 'LAB' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {room.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(room)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
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
              {selectedRoom ? 'Edit Room' : 'Add Room'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
                  {selectedRoom ? 'Update' : 'Create'}
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
        title="Delete Room"
        message={`Are you sure you want to delete room ${selectedRoom?.roomNumber}?`}
      />
    </div>
  );
}

export default RoomsPage;

