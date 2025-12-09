import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Courses API
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Sections API
export const sectionsAPI = {
  getAll: () => api.get('/sections'),
  getById: (id) => api.get(`/sections/${id}`),
  getByCourse: (courseId) => api.get(`/sections/course/${courseId}`),
  create: (data) => api.post('/sections', data),
  update: (id, data) => api.put(`/sections/${id}`, data),
  delete: (id) => api.delete(`/sections/${id}`),
};

// Instructors API
export const instructorsAPI = {
  getAll: () => api.get('/instructors'),
  getById: (id) => api.get(`/instructors/${id}`),
  create: (data) => api.post('/instructors', data),
  update: (id, data) => api.put(`/instructors/${id}`, data),
  delete: (id) => api.delete(`/instructors/${id}`),
};

// Rooms API
export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// Timeslots API
export const timeslotsAPI = {
  getAll: () => api.get('/timeslots'),
  getById: (id) => api.get(`/timeslots/${id}`),
  getByCode: (code) => api.get(`/timeslots/code/${code}`),
  create: (data) => api.post('/timeslots', data),
  update: (id, data) => api.put(`/timeslots/${id}`, data),
  delete: (id) => api.delete(`/timeslots/${id}`),
};

// Schedule API
export const scheduleAPI = {
  getAll: () => api.get('/schedule'),
  getById: (id) => api.get(`/schedule/${id}`),
  create: (data) => api.post('/schedule', data),
  update: (id, data) => api.put(`/schedule/${id}`, data),
  delete: (id) => api.delete(`/schedule/${id}`),
  checkConflicts: (data) => api.post('/schedule/check-conflicts', data),
  getByInstructor: (id) => api.get(`/schedule/by-instructor/${id}`),
  getByRoom: (id) => api.get(`/schedule/by-room/${id}`),
  getByTimeslot: (code) => api.get(`/schedule/by-timeslot/${code}`),
};

export default api;

