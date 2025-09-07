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
        console.log('🔄 AuthCallback: Processing OAuth callback');
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 Search params:', window.location.search);
        
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        
        console.log('🔍 Extracted token:', token ? 'Token exists' : 'No token');
        console.log('🔍 Extracted error:', error);

        if (error) {
          console.log('❌ OAuth error detected:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }

        if (token) {
          console.log('✅ Token found, setting auth token...');
          // Set token and refresh profile through AuthContext
          await setAuthToken(token);

          // Get redirect parameter, default to /learn-to-trade
          let redirectTo = searchParams.get('redirect') || '/learn-to-trade';
          
          // Handle legacy /services redirect (convert to /learn-to-trade)
          if (redirectTo === '/services') {
            console.log("~~ we still redirect to services")
            redirectTo = '/learn-to-trade';
          }
          
          // Handle subscription redirect parameters
          const subscriptionRedirect = searchParams.get('subscriptionRedirect');
          const productId = searchParams.get('product');
          const subscriptionType = searchParams.get('type');
          
          if ((subscriptionRedirect === 'subscribe' || subscriptionRedirect === 'subscribe-direct') && productId && subscriptionType) {
            redirectTo = `/learn-to-trade?redirect=${subscriptionRedirect}&product=${productId}&type=${subscriptionType}`;
          }

          console.log('🔀 Redirecting to:', redirectTo);
          // Navigate to the redirect URL
          navigate(redirectTo);
        } else {
          console.log('❌ No token found in callback URL');
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