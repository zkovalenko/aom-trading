import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, apiCall } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { CourseService } from '../services/courseService';
import { CourseQuiz, CourseChapter, CourseQuestion } from '../types/course';
import './StudyCourse.css';

interface QuizAttempt {
  answers: { [questionId: string]: string };
  score: number;
  passed: boolean;
  completed: boolean;
}

const QuizPage: React.FC = () => {
  const { chapterId, quizId } = useParams<{ chapterId: string; quizId: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<CourseQuiz | null>(null);
  const [chapter, setChapter] = useState<CourseChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt>({
    answers: {},
    score: 0,
    passed: false,
    completed: false
  });
  const [showResults, setShowResults] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    if (!chapterId || !quizId) {
      navigate('/my-subscriptions/study-course');
      return;
    }

    const courseService = CourseService.getInstance();
    const chapterData = courseService.getChapter(chapterId);
    const quizData = courseService.getQuiz(chapterId, quizId);

    if (!chapterData || !quizData) {
      navigate('/my-subscriptions/study-course');
      return;
    }

    setChapter(chapterData);
    setQuiz(quizData);
    setLoading(false);

  }, [chapterId, quizId, navigate]);

  useEffect(() => {
    if (!token || !quizId) {
      setAttemptCount(0);
      return;
    }

    const fetchProgress = async () => {
      try {
        const response = await apiCall('/course-progress', { method: 'GET' }, token);
        if (!response.ok) {
          throw new Error('Failed to load quiz progress');
        }

        const data = await response.json();
        const quizzes: Array<{ quizId: string; attempts?: number; passed?: boolean; score?: number }> = data?.data?.quizzes ?? [];
        const progress = quizzes.find(item => item.quizId === quizId);

        if (progress) {
          setAttemptCount(progress.attempts ?? 1);
          if (progress.passed) {
            setCurrentAttempt(prev => ({
              ...prev,
              score: typeof progress.score === 'number' ? progress.score : prev.score,
              passed: true,
              completed: true,
            }));
            setShowResults(true);
          }
        }
      } catch (error) {
        console.error('Failed to load quiz progress:', error);
        setAttemptCount(0);
      }
    };

    fetchProgress();
  }, [token, quizId]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setCurrentAttempt(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;

    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach(question => {
      totalPoints += question.points || 1;
      
      const userAnswer = currentAttempt.answers[question.questionId];
      if (!userAnswer) return;

      if (question.type === 'multiple-choice') {
        const correctOption = question.options?.find(opt => opt.isCorrect);
        if (correctOption && userAnswer === correctOption.optionId) {
          earnedPoints += question.points || 1;
        }
      } else if (question.type === 'true-false') {
        const correctOption = question.options?.find(opt => opt.isCorrect);
        if (correctOption && userAnswer === correctOption.optionId) {
          earnedPoints += question.points || 1;
        }
      } else if (question.type === 'short-answer') {
        // Simple string comparison - in real app, this would be more sophisticated
        if (question.correctAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
          earnedPoints += question.points || 1;
        }
      }
    });

    return totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter(q => !currentAttempt.answers[q.questionId]);
    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions before submitting. ${unansweredQuestions.length} questions remaining.`);
      return;
    }

    const score = calculateScore();
    const passed = score >= (quiz.passingScore || 70);

    setCurrentAttempt(prev => ({
      ...prev,
      score,
      passed,
      completed: true
    }));

    setShowResults(true);

    try {
      if (!token) {
        throw new Error('Please log in to save your progress.');
      }

      const response = await apiCall(
        '/course-progress/quizzes/complete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chapterId,
            quizId: quiz.quizId,
            score,
            passed,
          })
        },
        token
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Failed to save quiz attempt');
      }

      const result = await response.json();
      const attemptsFromApi = result?.data?.attempts;
      if (typeof attemptsFromApi === 'number') {
        setAttemptCount(attemptsFromApi);
      } else {
        setAttemptCount(prev => prev + 1);
      }

      toast.success(passed ? 'Quiz completed!' : 'Attempt recorded. Try again!');
    } catch (error) {
      console.error('Failed to save quiz attempt:', error);
      setAttemptCount(prev => prev + 1);
      toast.error(error instanceof Error ? error.message : 'Failed to save quiz attempt.');
    }
  };

  const handleRetakeQuiz = () => {
    if (!quiz || attemptCount >= (quiz.maxAttempts || 3)) {
      return;
    }

    setCurrentAttempt({
      answers: {},
      score: 0,
      passed: false,
      completed: false
    });
    setShowResults(false);
  };

  const renderQuestion = (question: CourseQuestion) => {
    const userAnswer = currentAttempt.answers[question.questionId];

    return (
      <div key={question.questionId} className="question-card">
        <div className="question-header">
          <h3>Question {question.order + 1}</h3>
          <span className="points">{question.points || 1} point{(question.points || 1) > 1 ? 's' : ''}</span>
        </div>
        
        <div className="question-text">
          <p>{question.text}</p>
        </div>

        <div className="answer-options">
          {question.type === 'multiple-choice' && question.options && (
            <div className="multiple-choice">
              {question.options
                .sort((a, b) => a.order - b.order)
                .map(option => (
                  <label key={option.optionId} className="option-label">
                    <input
                      type="radio"
                      name={question.questionId}
                      value={option.optionId}
                      checked={userAnswer === option.optionId}
                      onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                      disabled={showResults}
                    />
                    <span className={`option-text ${showResults ? (option.isCorrect ? 'correct' : userAnswer === option.optionId ? 'incorrect' : '') : ''}`}>
                      {option.text}
                      {showResults && option.isCorrect && <span className="correct-indicator"> ✓</span>}
                      {showResults && !option.isCorrect && userAnswer === option.optionId && <span className="incorrect-indicator"> ✗</span>}
                    </span>
                  </label>
                ))}
            </div>
          )}

          {question.type === 'true-false' && question.options && (
            <div className="true-false">
              {question.options
                .sort((a, b) => a.order - b.order)
                .map(option => (
                  <label key={option.optionId} className="option-label">
                    <input
                      type="radio"
                      name={question.questionId}
                      value={option.optionId}
                      checked={userAnswer === option.optionId}
                      onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                      disabled={showResults}
                    />
                    <span className={`option-text ${showResults ? (option.isCorrect ? 'correct' : userAnswer === option.optionId ? 'incorrect' : '') : ''}`}>
                      {option.text}
                      {showResults && option.isCorrect && <span className="correct-indicator"> ✓</span>}
                      {showResults && !option.isCorrect && userAnswer === option.optionId && <span className="incorrect-indicator"> ✗</span>}
                    </span>
                  </label>
                ))}
            </div>
          )}

          {question.type === 'short-answer' && (
            <div className="short-answer">
              <textarea
                value={userAnswer || ''}
                onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                placeholder="Enter your answer here..."
                disabled={showResults}
                rows={3}
              />
              {showResults && question.correctAnswer && (
                <div className="correct-answer">
                  <strong>Correct answer:</strong> {question.correctAnswer}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="quiz-page">
        <div className="container">
          <div className="no-access">Please log in to access quizzes.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="container">
          <div className="loading">Loading quiz...</div>
        </div>
      </div>
    );
  }

  if (!quiz || !chapter) {
    return (
      <div className="quiz-page">
        <div className="container">
          <div className="error">Quiz not found.</div>
        </div>
      </div>
    );
  }

  const canRetake = attemptCount < (quiz.maxAttempts || 3);
  const sortedQuestions = quiz.questions.sort((a, b) => a.order - b.order);

  return (
    <div className="quiz-page">
      <div className="container">
        <div className="quiz-header">
          <div className="breadcrumb">
            <Link to="/my-subscriptions/study-course">Study Course</Link>
            <span> / </span>
            <span>{chapter.name}</span>
            <span> / </span>
            <span>{quiz.name}</span>
          </div>
          
          <div className="quiz-title-section">
            <h1>{quiz.name}</h1>
            {quiz.description && (
              <p className="quiz-description">{quiz.description}</p>
            )}
            
            <div className="quiz-info">
              <div className="quiz-stats">
                <span className="questions-count">{quiz.questions.length} questions</span>
                <span className="stat-separator">•</span>
                <span className="passing-score">{quiz.passingScore || 70}% to pass</span>
                <span className="stat-separator">•</span>
                <span className="attempts">Attempt {attemptCount + 1} of {quiz.maxAttempts || 3}</span>
              </div>
            </div>
          </div>
        </div>

        {showResults && (
          <div className={`quiz-results ${currentAttempt.passed ? 'passed' : 'failed'}`}>
            <div className="results-header">
              <h2>{currentAttempt.passed ? 'Congratulations!' : 'Keep Learning'}</h2>
              <div className="score-display">
                <span className="score">{Math.round(currentAttempt.score)}%</span>
                <span className="status">{currentAttempt.passed ? 'PASSED' : 'FAILED'}</span>
              </div>
            </div>
            
            <div className="results-message">
              {currentAttempt.passed ? (
                <p>You've successfully passed the quiz! You can review your answers below or continue to the next quiz.</p>
              ) : (
                <p>You need {quiz.passingScore || 70}% to pass. {canRetake ? 'You can retake the quiz to improve your score.' : 'You have used all available attempts.'}</p>
              )}
            </div>

            <div className="results-actions">
              {canRetake && !currentAttempt.passed && (
                <button className="retake-btn" onClick={handleRetakeQuiz}>
                  Retake Quiz
                </button>
              )}
              <Link to="/my-subscriptions/study-course" className="back-btn">
                Back to Course
              </Link>
            </div>
          </div>
        )}

        <div className="quiz-content">
          {sortedQuestions.map(renderQuestion)}
        </div>

        {!showResults && (
          <div className="quiz-actions">
            <button 
              className="submit-quiz-btn primary"
              onClick={handleSubmitQuiz}
              disabled={Object.keys(currentAttempt.answers).length !== quiz.questions.length}
            >
              Submit Quiz
            </button>
            
            <div className="progress-indicator">
              <span>
                {Object.keys(currentAttempt.answers).length} of {quiz.questions.length} questions answered
              </span>
            </div>
          </div>
        )}

        {showResults && (
          <div className="back-navigation">
            <Link to="/my-subscriptions/study-course" className="back-to-course-btn">
              ← Back to Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
