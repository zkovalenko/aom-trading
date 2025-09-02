-- Add licenseeNumber and licenseNumber columns to user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS licensee_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(255);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_licensee_number 
ON user_subscriptions(licensee_number);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_license_number 
ON user_subscriptions(license_number);