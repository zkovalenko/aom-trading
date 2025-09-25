import { Request, Response } from 'express';
import pool from '../config/database';
import zoomService from '../services/zoomService';
import type { ZoomMeetingOccurrences } from '../services/zoomService';

interface MeetingRow {
  meeting_id: string;
  meeting_url: string;
  passcode: string;
  required_subscription_tier: string;
}

const canAccessMeeting = (
  tier: string,
  subscriptionAccess: any
): boolean => {
  const normalizedTier = (tier || 'basic').toLowerCase();

  if (!subscriptionAccess) {
    return false;
  }

  if (normalizedTier === 'premium') {
    return subscriptionAccess.hasPremiumAccess;
  }

  // Default to basic access requirement
  return subscriptionAccess.hasBasicAccess;
};

const evaluateSubscriptionAccess = (subscriptions: any[]) => {
  let hasAnyActiveSubscription = false;
  let hasBasicAccess = false;
  let hasPremiumAccess = false;

  const now = Date.now();

  subscriptions.forEach(subscription => {
    const status = subscription.subscriptionStatus;
    const expiryDate = subscription.subscriptionExpiryDate
      ? new Date(subscription.subscriptionExpiryDate).getTime()
      : null;
    const trialExpiryDate = subscription.subscriptionTrialExpiryDate
      ? new Date(subscription.subscriptionTrialExpiryDate).getTime()
      : null;

    let isCurrentlyActive = false;

    if (status === 'active') {
      isCurrentlyActive = !expiryDate || expiryDate >= now;
    } else if (status === 'trial') {
      isCurrentlyActive = !trialExpiryDate || trialExpiryDate >= now;
    }

    if (!isCurrentlyActive) {
      return;
    }

    hasAnyActiveSubscription = true;

    const productName = typeof subscription.productName === 'string'
      ? subscription.productName.toLowerCase()
      : '';
    const subscriptionType = typeof subscription.subscriptionType === 'string'
      ? subscription.subscriptionType.toLowerCase()
      : '';

    const isPremium = productName.includes('premium') || subscriptionType === 'premium';

    if (isPremium) {
      hasPremiumAccess = true;
      hasBasicAccess = true; // Premium plans can access basic meetings too
    } else {
      hasBasicAccess = true;
    }
  });

  return {
    hasAnyActiveSubscription,
    hasBasicAccess,
    hasPremiumAccess
  };
};

export const getActiveMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    // First, get user's subscriptions from the database
    const userId = (req.user as any).id;

    const userSubscriptionResult = await pool.query(
      'SELECT subscriptions, license_number, licensee_number FROM user_subscriptions WHERE user_id = $1',
      [userId]
    );

    let subscriptions: any[] = [];

    if (userSubscriptionResult.rows.length > 0) {
      const record = userSubscriptionResult.rows[0];
      subscriptions = record.subscriptions || [];

      // Parse subscriptions if they're stored as a string
      if (typeof subscriptions === 'string') {
        try {
          subscriptions = JSON.parse(subscriptions);
        } catch (error) {
          console.warn('Failed to parse subscriptions JSON for user', userId, error);
          subscriptions = [];
        }
      }
    }

    // Evaluate subscription access
    const subscriptionAccess = evaluateSubscriptionAccess(subscriptions);
    const userAccess = {
      hasAnyActiveSubscription: subscriptionAccess.hasAnyActiveSubscription,
      hasBasicAccess: subscriptionAccess.hasBasicAccess,
      hasPremiumAccess: subscriptionAccess.hasPremiumAccess,
      subscriptions: Array.isArray(subscriptions) ? subscriptions : []
    };

    // If user has no active subscriptions, return empty meetings
    if (!userAccess.hasAnyActiveSubscription) {
      res.json({
        success: true,
        data: {
          meetings: [],
          subscriptionAccess: userAccess
        }
      });
      return;
    }

    // Now get meetings that match the user's access level
    const { rows } = await pool.query<MeetingRow>(
      `SELECT meeting_id, meeting_url, passcode, required_subscription_tier
       FROM zoom_meetings
       WHERE is_active = true`
    );

    // Filter meetings based on user access
    const accessibleMeetings = rows.filter((row) =>
      canAccessMeeting(row.required_subscription_tier, userAccess)
    );

    // Get Zoom data for accessible meetings
    let meetingsWithOccurrences = [];

    console.log("Checking if ZOOM is configured: ", zoomService.isConfigured());

    if (zoomService.isConfigured() && accessibleMeetings.length > 0) {
      console.log('🔄 Fetching Zoom meeting occurrences...');

      const meetingIds = accessibleMeetings.map(row => row.meeting_id);
      const zoomData = await zoomService.getMultipleMeetingsWithOccurrences(meetingIds);

      meetingsWithOccurrences = accessibleMeetings.map((row, index) => {
        const zoomMeeting = zoomData[index];

        return {
          meetingId: row.meeting_id,
          meetingUrl: row.meeting_url,
          passcode: row.passcode,
          requiredSubscriptionTier: row.required_subscription_tier,
          // Add occurrences directly to the meeting object for easy access
          occurrences: zoomMeeting?.occurrences || [],
          // Add Zoom API data if available
          zoomData: zoomMeeting ? {
            topic: zoomMeeting.topic,
            status: zoomMeeting.status,
            start_time: zoomMeeting.start_time,
            duration: zoomMeeting.duration,
            timezone: zoomMeeting.timezone,
            occurrences: zoomMeeting.occurrences || []
          } : null
        };
      });
    } else {
      // Fallback to basic meeting data if Zoom API is not configured
      meetingsWithOccurrences = accessibleMeetings.map((row) => ({
        meetingId: row.meeting_id,
        meetingUrl: row.meeting_url,
        passcode: row.passcode,
        requiredSubscriptionTier: row.required_subscription_tier,
        occurrences: [], // Empty array when Zoom API is not available
        zoomData: null
      }));
    }

    res.json({
      success: true,
      data: {
        meetings: meetingsWithOccurrences,
        subscriptionAccess: userAccess,
        zoomApiConfigured: zoomService.isConfigured()
      }
    });
  } catch (error) {
    console.error('Failed to load meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load meetings'
    });
  }
};

export default {
  getActiveMeetings
};
