import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:4000/api'
})

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})