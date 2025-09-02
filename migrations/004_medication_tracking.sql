-- Migration 004: Add medication tracking for weight loss medications
-- This adds support for Ozempic, Zepbound, and other weight loss medications

-- Create medication_types table
CREATE TABLE IF NOT EXISTS medication_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    generic_name TEXT NOT NULL,
    weekly_efficacy_multiplier REAL NOT NULL,
    max_weight_loss_percentage REAL NOT NULL,
    typical_duration_weeks INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create user_medications table
CREATE TABLE IF NOT EXISTS user_medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    medication_type_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    dosage_mg REAL,
    frequency TEXT DEFAULT 'weekly',
    is_active BOOLEAN DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_type_id) REFERENCES medication_types(id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

-- Insert default medication types
INSERT OR REPLACE INTO medication_types (id, name, generic_name, weekly_efficacy_multiplier, max_weight_loss_percentage, typical_duration_weeks, description) VALUES
(1, 'Ozempic', 'Semaglutide', 1.4, 20.0, 68, 'Weekly injection, GLP-1 receptor agonist, typically results in 15-20% weight loss over 68 weeks'),
(2, 'Zepbound', 'Tirzepatide', 1.75, 25.0, 72, 'Weekly injection, dual GIP/GLP-1 receptor agonist, typically results in 20-25% weight loss over 72 weeks'),
(3, 'Wegovy', 'Semaglutide', 1.4, 20.0, 68, 'Higher dose semaglutide specifically for weight loss, same efficacy as Ozempic'),
(4, 'Mounjaro', 'Tirzepatide', 1.75, 25.0, 72, 'Same medication as Zepbound but marketed for diabetes, same weight loss efficacy');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_medications_user_id ON user_medications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_medications_active ON user_medications(is_active);
CREATE INDEX IF NOT EXISTS idx_medication_types_name ON medication_types(name);

