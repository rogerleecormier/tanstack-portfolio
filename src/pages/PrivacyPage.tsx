import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { H1, P } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Eye,
  Lock,
  Database,
  Cpu,
  Clock,
  Mail,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function PrivacyPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Update document title and meta tags
  useDocumentTitle({
    title: 'Privacy Policy - Roger Lee Cormier',
    description:
      'Privacy policy for AI-enhanced contact form and website services. Learn how we protect your data and use AI responsibly.',
    keywords: [
      'Privacy Policy',
      'Data Protection',
      'AI Ethics',
      'GDPR Compliance',
      'Contact Form Security',
    ],
    type: 'website',
  });

  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const dataCategories = [
    {
      icon: Mail,
      title: 'Contact Information',
      description: 'Name, email address, company name, and subject line',
      purpose:
        'To respond to your inquiries and provide personalized recommendations',
      retention: 'Until request completion or 2 years, whichever is shorter',
    },
    {
      icon: Cpu,
      title: 'Message Content',
      description: 'Your message text and any attachments',
      purpose:
        'AI analysis for personalized recommendations and meeting scheduling',
      retention: 'Processed in real-time, not stored after analysis',
    },
    {
      icon: Database,
      title: 'AI Analysis Results',
      description:
        'Inquiry type, priority level, industry classification, meeting recommendations',
      purpose:
        'To provide personalized responses and meeting scheduling options',
      retention: 'Stored with your contact record until request completion',
    },
    {
      icon: Clock,
      title: 'Meeting Data',
      description:
        'Scheduled meeting details, time preferences, timezone information',
      purpose: 'To coordinate and confirm meeting arrangements',
      retention: 'Until meeting completion or cancellation',
    },
  ];

  const securityMeasures = [
    {
      icon: Lock,
      title: 'Encryption in Transit',
      description: 'All data is encrypted using TLS 1.3 during transmission',
    },
    {
      icon: Shield,
      title: 'AI Security',
      description:
        'PII scrubbing, content filtering, and rate limiting on all AI processing',
    },
    {
      icon: Database,
      title: 'No Persistent Storage',
      description:
        'Message content is processed in real-time and not stored after analysis',
    },
    {
      icon: Eye,
      title: 'Access Controls',
      description:
        'Strict access controls and audit logging for all data access',
    },
  ];

  const aiFeatures = [
    {
      icon: Cpu,
      title: 'Intelligent Message Analysis',
      description:
        'AI analyzes your message to understand inquiry type, priority, and appropriate response',
    },
    {
      icon: Clock,
      title: 'Meeting Recommendations',
      description:
        'AI suggests optimal meeting duration and type based on your inquiry',
    },
    {
      icon: Mail,
      title: 'Personalized Responses',
      description:
        'AI generates tailored response suggestions based on your specific needs',
    },
    {
      icon: Shield,
      title: 'Security Screening',
      description:
        'AI automatically detects and filters suspicious content and spam',
    },
  ];

  const userRights = [
    {
      title: 'Right to Access',
      description: 'Request a copy of your personal data that we hold',
    },
    {
      title: 'Right to Rectification',
      description:
        'Request correction of inaccurate or incomplete personal data',
    },
    {
      title: 'Right to Erasure',
      description:
        'Request deletion of your personal data (subject to legal requirements)',
    },
    {
      title: 'Right to Data Portability',
      description: 'Request your data in a structured, machine-readable format',
    },
    {
      title: 'Right to Object',
      description:
        'Object to processing of your personal data for specific purposes',
    },
    {
      title: 'Right to Withdraw Consent',
      description: 'Withdraw consent for AI analysis at any time',
    },
  ];

  return (
    <div className='min-h-screen bg-surface-base'>
      {/* Header with Glassmorphism */}
      <div className='relative overflow-hidden border-b border-surface-elevated/50 bg-surface-base/40 backdrop-blur-xl'>
        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-surface-elevated/60 shadow-lg ring-1 ring-strategy-gold/20 backdrop-blur-md'>
                  <Shield className='size-7 text-strategy-gold' />
                </div>
                {/* Security indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-surface-deep/80 backdrop-blur-sm'>
                  <div className='size-2 rounded-full bg-strategy-gold'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-text-tertiary/60 backdrop-blur-sm'>
                  <div className='size-1.5 rounded-full bg-strategy-gold'></div>
                </div>
              </div>
              <div>
                <H1 className='text-4xl font-bold tracking-tight text-text-foreground sm:text-5xl lg:text-6xl'>
                  <span className='text-strategy-gold'>Privacy Policy</span>
                </H1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-strategy-gold/50'></div>
              </div>
            </div>

            {/* Description */}
            <P className='mx-auto max-w-3xl text-lg leading-7 text-text-secondary'>
              Complete transparency on data protection and
              <span className='font-medium text-strategy-gold'>
                {' '}
                responsible AI practices
              </span>
              . Your privacy and security are our top priorities.
            </P>

            {/* Quick Stats */}
            <div className='mt-6 flex flex-wrap justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
                <span>GDPR Compliant</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
                <span>Transparent AI</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
                <Badge
                  variant='outline'
                  className='ml-1 border-strategy-gold/30 text-xs text-strategy-gold'
                >
                  {lastUpdated}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Overview Card */}
        <Card className='mb-8 border-l-4 border-l-strategy-gold border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl sm:mb-12'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg text-strategy-gold sm:text-xl'>
              <Info className='size-5' />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <P className='text-sm text-text-secondary sm:text-base'>
              This privacy policy explains how Roger Lee Cormier ("we," "our,"
              or "us") collects, uses, and protects your personal information
              when you use our AI-enhanced contact form and website services. We
              are committed to transparency and responsible AI use.
            </P>
            <div className='rounded-lg border border-strategy-gold/30 bg-strategy-gold/10 p-4'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='mt-0.5 size-5 shrink-0 text-strategy-gold' />
                <div>
                  <h4 className='mb-1 text-sm font-medium text-text-foreground sm:text-base'>
                    AI-Enhanced Services Notice
                  </h4>
                  <p className='text-xs text-text-secondary sm:text-sm'>
                    Our contact form uses artificial intelligence to analyze
                    your messages and provide personalized recommendations. This
                    processing is optional and requires your explicit consent.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection and Use */}
        <Card className='mb-8 border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl sm:mb-12'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg text-strategy-gold sm:text-xl'>
              <Database className='size-5' />
              Data Collection and Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
              {dataCategories.map(category => (
                <div
                  key={category.title}
                  className='rounded-lg border border-strategy-gold/20 bg-surface-deep/50 p-4'
                >
                  <div className='mb-3 flex items-center gap-3'>
                    <div className='flex size-10 items-center justify-center rounded-lg bg-strategy-gold/20'>
                      <category.icon className='size-5 text-strategy-gold' />
                    </div>
                    <h3 className='text-sm font-semibold text-text-foreground sm:text-base'>
                      {category.title}
                    </h3>
                  </div>
                  <div className='space-y-2 text-xs sm:text-sm'>
                    <div>
                      <span className='font-medium text-text-foreground'>
                        What we collect:
                      </span>
                      <p className='mt-1 text-text-secondary'>
                        {category.description}
                      </p>
                    </div>
                    <div>
                      <span className='font-medium text-text-foreground'>
                        Purpose:
                      </span>
                      <p className='mt-1 text-text-secondary'>{category.purpose}</p>
                    </div>
                    <div>
                      <span className='font-medium text-text-foreground'>
                        Retention:
                      </span>
                      <p className='mt-1 text-text-secondary'>
                        {category.retention}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Features and Processing */}
        <Card className='mb-8 border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl sm:mb-12'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg text-strategy-gold sm:text-xl'>
              <Cpu className='size-5' />
              AI Features and Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <P className='mb-6 text-sm text-text-secondary sm:text-base'>
              Our contact form uses artificial intelligence to enhance your
              experience and provide personalized recommendations. Here's how AI
              processing works:
            </P>
            <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
              {aiFeatures.map(feature => (
                <div key={feature.title} className='flex items-start gap-3'>
                  <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-strategy-gold/20'>
                    <feature.icon className='size-4 text-strategy-gold' />
                  </div>
                  <div>
                    <h4 className='mb-1 text-sm font-medium text-text-foreground sm:text-base'>
                      {feature.title}
                    </h4>
                    <p className='text-xs text-text-secondary sm:text-sm'>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className='my-6' />

            <div className='rounded-lg border border-strategy-emerald/30 bg-strategy-emerald/10 p-4'>
              <div className='flex items-start gap-3'>
                <CheckCircle className='mt-0.5 size-5 shrink-0 text-strategy-emerald' />
                <div>
                  <h4 className='mb-2 text-sm font-medium text-text-foreground sm:text-base'>
                    AI Processing Safeguards
                  </h4>
                  <ul className='space-y-1 text-xs text-text-secondary sm:text-sm'>
                    <li>
                      • <strong>Consent Required:</strong> AI analysis only
                      occurs with your explicit consent
                    </li>
                    <li>
                      • <strong>PII Protection:</strong> Sensitive information
                      is automatically redacted before AI processing
                    </li>
                    <li>
                      • <strong>No Training Data:</strong> Your messages are not
                      used to train or improve AI models
                    </li>
                    <li>
                      • <strong>Real-time Processing:</strong> Messages are
                      processed in real-time and not stored after analysis
                    </li>
                    <li>
                      • <strong>Transparency:</strong> You can see exactly what
                      AI analysis was performed on your message
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card className='mb-8 border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl sm:mb-12'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg text-strategy-gold sm:text-xl'>
              <Lock className='size-5' />
              Security Measures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <P className='mb-6 text-sm text-text-secondary sm:text-base'>
              We implement industry-standard security measures to protect your
              personal information:
            </P>
            <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
              {securityMeasures.map(measure => (
                <div key={measure.title} className='flex items-start gap-3'>
                  <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-strategy-gold/20'>
                    <measure.icon className='size-4 text-strategy-gold' />
                  </div>
                  <div>
                    <h4 className='mb-1 text-sm font-medium text-text-foreground sm:text-base'>
                      {measure.title}
                    </h4>
                    <p className='text-xs text-text-secondary sm:text-sm'>
                      {measure.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className='mb-8 border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl sm:mb-12'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg text-strategy-gold sm:text-xl'>
              <Shield className='size-5' />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <P className='mb-6 text-sm text-text-secondary sm:text-base'>
              Under applicable data protection laws, you have the following
              rights regarding your personal information:
            </P>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {userRights.map(right => (
                <div
                  key={right.title}
                  className='rounded-lg border border-strategy-gold/20 bg-surface-deep/50 p-4'
                >
                  <h4 className='mb-2 text-sm font-medium text-text-foreground sm:text-base'>
                    {right.title}
                  </h4>
                  <p className='text-xs text-text-secondary sm:text-sm'>
                    {right.description}
                  </p>
                </div>
              ))}
            </div>
            <div className='mt-6 rounded-lg border border-strategy-gold/20 bg-surface-deep/50 p-4'>
              <P className='text-sm text-text-secondary'>
                To exercise any of these rights, please contact us at{' '}
                <a
                  href='mailto:roger@rcormier.dev'
                  className='font-medium text-strategy-gold hover:text-strategy-gold/80'
                >
                  roger@rcormier.dev
                </a>
                . We will respond to your request within 30 days.
              </P>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className='mb-8 border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl sm:mb-12'>
          <CardHeader>
            <CardTitle className='text-lg text-strategy-gold sm:text-xl'>
              Third-Party Services
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <P className='text-sm text-text-secondary sm:text-base'>
              We use the following third-party services to provide our
              AI-enhanced features:
            </P>
            <div className='space-y-3'>
              <div className='rounded-lg border border-strategy-gold/20 bg-surface-deep/50 p-4'>
                <h4 className='mb-2 text-sm font-medium text-text-foreground sm:text-base'>
                  Cloudflare AI
                </h4>
                <p className='mb-2 text-xs text-text-secondary sm:text-sm'>
                  Used for AI message analysis and processing. Data is processed
                  according to Cloudflare's privacy policy.
                </p>
                <a
                  href='https://www.cloudflare.com/privacypolicy/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs font-medium text-strategy-gold hover:text-strategy-gold/80 sm:text-sm'
                >
                  View Cloudflare Privacy Policy →
                </a>
              </div>
              <div className='rounded-lg border border-strategy-gold/20 bg-surface-deep/50 p-4'>
                <h4 className='mb-2 text-sm font-medium text-text-foreground sm:text-base'>
                  Email Service Providers
                </h4>
                <p className='mb-2 text-xs text-text-secondary sm:text-sm'>
                  Used for sending email communications. Contact information is
                  shared only for email delivery purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className='mb-8 border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl sm:mb-12'>
          <CardHeader>
            <CardTitle className='text-lg text-strategy-gold sm:text-xl'>
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <P className='mb-4 text-sm text-text-secondary sm:text-base'>
              If you have any questions about this privacy policy or our data
              practices, please contact us:
            </P>
            <div className='space-y-2 text-sm text-text-secondary sm:text-base'>
              <p>
                <strong className='text-text-foreground'>Email:</strong>{' '}
                <a
                  href='mailto:roger@rcormier.dev'
                  className='text-strategy-gold hover:text-strategy-gold/80'
                >
                  roger@rcormier.dev
                </a>
              </p>
              <p>
                <strong className='text-text-foreground'>Website:</strong>{' '}
                <a
                  href='https://rcormier.dev'
                  className='text-strategy-gold hover:text-strategy-gold/80'
                >
                  rcormier.dev
                </a>
              </p>
              <p>
                <strong className='text-text-foreground'>Location:</strong> Wellsville, NY, United States
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Updates to Policy */}
        <Card className='border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl'>
          <CardHeader>
            <CardTitle className='text-lg text-strategy-gold sm:text-xl'>
              Updates to This Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <P className='text-sm text-text-secondary sm:text-base'>
              We may update this privacy policy from time to time to reflect
              changes in our practices or applicable laws. We will notify you of
              any material changes by posting the updated policy on this page
              and updating the "Last Updated" date.
            </P>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
