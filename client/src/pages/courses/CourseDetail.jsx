import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { BookOpen, CheckCircle, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import { marked } from 'marked';
import JSConfetti from 'js-confetti';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const confetti = new JSConfetti();

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const [courseResponse, progressResponse] = await Promise.all([
        axios.get(`${API_URL}/courses/${id}`),
        axios.get(`${API_URL}/users/courses/${id}/progress`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setCourse(courseResponse.data.course);
      setLessons(courseResponse.data.lessons);
      setProgress(progressResponse.data.progress);
      
      // If there's a completed lesson, set it as current, otherwise set first lesson
      const completedLesson = courseResponse.data.lessons.find(lesson => 
        progressResponse.data.lessons?.find(l => l.id === lesson.id)?.completed
      );
      
      if (completedLesson) {
        handleLessonClick(completedLesson);
      } else if (courseResponse.data.lessons.length > 0) {
        handleLessonClick(courseResponse.data.lessons[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course details:', error);
      showToast('Failed to load course details', 'error');
      setLoading(false);
    }
  };

  const handleLessonClick = async (lesson) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}/lessons/${lesson.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setCurrentLesson({
        ...response.data.lesson,
        contentHtml: marked(response.data.lesson.content),
        completed: response.data.completion.completed,
        navigation: response.data.navigation
      });
    } catch (error) {
      console.error('Error fetching lesson:', error);
      showToast('Failed to load lesson', 'error');
    }
  };

  const handleLessonComplete = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/courses/${id}/lessons/${currentLesson.id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      showToast('Lesson completed! 🎉', 'success');
      confetti.addConfetti();
      
      // Update progress
      await fetchCourseDetails();
      
      if (response.data.course_completed) {
        showToast('Congratulations! You\'ve completed the course! 🎓', 'success');
        confetti.addConfetti({
          emojis: ['🎓', '🎉', '⭐'],
          emojiSize: 50,
          confettiNumber: 100
        });
      } else if (currentLesson.navigation.next_id) {
        // Automatically load next lesson
        const nextLesson = lessons.find(l => l.id === currentLesson.navigation.next_id);
        if (nextLesson) {
          handleLessonClick(nextLesson);
        }
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      showToast('Failed to mark lesson as complete', 'error');
    }
  };

  const navigateToLesson = (direction) => {
    if (!currentLesson) return;
    
    const targetId = direction === 'prev' 
      ? currentLesson.navigation.previous_id 
      : currentLesson.navigation.next_id;
    
    if (targetId) {
      const targetLesson = lessons.find(l => l.id === targetId);
      if (targetLesson) {
        handleLessonClick(targetLesson);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-4xl font-bold mb-4 text-blue-500">Loading Course</div>
          <div className="text-slate-400">Preparing your learning materials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Course Header */}
      <div className="bg-slate-800 rounded-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
            <p className="text-slate-400 mb-4">{course.description}</p>
            <div className="flex items-center gap-4">
              <span className={`text-sm px-3 py-1 rounded ${
                course.level === 'Beginner' ? 'bg-green-900/30 text-green-400' :
                course.level === 'Intermediate' ? 'bg-amber-900/30 text-amber-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {course.level}
              </span>
              <span className="text-slate-400">
                Created by {course.created_by_username}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-slate-700 rounded-lg">
            <div className="text-4xl font-bold text-white mb-2">{progress}%</div>
            <div className="w-full bg-slate-600 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-slate-300">Course Progress</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lesson List */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Course Content</h2>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    className={`w-full p-4 rounded-lg text-left transition-colors duration-200 ${
                      currentLesson?.id === lesson.id
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : 'hover:bg-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-medium text-white">{lesson.title}</h3>
                          <p className="text-sm text-slate-400">
                            {lesson.points} points
                          </p>
                        </div>
                      </div>
                      {lesson.completed ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <Lock size={20} className="text-slate-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="lg:col-span-2">
          {currentLesson ? (
            <div className="card">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">{currentLesson.title}</h2>
              </div>
              <div className="p-6">
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentLesson.contentHtml }}
                ></div>
                
                <div className="mt-8 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigateToLesson('prev')}
                      disabled={!currentLesson.navigation.previous_id}
                      className="btn btn-outline btn-sm"
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Previous
                    </button>
                    <button
                      onClick={() => navigateToLesson('next')}
                      disabled={!currentLesson.navigation.next_id}
                      className="btn btn-outline btn-sm"
                    >
                      Next
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-slate-400">
                      Points available: {currentLesson.points}
                    </div>
                    {!currentLesson.completed && (
                      <button
                        onClick={handleLessonComplete}
                        className="btn btn-primary"
                      >
                        Complete Lesson
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Select a Lesson to Begin
              </h3>
              <p className="text-slate-400">
                Choose a lesson from the list to start learning
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;