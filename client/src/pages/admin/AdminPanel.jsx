import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/constants'
import { useToast } from '../../contexts/ToastContext'
import { AlertCircle } from 'lucide-react'

const AdminPanel = () => {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [coursesDeleted, setCoursesDeleted] = useState(false)
  const [tournamentsDeleted, setTournamentsDeleted] = useState(false)

  const handleDeleteCourses = async () => {
    if (!window.confirm('Are you sure you want to delete all courses? This action cannot be undone!')) {
      return
    }

    try {
      await axios.post(`${API_URL}/admin/delete-courses`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setCoursesDeleted(true)
      showToast('All courses have been deleted', 'success')
    } catch (error) {
      console.error('Error deleting courses:', error)
      showToast('Failed to delete courses', 'error')
    }
  }

  const handleDeleteTournaments = async () => {
    if (!window.confirm('Are you sure you want to delete all tournaments? This action cannot be undone!')) {
      return
    }

    try {
      await axios.post(`${API_URL}/admin/delete-tournaments`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setTournamentsDeleted(true)
      showToast('All tournaments have been deleted', 'success')
    } catch (error) {
      console.error('Error deleting tournaments:', error)
      showToast('Failed to delete tournaments', 'error')
    }
  }

  const handleDeleteUsers = async () => {
    if (!coursesDeleted || !tournamentsDeleted) {
      showToast('You must delete all courses and tournaments first', 'error')
      return
    }

    if (!window.confirm('Are you sure you want to delete all users? This action cannot be undone!')) {
      return
    }

    try {
      await axios.post(`${API_URL}/admin/delete-users`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      showToast('All users have been deleted', 'success')
      localStorage.removeItem('token')
      navigate('/login')
    } catch (error) {
      console.error('Error deleting users:', error)
      showToast('Failed to delete users', 'error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
        <div className="px-2 py-1 bg-red-500/20 text-red-400 text-sm rounded">
          Danger Zone
        </div>
      </div>

      <div className="card p-6 space-y-8">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Delete All Courses</h2>
              <p className="text-slate-400 mt-1">
                This will permanently delete all courses and related data
              </p>
            </div>
            <button
              onClick={handleDeleteCourses}
              disabled={coursesDeleted}
              className="btn btn-danger"
            >
              {coursesDeleted ? 'Deleted' : 'Delete Courses'}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Delete All Tournaments</h2>
              <p className="text-slate-400 mt-1">
                This will permanently delete all tournaments and related data
              </p>
            </div>
            <button
              onClick={handleDeleteTournaments}
              disabled={tournamentsDeleted}
              className="btn btn-danger"
            >
              {tournamentsDeleted ? 'Deleted' : 'Delete Tournaments'}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Delete All Users</h2>
              <p className="text-slate-400 mt-1">
                This will permanently delete all user accounts
              </p>
              {(!coursesDeleted || !tournamentsDeleted) && (
                <p className="text-sm text-red-500 flex items-center mt-2">
                  <AlertCircle size={14} className="mr-1" />
                  You must delete all courses and tournaments first
                </p>
              )}
            </div>
            <button
              onClick={handleDeleteUsers}
              disabled={!coursesDeleted || !tournamentsDeleted}
              className="btn btn-danger"
            >
              Delete Users
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel