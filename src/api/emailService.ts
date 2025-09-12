// Email service for sending contact form submissions via Cloudflare Worker
// This avoids CORS issues by using a serverless function

import type { AIAnalysisResult } from './contactAnalyzer';

interface MeetingData {
  date: Date;
  time: string;
  duration: string;
  type: string;
  timezone: string;
  analysis: AIAnalysisResult;
}

interface EmailData {
  to_name: string;
  from_name: string;
  from_email: string;
  company: string;
  subject: string;
  message: string;
  reply_to: string;
  ai_analysis?: AIAnalysisResult;
  meeting_data?: MeetingData;
}

// Cloudflare Worker endpoint - Production only
const WORKER_ENDPOINT =
  'https://tanstack-portfolio-email-worker.rcormier.workers.dev';

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Always call the Cloudflare Worker (both dev and production)
    console.log('📧 Contact Form Submission - Calling Cloudflare Worker:', {
      from: `${emailData.from_name} <${emailData.from_email}>`,
      company: emailData.company,
      subject: emailData.subject,
      message: emailData.message,
      timestamp: new Date().toISOString(),
    });

    console.log('🚀 Calling worker at:', WORKER_ENDPOINT);

    // Call the Cloudflare Worker
    const response = await fetch(WORKER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_name: emailData.from_name,
        from_email: emailData.from_email,
        company: emailData.company,
        subject: emailData.subject,
        message: emailData.message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Worker error:', errorData);
      throw new Error(errorData.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

// Alternative: Use Resend with Cloudflare Workers
export const sendEmailWithResend = async (
  emailData: EmailData
): Promise<boolean> => {
  try {
    // This uses the Cloudflare Worker which calls Resend API server-side
    return await sendEmail(emailData);
  } catch (error) {
    console.error('Resend via Worker error:', error);
    return false;
  }
};
