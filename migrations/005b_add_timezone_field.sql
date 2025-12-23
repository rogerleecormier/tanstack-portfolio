-- Migration 005: Add timezone field to user_profiles table

-- Add timezone field (only if it doesn't exist)
ALTER TABLE user_profiles ADD COLUMN timezone TEXT DEFAULT 'America/New_York';

-- Note: birthdate field already exists from previous migrations
-- This migration only adds the timezone field
