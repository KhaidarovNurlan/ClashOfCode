import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Courses from './pages/courses/Courses'
import CourseDetail from './pages/courses/CourseDetail'
import Tournaments from './pages/tournaments/Tournaments'
import TournamentDetail from './pages/tournaments/TournamentDetail'
import CreateCourse from './pages/teacher/CreateCourse'
import CreateTournament from './pages/teacher/CreateTournament'
import AdminPanel from './pages/admin/AdminPanel'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/auth/ProtectedRoute'
import TeacherRoute from './components/auth/TeacherRoute'
import AdminRoute from './components/auth/AdminRoute'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-4xl font-bold mb-4 text-blue-500">Clash Of Code</div>
          <div className="text-slate-400">Loading awesome coding challenges...</div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="tournaments" element={<Tournaments />} />
          <Route path="tournaments/:id" element={<TournamentDetail />} />
          
          {/* Teacher-only routes */}
          <Route element={<TeacherRoute />}>
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="create-tournament" element={<CreateTournament />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminPanel />} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App