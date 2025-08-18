import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }

        if (token) {
          // Set token and refresh profile through AuthContext
          await setAuthToken(token);

          // Get redirect parameter, default to /services
          const redirectTo = searchParams.get('redirect') || '/services';

          // Navigate to the redirect URL
          navigate(redirectTo);
        } else {
          toast.error('No authentication token received');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      } finally {
        setProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuthToken]);

  if (processing) {
    return (
      <div className="auth-callback-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem'
      }}>
        <div className="spinner" style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <h2>Processing Authentication...</h2>
        <p>Please wait while we complete your sign-in.</p>
      </div>
    );
  }

  return null;
};

export default AuthCallback;