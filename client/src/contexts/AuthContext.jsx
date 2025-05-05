import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../utils/constants'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if the user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          // Set default headers for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Verify token and get user data
          const response = await axios.get(`${API_URL}/auth/me`)
          setUser(response.data)
        } catch (error) {
          console.error('Token verification failed', error)
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
        }
      }
      
      setLoading(false)
    }

    checkLoggedIn()
  }, [])

  // Register a new user
  const register = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData)
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      setUser(response.data.user)
    }
    
    return response.data
  }

  // Login a user
  const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      setUser(response.data.user)
    }
    
    return response.data
  }

  // Logout a user
  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  // Check if user is a teacher
  const isTeacher = user?.role === 'teacher'

  // Update user profile
  const updateProfile = async (userData) => {
    const response = await axios.put(`${API_URL}/users/profile`, userData)
    setUser(response.data)
    return response.data
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isTeacher,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}