-- Migration: 006_convert_to_pounds.sql
-- Description: Convert database schema from kilograms to pounds and update weight_goals structure
-- Author: Roger Lee Cormier
-- Date: 2024

-- Update weight_measurements table to store weight in pounds
ALTER TABLE weight_measurements RENAME TO weight_measurements_old;

CREATE TABLE weight_measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  weight_lbs REAL NOT NULL CHECK (weight_lbs > 0 AND weight_lbs < 2000),
  body_fat_percentage REAL CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  muscle_mass_lbs REAL CHECK (muscle_mass_lbs > 0),
  water_percentage REAL CHECK (water_percentage >= 0 AND water_percentage <= 100),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'manual',
  user_id TEXT DEFAULT '1',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing data from kg to lbs (multiply by 2.20462)
INSERT INTO weight_measurements (
  id, weight_lbs, body_fat_percentage, muscle_mass_lbs, water_percentage, 
  timestamp, source, user_id, notes, created_at, updated_at
)
SELECT 
  id, 
  ROUND(weight * 2.20462, 2) as weight_lbs,
  body_fat_percentage,
  CASE 
    WHEN muscle_mass IS NOT NULL THEN ROUND(muscle_mass * 2.20462, 2)
    ELSE NULL 
  END as muscle_mass_lbs,
  water_percentage,
  timestamp,
  source,
  user_id,
  notes,
  created_at,
  updated_at
FROM weight_measurements_old;

-- Update weight_goals table to use pounds and match the Settings page structure
ALTER TABLE weight_goals RENAME TO weight_goals_old;

CREATE TABLE weight_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  target_weight_lbs REAL NOT NULL CHECK (target_weight_lbs > 0),
  start_weight_lbs REAL NOT NULL CHECK (start_weight_lbs > 0),
  start_date TEXT NOT NULL,
  target_date TEXT,
  weekly_goal_lbs REAL CHECK (weekly_goal_lbs > 0),
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Migrate existing goals data from kg to lbs
INSERT INTO weight_goals (
  user_id, target_weight_lbs, start_weight_lbs, start_date, target_date, 
  weekly_goal_lbs, is_active, created_at, updated_at
)
SELECT 
  user_id,
  ROUND(target_weight * 2.20462, 2) as target_weight_lbs,
  ROUND(start_weight * 2.20462, 2) as start_weight_lbs,
  start_date,
  target_date,
  CASE 
    WHEN weekly_goal IS NOT NULL THEN ROUND(weekly_goal * 2.20462, 2)
    ELSE NULL 
  END as weekly_goal_lbs,
  is_active,
  created_at,
  updated_at
FROM weight_goals_old;

-- Update weight_projections table to use pounds
ALTER TABLE weight_projections RENAME TO weight_projections_old;

CREATE TABLE weight_projections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projected_date DATE NOT NULL,
  projected_weight_lbs REAL NOT NULL CHECK (projected_weight_lbs >= 0),
  confidence_interval REAL CHECK (confidence_interval >= 0 AND confidence_interval <= 1),
  calculation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  algorithm_version TEXT NOT NULL,
  user_id TEXT DEFAULT '1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing projections data from kg to lbs
INSERT INTO weight_projections (
  projected_date, projected_weight_lbs, confidence_interval, 
  calculation_date, algorithm_version, user_id, created_at
)
SELECT 
  projected_date,
  ROUND(projected_weight * 2.20462, 2) as projected_weight_lbs,
  confidence_interval,
  calculation_date,
  algorithm_version,
  user_id,
  created_at
FROM weight_projections_old;

-- Update body_composition table to use pounds
ALTER TABLE body_composition RENAME TO body_composition_old;

CREATE TABLE body_composition (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  body_fat_percentage REAL CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  muscle_mass_lbs REAL CHECK (muscle_mass_lbs > 0),
  water_percentage REAL CHECK (water_percentage >= 0 AND water_percentage <= 100),
  bone_density REAL CHECK (bone_density > 0),
  visceral_fat REAL CHECK (visceral_fat >= 0),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'manual',
  user_id TEXT DEFAULT '1',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing body composition data from kg to lbs
INSERT INTO body_composition (
  body_fat_percentage, muscle_mass_lbs, water_percentage, bone_density, 
  visceral_fat, timestamp, source, user_id, notes, created_at
)
SELECT 
  body_fat_percentage,
  CASE 
    WHEN muscle_mass IS NOT NULL THEN ROUND(muscle_mass * 2.20462, 2)
    ELSE NULL 
  END as muscle_mass_lbs,
  water_percentage,
  bone_density,
  visceral_fat,
  timestamp,
  source,
  user_id,
  notes,
  created_at
FROM body_composition_old;

-- Drop old tables
DROP TABLE weight_measurements_old;
DROP TABLE weight_goals_old;
DROP TABLE weight_projections_old;
DROP TABLE body_composition_old;

-- Update indexes for the new table structure
CREATE INDEX IF NOT EXISTS idx_weight_measurements_timestamp ON weight_measurements(timestamp);
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_id ON weight_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_goals_user_id ON weight_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_goals_active ON weight_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_weight_projections_date ON weight_projections(projected_date);
CREATE INDEX IF NOT EXISTS idx_body_composition_timestamp ON body_composition(timestamp);

-- Create triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_weight_measurements_timestamp 
  AFTER UPDATE ON weight_measurements
  BEGIN
    UPDATE weight_measurements SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_weight_goals_timestamp 
  AFTER UPDATE ON weight_goals
  BEGIN
    UPDATE weight_goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Insert default weight goal for user 1 if none exists
INSERT OR IGNORE INTO weight_goals (
  user_id, target_weight_lbs, start_weight_lbs, start_date, target_date, 
  weekly_goal_lbs, is_active, created_at, updated_at
) VALUES (
  '1',
  180.0,
  200.0,
  date('now'),
  date('now', '+6 months'),
  1.5,
  1,
  datetime('now'),
  datetime('now')
);
