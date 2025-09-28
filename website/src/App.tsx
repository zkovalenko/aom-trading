import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Homepage from './pages/Homepage';
import ServicesPage from './pages/ServicesPage';
import MySubscriptions from './pages/MySubscriptions';
import StudyCourse from './pages/StudyCourse';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import Software from './pages/Software';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import MeetingsPage from './pages/MeetingsPage';
import TermsOfService from './pages/TermsOfService';
import SupportPage from './pages/SupportPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#4CAF50',
                },
              },
              error: {
                style: {
                  background: '#dc3545',
                },
              },
            }}
          />
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/learn-to-trade" element={<ServicesPage />} />
              <Route path="/my-subscriptions" element={<MySubscriptions />} />
              <Route path="/my-subscriptions/study-course" element={<StudyCourse />} />
              <Route path="/my-subscriptions/study-course/:chapterId/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/my-subscriptions/study-course/:chapterId/quiz/:quizId" element={<QuizPage />} />
              <Route path="/my-subscriptions/software" element={<Software />} />
              <Route path="/trading-rooms" element={<MeetingsPage />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
