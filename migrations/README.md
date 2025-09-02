# Database Migrations for HealthBridge

This directory contains SQL migration scripts for setting up and updating the HealthBridge D1 database schema.

## Migration Files

### 001_enhanced_weight_tracking.sql
- Creates enhanced weight tracking tables
- Includes weight measurements, projections, and analytics tables
- Uses kilograms for weight storage

### 002_user_profiles.sql
- Creates user profile management tables
- Includes user_profiles and weight_goals tables
- Adds foreign key relationships and indexes

### 003_update_user_profiles_schema.sql
- Updates user profiles schema with additional fields
- Adds timezone support and other enhancements

### 004_medication_tracking.sql
- Creates medication tracking tables
- Includes medication types and user medication relationships

### 005_add_timezone_field.sql
- Adds timezone field to user profiles
- Enhances timezone handling capabilities

### 006_convert_to_pounds.sql ⭐ **NEW**
- **Converts entire database from kilograms to pounds**
- Updates weight_measurements table to store weight_lbs
- Updates weight_goals table to use pounds
- Updates weight_projections table to use pounds
- Migrates existing data from kg to lbs (multiplies by 2.20462)
- **Removes goal-setting functionality from HealthBridge app**
- **Moves goal management to Settings page only**
- Updates all related indexes and triggers

## Running Migrations

### Prerequisites
1. **Wrangler CLI**: Install globally with `npm install -g wrangler`
2. **D1 Database**: Ensure your D1 database is configured in wrangler.toml
3. **Authentication**: Run `wrangler login` if not already authenticated

### Option 1: PowerShell Script (Recommended for Pounds Migration)
```powershell
# Run the pounds conversion migration
.\scripts\run-pounds-migration.ps1

# Or with custom parameters
.\scripts\run-pounds-migration.ps1 -DatabaseName "your-db-name" -MigrationFile "migrations/006_convert_to_pounds.sql"
```

### Option 2: PowerShell Script (User Profiles)
```powershell
# Run from project root
.\scripts\run-user-profiles-migration.ps1

# Or with custom parameters
.\scripts\run-user-profiles-migration.ps1 -DatabaseName "your-db-name" -MigrationFile "migrations/002_user_profiles.sql"
```

### Option 3: Batch File (Windows)
```cmd
# Run from project root
scripts\run-user-profiles-migration.bat
```

### Option 4: Manual Wrangler Command
```bash
# Run the migration directly
wrangler d1 execute health_bridge --file migrations/006_convert_to_pounds.sql --config wrangler-d1.toml

# Verify tables were created
wrangler d1 execute health_bridge --command "SELECT name FROM sqlite_master WHERE type='table';" --config wrangler-d1.toml
```

## Database Schema

### weight_measurements Table (After Pounds Migration)
```sql
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
```

### weight_goals Table (After Pounds Migration)
```sql
CREATE TABLE weight_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    target_weight_lbs REAL NOT NULL,
    start_weight_lbs REAL NOT NULL,
    start_date TEXT NOT NULL,
    target_date TEXT,
    weekly_goal_lbs REAL CHECK (weekly_goal_lbs > 0),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);
```

### user_profiles Table
```sql
CREATE TABLE user_profiles (
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
```

## Important Changes in Pounds Migration

### ⚠️ Breaking Changes
- **All weight data is now stored in pounds instead of kilograms**
- **Goal-setting functionality removed from HealthBridge app**
- **Goals are now managed exclusively in Settings page**

### 🔄 Data Migration
- Existing weight measurements are automatically converted from kg to lbs
- Weight goals are converted from kg to lbs
- All projections and analytics now use pounds
- Thresholds updated for pound-based calculations (e.g., plateau detection)

### 📱 App Behavior Changes
- HealthBridge app only allows weight entry
- No more goal setting or progress tracking in the app
- All displays show weights in pounds (with kg conversion for reference)
- Settings page becomes the central location for goal management

## Default Data

The migration script automatically:
- Converts existing weight data from kg to lbs
- Updates table schemas to use pounds
- Maintains data integrity during conversion
- Creates appropriate indexes for performance

## Verification

After running the pounds migration, verify it worked by checking:
1. Tables exist: `SELECT name FROM sqlite_master WHERE type='table';`
2. Weight data in pounds: `SELECT weight_lbs FROM weight_measurements LIMIT 5;`
3. Goals data in pounds: `SELECT target_weight_lbs FROM weight_goals;`
4. Data conversion: Verify weights are reasonable pound values

## Troubleshooting

### Common Issues
1. **Wrangler not found**: Install with `npm install -g wrangler`
2. **Database not found**: Check your wrangler.toml configuration
3. **Permission denied**: Ensure you're logged in with `wrangler login`
4. **Migration fails**: Check that existing data is valid before migration

### Rollback (If Needed)
If you need to rollback the pounds migration:
```sql
-- This is complex and should be done carefully
-- Consider restoring from backup instead
-- The migration script creates backup tables that can be restored
```

## Next Steps

After running the pounds migration:
1. **Update your HealthBridge app** to use the new API structure
2. **Test weight entry functionality** to ensure pounds are working
3. **Verify goals are working** in the Settings page
4. **Deploy the updated worker** and frontend
5. **Update any external integrations** that might expect kg values

## Migration Order

**Important**: Run migrations in this order:
1. `001_enhanced_weight_tracking.sql` (if not already run)
2. `002_user_profiles.sql` (if not already run)
3. `003_update_user_profiles_schema.sql` (if not already run)
4. `004_medication_tracking.sql` (if not already run)
5. `005_add_timezone_field.sql` (if not already run)
6. **`006_convert_to_pounds.sql`** ⭐ **Run this last**

The pounds migration depends on the previous migrations being completed first.
