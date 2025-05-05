import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

const AdminRoute = () => {
  const { user, loading } = useAuth()
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

  if (!user || user.username !== 'ClashOfCode') {
    showToast('You need admin privileges to access this page', 'error')
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default AdminRoute