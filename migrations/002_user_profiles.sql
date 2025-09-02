-- Migration: 002_user_profiles.sql
-- Description: Create user_profiles table for HealthBridge user settings
-- Author: Roger Lee Cormier
-- Date: 2024

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    height_cm INTEGER NOT NULL,
    height_ft INTEGER NOT NULL,
    height_in INTEGER NOT NULL,
    activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create weight_goals table
CREATE TABLE IF NOT EXISTS weight_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    target_weight REAL NOT NULL,
    start_weight REAL NOT NULL,
    start_date TEXT NOT NULL,
    target_date TEXT,
    weekly_goal REAL NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_weight_goals_user_id ON weight_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_goals_active ON weight_goals(is_active);

-- Insert default profile for existing user (you can modify this)
INSERT OR IGNORE INTO user_profiles (
    id,
    name,
    age,
    gender,
    height_cm,
    height_ft,
    height_in,
    activity_level,
    created_at,
    updated_at
) VALUES (
    '1',
    'Roger Lee Cormier',
    35,
    'male',
    175,
    5,
    9,
    'moderate',
    datetime('now'),
    datetime('now')
);

-- Insert default weight goal for existing user
INSERT OR IGNORE INTO weight_goals (
    user_id,
    target_weight,
    start_weight,
    start_date,
    target_date,
    weekly_goal,
    is_active,
    created_at,
    updated_at
) VALUES (
    '1',
    72.0,
    85.0,
    date('now'),
    date('now', '+6 months'),
    0.5,
    1,
    datetime('now'),
    datetime('now')
);

