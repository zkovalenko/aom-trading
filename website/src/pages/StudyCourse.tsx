import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, apiCall } from '../contexts/AuthContext';
import { CourseService } from '../services/courseService';
import { Course } from '../types/course';
import './StudyCourse.css';

const StudyCourse: React.FC = () => {
  const { user, token } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeChapter, setActiveChapter] = useState<string>('');
  const [lessonProgress, setLessonProgress] = useState<Array<{ chapterId: string; lessonId: string; completedAt: string }>>([]);
  const [quizProgress, setQuizProgress] = useState<Array<{ chapterId: string; quizId: string; completedAt: string; passed: boolean; score: number | null; attempts: number }>>([]);

  useEffect(() => {
    const courseService = CourseService.getInstance();
    const courseData = courseService.getCourse();
    setCourse(courseData);

    if (courseData.chapters.length > 0) {
      setActiveChapter(courseData.chapters[0].chapterId);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setLessonProgress([]);
      setQuizProgress([]);
      return;
    }

    const fetchProgress = async () => {
      try {
        const response = await apiCall('/course-progress', { method: 'GET' }, token);
        if (!response.ok) {
          throw new Error('Failed to load course progress');
        }

        const data = await response.json();
        const lessons = data?.data?.lessons ?? [];
        const quizzes = data?.data?.quizzes ?? [];

        setLessonProgress(lessons);
        setQuizProgress(quizzes);
      } catch (error) {
        console.error('Failed to load course progress:', error);
        setLessonProgress([]);
        setQuizProgress([]);
      }
    };

    fetchProgress();
  }, [token]);

  const courseService = CourseService.getInstance();

  const completedLessonIds = useMemo(() => lessonProgress.map(item => item.lessonId), [lessonProgress]);
  const completedQuizIds = useMemo(
    () => quizProgress.filter(item => item.passed).map(item => item.quizId),
    [quizProgress]
  );

  if (!user) {
    return (
      <div className="study-course-page">
        <div className="container">
          <div className="no-access">Please log in to access the study course.</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="study-course-page">
        <div className="container">
          <div className="loading">Loading course content...</div>
        </div>
      </div>
    );
  }

  const overallProgress = courseService.getCourseProgress(completedLessonIds, completedQuizIds);
  const activeChapterData = course.chapters.find(ch => ch.chapterId === activeChapter);

  const getLessonDisplayName = (lessonId: string) => {
    const result = courseService.findLessonById(lessonId);
    return result?.lesson.name ?? lessonId;
  };

  const getQuizDisplayName = (quizId: string) => {
    const result = courseService.findQuizById(quizId);
    return result?.quiz.name ?? quizId;
  };

  return (
    <div className="study-course-page">
      <div className="container">
        <div className="study-course-header">
          <h1>{course.name}</h1>
          <p className="course-subtitle">{course.description}</p>
        </div>

        <div className="course-navigation">
          <nav className="course-nav">
            {course.chapters.map(chapter => {
              const chapterProgress = courseService.getChapterProgress(
                chapter.chapterId, 
                completedLessonIds,
                completedQuizIds
              );
              
              return (
                <button
                  key={chapter.chapterId}
                  className={`nav-item ${activeChapter === chapter.chapterId ? 'active' : ''}`}
                  onClick={() => setActiveChapter(chapter.chapterId)}
                >
                  {chapter.name}
                  {chapterProgress.completed && <span className="completion-badge">✓</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {activeChapterData && (
          <div className="course-content">
            <section className="course-section">
              <div className="section-header">
                <h2>{activeChapterData.name}</h2>
                <p className="section-description">{activeChapterData.description}</p>
              </div>

              <h3>Lessons</h3>
              <div className="content-section">
                <div className="lesson-grid">
                  {activeChapterData.lessons
                    .sort((a, b) => a.order - b.order)
                    .map(lesson => {
                      const isCompleted = completedLessonIds.includes(lesson.lessonId);
                      
                      return (
                        <div key={lesson.lessonId} className={`lesson-card ${isCompleted ? 'completed' : ''}`}>
                          <div className="lesson-header">
                            <h4>{lesson.name}</h4>
                            {isCompleted && <span className="completion-badge">✓ Done</span>}
                          </div>
                          <p>{lesson.description}</p>
                          <div className="lesson-meta">
                            {lesson.estimatedMinutes && (
                              <span className="duration">{lesson.estimatedMinutes} min</span>
                            )}
                            {/* <span className="content-type">{lesson.contentType}</span> */}
                          </div>
                          <Link 
                            to={`/my-subscriptions/study-course/${activeChapterData.chapterId}/lesson/${lesson.lessonId}`}
                            className="start-lesson-btn"
                          >
                            {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                          </Link>
                        </div>
                      );
                    })}
                </div>
              </div>

              <h3>Quizzes</h3>
              <div className="content-section">
                <div className="quiz-grid">
                  {activeChapterData.quizzes
                    .sort((a, b) => a.order - b.order)
                    .map(quiz => {
                      const isCompleted = completedQuizIds.includes(quiz.quizId);
                      
                      return (
                        <div key={quiz.quizId} className={`quiz-card ${isCompleted ? 'completed' : ''}`}>
                          <div className="quiz-header">
                            <h4>{quiz.name}</h4>
                            {isCompleted && <span className="completion-badge">✓ Done</span>}
                          </div>
                          <p>{quiz.description}</p>
                          <div className="quiz-meta">
                            <span className="questions">{quiz.questions.length} questions</span>
                            <span className="passing-score">{quiz.passingScore || 70}% to pass</span>
                            <span className="attempts">{quiz.maxAttempts || 3} attempts</span>
                          </div>
                          <Link 
                            to={`/my-subscriptions/study-course/${activeChapterData.chapterId}/quiz/${quiz.quizId}`}
                            className="start-quiz-btn"
                          >
                            {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
                          </Link>
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>
          </div>
        )}

        <div className="course-progress">
          <div className="progress-header">
            <h3>Your Progress</h3>
            <div className="overall-progress">
              <span>{Math.round(overallProgress)}% Complete</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${overallProgress}%`}}></div>
              </div>
            </div>
          </div>
          
          <div className="recent-activity">
            <h4>Recent Activity</h4>
            {completedLessonIds.length === 0 && completedQuizIds.length === 0 ? (
              <div className="activity-item">
                <span className="activity-text">No completed activities yet. Start your first lesson!</span>
              </div>
            ) : (
              <>
                {lessonProgress.slice(0, 2).map(progress => (
                  <div key={`${progress.lessonId}-${progress.completedAt}`} className="activity-item">
                    <span className="activity-date">
                      {new Date(progress.completedAt).toLocaleDateString()}
                    </span>
                    <span className="activity-text">Completed lesson: {getLessonDisplayName(progress.lessonId)}</span>
                  </div>
                ))}
                {quizProgress
                  .filter(progress => progress.passed)
                  .slice(0, 2)
                  .map(progress => (
                    <div key={`${progress.quizId}-${progress.completedAt}`} className="activity-item">
                      <span className="activity-date">
                        {new Date(progress.completedAt).toLocaleDateString()}
                      </span>
                      <span className="activity-text">Passed quiz: {getQuizDisplayName(progress.quizId)}</span>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCourse;
