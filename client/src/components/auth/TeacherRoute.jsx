import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

const TeacherRoute = () => {
  const { user, isTeacher, loading } = useAuth()
  const { showToast } = useToast()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-4xl font-bold mb-4 text-blue-500">Clash Of Code</div>
          <div className="text-slate-400">Loading authentication...</div>
        </div>
      </div>
    )
  }

  if (!user || !isTeacher) {
    // Show a toast notification
    showToast('You need teacher privileges to access this page', 'error')
    
    // Redirect to dashboard
    return <Navigate to="/dashboard" replace />
  }

  // If they are authenticated and have teacher role, render the protected route
  return <Outlet />
}

export default TeacherRoute