import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { useToast } from '../../contexts/ToastContext';
import { BookOpen, Plus, AlertCircle, FileText } from 'lucide-react';
import { marked } from 'marked';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    image_url: ''
  });
  const [lessons, setLessons] = useState([
    { title: '', content: '', points: 0, order_number: 1 }
  ]);
  const [errors, setErrors] = useState({});
  const [previewIndex, setPreviewIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleLessonChange = (index, field, value) => {
    const newLessons = [...lessons];
    newLessons[index] = {
      ...newLessons[index],
      [field]: value
    };
    setLessons(newLessons);

    if (errors[`lesson_${index}_${field}`]) {
      setErrors({
        ...errors,
        [`lesson_${index}_${field}`]: ''
      });
    }
  };

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: '',
        content: '',
        points: 0,
        order_number: lessons.length + 1
      }
    ]);
  };

  const removeLesson = (index) => {
    if (lessons.length > 1) {
      const newLessons = lessons.filter((_, i) => i !== index);
      // Update order numbers
      newLessons.forEach((lesson, i) => {
        lesson.order_number = i + 1;
      });
      setLessons(newLessons);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.level) {
      newErrors.level = 'Level is required';
    }
    
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Please enter a valid URL';
    }

    // Validate lessons
    lessons.forEach((lesson, index) => {
      if (!lesson.title.trim()) {
        newErrors[`lesson_${index}_title`] = 'Lesson title is required';
      }
      if (!lesson.content.trim()) {
        newErrors[`lesson_${index}_content`] = 'Lesson content is required';
      }
      if (lesson.points < 0) {
        newErrors[`lesson_${index}_points`] = 'Points cannot be negative';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // First create the course
      const courseResponse = await axios.post(
        `${API_URL}/courses`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      const courseId = courseResponse.data.courseId;

      // Then create all lessons
      await Promise.all(lessons.map(lesson =>
        axios.post(
          `${API_URL}/courses/${courseId}/lessons`,
          lesson,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        )
      ));
      
      showToast('Course and lessons created successfully!', 'success');
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Error creating course:', error);
      showToast(
        error.response?.data?.message || 'Failed to create course',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create New Course</h1>
        <p className="text-slate-400 mt-2">
          Create a structured learning experience for your students
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Details */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Course Details</h2>
            
            {/* Course Title */}
            <div className="mb-6">
              <label htmlFor="title" className="form-label">
                Course Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., JavaScript Fundamentals"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Course Description */}
            <div className="mb-6">
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
                placeholder="Describe what students will learn in this course..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Course Level */}
            <div className="mb-6">
              <label htmlFor="level" className="form-label">
                Difficulty Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className={`form-input ${errors.level ? 'border-red-500' : ''}`}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              {errors.level && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.level}
                </p>
              )}
            </div>

            {/* Course Image URL */}
            <div>
              <label htmlFor="image_url" className="form-label">
                Course Image URL (optional)
              </label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className={`form-input ${errors.image_url ? 'border-red-500' : ''}`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.image_url}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="card">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Course Lessons</h2>
              <button
                type="button"
                onClick={addLesson}
                className="btn btn-outline btn-sm"
              >
                <Plus size={16} className="mr-2" />
                Add Lesson
              </button>
            </div>

            <div className="space-y-6">
              {lessons.map((lesson, index) => (
                <div key={index} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">
                      Lesson {index + 1}
                    </h3>
                    {lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Lesson Title */}
                  <div className="mb-4">
                    <label className="form-label">Lesson Title</label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                      className={`form-input ${errors[`lesson_${index}_title`] ? 'border-red-500' : ''}`}
                      placeholder="e.g., Introduction to Variables"
                    />
                    {errors[`lesson_${index}_title`] && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors[`lesson_${index}_title`]}
                      </p>
                    )}
                  </div>

                  {/* Points */}
                  <div className="mb-4">
                    <label className="form-label">Points</label>
                    <input
                      type="number"
                      value={lesson.points}
                      onChange={(e) => handleLessonChange(index, 'points', parseInt(e.target.value) || 0)}
                      className={`form-input ${errors[`lesson_${index}_points`] ? 'border-red-500' : ''}`}
                      min="0"
                    />
                    {errors[`lesson_${index}_points`] && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors[`lesson_${index}_points`]}
                      </p>
                    )}
                  </div>

                  {/* Lesson Content */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="form-label">Content (Markdown)</label>
                      <button
                        type="button"
                        onClick={() => setPreviewIndex(previewIndex === index ? null : index)}
                        className="text-sm text-blue-500 hover:text-blue-400"
                      >
                        {previewIndex === index ? 'Edit' : 'Preview'}
                      </button>
                    </div>
                    
                    {previewIndex === index ? (
                      <div 
                        className="prose prose-invert max-w-none p-4 bg-slate-900 rounded-lg"
                        dangerouslySetInnerHTML={{ __html: marked(lesson.content) }}
                      />
                    ) : (
                      <textarea
                        value={lesson.content}
                        onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                        rows={10}
                        className={`form-input font-mono ${errors[`lesson_${index}_content`] ? 'border-red-500' : ''}`}
                        placeholder="# Lesson Title&#10;&#10;Write your lesson content here using Markdown.&#10;&#10;## Subtopic&#10;&#10;- List item 1&#10;- List item 2&#10;&#10;```javascript&#10;// Code example&#10;const example = 'Hello World';&#10;```"
                      />
                    )}
                    {errors[`lesson_${index}_content`] && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors[`lesson_${index}_content`]}
                      </p>
                    )}
                  </div>

                  {/* Markdown Help */}
                  {previewIndex !== index && (
                    <div className="text-sm text-slate-400">
                      <p className="font-medium mb-1">Markdown Tips:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li># Header 1</li>
                        <li>## Header 2</li>
                        <li>**Bold text**</li>
                        <li>`inline code`</li>
                        <li>```language&#10;code block&#10;```</li>
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
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
                Creating Course...
              </span>
            ) : (
              <span className="flex items-center">
                <Plus size={18} className="mr-2" />
                Create Course
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;