import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/constants'
import { useToast } from '../../contexts/ToastContext'
import { Trophy, Plus, AlertCircle, Code, Hash, Terminal } from 'lucide-react'

const CreateTournament = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [languages, setLanguages] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    max_participants: '',
    languages: [],
    levels: [
      {
        level_number: 1,
        expected_output: '',
        required_keywords: [],
        points: 100
      }
    ]
  })
  const [errors, setErrors] = useState({})
  const [newKeyword, setNewKeyword] = useState('')

  useEffect(() => {
    fetchLanguages()
  }, [])

  const fetchLanguages = async () => {
    
    try {
      const response = await axios.get(`${API_URL}/tournaments/languages`)
      setLanguages(response.data)
    } catch (error) {
      console.error('Error fetching languages:', error)
      showToast('Failed to load programming languages', 'error')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const handleLevelChange = (index, field, value) => {
    const newLevels = [...formData.levels]
    newLevels[index] = {
      ...newLevels[index],
      [field]: value
    }
    setFormData({
      ...formData,
      levels: newLevels
    })
  }

  const addLevel = () => {
    setFormData({
      ...formData,
      levels: [
        ...formData.levels,
        {
          level_number: formData.levels.length + 1,
          expected_output: '',
          required_keywords: [],
          points: 100
        }
      ]
    })
  }

  const removeLevel = (index) => {
    if (formData.levels.length > 1) {
      const newLevels = formData.levels.filter((_, i) => i !== index)
      newLevels.forEach((level, i) => {
        level.level_number = i + 1
      })
      setFormData({
        ...formData,
        levels: newLevels
      })
    }
  }

  const handleLanguageToggle = (languageCode) => {
    const newLanguages = formData.languages.includes(languageCode)
      ? formData.languages.filter(code => code !== languageCode)
      : [...formData.languages, languageCode]

    setFormData({
      ...formData,
      languages: newLanguages
    })
  }

  const addKeyword = (levelIndex) => {
    if (newKeyword.trim()) {
      const newLevels = [...formData.levels]
      newLevels[levelIndex].required_keywords = [
        ...newLevels[levelIndex].required_keywords,
        newKeyword.trim()
      ]
      setFormData({
        ...formData,
        levels: newLevels
      })
      setNewKeyword('')
    }
  }

  const removeKeyword = (levelIndex, keyword) => {
    const newLevels = [...formData.levels]
    newLevels[levelIndex].required_keywords = newLevels[levelIndex].required_keywords
      .filter(k => k !== keyword)
    setFormData({
      ...formData,
      levels: newLevels
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Difficulty level is required'
    }

    if (formData.max_participants && parseInt(formData.max_participants) < 2) {
      newErrors.max_participants = 'Must allow at least 2 participants'
    }

    if (formData.languages.length === 0) {
      newErrors.languages = 'Select at least one programming language'
    }

    formData.levels.forEach((level, index) => {
      if (!level.expected_output) {
        newErrors[`level_${index}_output`] = 'Expected output is required'
      }
      if (level.required_keywords.length === 0) {
        newErrors[`level_${index}_keywords`] = 'At least one keyword is required'
      }
      if (level.points < 0) {
        newErrors[`level_${index}_points`] = 'Points cannot be negative'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(
        `${API_URL}/tournaments`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      )

      showToast('Tournament created successfully!', 'success')
      navigate(`/tournaments/${response.data.tournamentId}`)
    } catch (error) {
      console.error('Error creating tournament:', error)
      showToast(
        error.response?.data?.message || 'Failed to create tournament',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create Tournament</h1>
        <p className="text-slate-400 mt-2">
          Set up a competitive coding tournament with multiple levels
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="form-label">
                  Tournament Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="e.g., Weekly Code Sprint"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`form-input ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Describe the tournament format and objectives..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="difficulty" className="form-label">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className={`form-input ${errors.difficulty ? 'border-red-500' : ''}`}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  {errors.difficulty && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.difficulty}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="max_participants" className="form-label">
                    Max Participants (optional)
                  </label>
                  <input
                    type="number"
                    id="max_participants"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleChange}
                    min="2"
                    className={`form-input ${errors.max_participants ? 'border-red-500' : ''}`}
                    placeholder="Leave empty for unlimited"
                  />
                  {errors.max_participants && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.max_participants}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">
                  Programming Languages
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                  {languages.map(language => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageToggle(language.code)}
                      className={`p-3 rounded-lg border flex items-center justify-center transition-colors duration-200 ${
                        formData.languages.includes(language.code)
                          ? 'bg-blue-500/20 border-blue-500/50 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-blue-500/50'
                      }`}
                    >
                      <Code size={16} className="mr-2" />
                      {language.name}
                    </button>
                  ))}
                </div>
                {errors.languages && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.languages}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Tournament Levels</h2>
              <button
                type="button"
                onClick={addLevel}
                className="btn btn-outline btn-sm"
              >
                <Plus size={16} className="mr-2" />
                Add Level
              </button>
            </div>

            <div className="space-y-6">
              {formData.levels.map((level, index) => (
                <div key={index} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">
                      Level {level.level_number}
                    </h3>
                    {formData.levels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLevel(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Expected Output</label>
                    <div className="relative">
                      <Terminal size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={level.expected_output}
                        onChange={(e) => handleLevelChange(index, 'expected_output', e.target.value)}
                        className={`form-input pl-10 ${errors[`level_${index}_output`] ? 'border-red-500' : ''}`}
                        placeholder="e.g., Hello, World!"
                      />
                    </div>
                    {errors[`level_${index}_output`] && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors[`level_${index}_output`]}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Required Keywords</label>
                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <Hash size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          className="form-input pl-10"
                          placeholder="e.g., for, if, while"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addKeyword(index)
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => addKeyword(index)}
                        className="btn btn-outline"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {level.required_keywords.map((keyword, keywordIndex) => (
                        <span
                          key={keywordIndex}
                          className="px-2 py-1 bg-slate-700 rounded-lg text-sm flex items-center"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(index, keyword)}
                            className="ml-2 text-slate-400 hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {errors[`level_${index}_keywords`] && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors[`level_${index}_keywords`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Points</label>
                    <input
                      type="number"
                      value={level.points}
                      onChange={(e) => handleLevelChange(index, 'points', parseInt(e.target.value) || 0)}
                      min="0"
                      className={`form-input ${errors[`level_${index}_points`] ? 'border-red-500' : ''}`}
                    />
                    {errors[`level_${index}_points`] && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors[`level_${index}_points`]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Tournament...
              </span>
            ) : (
              <span className="flex items-center">
                <Trophy size={18} className="mr-2" />
                Create Tournament
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateTournament