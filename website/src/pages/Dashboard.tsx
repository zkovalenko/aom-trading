import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  purchased_at?: string;
  expires_at?: string;
  access_granted?: boolean;
}

interface SoftwareLicense {
  license_type: string;
  is_active: boolean;
  purchased_at: string;
  expires_at?: string;
}

const Dashboard: React.FC = () => {
  const { user, logout, refreshProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [softwareLicenses, setSoftwareLicenses] = useState<SoftwareLicense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await refreshProfile();
        
        // Load user's courses
        const coursesResponse = await axios.get('/courses/user/my-courses');
        if (coursesResponse.data.success) {
          setCourses(coursesResponse.data.courses);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [refreshProfile]);

  useEffect(() => {
    if (user) {
      setSoftwareLicenses(user.softwareLicenses || []);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {user?.firstName}!</h1>
            <p>Access your courses, software, and learning materials</p>
          </div>
          <div className="header-actions">
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Account Overview */}
          <section className="account-overview">
            <h2>Account Overview</h2>
            <div className="overview-cards">
              <div className="overview-card">
                <div className="card-icon">📚</div>
                <div className="card-content">
                  <h3>{courses.length}</h3>
                  <p>Active Courses</p>
                </div>
              </div>
              <div className="overview-card">
                <div className="card-icon">💻</div>
                <div className="card-content">
                  <h3>{softwareLicenses.filter(l => l.is_active).length}</h3>
                  <p>Software Licenses</p>
                </div>
              </div>
              <div className="overview-card">
                <div className="card-icon">✅</div>
                <div className="card-content">
                  <h3>{user?.isEmailVerified ? 'Verified' : 'Pending'}</h3>
                  <p>Account Status</p>
                </div>
              </div>
            </div>
          </section>

          {/* My Courses */}
          <section className="my-courses">
            <h2>My Courses</h2>
            {courses.length > 0 ? (
              <div className="courses-grid">
                {courses.map((course) => (
                  <div key={course.id} className="course-card">
                    <div className="course-header">
                      <h3>{course.title}</h3>
                      <span className="course-status active">Active</span>
                    </div>
                    <p className="course-description">{course.description}</p>
                    <div className="course-details">
                      <p><strong>Purchased:</strong> {new Date(course.purchased_at!).toLocaleDateString()}</p>
                      {course.expires_at && (
                        <p><strong>Expires:</strong> {new Date(course.expires_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    <Link to={`/course/${course.id}`} className="access-course-button">
                      Access Course
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No courses yet</h3>
                <p>Browse our course catalog to start your trading education journey</p>
                <Link to="/services" className="browse-courses-button">
                  Browse Courses
                </Link>
              </div>
            )}
          </section>

          {/* Software Licenses */}
          <section className="software-licenses">
            <h2>Software Licenses</h2>
            {softwareLicenses.length > 0 ? (
              <div className="licenses-list">
                {softwareLicenses.map((license, index) => (
                  <div key={index} className="license-card">
                    <div className="license-info">
                      <h3>AOM Trading Software</h3>
                      <p className="license-type">
                        {license.license_type === 'lifetime' ? 'Lifetime License' : 'Annual License'}
                      </p>
                      <div className="license-details">
                        <p><strong>Status:</strong> 
                          <span className={`status ${license.is_active ? 'active' : 'inactive'}`}>
                            {license.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                        <p><strong>Purchased:</strong> {new Date(license.purchased_at).toLocaleDateString()}</p>
                        {license.expires_at && (
                          <p><strong>Expires:</strong> {new Date(license.expires_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="license-actions">
                      <Link to="/software" className="access-software-button">
                        Download Software
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💻</div>
                <h3>No software licenses</h3>
                <p>Get access to our professional trading software suite</p>
                <Link to="/software" className="browse-software-button">
                  View Software
                </Link>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <Link to="/services" className="action-card">
                <div className="action-icon">🎓</div>
                <h3>Browse Courses</h3>
                <p>Explore our comprehensive trading education courses</p>
              </Link>
              <Link to="/software" className="action-card">
                <div className="action-icon">⚙️</div>
                <h3>Get Software</h3>
                <p>Download our professional trading tools</p>
              </Link>
              <Link to="/contact" className="action-card">
                <div className="action-icon">💬</div>
                <h3>Get Support</h3>
                <p>Contact our team for help and guidance</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;