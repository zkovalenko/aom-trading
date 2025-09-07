import passport from 'passport';
import { Strategy as GoogleStrategy, StrategyOptions, Profile } from 'passport-google-oauth20';
import pool from './database';
import { loadEnvironmentVariables } from './env';

// Initialize passport configuration (called at runtime, not build time)
export function initializePassport() {
  // Load environment variables
  loadEnvironmentVariables();
  
  // Debug environment variables
  console.log('🔍 Passport Config Debug:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
  console.log('BACKEND_URL:', process.env.BACKEND_URL);

  // Validate required environment variables
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is required');
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET environment variable is required');
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const callbackURL = isProduction 
    ? `${process.env.BACKEND_URL || 'https://aom-trading.onrender.com'}/api/auth/google/callback`
    : '/api/auth/google/callback';

  console.log('🔗 OAuth Callback URL:', callbackURL);

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
      } as StrategyOptions,
      async (accessToken: string, refreshToken: string, profile: Profile, done: Function) => {
        try {
          const googleId = profile.id;
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
          const firstName = profile.name?.givenName || '';
          const lastName = profile.name?.familyName || '';

          // Check if user already exists
          const existingUserResult = await pool.query(
            'SELECT * FROM users WHERE google_id = $1 OR email = $2',
            [googleId, email]
          );

          if (existingUserResult.rows.length > 0) {
            // User exists, update their info
            const updateResult = await pool.query(
              'UPDATE users SET google_id = $1, first_name = $2, last_name = $3, updated_at = CURRENT_TIMESTAMP WHERE email = $4 RETURNING *',
              [googleId, firstName, lastName, email]
            );
            return done(null, updateResult.rows[0]);
          } else {
            // Create new user
            const newUserResult = await pool.query(
              'INSERT INTO users (email, first_name, last_name, google_id, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
              [email, firstName, lastName, googleId]
            );
            return done(null, newUserResult.rows[0]);
          }
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, false);
        }
      }
    )
  );

  // Serialize user for the session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        done(null, result.rows[0]);
      } else {
        // User not found in database (e.g., after clearing users table)
        // This is not an error - just return null to indicate no authenticated user
        done(null, null);
      }
    } catch (error) {
      console.error('Passport deserialize error:', error);
      done(error, false);
    }
  });
}

export default passport;