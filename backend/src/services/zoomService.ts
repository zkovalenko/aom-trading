import jwt from 'jsonwebtoken';
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
  private apiKey: string | null = null;
  private apiSecret: string | null = null;
  private accountId: string | null = null;
  private baseUrl = 'https://api.zoom.us/v2';

  constructor() {
    this.initializeCredentials();
  }

  private initializeCredentials() {
    loadEnvironmentVariables();

    this.apiKey = process.env.ZOOM_API_KEY || null;
    this.apiSecret = process.env.ZOOM_API_SECRET || null;
    this.accountId = process.env.ZOOM_ACCOUNT_ID || null;

    if (!this.apiKey || !this.apiSecret || !this.accountId) {
      console.warn('⚠️ Zoom API credentials not found. Meeting occurrences will not be available.');
    }
  }

  private generateJWT(): string | null {
    if (!this.apiKey || !this.apiSecret) {
      console.error('❌ Zoom API credentials missing for JWT generation');
      return null;
    }

    const payload = {
      iss: this.apiKey,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    };

    try {
      return jwt.sign(payload, this.apiSecret);
    } catch (error) {
      console.error('❌ Failed to generate Zoom JWT:', error);
      return null;
    }
  }

  private async makeZoomRequest(endpoint: string): Promise<any> {
    const token = this.generateJWT();
    if (!token) {
      throw new Error('Failed to generate Zoom authentication token');
    }

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

      const data = await response.json();
      console.log('✅ Zoom API response received');
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
    if (!this.apiKey || !this.apiSecret) {
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
          const occurrences = await this.makeZoomRequest(`/meetings/${meetingId}/instances`);
          meetingDetails.occurrences = occurrences.meetings || [];
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

    const promises = meetingIds.map(id => this.getMeetingWithOccurrences(id));
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
    return !!(this.apiKey && this.apiSecret && this.accountId);
  }
}

export default new ZoomService();
export type { ZoomMeetingOccurrences, ZoomOccurrence, ZoomMeetingDetails };
