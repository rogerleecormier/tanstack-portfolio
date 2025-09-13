// Blog Subscription Service
// Handles newsletter signups and blog post notifications

export interface BlogSubscription {
  email: string;
  name?: string;
  subscribedAt: string;
  isActive: boolean;
  preferences?: {
    weeklyDigest?: boolean;
    newPosts?: boolean;
    specialOffers?: boolean;
  };
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  subscription?: BlogSubscription;
}

// Cloudflare Worker endpoint for blog subscriptions
const SUBSCRIPTION_WORKER_ENDPOINT =
  'https://tanstack-portfolio-blog-subscription.rcormier.workers.dev';

export const subscribeToBlog = async (
  email: string,
  name?: string
): Promise<SubscriptionResponse> => {
  try {
    console.log('📧 Blog Subscription Request:', {
      email,
      name,
      timestamp: new Date().toISOString(),
    });

    const response = await fetch(SUBSCRIPTION_WORKER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'subscribe',
        email,
        name,
        preferences: {
          weeklyDigest: true,
          newPosts: true,
          specialOffers: false,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Subscription error:', errorData);
      throw new Error(errorData.error || 'Failed to subscribe');
    }

    const result = await response.json();
    console.log('✅ Subscription successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to subscribe:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to subscribe. Please try again.',
    };
  }
};

export const unsubscribeFromBlog = async (
  email: string
): Promise<SubscriptionResponse> => {
  try {
    console.log('📧 Blog Unsubscription Request:', {
      email,
      timestamp: new Date().toISOString(),
    });

    const response = await fetch(SUBSCRIPTION_WORKER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'unsubscribe',
        email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Unsubscription error:', errorData);
      throw new Error(errorData.error || 'Failed to unsubscribe');
    }

    const result = await response.json();
    console.log('✅ Unsubscription successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to unsubscribe:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to unsubscribe. Please try again.',
    };
  }
};

export const updateSubscriptionPreferences = async (
  email: string,
  preferences: BlogSubscription['preferences']
): Promise<SubscriptionResponse> => {
  try {
    console.log('📧 Update Subscription Preferences:', {
      email,
      preferences,
      timestamp: new Date().toISOString(),
    });

    const response = await fetch(SUBSCRIPTION_WORKER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update_preferences',
        email,
        preferences,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Update preferences error:', errorData);
      throw new Error(errorData.error || 'Failed to update preferences');
    }

    const result = await response.json();
    console.log('✅ Preferences updated successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to update preferences:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to update preferences. Please try again.',
    };
  }
};

export const checkSubscriptionStatus = async (
  email: string
): Promise<SubscriptionResponse> => {
  try {
    console.log('📧 Check Subscription Status:', {
      email,
      timestamp: new Date().toISOString(),
    });

    const response = await fetch(SUBSCRIPTION_WORKER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'check_status',
        email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Check status error:', errorData);
      throw new Error(errorData.error || 'Failed to check status');
    }

    const result = await response.json();
    console.log('✅ Status check successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to check status:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to check status. Please try again.',
    };
  }
};
