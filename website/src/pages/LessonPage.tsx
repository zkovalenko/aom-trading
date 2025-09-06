import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CourseService } from '../services/courseService';
import { CourseLesson, CourseChapter } from '../types/course';
import './StudyCourse.css';

const LessonPage: React.FC = () => {
  const { chapterId, lessonId } = useParams<{ chapterId: string; lessonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [chapter, setChapter] = useState<CourseChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!chapterId || !lessonId) {
      navigate('/my-subscriptions/study-course');
      return;
    }

    const courseService = CourseService.getInstance();
    const chapterData = courseService.getChapter(chapterId);
    const lessonData = courseService.getLesson(chapterId, lessonId);

    if (!chapterData || !lessonData) {
      navigate('/my-subscriptions/study-course');
      return;
    }

    setChapter(chapterData);
    setLesson(lessonData);
    setLoading(false);

    // TODO: Check if user has completed this lesson from API
    setCompleted(false);
  }, [chapterId, lessonId, navigate]);

  const handleMarkComplete = async () => {
    if (!lesson || !chapter) return;

    try {
      // TODO: API call to mark lesson as completed
      console.log(`Marking lesson ${lesson.lessonId} as completed`);
      
      setCompleted(true);
      
      // Optional: Navigate to next lesson or back to chapter
      // navigate(`/my-subscriptions/study-course`);
    } catch (error) {
      console.error('Failed to mark lesson as completed:', error);
    }
  };

  const getNextLesson = () => {
    if (!chapter || !lesson) return null;
    
    const sortedLessons = chapter.lessons.sort((a, b) => a.order - b.order);
    const currentIndex = sortedLessons.findIndex(l => l.lessonId === lesson.lessonId);
    
    if (currentIndex >= 0 && currentIndex < sortedLessons.length - 1) {
      return sortedLessons[currentIndex + 1];
    }
    
    return null;
  };

  const getPreviousLesson = () => {
    if (!chapter || !lesson) return null;
    
    const sortedLessons = chapter.lessons.sort((a, b) => a.order - b.order);
    const currentIndex = sortedLessons.findIndex(l => l.lessonId === lesson.lessonId);
    
    if (currentIndex > 0) {
      return sortedLessons[currentIndex - 1];
    }
    
    return null;
  };

  if (!user) {
    return (
      <div className="lesson-page">
        <div className="container">
          <div className="no-access">Please log in to access lessons.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="lesson-page">
        <div className="container">
          <div className="loading">Loading lesson...</div>
        </div>
      </div>
    );
  }

  if (!lesson || !chapter) {
    return (
      <div className="lesson-page">
        <div className="container">
          <div className="error">Lesson not found.</div>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="lesson-page">
      <div className="container">
        <div className="lesson-header">
          <div className="breadcrumb">
            <Link to="/my-subscriptions/study-course">Study Course</Link>
            <span> / </span>
            <span>{chapter.name}</span>
            <span> / </span>
            <span>{lesson.name}</span>
          </div>
          
          <div className="lesson-title-section">
            <h1>{lesson.name}</h1>
            {lesson.description && (
              <p className="lesson-description">{lesson.description}</p>
            )}
            
            <div className="lesson-meta">
              {lesson.estimatedMinutes && (
                <span className="duration">⏱️ {lesson.estimatedMinutes} minutes</span>
              )}
              <span className="content-type">📄 {lesson.contentType}</span>
              {completed && (
                <span className="completion-status">✅ Completed</span>
              )}
            </div>
          </div>
        </div>

        <div className="lesson-content">
          <div className="content-area">
            {lesson.contentType === 'text' && (
              <div className="text-content">
                {/* TODO: Load actual content from lesson.contentPath */}
                <div className="placeholder-content">
                  <h2>Lesson Content</h2>
                  <p>This is where the lesson content would be displayed. The content would be loaded from:</p>
                  <code>{lesson.contentPath}</code>
                  
                  <h3>Sample Content for: {lesson.name}</h3>
                  <p>This lesson covers the fundamentals of {lesson.name.toLowerCase()}. Here you would find:</p>
                  <ul>
                    <li>Key concepts and definitions</li>
                    <li>Practical examples and case studies</li>
                    <li>Interactive elements and exercises</li>
                    <li>Additional resources for further learning</li>
                  </ul>
                  
                  <div className="content-section">
                    <h4>Learning Objectives</h4>
                    <p>By the end of this lesson, you will be able to:</p>
                    <ul>
                      <li>Understand the core concepts</li>
                      <li>Apply the knowledge in practical scenarios</li>
                      <li>Identify key patterns and indicators</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {lesson.contentType === 'video' && (
              <div className="video-content">
                <div className="video-placeholder">
                  <p>📹 Video content would be loaded here</p>
                  <p>Content path: {lesson.contentPath}</p>
                </div>
              </div>
            )}
            
            {lesson.contentType === 'interactive' && (
              <div className="interactive-content">
                <div className="interactive-placeholder">
                  <p>🎯 Interactive content would be loaded here</p>
                  <p>Content path: {lesson.contentPath}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lesson-actions">
          <div className="action-buttons">
            {!completed && (
              <button 
                className="complete-btn primary"
                onClick={handleMarkComplete}
              >
                Mark as Complete
              </button>
            )}
            
            {completed && (
              <div className="completion-message">
                ✅ You've completed this lesson!
              </div>
            )}
          </div>
          
          <div className="navigation-buttons">
            {previousLesson && (
              <Link 
                to={`/my-subscriptions/study-course/${chapter.chapterId}/lesson/${previousLesson.lessonId}`}
                className="nav-btn prev"
              >
                ← Previous: {previousLesson.name}
              </Link>
            )}
            
            {nextLesson && (
              <Link 
                to={`/my-subscriptions/study-course/${chapter.chapterId}/lesson/${nextLesson.lessonId}`}
                className="nav-btn next"
              >
                Next: {nextLesson.name} →
              </Link>
            )}
            
            <Link 
              to="/my-subscriptions/study-course"
              className="nav-btn back-to-course"
            >
              Back to Course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;