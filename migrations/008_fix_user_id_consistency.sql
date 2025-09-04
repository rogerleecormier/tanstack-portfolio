-- Migration: Fix User ID Consistency
-- This migration ensures all internal user IDs are consistent integers

-- First, create a proper user profile for the development user with ID '2'
INSERT OR IGNORE INTO user_profiles (
    id,
    name,
    birthdate,
    gender,
    height_ft,
    height_in,
    activity_level,
    timezone,
    created_at,
    updated_at
) VALUES (
    '2',
    'Development User',
    '1990-01-01',
    'male',
    6,
    0,
    'moderate',
    'America/New_York',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Update the mapping to use consistent integer IDs
UPDATE user_authentication_mapping 
SET internal_user_id = '2' 
WHERE auth_provider = 'development' AND auth_user_id = 'dev-user-123';

-- Clean up any inconsistent user profiles (optional - be careful with this)
-- DELETE FROM user_profiles WHERE id NOT IN ('1', '2');

-- Verify the mapping is correct
-- SELECT * FROM user_authentication_mapping;
