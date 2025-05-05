import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { AlertCircle } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '../utils/constants'

const Dashboard = () => {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.username || '')
  const [error, setError] = useState('')

  const handleUsernameChange = async (e) => {
    e.preventDefault()
    
    if (!newUsername.trim()) {
      setError('Username cannot be empty')
      return
    }

    try {
      const response = await axios.put(
        `${API_URL}/users/profile`,
        { username: newUsername },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      )
      
      await updateProfile(response.data)
      setIsEditing(false)
      showToast('Username updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating username:', error)
      setError(error.response?.data?.message || 'Failed to update username')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
      
      <div className="card p-6 space-y-6">
        <div>
          <label className="text-sm text-slate-400">Username</label>
          {isEditing ? (
            <form onSubmit={handleUsernameChange} className="mt-1 space-y-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value)
                  setError('')
                }}
                className="form-input"
                placeholder="Enter new username"
              />
              {error && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setNewUsername(user?.username || '')
                    setError('')
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p className="text-white text-lg">{user?.username}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline btn-sm"
              >
                Change
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-400">Role</label>
          <p className="text-white text-lg mt-1">{user?.role}</p>
        </div>

        <div>
          <label className="text-sm text-slate-400">Points</label>
          <p className="text-white text-lg mt-1">{user?.points || 0}</p>
        </div>

        <div>
          <label className="text-sm text-slate-400">Member Since</label>
          <p className="text-white text-lg mt-1">
            {new Date(user?.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard