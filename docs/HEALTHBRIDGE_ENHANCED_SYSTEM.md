# HealthBridge Enhanced System Documentation

## Overview

HealthBridge Enhanced is a comprehensive weight loss tracking and projection system built on Cloudflare Workers with advanced smart analytics, medication efficacy modeling, and seamless iOS integration. The system provides sophisticated weight loss projections based on clinical research, user activity levels, and medication effects.

## 🏗️ System Architecture

### Core Components

- **Cloudflare Worker**: `healthbridge-enhanced.js` - Main API server
- **D1 Database**: `health_bridge` - SQLite database for data persistence
- **Frontend Interface**: React-based dashboard and weight entry
- **iOS Integration**: Apple Health sync via iOS Shortcuts
- **Medication Database**: Research-based efficacy multipliers

### Technology Stack

- **Backend**: Cloudflare Workers (JavaScript)
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Authentication**: Cloudflare Access integration
- **Data Sources**: Apple Health, manual entry, fitness apps
- **Analytics**: Custom linear regression algorithms

## 📊 Database Schema

### Core Tables

#### Weight Measurements (`weight` table)
```sql
CREATE TABLE weight (
  uuid TEXT PRIMARY KEY,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  kg REAL NOT NULL,
  sourceBundleId TEXT,
  createdAt TEXT,
  updatedAt TEXT
);
```

#### User Profiles (`user_profiles` table)
```sql
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  birthdate TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_ft INTEGER NOT NULL,
  height_in INTEGER NOT NULL,
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  timezone TEXT DEFAULT 'America/New_York',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### Weight Goals (`weight_goals` table)
```sql
CREATE TABLE weight_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  target_weight_lbs REAL NOT NULL,
  start_weight_lbs REAL NOT NULL,
  start_date TEXT NOT NULL,
  target_date TEXT,
  weekly_goal_lbs REAL,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);
```

#### Medication Tracking (`user_medications` & `medication_types`)
```sql
CREATE TABLE medication_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  generic_name TEXT,
  weekly_efficacy_multiplier REAL,
  max_weight_loss_percentage REAL,
  typical_duration_weeks INTEGER,
  description TEXT
);

CREATE TABLE user_medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  medication_type_id INTEGER,
  dosage_mg REAL,
  frequency TEXT,
  start_date TEXT,
  is_active BOOLEAN DEFAULT 1,
  notes TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (medication_type_id) REFERENCES medication_types(id)
);
```

## 🔌 API Endpoints

### Base URL
```
https://healthbridge-enhanced.rcormier.workers.dev
```

### Weight Management

#### Create Weight Measurement
```http
POST /api/v2/weight/measurement
Content-Type: application/json

{
  "weight": 178.5,
  "unit": "lb",
  "timestamp": "2024-01-15T08:00:00Z",
  "bodyFat": 18.5,
  "muscleMass": 65.2,
  "waterPercentage": 55.8,
  "source": "apple_health"
}
```

#### Get Weight Measurements
```http
GET /api/v2/weight/measurement?limit=100&days=30&userId=dev-user-123
```

### Weight Loss Projections

#### Get AI Projections
```http
GET /api/v2/weight/projections?days=30&userId=dev-user-123
```

**Response includes:**
- Current weight and daily loss rate
- Confidence intervals
- Medication vs non-medication scenarios
- Activity level impact
- 30-day projection array

### Analytics Dashboard

#### Get Comprehensive Analytics
```http
GET /api/v2/analytics/dashboard?period=30&userId=dev-user-123
```

**Includes:**
- Weight metrics (current, average, min/max)
- Trend analysis with moving averages
- Plateau detection
- Consistency scoring
- Comparative analytics

### User Management

#### Get User Profile
```http
GET /api/v2/user/profile?userId=dev-user-123
```

#### Update User Profile
```http
PUT /api/v2/user/profile
Content-Type: application/json

{
  "id": "dev-user-123",
  "name": "John Doe",
  "birthdate": "1990-01-01",
  "gender": "male",
  "height_ft": 6,
  "height_in": 0,
  "activity_level": "moderate",
  "timezone": "America/New_York"
}
```

### Medication Management

#### Get User Medications
```http
GET /api/v2/user/medications?userId=dev-user-123
```

#### Get Available Medication Types
```http
GET /api/v2/medication-types
```

## 🧬 Medication Efficacy System

### Research-Based Multipliers

The system uses clinical trial data to calculate medication effects:

#### GLP-1 Receptor Agonists
- **Semaglutide (Wegovy)**: 1.35x weekly efficacy (35% improvement)
- **Liraglutide (Saxenda)**: 1.25x weekly efficacy (25% improvement)

#### Dual GIP/GLP-1 Receptor Agonists
- **Tirzepatide (Zepbound)**: 1.65x weekly efficacy (65% improvement)

#### Combination Therapies
- **Phentermine-Topiramate (Qsymia)**: 1.20x weekly efficacy (20% improvement)
- **Naltrexone-Bupropion (Contrave)**: 1.15x weekly efficacy (15% improvement)

### Dosage Scaling
Medications are scaled based on:
- **Dosage strength**: Higher doses = better efficacy
- **Frequency**: Daily/weekly = 100%, bi-weekly = 80%, monthly = 50%
- **Time on medication**: 12-16 weeks to reach full effectiveness

### Clinical Evidence Sources
- STEP trials (Semaglutide)
- SURMOUNT trials (Tirzepatide)
- SCALE trials (Liraglutide)
- EQUIP trials (Qsymia)
- COR-II trials (Contrave)

## 📱 iOS Integration

### Apple Health Sync

The system integrates with Apple Health through iOS Shortcuts:

#### Data Flow
1. **iOS Shortcut**: User enters weight in shortcut
2. **Apple Health**: Data automatically synced to Health app
3. **Webhook**: Apple Health webhook triggers data sync
4. **Cloudflare Worker**: Processes and stores weight data
5. **Dashboard**: Updates projections and analytics

#### Supported Data Sources
- `com.apple.Health` - Apple Health app
- `com.myfitnesspal` - MyFitnessPal
- `com.google.android.apps.fitness` - Google Fit
- `com.fitbit.FitbitMobile` - Fitbit
- `com.samsung.shealth` - Samsung Health

#### iOS Shortcut Configuration
The iOS shortcut:
- Prompts user for weight input
- Saves to Apple Health with timestamp
- Triggers webhook to Cloudflare Worker
- Provides confirmation feedback

## 🔬 Weight Loss Projection Algorithm

### Linear Regression Model

The system uses advanced linear regression with multiple factors:

#### Base Calculation
```javascript
// Calculate daily weight loss rate
const totalDays = (latestDate - earliestDate) / (1000 * 60 * 60 * 24);
const totalWeightLoss = (earliestWeight - latestWeight) * 2.20462; // Convert to lbs
const dailyRate = totalWeightLoss / totalDays;
```

#### Activity Level Multipliers
- **Sedentary**: 1.2x (little/no exercise)
- **Light**: 1.375x (1-3 days/week)
- **Moderate**: 1.55x (3-5 days/week)
- **Active**: 1.725x (6-7 days/week)
- **Very Active**: 1.9x (heavy exercise + physical job)

#### Medication Impact Calculation
```javascript
// Calculate medication multiplier
const medicationMultiplier = calculateMedicationMultiplier(userMedications);
const adjustedDailyRate = dailyRate * activityMultiplier;
const medicationDailyRate = adjustedDailyRate * (1 + medicationMultiplier);
```

#### Confidence Scoring
- Based on data consistency and variance
- Minimum 7 measurements required
- Higher confidence with more consistent data
- Plateau detection for trend analysis

## 📈 Analytics Features

### Trend Analysis
- **Moving Averages**: 7-day, 14-day, 30-day
- **Plateau Detection**: Identifies periods of no significant change
- **Overall Trend**: Losing, gaining, stable, or insufficient data

### Consistency Scoring
- Measures weight fluctuation consistency
- Threshold-based scoring (1 lb variance)
- Percentage of consistent days vs total days

### Comparative Analytics
- Compare different time periods
- Track improvement over time
- Identify patterns and trends

## 🔧 Configuration

### Environment Variables
```toml
[vars]
ENVIRONMENT = "production"
API_VERSION = "v2"
```

### Database Configuration
```toml
[[d1_databases]]
binding = "DB"
database_name = "health_bridge"
database_id = "dd2b4664-fa2b-4534-8f07-3d1d0361ec06"
```

### Cron Jobs
```toml
[triggers]
crons = [
  "0 0 * * *"  # Daily at midnight - calculate projections
]
```

## 🚀 Deployment

### Worker Deployment
```bash
# Deploy the enhanced worker
wrangler deploy --config wrangler/wrangler-healthbridge-enhanced.toml

# Verify deployment
wrangler tail healthbridge-enhanced
```

### Database Migrations
```bash
# Run migrations in order
wrangler d1 execute health_bridge --file migrations/001_enhanced_weight_tracking.sql
wrangler d1 execute health_bridge --file migrations/002_user_profiles.sql
wrangler d1 execute health_bridge --file migrations/004_medication_tracking.sql
wrangler d1 execute health_bridge --file migrations/006_convert_to_pounds.sql
```

## 🔐 Security Features

### Authentication
- Cloudflare Access integration
- API key authentication
- User ID mapping system

### Data Validation
- Input sanitization
- SQL injection protection
- Weight range validation (0-2000 lbs)
- Date format validation

### CORS Configuration
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

## 📊 Performance Optimization

### Database Indexing
- Timestamp-based indexes for weight queries
- User ID indexes for profile lookups
- Active goal indexes for quick access

### Caching Strategy
- Projection caching in database
- Daily cron job for projection updates
- Development user dummy data for testing

### Response Times
- API responses typically under 500ms
- Optimized database queries
- Efficient data structures

## 🧪 Development & Testing

### Development Mode
- Dummy data for development users (`dev-user-123`, `dev@rcormier.dev`)
- Mock API responses for local testing
- Comprehensive logging and debugging

### Testing Features
- User mapping debug endpoint
- Comprehensive error handling
- Validation testing for all endpoints

## 📞 Support & Maintenance

### Monitoring
- Cloudflare Workers analytics
- Database performance monitoring
- API response time tracking
- Error rate monitoring

### Backup Strategy
- Automated D1 database backups
- Migration rollback procedures
- Data export capabilities

### Documentation Updates
- API documentation maintenance
- Clinical research updates
- User guide improvements
- Developer documentation

