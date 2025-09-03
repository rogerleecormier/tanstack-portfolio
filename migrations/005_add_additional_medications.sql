-- Migration 005: Add additional weight loss medications
-- This adds Saxenda, Qsymia, Contrave, Xenical, Belviq, and Phentermine

-- Insert additional medication types with research-based efficacy data
INSERT OR REPLACE INTO medication_types (id, name, generic_name, weekly_efficacy_multiplier, max_weight_loss_percentage, typical_duration_weeks, description) VALUES
(5, 'Saxenda', 'Liraglutide', 1.25, 12.0, 56, 'Daily injection, GLP-1 receptor agonist, typically results in 8-12% weight loss over 56 weeks. SCALE trials show 8.0% weight loss vs 2.6% placebo.'),
(6, 'Qsymia', 'Phentermine-Topiramate', 1.20, 10.0, 56, 'Daily oral medication, combination therapy, typically results in 8-10% weight loss over 56 weeks. EQUIP trials show 9.3% weight loss vs 1.2% placebo.'),
(7, 'Contrave', 'Naltrexone-Bupropion', 1.15, 8.0, 56, 'Daily oral medication, combination therapy, typically results in 6-8% weight loss over 56 weeks. COR-II trials show 6.1% weight loss vs 1.3% placebo.'),
(8, 'Xenical', 'Orlistat', 1.10, 6.0, 52, 'Daily oral medication, lipase inhibitor, typically results in 5-6% weight loss over 52 weeks. Clinical trials show 5.4% weight loss vs 3.0% placebo.'),
(9, 'Belviq', 'Lorcaserin', 1.12, 7.0, 52, 'Daily oral medication, serotonin receptor agonist, typically results in 5-7% weight loss over 52 weeks. BLOOM trials show 5.8% weight loss vs 2.2% placebo.'),
(10, 'Phentermine', 'Phentermine', 1.08, 5.0, 12, 'Daily oral medication, appetite suppressant, typically results in 3-5% weight loss over 12 weeks. Short-term use only, limited long-term data.');

-- Update existing medications with more accurate research-based data
UPDATE medication_types SET 
  weekly_efficacy_multiplier = 1.35,
  max_weight_loss_percentage = 18.0,
  description = 'Weekly injection, GLP-1 receptor agonist, typically results in 15-18% weight loss over 68 weeks. Clinical trials show 14.9% weight loss vs 2.4% placebo.'
WHERE name IN ('Ozempic', 'Wegovy');

UPDATE medication_types SET 
  weekly_efficacy_multiplier = 1.65,
  max_weight_loss_percentage = 22.0,
  description = 'Weekly injection, dual GIP/GLP-1 receptor agonist, typically results in 18-22% weight loss over 72 weeks. Clinical trials show 21.1% weight loss vs 3.1% placebo.'
WHERE name IN ('Zepbound', 'Mounjaro');

-- Verify the updates
SELECT 
  id,
  name,
  generic_name,
  weekly_efficacy_multiplier,
  max_weight_loss_percentage,
  typical_duration_weeks
FROM medication_types 
ORDER BY id;
