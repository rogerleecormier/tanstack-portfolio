import {
  AIAnalysisError,
  analyzeContactForm,
  type AIAnalysisResult,
} from '@/api/contactAnalyzer';
import { sendEmail } from '@/api/emailService';
import { AIMeetingScheduler } from '@/components/AIMeetingScheduler';
import { ContactAnalysis } from '@/components/ContactAnalysis';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { H1, H2, P } from '@/components/ui/typography';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useScrollToTopOnMount } from '@/hooks/useScrollToTop';
import { format } from 'date-fns';
import {
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Github,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  User,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaLinkedin } from 'react-icons/fa';

// Dynamic Action Button Component
interface DynamicActionButtonProps {
  aiAnalysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  meetingScheduled: boolean;
  showMessageForm: boolean;
  isSubmitting: boolean;
  onScheduleMeeting?: () => void;
}

function DynamicActionButton({
  aiAnalysis,
  isAnalyzing,
  meetingScheduled,
  showMessageForm,
  isSubmitting,
  onScheduleMeeting,
}: DynamicActionButtonProps) {
  // Button is disabled until AI analysis is complete
  if (isAnalyzing) {
    return (
      <Button
        type='button'
        disabled
        className='w-full cursor-not-allowed bg-gray-400 py-2 text-sm text-white sm:py-3 sm:text-base'
      >
        <div className='mr-2 size-3 animate-spin rounded-full border-b-2 border-white sm:size-4' />
        Analyzing your message...
      </Button>
    );
  }

  // If AI recommends scheduling a meeting and no meeting is scheduled yet
  if (aiAnalysis && aiAnalysis.shouldScheduleMeeting && !meetingScheduled) {
    return (
      <Button
        type='button'
        disabled={isSubmitting}
        onClick={onScheduleMeeting}
        className='w-full bg-teal-600 py-2 text-sm text-white hover:bg-teal-700 sm:py-3 sm:text-base'
      >
        {isSubmitting ? (
          <>
            <div className='mr-2 size-3 animate-spin rounded-full border-b-2 border-white sm:size-4' />
            Scheduling Meeting...
          </>
        ) : (
          <>
            <Calendar className='mr-2 size-3 sm:size-4' />
            Schedule Meeting
          </>
        )}
      </Button>
    );
  }

  // If user chose to send message instead
  if (showMessageForm) {
    return (
      <Button
        type='submit'
        disabled={isSubmitting}
        className='w-full bg-teal-600 py-2 text-sm text-white hover:bg-teal-700 sm:py-3 sm:text-base'
      >
        {isSubmitting ? (
          <>
            <div className='mr-2 size-3 animate-spin rounded-full border-b-2 border-white sm:size-4' />
            Sending Message...
          </>
        ) : (
          <>
            <Send className='mr-2 size-3 sm:size-4' />
            Send Message
          </>
        )}
      </Button>
    );
  }

  // Show greyed-out button initially, only enable after AI analysis
  if (!aiAnalysis) {
    return (
      <Button
        type='button'
        disabled
        className='w-full cursor-not-allowed bg-gray-400 py-2 text-sm text-white sm:py-3 sm:text-base'
      >
        <Send className='mr-2 size-3 sm:size-4' />
        {isAnalyzing ? 'AI analysis in progress...' : 'Send Message'}
      </Button>
    );
  }

  return (
    <Button
      type='submit'
      disabled={isSubmitting}
      className='w-full bg-teal-600 py-2 text-sm text-white hover:bg-teal-700 sm:py-3 sm:text-base'
    >
      {isSubmitting ? (
        <>
          <div className='mr-2 size-3 animate-spin rounded-full border-b-2 border-white sm:size-4' />
          Sending Message...
        </>
      ) : (
        <>
          <Send className='mr-2 size-3 sm:size-4' />
          Send Message
        </>
      )}
    </Button>
  );
}

interface ContactForm {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  consent: boolean;
  honeypot: string; // Hidden field for spam prevention
}

interface MeetingData {
  date: Date;
  time: string;
  duration: string;
  type: string;
  timezone: string;
  analysis: AIAnalysisResult;
}

type ContactMode = 'choice' | 'message';

export default function ContactPage() {
  const [contactMode, setContactMode] = useState<ContactMode>('choice');
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    consent: false,
    honeypot: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [meetingScheduled, setMeetingScheduled] = useState(false);
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to top when component mounts
  useScrollToTopOnMount();

  // Update document title and meta tags
  useDocumentTitle({
    title: 'Contact - Roger Lee Cormier',
    description:
      'Get in touch to discuss strategic technology initiatives, enterprise integration projects, or leadership opportunities.',
    keywords: [
      'Contact',
      'Consultation',
      'Project Management',
      'Technology Leadership',
      'Enterprise Integration',
    ],
    type: 'website',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const triggerAIAnalysis = useCallback(async () => {
    // Progressive AI analysis - trigger with message, enhance with more fields
    if (formData.message.length > 20) {
      setIsAnalyzing(true);
      setError(null); // Clear any previous errors
      try {
        const analysis = await analyzeContactForm({
          name: formData.name || 'Anonymous User',
          email: formData.email || 'user@example.com',
          company: formData.company || '',
          subject: formData.subject || 'General Inquiry',
          message: formData.message,
          consent: formData.consent,
          honeypot: formData.honeypot,
        });

        if (analysis) {
          setAiAnalysis(analysis);
        } else {
          throw new Error('AI analysis returned null');
        }
      } catch (error: unknown) {
        if (error instanceof AIAnalysisError) {
          setError(error.message);
        } else {
          setError(
            'AI analysis is required to send your message. Please try again or refresh the page.'
          );
        }
        // Block the form since AI analysis is required
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [formData]);

  // Debounced AI analysis function
  const debouncedAIAnalysis = useCallback(() => {
    // Clear any existing timeout
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    // Set new timeout for debounced analysis
    const timeout = setTimeout(() => {
      if (formData.message.length > 20) {
        void triggerAIAnalysis();
      }
    }, 1500); // 1.5 second delay for better mobile experience

    analysisTimeoutRef.current = timeout;
  }, [formData.message, triggerAIAnalysis]);

  // Monitor message field length and trigger debounced AI analysis when appropriate
  useEffect(() => {
    if (formData.message.length > 20) {
      debouncedAIAnalysis();
    } else if (formData.message.length <= 20) {
      // Clear analysis if message is too short
      setAiAnalysis(null);
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
        analysisTimeoutRef.current = null;
      }
    }
  }, [formData.message, debouncedAIAnalysis]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Send email using our email service with AI analysis
      const emailData = {
        to_name: 'Roger',
        from_name: formData.name,
        from_email: formData.email,
        company: formData.company || 'Not specified',
        subject: formData.subject,
        message: formData.message,
        reply_to: formData.email,
        ...(aiAnalysis && { ai_analysis: aiAnalysis }),
        ...(meetingData && { meeting_data: meetingData }),
      };

      const success = await sendEmail(emailData);

      if (success) {
        setIsSubmitted(true);
        // Scroll to top after successful submission
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Don't auto-reset - let user choose to send another message
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to send message. Please try again or email me directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMeetingScheduled = (meetingData: MeetingData) => {
    setMeetingScheduled(true);
    setMeetingData(meetingData);

    // Scroll to top after meeting scheduling
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Send confirmation email to user
    void sendConfirmationEmail(meetingData);
  };

  const sendConfirmationEmail = async (meetingData: MeetingData) => {
    try {
      const confirmationData = {
        to_name: formData.name || 'User',
        from_name: 'Roger Lee Cormier',
        from_email: 'roger@rcormier.dev',
        company: 'Roger Lee Cormier',
        subject: `Meeting Confirmed: ${meetingData.type} on ${format(meetingData.date, 'MMM do, yyyy')}`,
        message: `Meeting Request from ${formData.name || 'User'}

Meeting Details:
- Date: ${format(meetingData.date, 'EEEE, MMMM do, yyyy')}
- Time: ${meetingData.time} (${meetingData.timezone})
- Duration: ${meetingData.duration}
- Type: ${meetingData.type.replace('-', ' ')}

Original Message:
${formData.message}

Contact Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Company: ${formData.company || 'Not specified'}

This meeting request was generated based on AI analysis of their contact form submission.`,
        reply_to: 'roger@rcormier.dev',
      };

      await sendEmail(confirmationData);
    } catch {
      // Silently handle confirmation email failure
    }
  };

  const resetToChoice = () => {
    setContactMode('choice');
    setFormData({
      name: '',
      email: '',
      company: '',
      subject: '',
      message: '',
      consent: false,
      honeypot: '',
    });
    setError(null);
    setIsSubmitted(false);
    setMeetingScheduled(false);
    setMeetingData(null);
    setAiAnalysis(null);
    setShowMessageForm(false);
  };

  const handleSendMessageInstead = () => {
    setShowMessageForm(true);
  };

  const handleScheduleMeeting = () => {
    if (!aiAnalysis) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Create meeting data with current form data
      const meetingData: MeetingData = {
        date: new Date(), // This will be set by the meeting scheduler
        time: '09:00', // This will be set by the meeting scheduler
        duration: aiAnalysis.meetingDuration,
        type: aiAnalysis.meetingType ?? 'general-discussion',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        analysis: aiAnalysis,
      };

      // Call the meeting scheduled handler
      handleMeetingScheduled(meetingData);
    } catch {
      setError('Failed to schedule meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'roger@rcormier.dev',
      href: 'mailto:roger@rcormier.dev',
      description: 'Direct email for urgent inquiries',
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Wellsville, NY',
      description: 'Available for remote and on-site work',
    },
    {
      icon: Clock,
      title: 'Response Time',
      value: '< 24 hours',
      description: 'Typical response time for inquiries',
    },
  ];

  const expertiseAreas = [
    'Enterprise Systems Modernization',
    'SaaS Integration & Optimization',
    'DevOps & CI/CD Implementation',
    'Strategic Technology Planning',
    'Cross-functional Team Leadership',
    'Process Automation & Optimization',
  ];

  // Success/Confirmation State - Show when message sent OR meeting scheduled
  if (isSubmitted || meetingScheduled) {
    return (
      <div className='container mx-auto px-4 py-6'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='mx-auto max-w-4xl'>
            <div className='mb-6 flex items-center justify-center gap-4'>
              <div className='flex size-12 items-center justify-center rounded-xl bg-green-100'>
                <CheckCircle className='size-6 text-green-600' />
              </div>
              <H1 className='text-2xl font-bold text-gray-900 lg:text-3xl'>
                {isSubmitted
                  ? 'Message Sent Successfully!'
                  : 'Meeting Scheduled Successfully!'}
              </H1>
            </div>
            <P className='mx-auto max-w-3xl text-sm text-gray-600 dark:text-gray-400 lg:text-base'>
              {isSubmitted
                ? "Thank you for reaching out. I'll review your message and get back to you within 24 hours."
                : "Your meeting has been scheduled! You'll receive a confirmation email with meeting details shortly."}
            </P>
          </div>
        </div>

        {/* Modern Side-by-Side Layout */}
        <div className='w-full'>
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12'>
            {/* Left Side - Confirmation Message */}
            <div className='order-2 lg:order-1'>
              <Card className='border-l-4 border-l-green-500 bg-white shadow-lg'>
                <CardContent className='px-6 py-8'>
                  <div className='py-8 text-center'>
                    <CheckCircle className='mx-auto mb-6 size-16 text-green-500' />
                    <H2 className='mb-4 text-2xl font-semibold text-gray-900'>
                      {isSubmitted
                        ? 'Message Sent Successfully!'
                        : 'Meeting Scheduled Successfully!'}
                    </H2>
                    <P className='mb-6 text-base text-gray-600'>
                      {isSubmitted
                        ? "Thank you for reaching out. I'll review your message and get back to you soon."
                        : "Your meeting has been scheduled! You'll receive a confirmation email with meeting details shortly."}
                    </P>
                    {meetingData && (
                      <div className='mb-6 rounded-lg border border-green-200 bg-green-50 p-4'>
                        <Badge variant='outline' className='mb-2 text-sm'>
                          {format(meetingData.date, 'EEEE, MMMM do, yyyy')} at{' '}
                          {meetingData.time}
                        </Badge>
                        <p className='text-sm text-green-700'>
                          {meetingData.duration}{' '}
                          {meetingData.type.replace('-', ' ')} meeting
                        </p>
                      </div>
                    )}
                    <Button
                      onClick={resetToChoice}
                      variant='outline'
                      className='border-teal-200 bg-teal-50 text-base text-teal-700 hover:bg-teal-100'
                    >
                      Send Another Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Supporting Information */}
            <div className='order-1 space-y-6 lg:order-2'>
              {/* Contact Methods */}
              <Card className='border-0 bg-gradient-to-br from-teal-50 to-blue-50 shadow-lg'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-900'>
                    <div className='flex size-8 items-center justify-center rounded-lg bg-teal-100'>
                      <User className='size-5 text-teal-600' />
                    </div>
                    Contact Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {contactMethods.map(method => (
                    <div key={method.title} className='flex items-start gap-3'>
                      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm'>
                        <method.icon className='size-5 text-teal-600' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h4 className='text-sm font-medium text-gray-900'>
                          {method.title}
                        </h4>
                        {method.href ? (
                          <a
                            href={method.href}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='block break-all text-sm font-medium text-teal-600 hover:text-teal-700'
                          >
                            {method.value}
                          </a>
                        ) : (
                          <p className='text-sm font-medium text-gray-600'>
                            {method.value}
                          </p>
                        )}
                        <p className='mt-1 text-xs text-gray-500'>
                          {method.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Areas of Expertise */}
              <Card className='border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-900'>
                    <div className='flex size-8 items-center justify-center rounded-lg bg-blue-100'>
                      <Building className='size-5 text-blue-600' />
                    </div>
                    Areas of Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {expertiseAreas.map(area => (
                      <Badge
                        key={area}
                        variant='secondary'
                        className='border-blue-200 bg-white text-xs text-blue-800 hover:bg-blue-50'
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Connect & Follow */}
              <Card className='border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-900'>
                    <div className='flex size-8 items-center justify-center rounded-lg bg-indigo-100'>
                      <Linkedin className='size-5 text-indigo-600' />
                    </div>
                    Connect & Follow
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <a
                    href='https://linkedin.com/in/rogerleecormier'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-700 hover:shadow-lg'
                  >
                    <FaLinkedin className='size-4' />
                    LinkedIn
                  </a>
                  <a
                    href='https://github.com/rogerleecormier'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='brand-button-primary flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-md transition-colors hover:shadow-lg'
                  >
                    <Github className='size-4' />
                    GitHub
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Choice Selection Screen
  if (contactMode === 'choice') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950'>
        {/* Hero Section - Compact with Targeting Theme */}
        <div className='relative overflow-hidden border-b border-teal-200 dark:border-teal-800'>
          <div className='absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10'></div>

          <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-4xl text-center'>
              {/* Icon and Title with Targeting Theme */}
              <div className='mb-4 flex items-center justify-center gap-4'>
                <div className='relative'>
                  <div className='flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg'>
                    <MessageSquare className='size-7 text-white' />
                  </div>
                  {/* Targeting indicator dots */}
                  <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
                    <div className='size-2 rounded-full bg-white'></div>
                  </div>
                  <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500'>
                    <div className='size-1.5 rounded-full bg-white'></div>
                  </div>
                </div>
                <div>
                  <H1
                    className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl'
                    style={{ fontWeight: 700 }}
                  >
                    <span className='bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent'>
                      Let's Connect
                    </span>
                  </H1>
                  <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-teal-500 to-blue-500'></div>
                </div>
              </div>

              {/* Description with Targeting Language */}
              <P className='mx-auto max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-300'>
                Ready to discuss your next strategic technology initiative?
                <span className='font-medium text-teal-700 dark:text-teal-300'>
                  {' '}
                  Target your success{' '}
                </span>
                with strategic consultation and expert guidance.
              </P>

              {/* Quick Stats with Targeting Theme */}
              <div className='mt-6 flex justify-center gap-6'>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                  <div className='size-2 rounded-full bg-teal-500'></div>
                  <span>Strategic Consultation</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                  <div className='size-2 rounded-full bg-blue-500'></div>
                  <span>Expert Guidance</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                  <div className='size-2 rounded-full bg-purple-500'></div>
                  <span>24hr Response</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
          {/* Modern Side-by-Side Layout */}
          <div className='w-full'>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12'>
              {/* Left Side - Contact Form */}
              <div className='order-2 lg:order-1'>
                <Card className='border-0 bg-white shadow-lg'>
                  <CardHeader className='pb-6'>
                    <CardTitle className='flex items-center gap-3 text-2xl font-bold text-gray-900'>
                      <div className='flex size-10 items-center justify-center rounded-lg bg-teal-100'>
                        <MessageSquare className='size-6 text-teal-600' />
                      </div>
                      Send a Message
                    </CardTitle>
                    <P className='text-base text-gray-600'>
                      Have a question or want to discuss a project? I'll analyze
                      your message and recommend the best way to proceed.
                    </P>
                  </CardHeader>
                  <CardContent>
                    <form
                      id='contact-form'
                      onSubmit={e => void handleSubmit(e)}
                      className='space-y-6'
                    >
                      {/* Form Fields */}
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                          <label
                            htmlFor='name'
                            className='mb-2 block text-sm font-medium text-gray-700'
                          >
                            Full Name *
                          </label>
                          <Input
                            id='name'
                            name='name'
                            type='text'
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder='Your full name'
                            className='border-gray-300 text-base focus:border-teal-500 focus:ring-teal-500'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='email'
                            className='mb-2 block text-sm font-medium text-gray-700'
                          >
                            Email Address *
                          </label>
                          <Input
                            id='email'
                            name='email'
                            type='email'
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder='your.email@company.com'
                            className='border-gray-300 text-base focus:border-teal-500 focus:ring-teal-500'
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                          <label
                            htmlFor='company'
                            className='mb-2 block text-sm font-medium text-gray-700'
                          >
                            Company / Organization
                          </label>
                          <Input
                            id='company'
                            name='company'
                            type='text'
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder='Your company name'
                            className='border-gray-300 text-base focus:border-teal-500 focus:ring-teal-500'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='subject'
                            className='mb-2 block text-sm font-medium text-gray-700'
                          >
                            Subject *
                          </label>
                          <Input
                            id='subject'
                            name='subject'
                            type='text'
                            required
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder='What can I help you with?'
                            className='border-gray-300 text-base focus:border-teal-500 focus:ring-teal-500'
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor='message'
                          className='mb-2 block text-sm font-medium text-gray-700'
                        >
                          Message *
                        </label>
                        <Textarea
                          id='message'
                          name='message'
                          required
                          rows={6}
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder='Tell me about your project, challenge, or opportunity...'
                          className='resize-none border-gray-300 text-base focus:border-teal-500 focus:ring-teal-500'
                        />
                        {formData.message.length > 0 &&
                          formData.message.length < 20 && (
                            <p className='mt-2 text-sm text-gray-500'>
                              Type {20 - formData.message.length} more
                              characters to enable AI analysis
                            </p>
                          )}
                        {formData.message.length >= 20 &&
                          !aiAnalysis &&
                          !isAnalyzing && (
                            <p className='mt-2 text-sm text-blue-600'>
                              ✨ Analysis will start in 1.5 seconds after you
                              stop typing...
                            </p>
                          )}
                        {formData.message.length >= 20 && isAnalyzing && (
                          <div className='mt-2 flex items-center gap-2 text-sm text-blue-600'>
                            <div className='size-4 animate-spin rounded-full border-b-2 border-blue-600'></div>
                            Analyzing your message...
                          </div>
                        )}
                        {formData.message.length >= 20 &&
                          aiAnalysis &&
                          !isAnalyzing && (
                            <div className='mt-2 flex items-center gap-2 text-sm text-green-600'>
                              <CheckCircle className='size-4' />✅ Analysis
                              complete
                            </div>
                          )}
                      </div>

                      {/* Consent Checkbox */}
                      <div className='flex items-start gap-3'>
                        <input
                          type='checkbox'
                          id='consent'
                          name='consent'
                          checked={formData.consent}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              consent: e.target.checked,
                            }))
                          }
                          className='mt-1 size-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500'
                          required
                        />
                        <label
                          htmlFor='consent'
                          className='text-sm text-gray-700'
                        >
                          I consent to AI analysis of my message to receive
                          personalized recommendations and meeting scheduling
                          options. Your message content is processed securely
                          and not stored.
                          <span className='text-red-500'>*</span>
                        </label>
                      </div>

                      {/* Honeypot field - hidden from users */}
                      <div className='hidden'>
                        <input
                          type='text'
                          name='honeypot'
                          value={formData.honeypot}
                          onChange={handleInputChange}
                          tabIndex={-1}
                          autoComplete='off'
                        />
                      </div>

                      {/* Message Analysis - Above Meeting Scheduler */}
                      {((aiAnalysis ?? false) ||
                        isAnalyzing ||
                        formData.message.length >= 20) && (
                        <div className='border-t border-gray-200 pt-4'>
                          <ContactAnalysis
                            analysis={aiAnalysis}
                            isLoading={isAnalyzing}
                            className='border-l-4 border-l-teal-500'
                          />
                        </div>
                      )}

                      {/* Meeting Scheduler - Below Analysis */}
                      {aiAnalysis &&
                        aiAnalysis.shouldScheduleMeeting &&
                        !meetingScheduled && (
                          <div className='border-t border-gray-200 pt-4'>
                            <AIMeetingScheduler
                              analysis={aiAnalysis}
                              className='border-l-4 border-l-teal-500'
                            />
                          </div>
                        )}

                      {/* Dynamic Action Button - Always at the bottom */}
                      <div className='border-t border-gray-200 pt-4'>
                        <DynamicActionButton
                          aiAnalysis={aiAnalysis}
                          isAnalyzing={isAnalyzing}
                          meetingScheduled={meetingScheduled}
                          showMessageForm={showMessageForm}
                          isSubmitting={isSubmitting}
                          onScheduleMeeting={() => void handleScheduleMeeting()}
                        />

                        {/* Send Message Instead Link - Only show when meeting is recommended */}
                        {aiAnalysis &&
                          aiAnalysis.shouldScheduleMeeting &&
                          !meetingScheduled && (
                            <div className='mt-3 text-center'>
                              <button
                                onClick={handleSendMessageInstead}
                                className='inline-flex items-center gap-2 text-sm text-teal-600 transition-colors hover:text-teal-700 hover:underline'
                              >
                                <MessageSquare className='size-4' />
                                <span>Or just send a message instead</span>
                              </button>
                            </div>
                          )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Supporting Information */}
              <div className='order-1 space-y-6 lg:order-2'>
                {/* Contact Methods */}
                <Card className='border-0 bg-gradient-to-br from-teal-50 to-blue-50 shadow-lg'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-900'>
                      <div className='flex size-8 items-center justify-center rounded-lg bg-teal-100'>
                        <User className='size-5 text-teal-600' />
                      </div>
                      Contact Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {contactMethods.map(method => (
                      <div
                        key={method.title}
                        className='flex items-start gap-3'
                      >
                        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm'>
                          <method.icon className='size-5 text-teal-600' />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <h4 className='text-sm font-medium text-gray-900'>
                            {method.title}
                          </h4>
                          {method.href ? (
                            <a
                              href={method.href}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='block break-all text-sm font-medium text-teal-600 hover:text-teal-700'
                            >
                              {method.value}
                            </a>
                          ) : (
                            <p className='text-sm font-medium text-gray-600'>
                              {method.value}
                            </p>
                          )}
                          <p className='mt-1 text-xs text-gray-500'>
                            {method.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Areas of Expertise */}
                <Card className='border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-900'>
                      <div className='flex size-8 items-center justify-center rounded-lg bg-blue-100'>
                        <Building className='size-5 text-blue-600' />
                      </div>
                      Areas of Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap gap-2'>
                      {expertiseAreas.map(area => (
                        <Badge
                          key={area}
                          variant='secondary'
                          className='border-blue-200 bg-white text-xs text-blue-800 hover:bg-blue-50'
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Connect & Follow */}
                <Card className='border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-900'>
                      <div className='flex size-8 items-center justify-center rounded-lg bg-indigo-100'>
                        <Linkedin className='size-5 text-indigo-600' />
                      </div>
                      Connect & Follow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <a
                      href='https://linkedin.com/in/rogerleecormier'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-700 hover:shadow-lg'
                    >
                      <FaLinkedin className='size-4' />
                      LinkedIn
                    </a>
                    <a
                      href='https://github.com/rogerleecormier'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='brand-button-primary flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-md transition-colors hover:shadow-lg'
                    >
                      <Github className='size-4' />
                      GitHub
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {error && (
            <div className='mx-auto mt-8 max-w-2xl rounded-md border border-red-200 bg-red-50 p-4'>
              <p className='flex items-center gap-2 text-sm text-red-600'>
                <span className='text-red-500'>⚠</span>
                {error}
              </p>
            </div>
          )}

          {/* AI Disclosure */}
          <div className='mt-12 text-center'>
            <p className='text-xs text-gray-400'>
              This site uses AI to analyze messages and provide personalized
              recommendations. Message content is processed securely and not
              stored.
              <a
                href='/privacy'
                className='ml-1 text-teal-600 hover:text-teal-700'
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <ScrollToTop />
      </div>
    );
  }

  return null;
}
