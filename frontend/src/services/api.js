import axios from 'axios'
const api = axios.create({ baseURL: '/api/v1', headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('rms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login' }
  return Promise.reject(err)
})
export default api
export const authAPI = {
  login: d => api.post('/auth/login', d),
  register: d => api.post('/auth/register', d),
}
export const menuAPI = {
  getCategories: () => api.get('/menu/categories'),
  createCategory: d => api.post('/menu/categories', d),
  updateCategory: (id, d) => api.put(`/menu/categories/${id}`, d),
  deleteCategory: id => api.delete(`/menu/categories/${id}`),
  getItems: params => api.get('/menu/items', { params }),
  getItem: id => api.get(`/menu/items/${id}`),
  createItem: d => api.post('/menu/items', d),
  updateItem: (id, d) => api.put(`/menu/items/${id}`, d),
  toggleAvailability: id => api.patch(`/menu/items/${id}/availability`),
  deleteItem: id => api.delete(`/menu/items/${id}`),
}
export const orderAPI = {
  create: d => api.post('/orders', d),
  getAll: params => api.get('/orders', { params }),
  getMy: () => api.get('/orders/my'),
  getById: id => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, null, { params: { status } }),
  cancel: id => api.delete(`/orders/${id}`),
}
export const tableAPI = {
  getAll: () => api.get('/tables'),
  getAvailable: () => api.get('/tables/available'),
  create: d => api.post('/tables', d),
  update: (id, d) => api.put(`/tables/${id}`, d),
  updateStatus: (id, status) => api.patch(`/tables/${id}/status`, null, { params: { status } }),
  delete: id => api.delete(`/tables/${id}`),
}
export const paymentAPI = {
  process: d => api.post('/payments', d),
  getByOrder: id => api.get(`/payments/order/${id}`),
}
export const reservationAPI = {
  create: d => api.post('/reservations', d),
  getAll: () => api.get('/reservations'),
  getMy: () => api.get('/reservations/my'),
  updateStatus: (id, status) => api.patch(`/reservations/${id}/status`, null, { params: { status } }),
  cancel: id => api.delete(`/reservations/${id}`),
}
export const userAPI = {
  getAll: () => api.get('/users'),
  getProfile: () => api.get('/users/profile'),
  toggleStatus: id => api.patch(`/users/${id}/toggle-status`),
}
export const reportAPI = {
  getRevenue: (start, end) => api.get('/reports/revenue', { params: { start, end } }),
  getTopItems: () => api.get('/reports/top-items'),
  getOccupancy: () => api.get('/reports/table-occupancy'),
}
export const chatAPI = {
  getMessages: (orderId) => api.get(`/chat/order/${orderId}`),
  sendMessage: (orderId, message) => api.post(`/chat/order/${orderId}`, { message }),
  getUnread: (orderId) => api.get(`/chat/unread/order/${orderId}`),
}
