-- Migration to remove software_licenses table and add device tracking to user_subscriptions
-- This consolidates the license system to use only user_subscriptions

-- Drop the software_licenses table
DROP TABLE IF EXISTS software_licenses CASCADE;

-- Drop the api_keys table (since we'll use user_subscriptions instead)
DROP TABLE IF EXISTS api_keys CASCADE;
