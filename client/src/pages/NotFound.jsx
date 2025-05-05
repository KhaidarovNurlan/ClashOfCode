import React from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-800 rounded-full">
            <Search size={40} className="text-blue-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-slate-400 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/" className="btn btn-primary">
            Go to Homepage
          </Link>
          <Link to="/courses" className="btn btn-outline">
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound