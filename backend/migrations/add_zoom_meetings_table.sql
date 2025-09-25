-- Create table to store Zoom meeting metadata for scheduled sessions
CREATE TABLE IF NOT EXISTS zoom_meetings (
    id SERIAL PRIMARY KEY,
    meeting_id TEXT NOT NULL,
    meeting_url TEXT NOT NULL,
    passcode TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    required_subscription_tier TEXT NOT NULL DEFAULT 'basic'
        CHECK (required_subscription_tier IN ('basic', 'premium')),
    CONSTRAINT zoom_meetings_meeting_id_unique UNIQUE (meeting_id)
);

-- Seed default meetings for launch
INSERT INTO zoom_meetings (meeting_id, meeting_url, passcode, required_subscription_tier)
VALUES
    ('836 8128 3707', 'https://us02web.zoom.us/j/83681283707?pwd=BlEkwwzh1Uk6bahvKRoylRLPiv4zWF.1', '107134', 'basic'),
    ('824 3590 3679', 'https://us02web.zoom.us/j/82435903679?pwd=blcTLo5KkaOUVqyQlgTLe8k8KyawwW.1', '852141', 'premium')
ON CONFLICT (meeting_id) DO NOTHING;
