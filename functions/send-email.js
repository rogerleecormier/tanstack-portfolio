// Cloudflare Worker for sending emails via Resend API
// This avoids CORS issues by running server-side

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
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      // Parse the request body
      const emailData = await request.json();
      
      // Validate required fields
      if (!emailData.from_name || !emailData.from_email || !emailData.subject || !emailData.message) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Determine FROM_EMAIL and TO_EMAIL based on the worker environment
      // Since rcormier.dev is verified with Resend, we can use it for both environments
      const isProduction = request.url.includes('production') || env.ENVIRONMENT === 'production';
      
      // Use your verified domain email for both environments
      const fromEmail = 'noreply@rcormier.dev';
      
      // Always send to your domain email - domain is verified with Resend
      const toEmail = 'roger@rcormier.dev';

      // Send email using Resend API
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          reply_to: emailData.from_email,
          subject: `Portfolio Contact: ${emailData.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
                New Contact Form Submission
              </h2>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">Contact Details</h3>
                <p><strong>Name:</strong> ${emailData.from_name}</p>
                <p><strong>Email:</strong> <a href="mailto:${emailData.from_email}">${emailData.from_email}</a></p>
                <p><strong>Company:</strong> ${emailData.company || 'Not specified'}</p>
                <p><strong>Subject:</strong> ${emailData.subject}</p>
              </div>
              
              <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h3 style="color: #374151; margin-top: 0;">Message</h3>
                <p style="white-space: pre-wrap; line-height: 1.6;">${emailData.message}</p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                <p>This message was sent from your portfolio contact form at rcormier.dev</p>
                <p>Reply directly to: <a href="mailto:${emailData.from_email}">${emailData.from_email}</a></p>
              </div>
            </div>
          `,
          text: `
New Contact Form Submission

Contact Details:
Name: ${emailData.from_name}
Email: ${emailData.from_email}
Company: ${emailData.company || 'Not specified'}
Subject: ${emailData.subject}

Message:
${emailData.message}

---
This message was sent from your portfolio contact form at rcormier.dev
Reply directly to: ${emailData.from_email}
          `,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json();
        console.error('Resend API error:', errorData);
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send email',
            details: errorData 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const result = await resendResponse.json();
      console.log('Email sent successfully:', result);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully',
          data: result 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: error.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
