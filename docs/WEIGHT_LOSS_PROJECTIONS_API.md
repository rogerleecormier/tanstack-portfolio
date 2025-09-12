# HealthBridge Enhanced API Documentation

## Overview

The HealthBridge Enhanced API provides advanced weight loss tracking capabilities with AI-powered projections, goal setting, and comprehensive analytics. This API is designed to transform basic health tracking into a sophisticated weight loss analytics platform.

## Base URL

```
https://healthbridge-enhanced.rcormier.workers.dev
```

## Authentication

All API endpoints require authentication. Include your API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

## API Endpoints

### 1. Weight Measurements

#### Create Weight Measurement

**POST** `/api/v2/weight/measurement`

Creates a new weight measurement with optional body composition data.

**Request Body:**

```json
{
  "weight": 75.5,
  "unit": "kg",
  "timestamp": "2024-01-15T08:00:00Z",
  "bodyFat": 18.5,
  "muscleMass": 65.2,
  "waterPercentage": 55.8,
  "source": "apple_health"
}
```

**Response:**

```json
{
  "success": true,
  "id": 123,
  "message": "Weight measurement created successfully"
}
```

#### Get Weight Measurements

**GET** `/api/v2/weight/measurement`

Retrieves weight measurements with optional filtering.

**Query Parameters:**

- `limit` (optional): Maximum number of records to return (default: 100)
- `days` (optional): Filter by last N days
- `start_date` (optional): Start date for range filter (YYYY-MM-DD)
- `end_date` (optional): End date for range filter (YYYY-MM-DD)

**Response:**

```json
[
  {
    "id": 123,
    "weight": 75.5,
    "weight_lb": "166.45",
    "body_fat_percentage": 18.5,
    "muscle_mass": 65.2,
    "water_percentage": 55.8,
    "timestamp": "2024-01-15T08:00:00Z",
    "source": "apple_health"
  }
]
```

### 2. Weight Loss Projections

#### Get Weight Projections

**GET** `/api/v2/weight/projections`

Retrieves AI-powered weight loss projections with confidence intervals.

**Query Parameters:**

- `days` (optional): Number of days to project (default: 30)

**Response:**

```json
{
  "current_weight": 75.5,
  "daily_rate": -0.1,
  "confidence": 0.85,
  "projections": [
    {
      "date": "2024-01-16",
      "projected_weight": 75.4,
      "confidence": 0.85,
      "daily_rate": -0.1,
      "days_from_now": 1
    }
  ],
  "algorithm": "linear_regression_v1"
}
```

### 3. Weight Trends Analysis

#### Get Weight Trends

**GET** `/api/v2/weight/trends`

Analyzes weight trends and detects patterns including plateaus.

**Query Parameters:**

- `period` (optional): Analysis period in days (default: 30)

**Response:**

```json
{
  "period_days": 30,
  "moving_averages": {
    "7_day": [75.2, 75.1, 75.0],
    "14_day": [75.3, 75.2, 75.1],
    "30_day": [75.4, 75.3, 75.2]
  },
  "plateaus": [
    {
      "start_date": "2024-01-10",
      "end_date": "2024-01-12",
      "duration_days": 3,
      "weight_change": 0.1
    }
  ],
  "overall_trend": "losing",
  "data_points": 30,
  "analysis_date": "2024-01-15T08:00:00Z"
}
```

### 4. Goal Management

#### Set Weight Loss Goal

**POST** `/api/v2/goals/set`

Creates or updates a weight loss goal.

**Request Body:**

```json
{
  "target_weight": 70.0,
  "start_weight": 75.5,
  "start_date": "2024-01-01",
  "target_date": "2024-04-01",
  "weekly_goal": 0.5
}
```

**Response:**

```json
{
  "success": true,
  "goal_id": 456,
  "message": "Goal set successfully"
}
```

#### Get Goal Progress

**GET** `/api/v2/goals/progress`

Retrieves current goal progress and achievements.

**Response:**

```json
{
  "goal_id": 456,
  "start_weight": 75.5,
  "target_weight": 70.0,
  "current_weight": 73.2,
  "weight_lost": 2.3,
  "weight_remaining": 3.2,
  "progress_percentage": 41.8,
  "days_since_start": 14,
  "projected_completion": "2024-03-15",
  "weekly_goal": 0.5,
  "is_on_track": true
}
```

#### Get All Goals

**GET** `/api/v2/goals/set`

Retrieves all goals (active and inactive).

**Response:**

```json
[
  {
    "id": 456,
    "target_weight": 70.0,
    "start_weight": 75.5,
    "start_date": "2024-01-01",
    "target_date": "2024-04-01",
    "weekly_goal": 0.5,
    "is_active": true,
    "user_id": "default",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### 5. Analytics Dashboard

#### Get Analytics Dashboard

**GET** `/api/v2/analytics/dashboard`

Retrieves comprehensive analytics data for the dashboard.

**Query Parameters:**

- `period` (optional): Analysis period in days (default: 30)

**Response:**

```json
{
  "metrics": {
    "total_measurements": 30,
    "period_days": "30",
    "current_weight": 73.2,
    "starting_weight": 75.5,
    "total_change": -2.3,
    "average_weight": 74.1,
    "min_weight": 73.0,
    "max_weight": 75.5
  },
  "trends": {
    "overall_trend": "losing",
    "weekly_average": [74.8, 74.5, 74.2, 73.8],
    "consistency_score": 78.5
  },
  "projections": {
    "current_weight": 73.2,
    "daily_rate": -0.1,
    "confidence": 0.85,
    "projections": [...],
    "algorithm": "linear_regression_v1"
  },
  "generated_at": "2024-01-15T08:00:00Z"
}
```

#### Get Comparative Analytics

**GET** `/api/v2/analytics/comparative`

Compares analytics between two different time periods.

**Query Parameters:**

- `period1` (optional): First period in days (default: 30)
- `period2` (optional): Second period in days (default: 60)

**Response:**

```json
{
  "period1": {
    "days": "30",
    "analytics": { ... }
  },
  "period2": {
    "days": "60",
    "analytics": { ... }
  },
  "comparison": {
    "weight_change": -1.2,
    "weight_change_percentage": -1.6,
    "improvement": true,
    "trend_comparison": true,
    "consistency_improvement": true
  }
}
```

## Data Models

### WeightMeasurement

```typescript
interface WeightMeasurement {
  id: number;
  weight: number;
  weight_lb: string;
  body_fat_percentage?: number;
  muscle_mass?: number;
  water_percentage?: number;
  timestamp: string;
  source: string;
}
```

### WeightProjection

```typescript
interface WeightProjection {
  date: string;
  projected_weight: number;
  confidence: number;
  daily_rate: number;
  days_from_now: number;
}
```

### WeightGoal

```typescript
interface WeightGoal {
  id: number;
  target_weight: number;
  start_weight: number;
  start_date: string;
  target_date?: string;
  weekly_goal?: number;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

### GoalProgress

```typescript
interface GoalProgress {
  goal_id: number;
  start_weight: number;
  target_weight: number;
  current_weight: number;
  weight_lost: number;
  weight_remaining: number;
  progress_percentage: number;
  days_since_start: number;
  projected_completion?: string;
  weekly_goal?: number;
  is_on_track: boolean;
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- Maximum 100 requests per minute per API key
- Rate limit headers are included in responses

## CORS Support

The API supports Cross-Origin Resource Sharing (CORS) for web applications:

- All origins are allowed (`Access-Control-Allow-Origin: *`)
- Supported methods: GET, POST, PUT, DELETE, OPTIONS
- Preflight requests are handled automatically

## Data Validation

All input data is validated according to these rules:

- Weight values must be positive and reasonable (0 < weight < 1000 kg)
- Body fat percentage must be between 0-100%
- Muscle mass must be positive
- Water percentage must be between 0-100%
- Dates must be in ISO 8601 format
- Units must be either "kg" or "lb"

## Performance Considerations

- API response times are typically under 500ms
- Database queries are optimized with proper indexing
- Projections are cached for improved performance
- Batch operations are supported for bulk data operations

## Security Features

- API key authentication required for all endpoints
- Input validation and sanitization
- SQL injection protection
- Rate limiting to prevent abuse
- CORS configuration for web security

## Migration from v1

The API maintains backward compatibility with v1 endpoints:

- Legacy endpoints remain available at `/api/health/*`
- Data format is automatically converted
- Gradual migration is supported

## Support and Documentation

For additional support or questions:

- Check the HealthBridge documentation
- Review the issue tracker for known issues
- Contact the development team

## Version History

- **v2.0.0** - Enhanced API with projections, goals, and analytics
- **v1.0.0** - Basic weight tracking functionality
