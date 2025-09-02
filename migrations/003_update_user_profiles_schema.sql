-- Migration 003: Update user_profiles schema to use birthdate and English units
-- Date: 2024

-- Drop existing tables to recreate with new schema
DROP TABLE IF EXISTS weight_goals;
DROP TABLE IF EXISTS user_profiles;

-- Recreate user_profiles table with birthdate and English units
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    birthdate TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    height_ft INTEGER NOT NULL,
    height_in INTEGER NOT NULL,
    activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Recreate weight_goals table
CREATE TABLE weight_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    target_weight_lbs REAL NOT NULL, -- Store in pounds
    start_weight_lbs REAL NOT NULL, -- Store in pounds
    start_date TEXT NOT NULL,
    target_date TEXT,
    weekly_goal_lbs REAL NOT NULL, -- Store in pounds
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_id ON user_profiles(id);
CREATE INDEX idx_weight_goals_user_id ON weight_goals(user_id);
CREATE INDEX idx_weight_goals_active ON weight_goals(is_active);

-- Insert default user profile with birthdate (calculating to age 35)
INSERT INTO user_profiles (
    id, 
    name, 
    birthdate, 
    gender, 
    height_ft, 
    height_in, 
    activity_level, 
    created_at, 
    updated_at
) VALUES (
    '1',
    'Roger Lee Cormier',
    '1989-01-01', -- Example birthdate (will calculate to ~35 years old)
    'male',
    5,
    10,
    'moderate',
    datetime('now'),
    datetime('now')
);

-- Insert default weight goal
INSERT INTO weight_goals (
    user_id,
    target_weight_lbs,
    start_weight_lbs,
    start_date,
    target_date,
    weekly_goal_lbs,
    is_active,
    created_at,
    updated_at
) VALUES (
    '1',
    180.0, -- Target weight in pounds
    200.0, -- Start weight in pounds
    date('now'),
    date('now', '+6 months'),
    1.5, -- Weekly goal in pounds
    1,
    datetime('now'),
    datetime('now')
);

