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

-- Insert default medication types with research-based efficacy data
INSERT OR REPLACE INTO medication_types (id, name, generic_name, weekly_efficacy_multiplier, max_weight_loss_percentage, typical_duration_weeks, description) VALUES
(1, 'Ozempic', 'Semaglutide', 1.35, 18.0, 68, 'Weekly injection, GLP-1 receptor agonist, typically results in 15-18% weight loss over 68 weeks. Clinical trials show 14.9% weight loss vs 2.4% placebo.'),
(2, 'Zepbound', 'Tirzepatide', 1.65, 22.0, 72, 'Weekly injection, dual GIP/GLP-1 receptor agonist, typically results in 18-22% weight loss over 72 weeks. Clinical trials show 21.1% weight loss vs 3.1% placebo.'),
(3, 'Wegovy', 'Semaglutide', 1.35, 18.0, 68, 'Higher dose semaglutide specifically for weight loss, same efficacy as Ozempic. STEP trials show 15-18% weight loss over 68 weeks.'),
(4, 'Mounjaro', 'Tirzepatide', 1.65, 22.0, 72, 'Same medication as Zepbound but marketed for diabetes, same weight loss efficacy. SURMOUNT trials show 18-22% weight loss.'),
(5, 'Saxenda', 'Liraglutide', 1.25, 12.0, 56, 'Daily injection, GLP-1 receptor agonist, typically results in 8-12% weight loss over 56 weeks. SCALE trials show 8.0% weight loss vs 2.6% placebo.'),
(6, 'Qsymia', 'Phentermine-Topiramate', 1.20, 10.0, 56, 'Daily oral medication, combination therapy, typically results in 8-10% weight loss over 56 weeks. EQUIP trials show 9.3% weight loss vs 1.2% placebo.'),
(7, 'Contrave', 'Naltrexone-Bupropion', 1.15, 8.0, 56, 'Daily oral medication, combination therapy, typically results in 6-8% weight loss over 56 weeks. COR-II trials show 6.1% weight loss vs 1.3% placebo.'),
(8, 'Xenical', 'Orlistat', 1.10, 6.0, 52, 'Daily oral medication, lipase inhibitor, typically results in 5-6% weight loss over 52 weeks. Clinical trials show 5.4% weight loss vs 3.0% placebo.'),
(9, 'Belviq', 'Lorcaserin', 1.12, 7.0, 52, 'Daily oral medication, serotonin receptor agonist, typically results in 5-7% weight loss over 52 weeks. BLOOM trials show 5.8% weight loss vs 2.2% placebo.'),
(10, 'Phentermine', 'Phentermine', 1.08, 5.0, 12, 'Daily oral medication, appetite suppressant, typically results in 3-5% weight loss over 12 weeks. Short-term use only, limited long-term data.');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_medications_user_id ON user_medications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_medications_active ON user_medications(is_active);
CREATE INDEX IF NOT EXISTS idx_medication_types_name ON medication_types(name);

