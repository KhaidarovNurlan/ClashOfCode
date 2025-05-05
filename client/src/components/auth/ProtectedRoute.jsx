import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

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

  if (!user) {
    // Redirect to login page and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If they are authenticated, render the protected route
  return <Outlet />
}

export default ProtectedRoute