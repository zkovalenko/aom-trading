import { loadEnvironmentVariables } from '../config/env';

interface ZoomOccurrence {
  occurrence_id: string;
  start_time: string;
  duration: number;
  status: string;
}

interface ZoomMeetingDetails {
  id: string;
  uuid: string;
  topic: string;
  type: number;
  status: string;
  start_time: string;
  duration: number;
  timezone: string;
  join_url: string;
  password: string;
}

interface ZoomMeetingOccurrences extends ZoomMeetingDetails {
  occurrences?: ZoomOccurrence[];
}

class ZoomService {
  private clientId: string | null = null;
  private clientSecret: string | null = null;
  private accountId: string | null = null;
  private baseUrl = 'https://api.zoom.us/v2';

  constructor() {
    this.initializeCredentials();
  }

  private initializeCredentials() {
    loadEnvironmentVariables();

    this.clientId = process.env.ZOOM_API_CLIENT_ID || null;
    this.clientSecret = process.env.ZOOM_API_SECRET || null;
    this.accountId = process.env.ZOOM_API_ACCOUNT_ID || null;


    if (!this.clientId || !this.clientSecret || !this.accountId) {
      console.warn('⚠️ Zoom API credentials not found. Meeting occurrences will not be available.');
    }
  }

  private async generateZoomAPIToken(): Promise<string | null> {
    if (!this.clientId || !this.clientSecret || !this.accountId) {
      console.error('❌ Zoom API credentials missing for token generation');
      console.error('clientId:', !!this.clientId, 'clientSecret:', !!this.clientSecret, 'accountId:', !!this.accountId);
      return null;
    }

    // Use Buffer for base64 encoding with client_id:client_secret for Zoom OAuth
    const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const endpoint = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`;

    console.log('🔗 Generating Zoom OAuth token authString', authString);
    console.log('🔗 Using clientId:', this.clientId?.substring(0, 8) + '...');
    console.log('🔗 Using accountId:', this.accountId);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Zoom token API error:', response.status, errorText);
        return null;
      }

      const data = await response.json() as any;
      console.log('✅ Zoom OAuth token generated successfully');
      return data.access_token;
    } catch (error) {
      console.error('❌ Failed to generate Zoom token:', error);
      return null;
    }
  }

  private getFirstNOccurences(data: ZoomOccurrence[], n: number): ZoomOccurrence[] {
    if (!Array.isArray(data)) return [];
    const sortedByStart = [...data].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    return sortedByStart.slice(0, n);
  }

  private async makeZoomRequest(endpoint: string): Promise<any> {
    const token = await this.generateZoomAPIToken();
    const url = `${this.baseUrl}${endpoint}`;
    console.log('🔗 Making Zoom API request to:', endpoint);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Zoom API error:', response.status, errorText);
        throw new Error(`Zoom API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      console.log('✅ Zoom API response received:', {
        id: data.id,
        topic: data.topic,
        duration: data.duration,
        type: data.type,
        hasOccurrences: !!data.occurrences,
        occurrencesCount: data.occurrences?.length || 0
      });
      return data;
    } catch (error) {
      console.error('❌ Zoom API request failed:', error);
      throw error;
    }
  }

  /**
   * Get meeting details including occurrences for recurring meetings
   */
  async getMeetingWithOccurrences(meetingId: string): Promise<ZoomMeetingOccurrences | null> {
    if (!this.clientId || !this.clientSecret || !this.accountId) {
      console.log('⚠️ Zoom API not configured, skipping meeting occurrence fetch');
      return null;
    }

    try {
      console.log('🔍 Fetching meeting details for:', meetingId);

      // First get the basic meeting details
      const meetingDetails = await this.makeZoomRequest(`/meetings/${meetingId}`);

      // If it's a recurring meeting (type 8 or 9), get occurrences
      if (meetingDetails.type === 8 || meetingDetails.type === 9) {
        console.log('🔄 Fetching occurrences for recurring meeting');
        try {
          const detailsWithOccurrences = await this.makeZoomRequest(`/meetings/${meetingId}`);
          meetingDetails.occurrences = this.getFirstNOccurences(detailsWithOccurrences.occurrences || [], 3);
        } catch (occurrenceError) {
          console.warn('⚠️ Failed to fetch occurrences, continuing with basic meeting data:', occurrenceError);
          meetingDetails.occurrences = [];
        }
      }

      return meetingDetails;
    } catch (error) {
      console.error('❌ Failed to fetch meeting from Zoom API:', error);
      return null;
    }
  }

  /**
   * Get multiple meetings with their occurrences
   */
  async getMultipleMeetingsWithOccurrences(meetingIds: string[]): Promise<(ZoomMeetingOccurrences | null)[]> {
    console.log('🔍 Fetching multiple meetings with occurrences:', meetingIds.length);

    const promises = meetingIds.map(id => this.getMeetingWithOccurrences(id.replace(/\s+/g, "")));
    const results = await Promise.allSettled(promises);

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error('❌ Failed to fetch meeting:', result.reason);
        return null;
      }
    });
  }

  /**
   * Check if Zoom API is configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.accountId);
  }

  /**
   * Test token generation with detailed credential info
   */
  async testTokenGeneration(): Promise<void> {
    console.log('🧪 Testing Zoom token generation...');
    console.log('📋 Current credential configuration:');
    console.log('   Client ID:', this.clientId ? `${this.clientId.substring(0, 8)}...` : 'NOT SET');
    console.log('   Client Secret:', this.clientSecret ? `${this.clientSecret.substring(0, 8)}...` : 'NOT SET');
    console.log('   Account ID:', this.accountId ? `${this.accountId.substring(0, 8)}...` : 'NOT SET');

    const token = await this.generateZoomAPIToken();
    if (token) {
      console.log('✅ Test successful - token generated');
      console.log('🔑 Token preview:', `${token.substring(0, 20)}...`);
    } else {
      console.log('❌ Test failed - no token generated');
      console.log('💡 Please verify your Zoom API credentials are correct and active');
    }
  }
}

export default new ZoomService();
export type { ZoomMeetingOccurrences, ZoomOccurrence, ZoomMeetingDetails };
