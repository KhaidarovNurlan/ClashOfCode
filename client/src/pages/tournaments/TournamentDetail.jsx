import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/constants'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Trophy, Clock, Users, Play, CheckCircle, XCircle } from 'lucide-react'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import JSConfetti from 'js-confetti'

const TournamentDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [tournament, setTournament] = useState(null)
  const [currentLevel, setCurrentLevel] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [code, setCode] = useState('')
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const editorRef = useRef()
  const confettiRef = useRef(null)
  const timerRef = useRef(null)

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }

    return () => clearInterval(timerRef.current)
  }, [isTimerRunning])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    confettiRef.current = new JSConfetti()
    fetchTournamentDetails()
  }, [id])

  const fetchTournamentDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/tournaments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      const { tournament, leaderboard, nextLevelNumber } = response.data
      
      setTournament(tournament)
      setLeaderboard(leaderboard)
      
      if (tournament.levels.length > 0) {
        const nextLevel = tournament.levels.find(l => l.level_number === nextLevelNumber) ||
                         tournament.levels[0]
        
        if (!currentLevel || currentLevel.level_number !== nextLevel.level_number) {
          setCurrentLevel(nextLevel)
          setCode('')
          setResults(null)
        }
      }
      
      if (tournament.languages.length > 0 && !selectedLanguage) {
        setSelectedLanguage(tournament.languages[0].code)
      }

      // Start timer if tournament is active and not completed
      if (!tournament.completed) {
        setIsTimerRunning(true)
      }
    } catch (error) {
      console.error('Error fetching tournament details:', error)
      showToast('Failed to load tournament details', 'error')
    }
  }

  useEffect(() => {
    if (currentLevel && selectedLanguage) {
      initializeEditor()
    }
  }, [currentLevel, selectedLanguage])

  const initializeEditor = () => {
    if (editorRef.current) {
      editorRef.current.destroy()
    }

    // Создаем кастомное расширение для блокировки копирования/вставки
    const disableCopyPaste = EditorView.domEventHandlers({
      paste(event) {
        event.preventDefault();
        showToast('Pasting is disabled in this editor', 'warning');
      },
      copy(event) {
        event.preventDefault();
        showToast('Copying is disabled in this editor', 'warning');
      },
      cut(event) {
        event.preventDefault();
        showToast('Cutting is disabled in this editor', 'warning');
      }
    });

    const languageSupport = {
      javascript: javascript(),
      python: python()
    }

    editorRef.current = new EditorView({
      doc: code || '',
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        languageSupport[selectedLanguage] || javascript(),
        oneDark,
        disableCopyPaste,
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            setCode(update.state.doc.toString())
          }
        })
      ],
      parent: document.getElementById('code-editor')
    })
  }

  const handleSubmit = async () => {
    if (!code.trim()) {
      showToast('Please write some code first', 'error')
      return
    }
  
    setRunning(true)
    setResults(null)
  
    try {
      const response = await axios.post(
        `${API_URL}/tournaments/${id}/submit`,
        {
          level_id: currentLevel.level_number,
          code,
          languageCode: selectedLanguage,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      )
  
      setResults(response.data)
  
      if (response.data.passed) {
        confettiRef.current.addConfetti()
        showToast('Level completed successfully! 🎉', 'success')

        if (response.data.tournament_completed) {
          confettiRef.current.addConfetti({
            emojis: ['🏆', '🎉', '⭐'],
            emojiSize: 50,
            confettiNumber: 100
          })
          showToast('Congratulations! You\'ve completed the tournament! 🏆', 'success')
          // Save completion time
          await axios.post(`${API_URL}/tournaments/${id}/complete`, {
            completion_time: elapsedTime
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        }
        
        setCode('')
        setResults(null)
        await fetchTournamentDetails()
        
        if (editorRef.current) {
          editorRef.current.destroy()
          initializeEditor()
        }
      } else {
        showToast('Your solution didn\'t pass all tests. Try again!', 'error')
      }
    } catch (error) {
      console.error('Error submitting solution:', error)
      showToast(
        error.response?.data?.message || 'Failed to submit solution',
        'error'
      )
    } finally {
      setRunning(false)
    }
  }
  
  if (!tournament || !currentLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-4xl font-bold mb-4 text-blue-500">Loading Tournament</div>
          <div className="text-slate-400">Preparing the competition...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <div className="bg-slate-800 rounded-lg p-8 mb-8">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-4">{tournament.title}</h1>
            <p className="text-slate-400 mb-6">{tournament.description}</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-slate-300">
                <Users size={20} className="mr-2" />
                <span>{leaderboard.length} participants</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Trophy size={20} className="mr-2" />
                <span>Level {currentLevel.level_number} of {tournament.levels.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Level {currentLevel.level_number}</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-400">Expected Output:</h3>
                  <pre className="mt-2 p-3 bg-slate-900 rounded-lg text-white font-mono">
                    {currentLevel.expected_output}
                  </pre>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400">Required Keywords:</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentLevel.required_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-700 rounded-lg text-sm text-white font-mono"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="form-input w-40"
              >
                {tournament.languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSubmit}
                disabled={running}
                className="btn btn-primary"
              >
                {running ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Play size={16} className="mr-2" />
                    Run Code
                  </span>
                )}
              </button>
            </div>
            <div id="code-editor" className="h-96 overflow-auto"></div>
          </div>

          {results && (
            <div className="card">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">Results</h3>
              </div>
              <div className="p-4">
                <div className={`p-4 rounded-lg ${
                  results.passed ? 'bg-green-900/20' : 'bg-red-900/20'
                }`}>
                  <div className="flex items-center">
                    {results.passed ? (
                      <CheckCircle size={20} className="text-green-500 mr-2" />
                    ) : (
                      <XCircle size={20} className="text-red-500 mr-2" />
                    )}
                    <span className="font-medium text-white">
                      {results.passed ? 'All tests passed!' : 'Some tests failed'}
                    </span>
                  </div>
                  {results.output && (
                    <div className="mt-4">
                      <p className="text-slate-400 mb-2">Your Output:</p>
                      <pre className="bg-slate-800 p-3 rounded-lg text-white font-mono">
                        {results.output}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="card">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock size={20} />
                Your Time
              </h2>
            </div>
            <div className="p-6">
              <div className="text-3xl font-mono font-bold text-center text-blue-400">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-xs text-slate-400 text-center mt-2">
                {isTimerRunning ? 'Timer is running...' : 'Timer paused'}
              </div>
            </div>
          </div>
          <div className="card sticky top-8">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Leaderboard</h2>
            </div>
            <div className="p-4">
              {leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className={`p-4 rounded-lg ${
                        entry.user_id === user?.id ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-amber-500' :
                          index === 1 ? 'bg-slate-400' :
                          index === 2 ? 'bg-amber-800' :
                          'bg-slate-600'
                        } text-white font-bold mr-3`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">
                              {entry.username}
                            </span>
                            <span className="text-blue-500 font-medium">
                              {formatTime(entry.completion_time)}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400 mt-1">
                            {entry.completed_levels} levels completed
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy size={40} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-400">No participants yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TournamentDetail