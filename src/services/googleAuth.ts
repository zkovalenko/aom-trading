// Removed google-auth-library dependency to avoid Node.js polyfills

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

class GoogleAuthService {
  private clientId: string;

  constructor() {
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  }

  async initializeGoogleSignIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.clientId) {
        reject(new Error('Google Client ID not configured'));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        window.google?.accounts.id.initialize({
          client_id: this.clientId,
          callback: this.handleCredentialResponse.bind(this),
        });
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
      document.head.appendChild(script);
    });
  }

  private handleCredentialResponse(response: any) {
    // This will be called when Google Sign-In is successful
    // The response contains the JWT token
    console.log('Google Sign-In successful:', response);
  }

  async signInWithPopup(): Promise<GoogleUser | null> {
    if (!this.clientId) {
      throw new Error('Google Client ID not configured');
    }

    return new Promise((resolve, reject) => {
      window.google?.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'email profile',
        callback: async (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }

          try {
            const userInfo = await this.getUserInfo(response.access_token);
            resolve(userInfo);
          } catch (error) {
            reject(error);
          }
        },
      }).requestAccessToken();
    });
  }

  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    return response.json();
  }

  async verifyIdToken(idToken: string): Promise<GoogleUser | null> {
    // Note: For security, ID token verification should be done server-side
    // This client-side implementation is for development/testing only
    try {
      // Decode the JWT payload (this is NOT secure verification)
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      
      // Basic validation - in production, use server-side verification
      if (payload.aud !== this.clientId) {
        throw new Error('Invalid audience');
      }
      
      return {
        sub: payload.sub,
        name: payload.name,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture,
        email: payload.email,
        email_verified: payload.email_verified,
        locale: payload.locale,
      };
    } catch (error) {
      console.error('Error verifying ID token:', error);
      throw error;
    }
  }

  renderSignInButton(elementId: string, theme: 'outline' | 'filled_blue' | 'filled_black' = 'outline'): void {
    if (!window.google || !this.clientId) {
      console.error('Google Sign-In not properly initialized');
      return;
    }

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme,
        size: 'large',
        width: '100%',
      }
    );
  }
}

export const googleAuthService = new GoogleAuthService();