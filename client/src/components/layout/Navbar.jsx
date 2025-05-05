import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Code, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout, isTeacher } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Handle scroll event to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  const navLinks = [
    { name: 'Home', path: '/', public: true },
    { name: 'Courses', path: '/courses', protected: true },
    { name: 'Tournaments', path: '/tournaments', protected: true },
    { name: 'Dashboard', path: '/dashboard', protected: true },
  ]

  const teacherLinks = [
    { name: 'Create Course', path: '/create-course' },
    { name: 'Create Tournament', path: '/create-tournament' },
  ]

  const adminLinks = user?.username === 'ClashOfCode' ? [
    { name: 'Admin Panel', path: '/admin' }
  ] : []

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-900 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4 md:space-x-10">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link to="/" className="flex items-center">
              <Code size={28} className="text-blue-500 mr-2" />
              <span className="text-xl font-bold">Clash Of Code</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-500 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop navbar links */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              // Skip protected links if user is not logged in
              if (link.protected && !user) return null
              // Show public links or links appropriate for logged-in users
              if (link.public || user) {
                return (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    className={`text-sm font-medium transition-colors duration-200 hover:text-blue-500 ${
                      location.pathname === link.path ? 'text-blue-500' : 'text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              }
              return null
            })}

            {/* Teacher-only links */}
            {isTeacher && teacherLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 hover:text-blue-500 ${
                  location.pathname === link.path ? 'text-blue-500' : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Admin-only links */}
            {adminLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 hover:text-blue-500 ${
                  location.pathname === link.path ? 'text-blue-500' : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Login/Logout buttons */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            {user ? (
              <button
                onClick={handleLogout}
                className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="whitespace-nowrap text-sm font-medium text-white hover:text-blue-500"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800 border-t border-slate-700">
          {navLinks.map((link) => {
            // Skip protected links if user is not logged in
            if (link.protected && !user) return null
            // Show public links or links appropriate for logged-in users
            if (link.public || user) {
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'text-blue-500 bg-slate-700'
                      : 'text-white hover:bg-slate-700'
                  }`}
                >
                  {link.name}
                </Link>
              )
            }
            return null
          })}

          {/* Teacher-only links */}
          {isTeacher && teacherLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'text-blue-500 bg-slate-700'
                  : 'text-white hover:bg-slate-700'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Admin-only links */}
          {adminLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'text-blue-500 bg-slate-700'
                  : 'text-white hover:bg-slate-700'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile login/logout */}
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-slate-700"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-slate-700"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 mt-2"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar