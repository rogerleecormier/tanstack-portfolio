-- Migration: 001_enhanced_weight_tracking.sql
-- Description: Enhanced weight tracking schema with comprehensive health metrics
-- Author: Roger Lee Cormier
-- Date: 2024

-- Enhanced weight measurements table
CREATE TABLE IF NOT EXISTS weight_measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  weight REAL NOT NULL CHECK (weight > 0 AND weight < 1000),
  body_fat_percentage REAL CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  muscle_mass REAL CHECK (muscle_mass > 0),
  water_percentage REAL CHECK (water_percentage >= 0 AND water_percentage <= 100),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'apple_health',
  user_id TEXT DEFAULT 'default',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Weight goals table
CREATE TABLE IF NOT EXISTS weight_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_weight REAL NOT NULL CHECK (target_weight > 0),
  start_weight REAL NOT NULL CHECK (start_weight > 0),
  start_date DATE NOT NULL,
  target_date DATE,
  weekly_goal REAL CHECK (weekly_goal > 0),
  is_active BOOLEAN DEFAULT 1,
  user_id TEXT DEFAULT 'default',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Weight projections table for caching
CREATE TABLE IF NOT EXISTS weight_projections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projected_date DATE NOT NULL,
  projected_weight REAL NOT NULL CHECK (projected_weight >= 0),
  confidence_interval REAL CHECK (confidence_interval >= 0 AND confidence_interval <= 1),
  calculation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  algorithm_version TEXT NOT NULL,
  user_id TEXT DEFAULT 'default',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Health metrics table for additional tracking
CREATE TABLE IF NOT EXISTS health_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('calories', 'steps', 'sleep', 'exercise', 'heart_rate', 'blood_pressure')),
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'apple_health',
  user_id TEXT DEFAULT 'default',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Body composition tracking table
CREATE TABLE IF NOT EXISTS body_composition (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  body_fat_percentage REAL CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  muscle_mass REAL CHECK (muscle_mass > 0),
  water_percentage REAL CHECK (water_percentage >= 0 AND water_percentage <= 100),
  bone_density REAL CHECK (bone_density > 0),
  visceral_fat REAL CHECK (visceral_fat >= 0),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'manual',
  user_id TEXT DEFAULT 'default',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Exercise tracking table
CREATE TABLE IF NOT EXISTS exercise_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  calories_burned REAL CHECK (calories_burned >= 0),
  intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'apple_health',
  user_id TEXT DEFAULT 'default',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sleep tracking table
CREATE TABLE IF NOT EXISTS sleep_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sleep_duration_hours REAL CHECK (sleep_duration_hours >= 0 AND sleep_duration_hours <= 24),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  deep_sleep_percentage REAL CHECK (deep_sleep_percentage >= 0 AND deep_sleep_percentage <= 100),
  rem_sleep_percentage REAL CHECK (rem_sleep_percentage >= 0 AND rem_sleep_percentage <= 100),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'apple_health',
  user_id TEXT DEFAULT 'default',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition tracking table
CREATE TABLE IF NOT EXISTS nutrition_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories INTEGER CHECK (calories >= 0),
  protein_g REAL CHECK (protein_g >= 0),
  carbs_g REAL CHECK (carbs_g >= 0),
  fat_g REAL CHECK (fat_g >= 0),
  fiber_g REAL CHECK (fiber_g >= 0),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'manual',
  user_id TEXT DEFAULT 'default',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weight_measurements_timestamp ON weight_measurements(timestamp);
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_id ON weight_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_goals_user_id ON weight_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_goals_active ON weight_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_weight_projections_date ON weight_projections(projected_date);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type_timestamp ON health_metrics(metric_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_body_composition_timestamp ON body_composition(timestamp);
CREATE INDEX IF NOT EXISTS idx_exercise_log_timestamp ON exercise_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_sleep_log_timestamp ON sleep_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_nutrition_log_timestamp ON nutrition_log(timestamp);

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

-- Insert sample data for testing (optional)
-- INSERT INTO weight_measurements (weight, body_fat_percentage, muscle_mass, water_percentage, timestamp) 
-- VALUES (80.5, 18.5, 65.2, 55.8, '2024-01-01 08:00:00');

-- INSERT INTO weight_goals (target_weight, start_weight, start_date, weekly_goal) 
-- VALUES (75.0, 80.5, '2024-01-01', 0.5);

-- End of migration
