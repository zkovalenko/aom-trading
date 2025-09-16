-- Migration: Add license validation fields
-- Created: 2025-09-12

-- Add required fields to software_licenses table
ALTER TABLE public.software_licenses 
ADD COLUMN IF NOT EXISTS product_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_basic BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS device_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS max_devices INTEGER DEFAULT 2;

-- Create API keys table for authentication
CREATE TABLE IF NOT EXISTS public.api_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_software_licenses_product_number ON public.software_licenses(product_number);
CREATE INDEX IF NOT EXISTS idx_software_licenses_device_ids ON public.software_licenses USING GIN (device_ids);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(api_key);

-- Insert a default API key for testing (change this in production)
INSERT INTO api_keys (key_name, api_key) 
VALUES ('License Validation API', 'aom_license_api_key_' || substring(md5(random()::text) from 1 for 16))
ON CONFLICT (api_key) DO NOTHING;