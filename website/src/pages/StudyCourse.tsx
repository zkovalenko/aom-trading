import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './StudyCourse.css';

const StudyCourse: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="study-course-page">
        <div className="container">
          <div className="no-access">Please log in to access the study course.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="study-course-page">
      <div className="container">
        <div className="study-course-header">
          <h1>Educational Materials</h1>
          <p className="course-subtitle">Comprehensive trading guides and educational resources</p>
        </div>

        <div className="course-navigation">
          <nav className="course-nav">
            <a href="#basics" className="nav-item active">Trading Basics</a>
            <a href="#analysis" className="nav-item">Technical Analysis</a>
            <a href="#strategies" className="nav-item">Trading Strategies</a>
            <a href="#risk-management" className="nav-item">Risk Management</a>
            <a href="#psychology" className="nav-item">Trading Psychology</a>
          </nav>
        </div>

        <div className="course-content">
          <section id="basics" className="course-section">
            <h2>Trading Basics</h2>
            <div className="lesson-grid">
              <div className="lesson-card">
                <h3>Introduction to Trading</h3>
                <p>Learn the fundamentals of trading, market structure, and basic terminology.</p>
                <div className="lesson-meta">
                  <span className="duration">45 min</span>
                  <span className="difficulty">Beginner</span>
                </div>
                <button className="start-lesson-btn">Start Lesson</button>
              </div>
              
              <div className="lesson-card">
                <h3>Market Types & Hours</h3>
                <p>Understanding different markets, trading sessions, and optimal trading times.</p>
                <div className="lesson-meta">
                  <span className="duration">30 min</span>
                  <span className="difficulty">Beginner</span>
                </div>
                <button className="start-lesson-btn">Start Lesson</button>
              </div>
              
              <div className="lesson-card">
                <h3>Order Types</h3>
                <p>Master different order types: market, limit, stop-loss, and advanced orders.</p>
                <div className="lesson-meta">
                  <span className="duration">35 min</span>
                  <span className="difficulty">Beginner</span>
                </div>
                <button className="start-lesson-btn">Start Lesson</button>
              </div>
            </div>
            <div className="lesson-grid">
              <div className="lesson-card">
                <h3>Introduction to Trading</h3>
                <p>Learn the fundamentals of trading, market structure, and basic terminology.</p>
                <div className="lesson-meta">
                  <span className="duration">45 min</span>
                  <span className="difficulty">Beginner</span>
                </div>
                <button className="start-lesson-btn">Start Lesson</button>
              </div>
              
              <div className="lesson-card">
                <h3>Market Types & Hours</h3>
                <p>Understanding different markets, trading sessions, and optimal trading times.</p>
                <div className="lesson-meta">
                  <span className="duration">30 min</span>
                  <span className="difficulty">Beginner</span>
                </div>
                <button className="start-lesson-btn">Start Lesson</button>
              </div>
              
              <div className="lesson-card">
                <h3>Order Types</h3>
                <p>Master different order types: market, limit, stop-loss, and advanced orders.</p>
                <div className="lesson-meta">
                  <span className="duration">35 min</span>
                  <span className="difficulty">Beginner</span>
                </div>
                <button className="start-lesson-btn">Start Lesson</button>
              </div>
            </div>
          </section>

          <section id="analysis" className="course-section">
            <h2>Technical Analysis</h2>
            <div className="lesson-grid">
              <div className="lesson-card">
                <h3>Chart Patterns</h3>
                <p>Identify and trade common chart patterns like triangles, flags, and head & shoulders.</p>
                <div className="lesson-meta">
                  <span className="duration">60 min</span>
                  <span className="difficulty">Intermediate</span>
                </div>
                <button className="start-lesson-btn">Start Lesson</button>
              </div>
              
              <div className="lesson-card">
                <h3>Technical Indicators</h3>
                <p>Learn to use RSI, MACD, Moving Averages, and other popular indicators.</p>
                <div className="lesson-meta">
                  <span className="duration">50 min</span>
                  <span className="difficulty">Intermediate</span>
                </div>
                <button className="start-lesson-btn">Start Lesson</button>
              </div>
              
              <div className="lesson-card">
                <h3>Support & Resistance</h3>
                <p>Master the art of identifying key levels and trading around them.</p>
                <div className="lesson-meta">
                  <span className="duration">40 min</span>
                  <span className="difficulty">Intermediate</span>
                </div>
                <button className="start-lesson-btn">Start Lesson</button>
              </div>
            </div>
          </section>
        </div>

        <div className="course-progress">
          <div className="progress-header">
            <h3>Your Progress</h3>
            <div className="overall-progress">
              <span>12% Complete</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '12%'}}></div>
              </div>
            </div>
          </div>
          
          <div className="recent-activity">
            <h4>Recent Activity</h4>
            <div className="activity-item">
              <span className="activity-date">Today</span>
              <span className="activity-text">Completed "Introduction to Trading"</span>
            </div>
            <div className="activity-item">
              <span className="activity-date">Yesterday</span>
              <span className="activity-text">Started "Market Types & Hours"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCourse;