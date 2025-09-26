import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, apiCall } from '../contexts/AuthContext';
import './MeetingsPage.css';

interface ZoomOccurrence {
  occurrence_id: string;
  start_time: string;
  duration: number;
  status: string;
}

interface Meeting {
  meetingId: string;
  meetingUrl: string;
  passcode: string;
  scheduledAt: string | null;
  requiredSubscriptionTier?: string;
  occurrences: ZoomOccurrence[]; // Direct access to occurrences
  zoomData?: {
    topic: string;
    status: string;
    start_time: string;
    duration: number;
    timezone: string;
    occurrences: ZoomOccurrence[];
  } | null;
}

const MeetingsPage: React.FC = () => {
  const { token, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const upcomingMeetings = useMemo(() => {
    const now = Date.now();
    const upcomingItems: Array<Meeting & { nextOccurrence?: ZoomOccurrence }> = [];

    meetings.forEach((meeting) => {
      // If we have occurrences, use those
      if (meeting.occurrences?.length) {
        const futureOccurrences = meeting.occurrences.filter(occurrence => {
          const occurrenceTime = new Date(occurrence.start_time).getTime();
          return !Number.isNaN(occurrenceTime) && occurrenceTime >= now;
        });

        if (futureOccurrences.length > 0) {
          // Sort occurrences by start time and take the next one
          futureOccurrences.sort((a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
          upcomingItems.push({ ...meeting, nextOccurrence: futureOccurrences[0] });
        }
      } else if (meeting.scheduledAt) {
        // Fallback to scheduledAt if no occurrences
        const scheduledTime = new Date(meeting.scheduledAt).getTime();
        if (!Number.isNaN(scheduledTime) && scheduledTime >= now) {
          upcomingItems.push(meeting);
        }
      }
    });

    return upcomingItems
      .sort((a, b) => {
        const dateA = a.nextOccurrence
          ? new Date(a.nextOccurrence.start_time).getTime()
          : new Date(a.scheduledAt || 0).getTime();
        const dateB = b.nextOccurrence
          ? new Date(b.nextOccurrence.start_time).getTime()
          : new Date(b.scheduledAt || 0).getTime();
        return dateA - dateB;
      })
      .slice(0, 3);
  }, [meetings]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchMeetings = async () => {
      try {
        const response = await apiCall('/meetings', { method: 'GET' }, token);

        if (response.status === 403) {
          setError('An active subscription is required to view meetings.');
          setMeetings([]);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load meetings');
        }

        const data = await response.json();
        const meetingsData: Meeting[] = data?.data?.meetings || [];
        console.log("~~meetingsData:", meetingsData);
        console.log("~~First meeting zoomData:", meetingsData[0]?.zoomData);
        console.log("~~First meeting duration:", meetingsData[0]?.zoomData?.duration);
        setMeetings(meetingsData);
      } catch (err) {
        console.error('Failed to load meetings:', err);
        setError('We could not load meetings right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [authLoading, navigate, token]);

  if (authLoading || loading) {
    return (
      <div className="meetings-page">
        <div className="container">
          <div className="loading">Loading your meetings...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="meetings-page">
        <div className="container">
          <div className="no-access">Please log in to view meetings.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="meetings-page">
        <div className="container">
          <div className="error-message">{error}</div>
          <a href="/learn-to-trade" className="subscribe-link">View Subscription Plans</a>
        </div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="meetings-page">
        <div className="container">
          <div className="no-meetings">
            <h2>No Meetings Available</h2>
            <p>Check back soon for upcoming sessions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="meetings-page">
        <div className="container">
          <h1>Trading rooms</h1>
          {upcomingMeetings.length > 0 && (
            <section className="upcoming-section" aria-label="Upcoming meetings schedule">
              <h2>Upcoming Schedule</h2>
              <ul className="upcoming-list">
                {upcomingMeetings.map((meeting) => {
                  const displayDate = meeting.nextOccurrence
                    ? new Date(meeting.nextOccurrence.start_time)
                    : meeting.scheduledAt
                    ? new Date(meeting.scheduledAt)
                    : null;

                  return (
                    <li className="upcoming-item" key={`upcoming-${meeting.meetingId}-${meeting.nextOccurrence?.occurrence_id || meeting.scheduledAt}`}>
                      <div className="upcoming-meta">
                        <span className={`tier-badge ${meeting.requiredSubscriptionTier === 'premium' ? 'tier-premium' : 'tier-basic'}`}>
                          {meeting.requiredSubscriptionTier === 'premium' ? 'Premium' : 'Basic'} Subscription
                        </span>
                        {displayDate && (
                          <time dateTime={displayDate.toISOString()}>
                            {displayDate.toLocaleString(undefined, {
                              dateStyle: 'full',
                              timeStyle: 'short'
                            })}
                          </time>
                        )}
                      </div>
                      <div className="upcoming-info">
                        {meeting.zoomData?.topic && (
                          <div className="meeting-topic">{meeting.zoomData.topic}</div>
                        )}
                        {meeting.nextOccurrence && (
                          <div className="occurrence-info">
                            Duration: {meeting.nextOccurrence.duration} minutes
                            {meeting.zoomData?.timezone && (
                              <span> • {meeting.zoomData.timezone}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="upcoming-links">
                        <span className="upcoming-id">ID: {meeting.meetingId}</span>
                        <a
                          href={meeting.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join Link
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          <div className="meetings-grid">
            {meetings.map((meeting) => {
            const scheduledDate = meeting.scheduledAt
              ? new Date(meeting.scheduledAt)
              : null;

            return (
              <div className="meeting-card" key={`${meeting.meetingId}-${meeting.scheduledAt}`}>
                <div className="meeting-card-header">
                  <h2>{meeting.zoomData?.topic || 'Zoom Session'}</h2>
                </div>
                {meeting.zoomData && (
                  <div className="zoom-info">
                    <div className="meeting-detail">
                      <span className="label">Status:</span>
                      <span className="value">{meeting.zoomData.status}</span>
                    </div>
                    {meeting.zoomData.start_time && (
                      <div className="meeting-detail">
                        <span className="label">Start Time:</span>
                        <span className="value">
                          {new Date(meeting.zoomData.start_time).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                    )}
                    <div className="meeting-detail">
                      <span className="label">Duration:</span>
                      <span className="value">{meeting.zoomData.duration || 'N/A'} minutes</span>
                    </div>
                    {meeting.zoomData.timezone && (
                      <div className="meeting-detail">
                        <span className="label">Timezone:</span>
                        <span className="value">{meeting.zoomData.timezone}</span>
                      </div>
                    )}
                  </div>
                )}
                {!meeting.zoomData && scheduledDate && (
                  <p className="meeting-time">
                    {scheduledDate.toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                )}
                {!meeting.zoomData && !scheduledDate && (
                  <p className="meeting-time unscheduled">Schedule TBA</p>
                )}
                <div className="meeting-detail">
                  <span className="label">Meeting ID:</span>
                  <span className="value">{meeting.meetingId}</span>
                </div>
                <div className="meeting-detail">
                  <span className="label">Passcode:</span>
                  <span className="value">{meeting.passcode}</span>
                </div>
                {/* Debug info */}
                <div className="meeting-detail">
                  <span className="label">Debug - Zoom Data:</span>
                  <span className="value">{meeting.zoomData ? 'Available' : 'Missing'}</span>
                </div>
                {!meeting.zoomData && (
                  <div className="meeting-detail">
                    <span className="label">Duration (Fallback):</span>
                    <span className="value">60 minutes (default)</span>
                  </div>
                )}
                {meeting.occurrences && meeting.occurrences.length > 0 && (
                  <div className="occurrences-section">
                    <h3>Upcoming Occurrences</h3>
                    <div className="occurrences-list">
                      {meeting.occurrences
                        .filter(occurrence => new Date(occurrence.start_time).getTime() >= Date.now())
                        .slice(0, 3)
                        .map(occurrence => (
                          <div key={occurrence.occurrence_id} className="occurrence-item">
                            <div className="occurrence-time">
                              {new Date(occurrence.start_time).toLocaleString(undefined, {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </div>
                            <div className="occurrence-duration">{occurrence.duration}min</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                <a
                  href={meeting.meetingUrl}
                  className="join-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Meeting
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
