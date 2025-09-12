# iOS Shortcuts Setup Guide for HealthBridge Enhanced

## Overview

This guide provides step-by-step instructions for setting up iOS Shortcuts to automatically collect health data and send it to the HealthBridge Enhanced API. The shortcuts will enable seamless integration between Apple Health and your weight loss tracking dashboard.

## Prerequisites

- iOS 14.0 or later
- Apple Health app with health data
- HealthBridge Enhanced API access
- API key for authentication

## Required Permissions

Before setting up shortcuts, ensure the following permissions are granted:

1. **Health App Permissions:**
   - Weight
   - Body Fat Percentage
   - Lean Body Mass
   - Body Water Percentage
   - Steps
   - Sleep Analysis
   - Active Energy
   - Heart Rate

2. **Shortcuts Permissions:**
   - Allow Shortcuts to access Health data
   - Allow Shortcuts to run automatically

## Shortcut 1: WeightWise Data Collection

### Purpose

Automatically collects weight and body composition data from Apple Health and sends it to the HealthBridge API.

### Setup Steps

1. **Open Shortcuts App**
   - Launch the Shortcuts app on your iOS device

2. **Create New Shortcut**
   - Tap the "+" button to create a new shortcut
   - Name it "WeightWise Data Collection"

3. **Add Health Actions**
   - Search for "Get Latest Weight"
   - Add this action to your shortcut
   - Configure to get the most recent weight measurement

4. **Add Body Composition Data**
   - Search for "Get Latest Body Fat Percentage"
   - Add this action
   - Repeat for "Lean Body Mass" and "Body Water Percentage"

5. **Add Date/Time Action**
   - Search for "Get Current Date"
   - Add this action
   - Format as "ISO Date" for API compatibility

6. **Add HTTP Request Action**
   - Search for "Get Contents of URL"
   - Configure as follows:
     - **URL:** `https://healthbridge-enhanced.rcormier.workers.dev/api/v2/weight/measurement`
     - **Method:** POST
     - **Headers:**
       - `Content-Type: application/json`
       - `Authorization: Bearer YOUR_API_KEY`
     - **Request Body:** JSON with the following structure:
     ```json
     {
       "weight": [Weight from Health],
       "unit": "kg",
       "timestamp": [Current Date],
       "bodyFat": [Body Fat Percentage],
       "muscleMass": [Lean Body Mass],
       "waterPercentage": [Body Water Percentage],
       "source": "apple_health"
     }
     ```

7. **Add Error Handling**
   - Search for "If Result"
   - Configure to check if the API request was successful
   - Add appropriate success/failure notifications

8. **Test the Shortcut**
   - Run the shortcut manually to ensure it works correctly
   - Check the API response and HealthBridge dashboard

### Automation Setup

1. **Create Personal Automation**
   - In Shortcuts, go to Automation tab
   - Tap "+" and select "Create Personal Automation"

2. **Choose Trigger**
   - Select "Time of Day"
   - Set to run daily at your preferred time (e.g., morning after weighing)

3. **Add Action**
   - Select "Run Shortcut"
   - Choose "WeightWise Data Collection"
   - Enable "Ask Before Running" initially for testing

4. **Test Automation**
   - Run the automation manually to verify it works
   - Once confirmed, disable "Ask Before Running"

## Shortcut 2: WeightWise Weekly Report

### Purpose

Generates a weekly progress report by fetching data from the HealthBridge API and displaying key metrics.

### Setup Steps

1. **Create New Shortcut**
   - Name it "WeightWise Weekly Report"

2. **Add HTTP Request Actions**
   - **Get Analytics Dashboard:**
     - URL: `https://healthbridge-enhanced.rcormier.workers.dev/api/v2/analytics/dashboard?period=7`
     - Method: GET
     - Headers: Include your API key
   - **Get Goal Progress:**
     - URL: `https://healthbridge-enhanced.rcormier.workers.dev/api/v2/goals/progress`
     - Method: GET
     - Headers: Include your API key

3. **Add Data Processing**
   - Parse the JSON responses
   - Extract key metrics (weight change, progress percentage, etc.)

4. **Add Display Actions**
   - Use "Show Result" or "Quick Look" to display the report
   - Format the data in a readable way

5. **Add Notifications**
   - Include motivational messages based on progress
   - Highlight achievements and areas for improvement

### Automation Setup

- Set to run weekly (e.g., every Sunday evening)
- Provides motivation and progress tracking

## Shortcut 3: WeightWise Goal Setting

### Purpose

Allows quick goal setting and updates through a simple interface.

### Setup Steps

1. **Create New Shortcut**
   - Name it "WeightWise Goal Setting"

2. **Add Input Actions**
   - "Ask for Input" for target weight
   - "Ask for Input" for weekly goal
   - "Ask for Input" for target date

3. **Add HTTP Request Action**
   - URL: `https://healthbridge-enhanced.rcormier.workers.dev/api/v2/goals/set`
   - Method: POST
   - Headers: Include your API key
   - Body: JSON with goal data

4. **Add Confirmation**
   - Display success message
   - Show new goal details

## Shortcut 4: WeightWise Quick Check

### Purpose

Provides a quick overview of current progress and recent measurements.

### Setup Steps

1. **Create New Shortcut**
   - Name it "WeightWise Quick Check"

2. **Add Multiple API Calls**
   - Get latest weight measurement
   - Get goal progress
   - Get weight projections

3. **Add Summary Display**
   - Show current weight vs. target
   - Display progress percentage
   - Show projected completion date

4. **Add Quick Actions**
   - Option to add new measurement
   - Option to update goal
   - Option to view full dashboard

## Advanced Configuration

### Custom Variables

Create reusable variables for common values:

1. **API Base URL:**
   - Variable name: `API_BASE_URL`
   - Value: `https://healthbridge-enhanced.rcormier.workers.dev`

2. **API Key:**
   - Variable name: `API_KEY`
   - Value: Your actual API key

3. **User ID:**
   - Variable name: `USER_ID`
   - Value: Your user identifier

### Error Handling

Implement robust error handling:

1. **Network Errors:**
   - Check for network connectivity
   - Retry failed requests
   - Show user-friendly error messages

2. **API Errors:**
   - Parse error responses
   - Handle rate limiting
   - Validate input data

3. **Health Data Errors:**
   - Check if health data is available
   - Handle missing measurements gracefully
   - Provide fallback values

### Data Validation

Ensure data quality:

1. **Weight Validation:**
   - Check for reasonable weight values
   - Convert units if necessary
   - Validate date ranges

2. **Health Data Validation:**
   - Ensure measurements are recent
   - Check data source reliability
   - Validate measurement units

## Troubleshooting

### Common Issues

1. **Shortcut Won't Run:**
   - Check permissions in Settings > Privacy & Security > Shortcuts
   - Ensure Health app permissions are granted
   - Verify shortcut is properly configured

2. **API Errors:**
   - Check API key validity
   - Verify network connectivity
   - Review API endpoint URLs

3. **Data Not Syncing:**
   - Check Health app data availability
   - Verify shortcut automation is enabled
   - Review error logs in Shortcuts

4. **Performance Issues:**
   - Limit API calls to necessary endpoints
   - Use appropriate time intervals
   - Optimize data processing

### Debug Mode

Enable debug mode for troubleshooting:

1. **Add Logging Actions:**
   - Use "Log" action to track execution
   - Add "Show Result" for debugging
   - Include error details in logs

2. **Test Individual Actions:**
   - Run each action separately
   - Verify data flow between actions
   - Check intermediate results

## Best Practices

### Security

1. **API Key Management:**
   - Store API key securely
   - Use environment variables when possible
   - Rotate keys regularly

2. **Data Privacy:**
   - Only collect necessary health data
   - Respect user privacy preferences
   - Secure data transmission

### Performance

1. **Optimization:**
   - Minimize API calls
   - Cache frequently used data
   - Use efficient data formats

2. **Reliability:**
   - Implement retry logic
   - Handle network failures gracefully
   - Provide offline capabilities when possible

### User Experience

1. **Simplicity:**
   - Keep shortcuts simple and focused
   - Provide clear feedback
   - Minimize user interaction

2. **Accessibility:**
   - Use clear language
   - Provide alternative input methods
   - Support VoiceOver when possible

## Integration with Other Apps

### Health Apps

- **MyFitnessPal:** Export nutrition data
- **Strava:** Import exercise data
- **Sleep Cycle:** Import sleep data

### Productivity Apps

- **Things 3:** Create weight loss tasks
- **Streaks:** Track daily habits
- **Due:** Set weight loss reminders

### Communication Apps

- **Messages:** Share progress with friends
- **Mail:** Send weekly reports
- **Slack:** Post achievements to team channels

## Future Enhancements

### Planned Features

1. **Machine Learning Integration:**
   - Personalized recommendations
   - Advanced trend analysis
   - Predictive insights

2. **Social Features:**
   - Share progress with friends
   - Join weight loss challenges
   - Community support

3. **Advanced Analytics:**
   - Correlation analysis
   - Seasonal adjustments
   - Goal optimization

### Customization Options

1. **Personalized Dashboards:**
   - Custom metrics display
   - Preferred chart types
   - Color schemes

2. **Notification Preferences:**
   - Custom reminder times
   - Progress thresholds
   - Motivational messages

## Support and Resources

### Documentation

- HealthBridge API documentation
- iOS Shortcuts user guide
- Apple Health integration guide

### Community

- HealthBridge user forum
- iOS Shortcuts community
- Health tracking enthusiasts

### Updates

- Regular shortcut improvements
- New feature announcements
- Bug fix notifications

## Conclusion

This setup guide provides a comprehensive foundation for integrating iOS Shortcuts with the HealthBridge Enhanced API. By following these steps, you can create a seamless, automated health tracking experience that leverages the power of Apple Health and provides advanced analytics for your weight loss journey.

Remember to test thoroughly, handle errors gracefully, and continuously improve your shortcuts based on user feedback and usage patterns.
