import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/constants'
import { BookOpen, ChevronRight, Search, Filter } from 'lucide-react'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [totalCourses, setTotalCourses] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 9

  useEffect(() => {
    fetchCourses()
  }, [page, selectedLevel])

  const fetchCourses = async () => {
    try {
      const offset = (page - 1) * limit
      const response = await axios.get(`${API_URL}/courses`, {
        params: {
          level: selectedLevel,
          limit,
          offset
        }
      })
      setCourses(response.data.courses)
      setTotalCourses(response.data.total)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(totalCourses / limit)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-4xl font-bold mb-4 text-blue-500">Loading Courses</div>
          <div className="text-slate-400">Finding the best courses for you...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Programming Courses</h1>
          <p className="text-slate-400 mt-2">
            Learn programming through structured courses and hands-on practice
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/create-course" className="btn btn-primary">
            Create Course
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800 p-4 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 form-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-slate-400" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="form-input"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="card hover:border-blue-500 transition-colors duration-300"
            >
              <div className="aspect-video bg-slate-700 rounded-t-lg overflow-hidden">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={48} className="text-slate-500" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm px-2 py-1 rounded ${
                    course.level === 'Beginner' ? 'bg-green-900/30 text-green-400' :
                    course.level === 'Intermediate' ? 'bg-amber-900/30 text-amber-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {course.level}
                  </span>
                  <div className="flex items-center text-blue-500 text-sm">
                    View Course <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Courses Found</h3>
          <p className="text-slate-400">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`btn ${pageNum === page ? 'btn-primary' : 'btn-outline'}`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Courses