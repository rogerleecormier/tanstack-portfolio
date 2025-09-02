/**
 * @fileoverview Enhanced HealthBridge Worker
 * @description Advanced weight loss tracking and projection API with D1 database integration
 * @author Roger Lee Cormier
 * @version 2.0.0
 * @lastUpdated 2024
 * 
 * @features
 * - Weight loss projections with confidence intervals
 * - Advanced health metrics tracking
 * - Goal setting and progress tracking
 * - Trend analysis and analytics
 * - Enhanced data schema for comprehensive health tracking
 * 
 * @endpoints
 * - POST /api/v2/weight/measurement
 * - GET /api/v2/weight/projections
 * - GET /api/v2/weight/trends
 * - GET /api/v2/goals/progress
 * - POST /api/v2/goals/set
 * - GET /api/v2/analytics/dashboard
 * - GET /api/v2/analytics/comparative
 */

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // API v2 endpoints
      if (path.startsWith('/api/v2/')) {
        return await handleV2API(request, env, ctx, corsHeaders);
      }

      // Legacy API v1 endpoints (backward compatibility)
      if (path.startsWith('/api/health/')) {
        return await handleLegacyAPI(request, env, ctx, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('HealthBridge Worker Error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error', message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};

/**
 * Handle API v2 endpoints with enhanced functionality
 */
async function handleV2API(request, env, ctx, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Weight measurement endpoints
  if (path === '/api/v2/weight/measurement') {
    if (request.method === 'POST') {
      return await createWeightMeasurement(request, env, corsHeaders);
    }
    if (request.method === 'GET') {
      return await getWeightMeasurements(request, env, corsHeaders);
    }
  }

  // Weight projections endpoint
  if (path === '/api/v2/weight/projections') {
    return await getWeightProjections(request, env, corsHeaders);
  }

  // Weight trends endpoint
  if (path === '/api/v2/weight/trends') {
    return await getWeightTrends(request, env, corsHeaders);
  }

  // Goals endpoints
  if (path === '/api/v2/goals/progress') {
    return await getGoalProgress(request, env, corsHeaders);
  }
  if (path === '/api/v2/goals/set') {
    if (request.method === 'POST') {
      return await setGoal(request, env, corsHeaders);
    }
    if (request.method === 'GET') {
      return await getGoals(request, env, corsHeaders);
    }
  }

  // Analytics endpoints
  if (path === '/api/v2/analytics/dashboard') {
    return await getAnalyticsDashboard(request, env, corsHeaders);
  }
  if (path === '/api/v2/analytics/comparative') {
    return await getComparativeAnalytics(request, env, corsHeaders);
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

/**
 * Handle legacy API v1 endpoints for backward compatibility
 */
async function handleLegacyAPI(request, env, ctx, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/health/weight') {
    if (request.method === 'GET') {
      return await getLegacyWeights(request, env, corsHeaders);
    }
    if (request.method === 'POST') {
      return await createLegacyWeight(request, env, corsHeaders);
    }
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

/**
 * Create a new weight measurement with enhanced data
 */
async function createWeightMeasurement(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { weight, unit, timestamp, bodyFat, muscleMass, waterPercentage, source = 'apple_health' } = body;

    // Validate required fields
    if (!weight || !unit || !timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: weight, unit, timestamp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert to kg if needed
    const weightKg = unit === 'lb' ? weight * 0.453592 : weight;

    // Insert into enhanced weight_measurements table
    const stmt = env.DB.prepare(`
      INSERT INTO weight_measurements (weight, body_fat_percentage, muscle_mass, water_percentage, timestamp, source)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      weightKg,
      bodyFat || null,
      muscleMass || null,
      waterPercentage || null,
      timestamp,
      source
    ).run();

    // Calculate and store projections
    await calculateAndStoreProjections(env);

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: result.meta.last_row_id,
        message: 'Weight measurement created successfully' 
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating weight measurement:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create weight measurement', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get weight measurements with enhanced filtering
 */
async function getWeightMeasurements(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const days = url.searchParams.get('days');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    let query = `
      SELECT id, weight, body_fat_percentage, muscle_mass, water_percentage, timestamp, source
      FROM weight_measurements
    `;
    let params = [];

    if (days) {
      query += ` WHERE timestamp >= datetime('now', '-${days} days')`;
    } else if (startDate && endDate) {
      query += ` WHERE timestamp BETWEEN ? AND ?`;
      params = [startDate, endDate];
    }

    query += ` ORDER BY timestamp DESC LIMIT ?`;
    params.push(limit);

    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...params).all();

    const measurements = result.results.map(row => ({
      id: row.id,
      weight: row.weight,
      weight_lb: (row.weight * 2.20462).toFixed(2),
      body_fat_percentage: row.body_fat_percentage,
      muscle_mass: row.muscle_mass,
      water_percentage: row.water_percentage,
      timestamp: row.timestamp,
      source: row.source
    }));

    return new Response(
      JSON.stringify(measurements),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching weight measurements:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch weight measurements', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get weight loss projections with confidence intervals
 */
async function getWeightProjections(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');

    // Get recent weight data for projections
    const stmt = env.DB.prepare(`
      SELECT weight, timestamp FROM weight_measurements 
      ORDER BY timestamp DESC LIMIT 30
    `);
    const result = await stmt.all();

    if (result.results.length < 7) {
      return new Response(
        JSON.stringify({ error: 'Insufficient data for projections. Need at least 7 measurements.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const projections = calculateWeightProjections(result.results, days);

    return new Response(
      JSON.stringify(projections),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calculating weight projections:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to calculate projections', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Calculate weight loss projections using linear regression
 */
function calculateWeightProjections(measurements, days) {
  // Sort by date (oldest first)
  const sortedMeasurements = measurements
    .map(m => ({ ...m, date: new Date(m.timestamp) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate daily weight loss rate
  const totalDays = (sortedMeasurements[sortedMeasurements.length - 1].date - sortedMeasurements[0].date) / (1000 * 60 * 60 * 24);
  const totalWeightLoss = sortedMeasurements[0].weight - sortedMeasurements[sortedMeasurements.length - 1].weight;
  const dailyRate = totalWeightLoss / totalDays;

  // Calculate confidence based on data consistency
  const variance = calculateVariance(sortedMeasurements.map(m => m.weight));
  const confidence = Math.max(0.1, Math.min(0.95, 1 - (variance / 100)));

  // Generate projections
  const projections = [];
  const currentWeight = sortedMeasurements[sortedMeasurements.length - 1].weight;
  const currentDate = new Date();

  for (let i = 1; i <= days; i++) {
    const projectedDate = new Date(currentDate);
    projectedDate.setDate(currentDate.getDate() + i);
    
    const projectedWeight = currentWeight - (dailyRate * i);
    
    projections.push({
      date: projectedDate.toISOString().split('T')[0],
      projected_weight: Math.max(0, projectedWeight),
      confidence: confidence,
      daily_rate: dailyRate,
      days_from_now: i
    });
  }

  return {
    current_weight: currentWeight,
    daily_rate: dailyRate,
    confidence: confidence,
    projections: projections,
    algorithm: 'linear_regression_v1'
  };
}

/**
 * Calculate variance for confidence scoring
 */
function calculateVariance(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Get weight trends and analysis
 */
async function getWeightTrends(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30';

    // Get weight data for trend analysis
    const stmt = env.DB.prepare(`
      SELECT weight, timestamp FROM weight_measurements 
      WHERE timestamp >= datetime('now', '-${period} days')
      ORDER BY timestamp ASC
    `);
    const result = await stmt.all();

    if (result.results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No data available for trend analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trends = analyzeWeightTrends(result.results);

    return new Response(
      JSON.stringify(trends),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing weight trends:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze trends', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Analyze weight trends and patterns
 */
function analyzeWeightTrends(measurements) {
  const weights = measurements.map(m => m.weight);
  const dates = measurements.map(m => new Date(m.timestamp));

  // Calculate moving averages
  const movingAverages = {
    '7_day': calculateMovingAverage(weights, 7),
    '14_day': calculateMovingAverage(weights, 14),
    '30_day': calculateMovingAverage(weights, 30)
  };

  // Detect plateaus (periods of no significant change)
  const plateaus = detectPlateaus(weights, dates);

  // Calculate overall trend
  const trend = calculateOverallTrend(weights, dates);

  return {
    period_days: measurements.length,
    moving_averages: movingAverages,
    plateaus: plateaus,
    overall_trend: trend,
    data_points: measurements.length,
    analysis_date: new Date().toISOString()
  };
}

/**
 * Calculate moving average for trend analysis
 */
function calculateMovingAverage(values, window) {
  if (values.length < window) return null;
  
  const result = [];
  for (let i = window - 1; i < values.length; i++) {
    const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / window);
  }
  return result;
}

/**
 * Detect weight loss plateaus
 */
function detectPlateaus(weights, dates) {
  const plateaus = [];
  const threshold = 0.5; // kg threshold for plateau detection
  
  for (let i = 2; i < weights.length; i++) {
    const change = Math.abs(weights[i] - weights[i - 1]);
    if (change < threshold) {
      plateaus.push({
        start_date: dates[i - 1].toISOString().split('T')[0],
        end_date: dates[i].toISOString().split('T')[0],
        duration_days: 1,
        weight_change: change
      });
    }
  }
  
  return plateaus;
}

/**
 * Calculate overall weight trend
 */
function calculateOverallTrend(weights, dates) {
  if (weights.length < 2) return 'insufficient_data';
  
  const totalChange = weights[weights.length - 1] - weights[0];
  const totalDays = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
  
  if (totalDays === 0) return 'no_change';
  
  const dailyRate = totalChange / totalDays;
  
  if (dailyRate > 0.1) return 'gaining';
  if (dailyRate < -0.1) return 'losing';
  return 'stable';
}

/**
 * Get goal progress and achievements
 */
async function getGoalProgress(request, env, corsHeaders) {
  try {
    const stmt = env.DB.prepare(`
      SELECT * FROM weight_goals WHERE is_active = 1 ORDER BY start_date DESC LIMIT 1
    `);
    const goalResult = await stmt.all();

    if (goalResult.results.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active goals found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const goal = goalResult.results[0];
    
    // Get current weight
    const currentWeightStmt = env.DB.prepare(`
      SELECT weight FROM weight_measurements ORDER BY timestamp DESC LIMIT 1
    `);
    const currentWeightResult = await currentWeightStmt.all();
    
    if (currentWeightResult.results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No weight data available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentWeight = currentWeightResult.results[0].weight;
    const progress = calculateGoalProgress(goal, currentWeight);

    return new Response(
      JSON.stringify(progress),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting goal progress:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get goal progress', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Calculate goal progress and achievements
 */
function calculateGoalProgress(goal, currentWeight) {
  const totalWeightToLose = goal.start_weight - goal.target_weight;
  const weightLost = goal.start_weight - currentWeight;
  const progressPercentage = (weightLost / totalWeightToLose) * 100;
  
  const daysSinceStart = Math.floor((new Date() - new Date(goal.start_date)) / (1000 * 60 * 60 * 24));
  const projectedCompletion = goal.target_date ? new Date(goal.target_date) : null;
  
  return {
    goal_id: goal.id,
    start_weight: goal.start_weight,
    target_weight: goal.target_weight,
    current_weight: currentWeight,
    weight_lost: weightLost,
    weight_remaining: totalWeightToLose - weightLost,
    progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
    days_since_start: daysSinceStart,
    projected_completion: projectedCompletion,
    weekly_goal: goal.weekly_goal,
    is_on_track: progressPercentage >= (daysSinceStart / 7) * (goal.weekly_goal || 1)
  };
}

/**
 * Set or update weight loss goals
 */
async function setGoal(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { target_weight, start_weight, start_date, target_date, weekly_goal } = body;

    // Validate required fields
    if (!target_weight || !start_weight || !start_date) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: target_weight, start_weight, start_date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deactivate existing goals
    await env.DB.prepare('UPDATE weight_goals SET is_active = 0').run();

    // Insert new goal
    const stmt = env.DB.prepare(`
      INSERT INTO weight_goals (target_weight, start_weight, start_date, target_date, weekly_goal, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    const result = await stmt.bind(
      target_weight,
      start_weight,
      start_date,
      target_date || null,
      weekly_goal || null
    ).run();

    return new Response(
      JSON.stringify({ 
        success: true, 
        goal_id: result.meta.last_row_id,
        message: 'Goal set successfully' 
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error setting goal:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to set goal', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get all goals (active and inactive)
 */
async function getGoals(request, env, corsHeaders) {
  try {
    const stmt = env.DB.prepare(`
      SELECT * FROM weight_goals ORDER BY start_date DESC
    `);
    const result = await stmt.all();

    return new Response(
      JSON.stringify(result.results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching goals:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch goals', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get analytics dashboard data
 */
async function getAnalyticsDashboard(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30';

    // Get comprehensive analytics data
    const analytics = await calculateAnalytics(env, period);

    return new Response(
      JSON.stringify(analytics),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating analytics dashboard:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate analytics', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Calculate comprehensive analytics data
 */
async function calculateAnalytics(env, period) {
  // Get weight measurements
  const weightStmt = env.DB.prepare(`
    SELECT weight, timestamp FROM weight_measurements 
    WHERE timestamp >= datetime('now', '-${period} days')
    ORDER BY timestamp ASC
  `);
  const weightResult = await weightStmt.all();

  if (weightResult.results.length === 0) {
    return { error: 'No data available for analytics' };
  }

  const weights = weightResult.results.map(r => r.weight);
  const dates = weightResult.results.map(r => new Date(r.timestamp));

  // Calculate key metrics
  const metrics = {
    total_measurements: weights.length,
    period_days: period,
    current_weight: weights[weights.length - 1],
    starting_weight: weights[0],
    total_change: weights[weights.length - 1] - weights[0],
    average_weight: weights.reduce((a, b) => a + b, 0) / weights.length,
    min_weight: Math.min(...weights),
    max_weight: Math.max(...weights)
  };

  // Calculate trends
  const trends = {
    overall_trend: calculateOverallTrend(weights, dates),
    weekly_average: calculateWeeklyAverage(weights, dates),
    consistency_score: calculateConsistencyScore(weights)
  };

  // Calculate projections
  const projections = calculateWeightProjections(weightResult.results, 30);

  return {
    metrics,
    trends,
    projections,
    generated_at: new Date().toISOString()
  };
}

/**
 * Calculate weekly average weight
 */
function calculateWeeklyAverage(weights, dates) {
  if (weights.length < 7) return null;
  
  const weeklyAverages = [];
  for (let i = 6; i < weights.length; i += 7) {
    const weekWeights = weights.slice(Math.max(0, i - 6), i + 1);
    const average = weekWeights.reduce((a, b) => a + b, 0) / weekWeights.length;
    weeklyAverages.push(average);
  }
  
  return weeklyAverages;
}

/**
 * Calculate consistency score based on weight fluctuations
 */
function calculateConsistencyScore(weights) {
  if (weights.length < 2) return 0;
  
  let consistentDays = 0;
  const threshold = 0.5; // kg threshold for consistency
  
  for (let i = 1; i < weights.length; i++) {
    const change = Math.abs(weights[i] - weights[i - 1]);
    if (change <= threshold) {
      consistentDays++;
    }
  }
  
  return (consistentDays / (weights.length - 1)) * 100;
}

/**
 * Get comparative analytics between different periods
 */
async function getComparativeAnalytics(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const period1 = url.searchParams.get('period1') || '30';
    const period2 = url.searchParams.get('period2') || '60';

    // Get analytics for both periods
    const analytics1 = await calculateAnalytics(env, period1);
    const analytics2 = await calculateAnalytics(env, period2);

    // Compare the two periods
    const comparison = compareAnalytics(analytics1, analytics2, period1, period2);

    return new Response(
      JSON.stringify(comparison),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating comparative analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate comparative analytics', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Compare analytics between two periods
 */
function compareAnalytics(analytics1, analytics2, period1, period2) {
  if (analytics1.error || analytics2.error) {
    return { error: 'Cannot compare periods with insufficient data' };
  }

  const change = analytics2.metrics.current_weight - analytics1.metrics.current_weight;
  const changePercentage = (change / analytics1.metrics.current_weight) * 100;

  return {
    period1: { days: period1, analytics: analytics1 },
    period2: { days: period2, analytics: analytics2 },
    comparison: {
      weight_change: change,
      weight_change_percentage: changePercentage,
      improvement: change < 0, // Negative change means weight loss
      trend_comparison: analytics1.trends.overall_trend === analytics2.trends.overall_trend,
      consistency_improvement: analytics2.trends.consistency_score > analytics1.trends.consistency_score
    }
  };
}

/**
 * Calculate and store weight projections for caching
 */
async function calculateAndStoreProjections(env) {
  try {
    // Get recent weight data
    const stmt = env.DB.prepare(`
      SELECT weight, timestamp FROM weight_measurements 
      ORDER BY timestamp DESC LIMIT 30
    `);
    const result = await stmt.all();

    if (result.results.length < 7) return; // Need minimum data

    const projections = calculateWeightProjections(result.results, 30);
    
    // Store projections in database for caching
    const insertStmt = env.DB.prepare(`
      INSERT OR REPLACE INTO weight_projections (projected_date, projected_weight, confidence_interval, calculation_date, algorithm_version)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const projection of projections.projections) {
      await insertStmt.bind(
        projection.date,
        projection.projected_weight,
        projection.confidence,
        new Date().toISOString(),
        projections.algorithm
      ).run();
    }
  } catch (error) {
    console.error('Error storing projections:', error);
  }
}

/**
 * Legacy API functions for backward compatibility
 */
async function getLegacyWeights(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '100';

    const stmt = env.DB.prepare(`
      SELECT weight as kg, timestamp as date FROM weight_measurements 
      ORDER BY timestamp DESC LIMIT ?
    `);
    const result = await stmt.bind(parseInt(limit)).all();

    return new Response(
      JSON.stringify(result.results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching legacy weights:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch weights', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createLegacyWeight(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { weight, unit, timestamp } = body;

    if (!weight || !unit || !timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const weightKg = unit === 'lb' ? weight * 0.453592 : weight;

    const stmt = env.DB.prepare(`
      INSERT INTO weight_measurements (weight, timestamp, source)
      VALUES (?, ?, 'legacy_api')
    `);

    const result = await stmt.bind(weightKg, timestamp).run();

    return new Response(
      JSON.stringify({ success: true, id: result.meta.last_row_id }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating legacy weight:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create weight', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
