import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/constants'
import { Trophy, Clock, Users, ChevronRight, Filter } from 'lucide-react'

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming') // 'upcoming', 'active', 'past'
  const [totalTournaments, setTotalTournaments] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 9

  useEffect(() => {
    fetchTournaments()
  }, [filter, page])

  const fetchTournaments = async () => {
    try {
      const offset = (page - 1) * limit
      const response = await axios.get(`${API_URL}/tournaments`, {
        params: {
          status: filter,
          limit,
          offset
        }
      })
      setTournaments(response.data.tournaments)
      setTotalTournaments(response.data.total)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      setLoading(false)
    }
  }

  const calculateTimeRemaining = (startTime, endTime) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now < start) {
      const timeUntilStart = start - now
      const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      return `Starts in ${days}d ${hours}h`
    } else if (now < end) {
      const timeUntilEnd = end - now
      const hours = Math.floor(timeUntilEnd / (1000 * 60 * 60))
      const minutes = Math.floor((timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m remaining`
    } else {
      return 'Ended'
    }
  }

  const totalPages = Math.ceil(totalTournaments / limit)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-4xl font-bold mb-4 text-blue-500">Loading Tournaments</div>
          <div className="text-slate-400">Preparing the competition arena...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Coding Tournaments</h1>
          <p className="text-slate-400 mt-2">
            Compete with other programmers in real-time coding challenges
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/create-tournament" className="btn btn-primary">
            Create Tournament
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-4 rounded-lg mb-8">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input"
          >
            <option value="upcoming">Upcoming Tournaments</option>
            <option value="active">Active Tournaments</option>
            <option value="past">Past Tournaments</option>
          </select>
        </div>
      </div>

      {/* Tournament Grid */}
      {tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(tournament => (
            <Link
              key={tournament.id}
              to={`/tournaments/${tournament.id}`}
              className="card hover:border-blue-500 transition-colors duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{tournament.title}</h3>
                  <div className={`px-2 py-1 rounded text-sm ${
                    filter === 'upcoming' ? 'bg-blue-900/30 text-blue-400' :
                    filter === 'active' ? 'bg-green-900/30 text-green-400' :
                    'bg-slate-900/30 text-slate-400'
                  }`}>
                    {filter === 'upcoming' ? 'Upcoming' :
                     filter === 'active' ? 'Active' : 'Ended'}
                  </div>
                </div>
                
                <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                  {tournament.description}
                </p>

                <div className="space-y-3">

                  <div className="flex items-center text-slate-300">
                    <Users size={16} className="mr-2" />
                    <span>{tournament.participant_count} participants</span>
                  </div>

                  <div className="flex items-center text-slate-300">
                    <Trophy size={16} className="mr-2" />
                    <span>{tournament.challenge_count} challenges</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between">
                  <span className={`text-sm px-2 py-1 rounded ${
                    tournament.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400' :
                    tournament.difficulty === 'Medium' ? 'bg-amber-900/30 text-amber-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {tournament.difficulty}
                  </span>
                  <div className="flex items-center text-blue-500 text-sm">
                    View Details <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Tournaments Found</h3>
          <p className="text-slate-400">
            {filter === 'upcoming' ? 'No upcoming tournaments scheduled.' :
             filter === 'active' ? 'No tournaments currently active.' :
             'No past tournaments available.'}
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

export default Tournaments