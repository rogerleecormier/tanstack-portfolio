/**
 * @fileoverview Enhanced HealthBridge Worker
 * @description Advanced weight loss tracking and projection API with D1 database integration
 * @author Roger Lee Cormier
 * @version 3.0.0
 * @lastUpdated 2024
 * 
 * @features
 * - Weight loss projections with confidence intervals (pounds only)
 * - Advanced health metrics tracking
 * - Trend analysis and analytics
 * - Enhanced data schema for comprehensive health tracking
 * - Goals are managed in Settings page only
 * 
 * @endpoints
 * - POST /api/v2/weight/measurement
 * - GET /api/v2/weight/projections
 * - GET /api/v2/weight/trends
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

  // Analytics endpoints
  if (path === '/api/v2/analytics/dashboard') {
    return await getAnalyticsDashboard(request, env, corsHeaders);
  }
  if (path === '/api/v2/analytics/comparative') {
    return await getComparativeAnalytics(request, env, corsHeaders);
  }

  // User profile endpoints
  if (path === '/api/v2/user/profile') {
    if (request.method === 'GET') {
      return await getUserProfile(request, env, corsHeaders);
    }
    if (request.method === 'PUT') {
      return await updateUserProfile(request, env, corsHeaders);
    }
  }

  if (path === '/api/v2/user/weight-goal') {
    if (request.method === 'GET') {
      return await getWeightGoal(request, env, corsHeaders);
    }
    if (request.method === 'PUT') {
      return await updateWeightGoal(request, env, corsHeaders);
    }
  }

  if (path === '/api/v2/user/medications') {
    if (request.method === 'GET') {
      return await getUserMedications(request, env, corsHeaders);
    }
    if (request.method === 'POST') {
      return await createUserMedication(request, env, corsHeaders);
    }
    if (request.method === 'PUT') {
      return await updateUserMedication(request, env, corsHeaders);
    }
    if (request.method === 'DELETE') {
      return await deleteUserMedication(request, env, corsHeaders);
    }
  }

  if (path === '/api/v2/medication-types') {
    if (request.method === 'GET') {
      return await getMedicationTypes(request, env, corsHeaders);
    }
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
 * Create a new weight measurement (pounds only)
 */
async function createWeightMeasurement(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { weight, unit, timestamp, bodyFat, muscleMass, waterPercentage, source = 'manual' } = body;

    // Validate required fields
    if (!weight || !unit || !timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: weight, unit, timestamp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert to pounds if needed
    const weightLbs = unit === 'kg' ? weight * 2.20462 : weight;

    // Insert into existing weight table
    const stmt = env.DB.prepare(`
      INSERT INTO weight (uuid, startDate, endDate, kg, sourceBundleId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      crypto.randomUUID(), // Generate UUID
      timestamp.split('T')[0], // startDate
      timestamp.split('T')[0], // endDate (same as startDate for single measurement)
      unit === 'kg' ? weight : weight / 2.20462, // kg
      'healthbridge-enhanced', // sourceBundleId
      new Date().toISOString(), // createdAt
      new Date().toISOString()  // updatedAt
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
 * Get weight measurements with enhanced filtering (pounds only)
 */
async function getWeightMeasurements(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const days = url.searchParams.get('days');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const userId = url.searchParams.get('userId');

    // Return dummy weight data for development users
    if (userId === 'dev-user-123' || userId === 'dev@rcormier.dev') {
      const dummyWeights = [
        { id: 1, weight: 192.2, weight_lb: "192.2", weight_kg: "87.2", timestamp: "2024-01-01T08:00:00.000Z", source: "dummy" },
        { id: 2, weight: 190.8, weight_lb: "190.8", weight_kg: "86.5", timestamp: "2024-01-08T08:00:00.000Z", source: "dummy" },
        { id: 3, weight: 189.4, weight_lb: "189.4", weight_kg: "85.9", timestamp: "2024-01-15T08:00:00.000Z", source: "dummy" },
        { id: 4, weight: 187.9, weight_lb: "187.9", weight_kg: "85.2", timestamp: "2024-01-22T08:00:00.000Z", source: "dummy" },
        { id: 5, weight: 186.3, weight_lb: "186.3", weight_kg: "84.5", timestamp: "2024-01-29T08:00:00.000Z", source: "dummy" },
        { id: 6, weight: 184.7, weight_lb: "184.7", weight_kg: "83.8", timestamp: "2024-02-05T08:00:00.000Z", source: "dummy" },
        { id: 7, weight: 183.1, weight_lb: "183.1", weight_kg: "83.0", timestamp: "2024-02-12T08:00:00.000Z", source: "dummy" },
        { id: 8, weight: 181.4, weight_lb: "181.4", weight_kg: "82.3", timestamp: "2024-02-19T08:00:00.000Z", source: "dummy" },
        { id: 9, weight: 179.7, weight_lb: "179.7", weight_kg: "81.5", timestamp: "2024-02-26T08:00:00.000Z", source: "dummy" },
        { id: 10, weight: 178.5, weight_lb: "178.5", weight_kg: "81.0", timestamp: "2024-03-05T08:00:00.000Z", source: "dummy" }
      ];
      
      return new Response(
        JSON.stringify(dummyWeights),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let query = `
      SELECT startDate, kg
      FROM weight
    `;
    let params = [];

    if (days) {
      // Calculate the date X days ago using JavaScript
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      const daysAgoStr = daysAgo.toISOString().split('T')[0];
      query += ` WHERE startDate >= ?`;
      params.push(daysAgoStr);
    } else if (startDate && endDate) {
      query += ` WHERE startDate BETWEEN ? AND ?`;
      params = [startDate, endDate];
    }

    query += ` ORDER BY startDate DESC LIMIT ?`;
    params.push(limit);

    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...params).all();

    const measurements = result.results.map(row => ({
      id: Math.floor(Math.random() * 10000) + 1, // Generate ID since weight table doesn't have one
      weight: parseFloat((row.kg * 2.20462).toFixed(1)), // Convert kg to pounds with xx.x format
      weight_lb: (row.kg * 2.20462).toFixed(1), // Formatted pounds with xx.x format
      weight_kg: row.kg.toFixed(1), // Weight in kg with xx.x format
      timestamp: new Date(row.startDate).toISOString(), // Ensure valid ISO timestamp
      source: 'legacy'
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
 * Get weight loss projections with confidence intervals (pounds only)
 * Now includes medication vs non-medication scenarios
 */
async function getWeightProjections(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const userId = url.searchParams.get('userId') || 'dev-user-123';

    // Return dummy data for development users
    if (userId === 'dev-user-123' || userId === 'dev@rcormier.dev') {
      const dummyProjections = {
        current_weight: 178.5,
        daily_rate: -0.15,
        confidence: 0.89,
        algorithm: "linear_regression_v4_activity_medication_scenarios",
        activity_level: "sedentary",
        activity_multiplier: 0.8,
        medication_scenarios: {
          no_medication: {
            daily_rate: -0.15,
            projections: []
          },
          with_medication: {
            daily_rate: -0.21,
            multiplier: 0.4,
            projections: []
          }
        },
        user_medications: [
          {
            id: "1",
            medication_name: "Wegovy",
            generic_name: "Semaglutide",
            weekly_efficacy_multiplier: 1.5
          }
        ]
      };
      
      return new Response(
        JSON.stringify(dummyProjections),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get recent weight data for projections
    const stmt = env.DB.prepare(`
      SELECT kg, startDate FROM weight 
      ORDER BY startDate DESC LIMIT 30
    `);
    const result = await stmt.all();

    if (result.results.length < 7) {
      return new Response(
        JSON.stringify({ error: 'Insufficient data for projections. Need at least 7 measurements.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile for activity level and other factors
    const profileStmt = env.DB.prepare('SELECT * FROM user_profiles WHERE id = ?');
    
    // Map authenticated user IDs to database user IDs
    let dbUserId = userId;
    if (userId.startsWith('auth0|') || userId.includes('cloudflare') || userId.includes('@')) {
      // For production users, check if they should map to user ID 1 (rogerleecormier@gmail.com)
      if (userId.includes('rogerleecormier@gmail.com')) {
        dbUserId = '1'; // Map rogerleecormier@gmail.com to existing user data
      } else {
        dbUserId = userId; // Use their actual user ID
      }
    }
    
    const profileResult = await profileStmt.bind(dbUserId).first();
    const userProfile = profileResult || { activity_level: 'moderate' }; // Default to moderate if no profile

    // Get user medications for accurate projections
    const medicationStmt = env.DB.prepare(`
      SELECT 
        um.*,
        mt.name as medication_name,
        mt.generic_name,
        mt.weekly_efficacy_multiplier,
        mt.max_weight_loss_percentage,
        mt.typical_duration_weeks,
        mt.description as medication_description
      FROM user_medications um
      LEFT JOIN medication_types mt ON um.medication_type_id = mt.id
      WHERE um.user_id = ? AND um.is_active = 1
      ORDER BY um.start_date DESC
    `);
    
    const medicationsResult = await medicationStmt.bind(dbUserId).all();
    const userMedications = medicationsResult.results || [];

    const projections = calculateWeightProjectionsWithMedications(result.results, days, userMedications, userProfile);

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
 * Calculate weight loss projections using linear regression with medication scenarios (pounds only)
 */
function calculateWeightProjectionsWithMedications(measurements, days, userMedications, userProfile) {
  // Sort by date (oldest first)
  const sortedMeasurements = measurements
    .map(m => ({ ...m, date: new Date(m.startDate) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate daily weight loss rate (convert kg to lbs)
  const totalDays = (sortedMeasurements[sortedMeasurements.length - 1].date - sortedMeasurements[0].date) / (1000 * 60 * 60 * 24);
  const totalWeightLoss = (sortedMeasurements[0].kg - sortedMeasurements[sortedMeasurements.length - 1].kg) * 2.20462; // Convert to lbs
  const dailyRate = totalWeightLoss / totalDays;

  // Calculate confidence based on data consistency
  const variance = calculateVariance(sortedMeasurements.map(m => m.kg * 2.20462)); // Convert to lbs
  const confidence = Math.max(0.1, Math.min(0.95, 1 - (variance / 100)));

  // Get current weight from most recent measurement
  const currentWeight = sortedMeasurements[sortedMeasurements.length - 1].kg * 2.20462; // Convert to lbs
  const currentDate = new Date();

  // Calculate activity level multiplier
  const activityMultiplier = calculateActivityLevelMultiplier(userProfile.activity_level || 'moderate');
  
  // Calculate medication multiplier based on user's actual medications
  const medicationMultiplier = calculateMedicationMultiplier(userMedications);
  
  // Apply both activity and medication multipliers to daily rate
  const adjustedDailyRate = dailyRate * activityMultiplier;
  const medicationDailyRate = adjustedDailyRate * (1 + medicationMultiplier);

  // Generate projections for both scenarios
  const projections = [];
  const noMedicationProjections = [];
  const withMedicationProjections = [];

  for (let i = 1; i <= days; i++) {
    const projectedDate = new Date(currentDate);
    projectedDate.setDate(currentDate.getDate() + i);
    
    const projectedWeightNoMed = currentWeight - (adjustedDailyRate * i);
    const projectedWeightWithMed = currentWeight - (medicationDailyRate * i);
    
    // Add to main projections array
    projections.push({
      date: projectedDate.toISOString().split('T')[0],
      projected_weight: parseFloat(Math.max(0, projectedWeightNoMed).toFixed(1)), // xx.x format
      confidence: confidence,
      daily_rate: parseFloat(adjustedDailyRate.toFixed(1)), // xx.x format
      days_from_now: i
    });

    // Add to scenario-specific arrays
    noMedicationProjections.push({
      date: projectedDate.toISOString().split('T')[0],
      weight: parseFloat(Math.max(0, projectedWeightNoMed).toFixed(1)),
      days_from_now: i
    });

    withMedicationProjections.push({
      date: projectedDate.toISOString().split('T')[0],
      weight: parseFloat(Math.max(0, projectedWeightWithMed).toFixed(1)),
      days_from_now: i
    });
  }

  return {
    current_weight: parseFloat(currentWeight.toFixed(1)), // xx.x format
    daily_rate: parseFloat(adjustedDailyRate.toFixed(1)), // xx.x format
    confidence: confidence,
    projections: projections,
    algorithm: 'linear_regression_v4_activity_medication_scenarios',
    activity_level: userProfile.activity_level || 'moderate',
    activity_multiplier: activityMultiplier,
    medication_scenarios: {
      no_medication: {
        daily_rate: parseFloat(adjustedDailyRate.toFixed(1)),
        projections: noMedicationProjections
      },
      with_medication: {
        daily_rate: parseFloat(medicationDailyRate.toFixed(1)),
        multiplier: medicationMultiplier,
        projections: withMedicationProjections
      }
    },
    user_medications: userMedications.map(med => ({
      name: med.medication_name || med.generic_name || 'Unknown',
      dosage_mg: med.dosage_mg,
      frequency: med.frequency,
      efficacy_multiplier: med.weekly_efficacy_multiplier || 1.0
    }))
  };
}

/**
 * Calculate activity level multiplier for weight loss projections
 */
function calculateActivityLevelMultiplier(activityLevel) {
  const activityMultipliers = {
    sedentary: 0.8,      // 20% reduction in weight loss rate (less active)
    light: 0.9,           // 10% reduction in weight loss rate
    moderate: 1.0,        // Base rate (no adjustment)
    active: 1.15,         // 15% increase in weight loss rate
    very_active: 1.3      // 30% increase in weight loss rate
  };
  
  return activityMultipliers[activityLevel] || 1.0;
}

/**
 * Calculate medication multiplier based on user's medications and dosage
 */
function calculateMedicationMultiplier(userMedications) {
  if (!userMedications || userMedications.length === 0) {
    return 0; // No active medications
  }

  // Find active medications
  const activeMedications = userMedications.filter(med => med.is_active);
  if (activeMedications.length === 0) {
    return 0; // No active medications
  }

  // Calculate combined multiplier for all active medications
  let totalMultiplier = 0;
  
  activeMedications.forEach(medication => {
    let baseMultiplier = 0;
    
    // Base multiplier from medication type (from database)
    if (medication.weekly_efficacy_multiplier) {
      baseMultiplier = medication.weekly_efficacy_multiplier - 1; // Convert to boost percentage
    } else {
      // Fallback multipliers by medication name
      switch (medication.medication_name?.toLowerCase()) {
        case 'ozempic':
        case 'wegovy':
          baseMultiplier = 0.4; // 40% improvement (semaglutide)
          break;
        case 'zepbound':
        case 'mounjaro':
          baseMultiplier = 0.75; // 75% improvement (tirzepatide)
          break;
        default:
          baseMultiplier = 0.2; // 20% default
      }
    }

    // Adjust for dosing frequency
    let frequencyMultiplier = 1;
    switch (medication.frequency?.toLowerCase()) {
      case 'daily':
        frequencyMultiplier = 1.0;
        break;
      case 'weekly':
        frequencyMultiplier = 1.0; // Standard dosing
        break;
      case 'bi-weekly':
      case 'biweekly':
        frequencyMultiplier = 0.7; // Reduced effectiveness
        break;
      case 'monthly':
        frequencyMultiplier = 0.4; // Much reduced effectiveness
        break;
      default:
        frequencyMultiplier = 1.0;
    }

    // Adjust for dosage (higher dosage = better effectiveness)
    let dosageMultiplier = 1.0;
    if (medication.dosage_mg) {
      // Standard dosages: Ozempic 0.5-2.0mg, Zepbound 2.5-15mg
      const standardDosage = medication.medication_name?.toLowerCase().includes('ozempic') || 
                             medication.medication_name?.toLowerCase().includes('wegovy') ? 1.0 : 7.5;
      const maxDosage = medication.medication_name?.toLowerCase().includes('ozempic') || 
                        medication.medication_name?.toLowerCase().includes('wegovy') ? 2.0 : 15.0;
      
      if (medication.dosage_mg >= standardDosage) {
        dosageMultiplier = 1.0; // Standard or higher dosage
      } else if (medication.dosage_mg >= standardDosage * 0.5) {
        dosageMultiplier = 0.8; // Lower than standard dosage
      } else {
        dosageMultiplier = 0.6; // Much lower than standard dosage
      }
    }

    totalMultiplier += baseMultiplier * frequencyMultiplier * dosageMultiplier;
  });

  // Cap the maximum combined multiplier at 100% improvement
  return Math.min(totalMultiplier, 1.0);
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
 * Get weight trends and analysis (pounds only)
 */
async function getWeightTrends(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30';

    // Get weight data for trend analysis
    const periodDays = parseInt(period);
    const periodAgo = new Date();
    periodAgo.setDate(periodAgo.getDate() - periodDays);
    const periodAgoStr = periodAgo.toISOString().split('T')[0];
    
    const stmt = env.DB.prepare(`
      SELECT kg, startDate FROM weight 
      WHERE startDate >= ?
      ORDER BY startDate ASC
    `);
    const result = await stmt.bind(periodAgoStr).all();

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
 * Analyze weight trends and patterns (pounds only)
 */
function analyzeWeightTrends(measurements) {
  const weights = measurements.map(m => m.kg * 2.20462); // Convert to lbs
  const dates = measurements.map(m => new Date(m.startDate));

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
  const threshold = 1.0; // 1 lb threshold for plateau detection
  
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
  
  if (dailyRate > 0.2) return 'gaining'; // 0.2 lbs per day threshold
  if (dailyRate < -0.2) return 'losing'; // -0.2 lbs per day threshold
  return 'stable';
}

/**
 * Get analytics dashboard data (pounds only)
 */
async function getAnalyticsDashboard(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30';
    const userId = url.searchParams.get('userId') || 'dev-user-123';

    // Get comprehensive analytics data
    const analytics = await calculateAnalytics(env, period, userId);

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
 * Get dummy analytics data for development users
 */
function getDummyAnalytics(period) {
  const periodDays = parseInt(period);
  
  // Generate dummy weight data for the period
  const dummyWeights = [
    { weight: 192.2, date: new Date(Date.now() - (periodDays - 1) * 24 * 60 * 60 * 1000) },
    { weight: 191.2, date: new Date(Date.now() - (periodDays - 2) * 24 * 60 * 60 * 1000) },
    { weight: 190.3, date: new Date(Date.now() - (periodDays - 3) * 24 * 60 * 60 * 1000) },
    { weight: 189.7, date: new Date(Date.now() - (periodDays - 4) * 24 * 60 * 60 * 1000) },
    { weight: 188.9, date: new Date(Date.now() - (periodDays - 5) * 24 * 60 * 60 * 1000) },
    { weight: 187.6, date: new Date(Date.now() - (periodDays - 6) * 24 * 60 * 60 * 1000) },
    { weight: 186.4, date: new Date(Date.now() - (periodDays - 7) * 24 * 60 * 60 * 1000) },
    { weight: 185.1, date: new Date(Date.now() - (periodDays - 8) * 24 * 60 * 60 * 1000) },
    { weight: 184.2, date: new Date(Date.now() - (periodDays - 9) * 24 * 60 * 60 * 1000) },
    { weight: 183.5, date: new Date(Date.now() - (periodDays - 10) * 24 * 60 * 60 * 1000) },
    { weight: 182.8, date: new Date(Date.now() - (periodDays - 11) * 24 * 60 * 60 * 1000) },
    { weight: 181.3, date: new Date(Date.now() - (periodDays - 12) * 24 * 60 * 60 * 1000) },
    { weight: 180.1, date: new Date(Date.now() - (periodDays - 13) * 24 * 60 * 60 * 1000) },
    { weight: 179.2, date: new Date(Date.now() - (periodDays - 14) * 24 * 60 * 60 * 1000) },
    { weight: 178.5, date: new Date(Date.now() - (periodDays - 15) * 24 * 60 * 60 * 1000) }
  ].filter(w => w.date >= new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000));

  const weights = dummyWeights.map(w => w.weight);
  const dates = dummyWeights.map(w => w.date);

  const metrics = {
    total_measurements: weights.length,
    period_days: period,
    current_weight: parseFloat(weights[weights.length - 1].toFixed(1)),
    starting_weight: parseFloat(weights[0].toFixed(1)),
    total_change: parseFloat((weights[weights.length - 1] - weights[0]).toFixed(1)),
    average_weight: parseFloat((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)),
    min_weight: parseFloat(Math.min(...weights).toFixed(1)),
    max_weight: parseFloat(Math.max(...weights).toFixed(1))
  };

  const trends = {
    overall_trend: "losing",
    weekly_average: calculateWeeklyAverage(weights, dates),
    consistency_score: 87.0
  };

  const projections = {
    current_weight: 178.5,
    daily_rate: -0.15,
    confidence: 0.89,
    algorithm: "linear_regression_v4_activity_medication_scenarios",
    activity_level: "sedentary",
    activity_multiplier: 0.8,
    projections: []
  };

  return {
    metrics,
    trends,
    projections,
    generated_at: new Date().toISOString()
  };
}

/**
 * Calculate comprehensive analytics data (pounds only)
 */
async function calculateAnalytics(env, period, userId) {
  // Return dummy data for development users
  if (userId === 'dev-user-123' || userId === 'dev@rcormier.dev') {
    return getDummyAnalytics(period);
  }

  // Get weight measurements
  const periodDays = parseInt(period);
  const periodAgo = new Date();
  periodAgo.setDate(periodAgo.getDate() - periodDays);
  const periodAgoStr = periodAgo.toISOString().split('T')[0];
  
  const weightStmt = env.DB.prepare(`
    SELECT kg, startDate FROM weight 
    WHERE startDate >= ?
    ORDER BY startDate ASC
  `);
  const weightResult = await weightStmt.bind(periodAgoStr).all();

  if (weightResult.results.length === 0) {
    return { error: 'No data available for analytics' };
  }

  // Get user profile for activity level
  const profileStmt = env.DB.prepare('SELECT * FROM user_profiles WHERE id = ?');
  
  // Map authenticated user IDs to database user IDs
  let dbUserId = userId;
  if (userId.startsWith('auth0|') || userId.includes('cloudflare') || userId.includes('@')) {
    // For production users, check if they should map to user ID 1 (rogerleecormier@gmail.com)
    if (userId.includes('rogerleecormier@gmail.com')) {
      dbUserId = '1'; // Map rogerleecormier@gmail.com to existing user data
    } else {
      dbUserId = userId; // Use their actual user ID
    }
  }
  
  const profileResult = await profileStmt.bind(dbUserId).first();
  const userProfile = profileResult || { activity_level: 'moderate' }; // Default to moderate if no profile

  const weights = weightResult.results.map(r => r.kg * 2.20462); // Convert to lbs
  const dates = weightResult.results.map(r => new Date(r.startDate));

  // Calculate key metrics
  const metrics = {
    total_measurements: weights.length,
    period_days: period,
    current_weight: parseFloat(weights[weights.length - 1].toFixed(1)), // xx.x format
    starting_weight: parseFloat(weights[0].toFixed(1)), // xx.x format
    total_change: parseFloat((weights[weights.length - 1] - weights[0]).toFixed(1)), // xx.x format
    average_weight: parseFloat((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)), // xx.x format
    min_weight: parseFloat(Math.min(...weights).toFixed(1)), // xx.x format
    max_weight: parseFloat(Math.max(...weights).toFixed(1)) // xx.x format
  };

  // Calculate trends
  const trends = {
    overall_trend: calculateOverallTrend(weights, dates),
    weekly_average: calculateWeeklyAverage(weights, dates),
    consistency_score: calculateConsistencyScore(weights)
  };

  // Calculate projections with activity level consideration
  const projections = calculateWeightProjectionsWithMedications(weightResult.results, 30, [], userProfile);

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
    weeklyAverages.push(parseFloat(average.toFixed(1))); // xx.x format
  }
  
  return weeklyAverages;
}

/**
 * Calculate consistency score based on weight fluctuations
 */
function calculateConsistencyScore(weights) {
  if (weights.length < 2) return 0;
  
  let consistentDays = 0;
  const threshold = 1.0; // 1 lb threshold for consistency
  
  for (let i = 1; i < weights.length; i++) {
    const change = Math.abs(weights[i] - weights[i - 1]);
    if (change <= threshold) {
      consistentDays++;
    }
  }
  
  return parseFloat(((consistentDays / (weights.length - 1)) * 100).toFixed(1)); // xx.x format
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
      weight_change: parseFloat(change.toFixed(1)), // xx.x format
      weight_change_percentage: parseFloat(changePercentage.toFixed(1)), // xx.x format
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
      SELECT kg, startDate FROM weight 
      ORDER BY startDate DESC LIMIT 30
    `);
    const result = await stmt.all();

    if (result.results.length < 7) return; // Need minimum data

    const projections = calculateWeightProjections(result.results, 30);
    
    // Store projections in database for caching
    const insertStmt = env.DB.prepare(`
      INSERT OR REPLACE INTO weight_projections (projected_date, projected_weight_lbs, confidence_interval, calculation_date, algorithm_version)
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
 * Legacy API functions for backward compatibility (pounds only)
 */
async function getLegacyWeights(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '100';

    const stmt = env.DB.prepare(`
      SELECT kg as lbs, startDate FROM weight 
      ORDER BY startDate DESC LIMIT ?
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

    const weightLbs = unit === 'kg' ? weight * 2.20462 : weight;

    const stmt = env.DB.prepare(`
      INSERT INTO weight (uuid, startDate, endDate, kg, sourceBundleId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      crypto.randomUUID(), // Generate UUID
      timestamp.split('T')[0], // startDate
      timestamp.split('T')[0], // endDate (same as startDate for single measurement)
      unit === 'kg' ? weight : weight / 2.20462, // kg
      'healthbridge-legacy', // sourceBundleId
      new Date().toISOString(), // createdAt
      new Date().toISOString()  // updatedAt
    ).run();

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

/**
 * User Profile Management Functions
 */

async function getUserProfile(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return dummy data for development users
    if (userId === 'dev-user-123' || userId === 'dev@rcormier.dev') {
      const dummyProfile = {
        id: userId,
        name: 'Development User',
        birthdate: '1990-01-01',
        gender: 'male',
        height_ft: 6,
        height_in: 0,
        activity_level: 'moderate',
        timezone: 'America/New_York',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify(dummyProfile),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map authenticated user IDs to database user IDs
    let dbUserId = userId;
    if (userId.startsWith('auth0|') || userId.includes('cloudflare') || userId.includes('@')) {
      // For production users, check if they should map to user ID 1 (rogerleecormier@gmail.com)
      if (userId.includes('rogerleecormier@gmail.com')) {
        dbUserId = '1'; // Map rogerleecormier@gmail.com to existing user data
      } else {
        dbUserId = userId; // Use their actual user ID
      }
    }

    // Query the actual database
    const stmt = env.DB.prepare('SELECT * FROM user_profiles WHERE id = ?');
    const profile = await stmt.bind(dbUserId).first();

    if (!profile) {
      // If no profile exists, create a default one
      const defaultProfile = {
        id: dbUserId,
        name: (userId === 'dev-user-123' || userId === 'dev@rcormier.dev') ? 'Development User' : 'New User',
        birthdate: '1990-01-01',
        gender: 'male',
        height_ft: 6,
        height_in: 0,
        activity_level: 'moderate',
        timezone: 'America/New_York',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert the new profile
      const insertStmt = env.DB.prepare(`
        INSERT INTO user_profiles (id, name, birthdate, gender, height_ft, height_in, activity_level, timezone, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      await insertStmt.bind(
        defaultProfile.id,
        defaultProfile.name,
        defaultProfile.birthdate,
        defaultProfile.gender,
        defaultProfile.height_ft,
        defaultProfile.height_in,
        defaultProfile.activity_level,
        defaultProfile.timezone,
        defaultProfile.created_at,
        defaultProfile.updated_at
      ).run();

      return new Response(
        JSON.stringify(defaultProfile),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate age from birthdate
    const birthDate = new Date(profile.birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() - 
      (today.getMonth() < birthDate.getMonth() || 
       (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);

    const profileWithAge = {
      ...profile,
      age
    };

    return new Response(
      JSON.stringify(profileWithAge),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch profile', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function updateUserProfile(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { id, name, birthdate, gender, height_ft, height_in, activity_level, timezone } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing user ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return dummy success for development users (don't actually update database)
    if (id === 'dev-user-123' || id === 'dev@rcormier.dev') {
      const updatedProfile = {
        ...body,
        id: id,
        updated_at: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify({ success: true, profile: updatedProfile }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map authenticated user IDs to database user IDs
    let dbUserId = id;
    if (id.startsWith('auth0|') || id.includes('cloudflare') || id.includes('@')) {
      // For production users, check if they should map to user ID 1 (rogerleecormier@gmail.com)
      if (id.includes('rogerleecormier@gmail.com')) {
        dbUserId = '1'; // Map rogerleecormier@gmail.com to existing user data
      } else {
        dbUserId = id; // Use their actual user ID
      }
    }

    // Update the database
    const stmt = env.DB.prepare(`
      UPDATE user_profiles 
      SET name = ?, birthdate = ?, gender = ?, height_ft = ?, height_in = ?, activity_level = ?, timezone = ?, updated_at = ?
      WHERE id = ?
    `);
    
    const updatedAt = new Date().toISOString();
    const result = await stmt.bind(
      name, birthdate, gender, height_ft, height_in, activity_level, timezone, updatedAt, dbUserId
    ).run();

    if (result.changes === 0) {
      return new Response(
        JSON.stringify({ error: 'Profile not found or no changes made' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updatedProfile = {
      ...body,
      id: dbUserId,
      updated_at: updatedAt
    };

    return new Response(
      JSON.stringify({ success: true, profile: updatedProfile }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update profile', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getWeightGoal(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return dummy data for development users
    if (userId === 'dev-user-123' || userId === 'dev@rcormier.dev') {
      const dummyGoal = {
        user_id: userId,
        target_weight_lbs: 165,
        target_date: '2024-06-15T00:00:00.000Z',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify(dummyGoal),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map authenticated user IDs to database user IDs
    let dbUserId = userId;
    if (userId.startsWith('auth0|') || userId.includes('cloudflare') || userId.includes('@')) {
      // For production users, check if they should map to user ID 1 (rogerleecormier@gmail.com)
      if (userId.includes('rogerleecormier@gmail.com')) {
        dbUserId = '1'; // Map rogerleecormier@gmail.com to existing user data
      } else {
        dbUserId = userId; // Use their actual user ID
      }
    }

    // Query the actual database
    const stmt = env.DB.prepare('SELECT * FROM weight_goals WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1');
    const goal = await stmt.bind(dbUserId).first();

    if (!goal) {
      // If no goal exists, create a default one
      const defaultGoal = {
        user_id: dbUserId,
        target_weight_lbs: 180.0,
        start_weight_lbs: 200.0,
        start_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        target_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months from now
        weekly_goal_lbs: 1.5,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert the new goal
      const insertStmt = env.DB.prepare(`
        INSERT INTO weight_goals (user_id, target_weight_lbs, start_weight_lbs, start_date, target_date, weekly_goal_lbs, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = await insertStmt.bind(
        defaultGoal.user_id,
        defaultGoal.target_weight_lbs,
        defaultGoal.start_weight_lbs,
        defaultGoal.start_date,
        defaultGoal.target_date,
        defaultGoal.weekly_goal_lbs,
        defaultGoal.is_active,
        defaultGoal.created_at,
        defaultGoal.updated_at
      ).run();

      const goalWithId = {
        id: result.meta.last_row_id,
        ...defaultGoal
      };

      return new Response(
        JSON.stringify(goalWithId),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(goal),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching weight goal:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch weight goal', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function updateWeightGoal(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { id, user_id, start_weight_lbs, target_weight_lbs, weekly_goal_lbs, target_date } = body;

    if (!id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return dummy success for development users (don't actually update database)
    if (user_id === 'dev-user-123' || user_id === 'dev@rcormier.dev') {
      const updatedGoal = {
        ...body,
        id: id,
        user_id: user_id,
        updated_at: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify({ success: true, goal: updatedGoal }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map authenticated user IDs to database user IDs
    let dbUserId = user_id;
    if (user_id.startsWith('auth0|') || user_id.includes('cloudflare') || user_id.includes('@')) {
      // For production users, check if they should map to user ID 1 (rogerleecormier@gmail.com)
      if (user_id.includes('rogerleecormier@gmail.com')) {
        dbUserId = '1'; // Map rogerleecormier@gmail.com to existing user data
      } else {
        dbUserId = user_id; // Use their actual user ID
      }
    }

    // Update the database
    const stmt = env.DB.prepare(`
      UPDATE weight_goals 
      SET start_weight_lbs = ?, target_weight_lbs = ?, weekly_goal_lbs = ?, target_date = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);
    
    const updatedAt = new Date().toISOString();
    const result = await stmt.bind(
      start_weight_lbs, target_weight_lbs, weekly_goal_lbs, target_date, updatedAt, id, dbUserId
    ).run();

    if (result.changes === 0) {
      return new Response(
        JSON.stringify({ error: 'Weight goal not found or no changes made' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updatedGoal = {
      ...body,
      user_id: dbUserId,
      updated_at: updatedAt
    };

    return new Response(
      JSON.stringify({ success: true, goal: updatedGoal }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating weight goal:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update weight goal', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getUserMedications(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return dummy data for development users
    if (userId === 'dev-user-123' || userId === 'dev@rcormier.dev') {
      const dummyMedications = [
        {
          id: "1",
          user_id: userId,
          medication_type_id: 1,
          dosage_mg: 2.4,
          frequency: "weekly",
          start_date: "2024-01-01T00:00:00.000Z",
          is_active: true,
          medication_name: "Wegovy",
          generic_name: "Semaglutide",
          weekly_efficacy_multiplier: 1.5,
          max_weight_loss_percentage: 15,
          typical_duration_weeks: 68,
          medication_description: "GLP-1 receptor agonist for weight management"
        }
      ];
      
      return new Response(
        JSON.stringify(dummyMedications),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map authenticated user IDs to database user IDs
    let dbUserId = userId;
    if (userId.startsWith('auth0|') || userId.includes('cloudflare') || userId.includes('@')) {
      // For production users, check if they should map to user ID 1 (rogerleecormier@gmail.com)
      if (userId.includes('rogerleecormier@gmail.com')) {
        dbUserId = '1'; // Map rogerleecormier@gmail.com to existing user data
      } else {
        dbUserId = userId; // Use their actual user ID
      }
    }

    // Query the actual database with JOIN to get medication type details
    const stmt = env.DB.prepare(`
      SELECT 
        um.*,
        mt.name as medication_name,
        mt.generic_name,
        mt.weekly_efficacy_multiplier,
        mt.max_weight_loss_percentage,
        mt.typical_duration_weeks,
        mt.description as medication_description
      FROM user_medications um
      LEFT JOIN medication_types mt ON um.medication_type_id = mt.id
      WHERE um.user_id = ? AND um.is_active = 1
      ORDER BY um.start_date DESC
    `);
    
    const medications = await stmt.bind(dbUserId).all();

    return new Response(
      JSON.stringify(medications.results || []),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching user medications:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch medications', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createUserMedication(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { user_id, medication_type_id, start_date, dosage_mg, frequency, notes } = body;

    if (!user_id || !medication_type_id || !start_date) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, just return success with mock ID
    const newMedication = {
      id: `med_${Date.now()}`,
      ...body,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({ success: true, medication: newMedication }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating medication:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create medication', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function updateUserMedication(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { id, user_id, medication_type_id, start_date, dosage_mg, frequency, notes, is_active } = body;

    if (!id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, just return success
    const updatedMedication = {
      ...body,
      updated_at: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({ success: true, medication: updatedMedication }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating medication:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update medication', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function deleteUserMedication(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const medicationId = url.searchParams.get('id');

    if (!medicationId) {
      return new Response(
        JSON.stringify({ error: 'Missing medication ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, just return success
    return new Response(
      JSON.stringify({ success: true, message: 'Medication deleted' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting medication:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete medication', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get medication types for the dropdown
 */
async function getMedicationTypes(request, env, corsHeaders) {
  try {
    // Get all medication types from the database
    const stmt = env.DB.prepare(`
      SELECT 
        id,
        name,
        generic_name,
        weekly_efficacy_multiplier,
        max_weight_loss_percentage,
        typical_duration_weeks,
        description,
        created_at,
        updated_at
      FROM medication_types 
      ORDER BY name ASC
    `);
    
    const result = await stmt.all();
    
    return new Response(
      JSON.stringify({
        success: true,
        medication_types: result.results || []
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error fetching medication types:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch medication types',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
}
