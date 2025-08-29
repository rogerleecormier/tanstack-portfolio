// Cloudflare Worker for blog subscription management
// Handles newsletter signups, unsubscriptions, and email notifications

export default {
  async fetch(request, env, ctx) {
    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const data = await request.json();
      const { action, email, name, preferences } = data;

      // Validate required fields
      if (!action || !email) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: action and email' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let result;

      switch (action) {
        case 'subscribe':
          result = await handleSubscribe(env, email, name, preferences);
          break;
        case 'unsubscribe':
          result = await handleUnsubscribe(env, email);
          break;
        case 'update_preferences':
          result = await handleUpdatePreferences(env, email, preferences);
          break;
        case 'check_status':
          result = await handleCheckStatus(env, email);
          break;
        default:
          return new Response(
            JSON.stringify({ error: 'Invalid action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }

      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: error.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};

// Handle new subscription
async function handleSubscribe(env, email, name, preferences) {
  const subscriptionKey = `subscription:${email}`;
  
  // Check if already subscribed
  const existing = await env.BLOG_SUBSCRIPTIONS.get(subscriptionKey);
  if (existing) {
    const existingData = JSON.parse(existing);
    if (existingData.isActive) {
      return {
        success: false,
        message: 'You are already subscribed to our newsletter!'
      };
    }
  }

  // Create new subscription
  const subscription = {
    email,
    name: name || '',
    subscribedAt: new Date().toISOString(),
    isActive: true,
    preferences: {
      weeklyDigest: true,
      newPosts: true,
      specialOffers: false,
      ...preferences
    }
  };

  // Store in KV
  await env.BLOG_SUBSCRIPTIONS.put(subscriptionKey, JSON.stringify(subscription));

  // Send welcome email
  try {
    await sendWelcomeEmail(env, subscription);
    return {
      success: true,
      message: 'Successfully subscribed to our newsletter! Check your email for confirmation.',
      subscription
    };
  } catch (emailError) {
    console.error('Failed to send welcome email, but subscription was stored:', emailError);
    // Return success but with a warning about email
    return {
      success: true,
      message: 'Successfully subscribed to our newsletter! However, there was an issue sending the confirmation email. Please check your spam folder or contact support.',
      subscription,
      emailWarning: true
    };
  }
}

// Handle unsubscription
async function handleUnsubscribe(env, email) {
  const subscriptionKey = `subscription:${email}`;
  
  // Get existing subscription
  const existing = await env.BLOG_SUBSCRIPTIONS.get(subscriptionKey);
  if (!existing) {
    return {
      success: false,
      message: 'No active subscription found for this email.'
    };
  }

  const subscription = JSON.parse(existing);
  subscription.isActive = false;
  subscription.unsubscribedAt = new Date().toISOString();

  // Update in KV
  await env.BLOG_SUBSCRIPTIONS.put(subscriptionKey, JSON.stringify(subscription));

  // Send confirmation email
  try {
    await sendUnsubscribeEmail(env, subscription);
    return {
      success: true,
      message: 'Successfully unsubscribed from our newsletter.',
      subscription
    };
  } catch (emailError) {
    console.error('Failed to send unsubscribe email, but unsubscription was processed:', emailError);
    // Return success but with a warning about email
    return {
      success: true,
      message: 'Successfully unsubscribed from our newsletter. However, there was an issue sending the confirmation email.',
      subscription,
      emailWarning: true
    };
  }
}

// Handle preference updates
async function handleUpdatePreferences(env, email, preferences) {
  const subscriptionKey = `subscription:${email}`;
  
  // Get existing subscription
  const existing = await env.BLOG_SUBSCRIPTIONS.get(subscriptionKey);
  if (!existing) {
    return {
      success: false,
      message: 'No subscription found for this email.'
    };
  }

  const subscription = JSON.parse(existing);
  subscription.preferences = {
    ...subscription.preferences,
    ...preferences
  };

  // Update in KV
  await env.BLOG_SUBSCRIPTIONS.put(subscriptionKey, JSON.stringify(subscription));

  return {
    success: true,
    message: 'Preferences updated successfully.',
    subscription
  };
}

// Handle status check
async function handleCheckStatus(env, email) {
  const subscriptionKey = `subscription:${email}`;
  
  // Get existing subscription
  const existing = await env.BLOG_SUBSCRIPTIONS.get(subscriptionKey);
  if (!existing) {
    return {
      success: false,
      message: 'No subscription found for this email.'
    };
  }

  const subscription = JSON.parse(existing);
  
  return {
    success: true,
    message: subscription.isActive ? 'Active subscription found.' : 'Inactive subscription found.',
    subscription
  };
}

// Send welcome email
async function sendWelcomeEmail(env, subscription) {
  try {
    // Check if RESEND_KEY is configured
    if (!env.RESEND_KEY) {
      console.error('RESEND_KEY is not configured in environment variables');
      throw new Error('Email service not configured - missing API key');
    }

    const emailData = {
      from: 'noreply@rcormier.dev',
      to: [subscription.email],
      subject: 'Welcome to Roger Lee Cormier\'s Newsletter!',
      html: generateWelcomeEmailHTML(subscription),
      text: generateWelcomeEmailText(subscription),
    };

    console.log('Attempting to send welcome email to:', subscription.email);
    console.log('Using API key:', env.RESEND_KEY ? 'Configured' : 'Missing');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send welcome email:', errorData);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`Resend API error: ${response.status} - ${JSON.stringify(errorData)}`);
    } else {
      const result = await response.json();
      console.log('Welcome email sent successfully:', result);
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Re-throw the error so the calling function can handle it
    throw error;
  }
}

// Send unsubscribe confirmation email
async function sendUnsubscribeEmail(env, subscription) {
  try {
    // Check if RESEND_KEY is configured
    if (!env.RESEND_KEY) {
      console.error('RESEND_KEY is not configured in environment variables');
      throw new Error('Email service not configured - missing API key');
    }

    const emailData = {
      from: 'noreply@rcormier.dev',
      to: [subscription.email],
      subject: 'Unsubscribed from Roger Lee Cormier\'s Newsletter',
      html: generateUnsubscribeEmailHTML(subscription),
      text: generateUnsubscribeEmailText(subscription),
    };

    console.log('Attempting to send unsubscribe email to:', subscription.email);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send unsubscribe email:', errorData);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`Resend API error: ${response.status} - ${JSON.stringify(errorData)}`);
    } else {
      const result = await response.json();
      console.log('Unsubscribe email sent successfully:', result);
    }
  } catch (error) {
    console.error('Error sending unsubscribe email:', error);
    // Re-throw the error so the calling function can handle it
    throw error;
  }
}

// Generate welcome email HTML
function generateWelcomeEmailHTML(subscription) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
        Welcome to My Newsletter! 🎉
      </h2>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Thank you for subscribing!</h3>
        <p>Hi ${subscription.name || 'there'},</p>
        <p>Welcome to my newsletter! I'm excited to share insights about technology leadership, DevOps, and strategic thinking with you.</p>
      </div>
      
      <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #374151; margin-top: 0;">What to Expect</h3>
        <ul style="line-height: 1.6;">
          <li><strong>Weekly Insights:</strong> Deep dives into technology trends and leadership</li>
          <li><strong>New Articles:</strong> Notifications when I publish new blog posts</li>
          <li><strong>Practical Tips:</strong> Actionable advice for technology leaders</li>
        </ul>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        <p>You can manage your preferences or unsubscribe anytime by visiting <a href="https://rcormier.dev/blog">my blog</a>.</p>
        <p><a href="https://rcormier.dev/newsletter-preferences" style="color: #10b981; text-decoration: none;">📧 Manage Newsletter Preferences</a></p>
        <p>Best regards,<br>Roger Lee Cormier</p>
      </div>
    </div>
  `;
}

// Generate welcome email text
function generateWelcomeEmailText(subscription) {
  return `
Welcome to My Newsletter! 🎉

Thank you for subscribing!

Hi ${subscription.name || 'there'},

Welcome to my newsletter! I'm excited to share insights about technology leadership, DevOps, and strategic thinking with you.

What to Expect:
- Weekly Insights: Deep dives into technology trends and leadership
- New Articles: Notifications when I publish new blog posts
- Practical Tips: Actionable advice for technology leaders

You can manage your preferences or unsubscribe anytime by visiting my blog at https://rcormier.dev/blog

Best regards,
Roger Lee Cormier
  `;
}

// Generate unsubscribe email HTML
function generateUnsubscribeEmailHTML(subscription) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
        Unsubscribed from Newsletter
      </h2>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">You've been unsubscribed</h3>
        <p>Hi ${subscription.name || 'there'},</p>
        <p>You have been successfully unsubscribed from my newsletter. I'm sorry to see you go!</p>
      </div>
      
      <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #374151; margin-top: 0;">Stay Connected</h3>
        <p>You can still stay updated by:</p>
        <ul style="line-height: 1.6;">
          <li>Visiting <a href="https://rcormier.dev/blog">my blog</a> directly</li>
          <li>Following me on <a href="https://linkedin.com/in/rogerleecormier">LinkedIn</a></li>
          <li>Reaching out via <a href="https://rcormier.dev/contact">my contact form</a></li>
        </ul>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        <p>If you change your mind, you can always resubscribe at <a href="https://rcormier.dev/blog">rcormier.dev/blog</a></p>
        <p><a href="https://rcormier.dev/newsletter-preferences" style="color: #10b981; text-decoration: none;">📧 Manage Newsletter Preferences</a></p>
        <p>Best regards,<br>Roger Lee Cormier</p>
      </div>
    </div>
  `;
}

// Generate unsubscribe email text
function generateUnsubscribeEmailText(subscription) {
  return `
Unsubscribed from Newsletter

You've been unsubscribed

Hi ${subscription.name || 'there'},

You have been successfully unsubscribed from my newsletter. I'm sorry to see you go!

Stay Connected:
You can still stay updated by:
- Visiting my blog directly at https://rcormier.dev/blog
- Following me on LinkedIn
- Reaching out via my contact form at https://rcormier.dev/contact

If you change your mind, you can always resubscribe at https://rcormier.dev/blog

Best regards,
Roger Lee Cormier
  `;
}
