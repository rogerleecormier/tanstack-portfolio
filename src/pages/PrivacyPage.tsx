
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { H1, P } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Info
} from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function PrivacyPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Update document title and meta tags
  useDocumentTitle({
    title: 'Privacy Policy - Roger Lee Cormier',
    description: 'Privacy policy for AI-enhanced contact form and website services. Learn how we protect your data and use AI responsibly.',
    keywords: ['Privacy Policy', 'Data Protection', 'AI Ethics', 'GDPR Compliance', 'Contact Form Security'],
    type: 'website'
  })

  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const dataCategories = [
    {
      icon: Mail,
      title: 'Contact Information',
      description: 'Name, email address, company name, and subject line',
      purpose: 'To respond to your inquiries and provide personalized recommendations',
      retention: 'Until request completion or 2 years, whichever is shorter'
    },
    {
      icon: Cpu,
      title: 'Message Content',
      description: 'Your message text and any attachments',
      purpose: 'AI analysis for personalized recommendations and meeting scheduling',
      retention: 'Processed in real-time, not stored after analysis'
    },
    {
      icon: Database,
      title: 'AI Analysis Results',
      description: 'Inquiry type, priority level, industry classification, meeting recommendations',
      purpose: 'To provide personalized responses and meeting scheduling options',
      retention: 'Stored with your contact record until request completion'
    },
    {
      icon: Clock,
      title: 'Meeting Data',
      description: 'Scheduled meeting details, time preferences, timezone information',
      purpose: 'To coordinate and confirm meeting arrangements',
      retention: 'Until meeting completion or cancellation'
    }
  ]

  const securityMeasures = [
    {
      icon: Lock,
      title: 'Encryption in Transit',
      description: 'All data is encrypted using TLS 1.3 during transmission'
    },
    {
      icon: Shield,
      title: 'AI Security',
      description: 'PII scrubbing, content filtering, and rate limiting on all AI processing'
    },
    {
      icon: Database,
      title: 'No Persistent Storage',
      description: 'Message content is processed in real-time and not stored after analysis'
    },
    {
      icon: Eye,
      title: 'Access Controls',
      description: 'Strict access controls and audit logging for all data access'
    }
  ]

  const aiFeatures = [
    {
      icon: Cpu,
      title: 'Intelligent Message Analysis',
      description: 'AI analyzes your message to understand inquiry type, priority, and appropriate response'
    },
    {
      icon: Clock,
      title: 'Meeting Recommendations',
      description: 'AI suggests optimal meeting duration and type based on your inquiry'
    },
    {
      icon: Mail,
      title: 'Personalized Responses',
      description: 'AI generates tailored response suggestions based on your specific needs'
    },
    {
      icon: Shield,
      title: 'Security Screening',
      description: 'AI automatically detects and filters suspicious content and spam'
    }
  ]

  const userRights = [
    {
      title: 'Right to Access',
      description: 'Request a copy of your personal data that we hold'
    },
    {
      title: 'Right to Rectification',
      description: 'Request correction of inaccurate or incomplete personal data'
    },
    {
      title: 'Right to Erasure',
      description: 'Request deletion of your personal data (subject to legal requirements)'
    },
    {
      title: 'Right to Data Portability',
      description: 'Request your data in a structured, machine-readable format'
    },
    {
      title: 'Right to Object',
      description: 'Object to processing of your personal data for specific purposes'
    },
    {
      title: 'Right to Withdraw Consent',
      description: 'Withdraw consent for AI analysis at any time'
    }
  ]

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-teal-600" />
          </div>
          <H1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Privacy Policy
          </H1>
          <P className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            How we protect your data and use AI responsibly to enhance your experience
          </P>
          <div className="mt-4 sm:mt-6">
            <Badge variant="outline" className="text-xs sm:text-sm">
              Last Updated: {lastUpdated}
            </Badge>
          </div>
        </div>

        {/* Overview Card */}
        <Card className="mb-8 sm:mb-12 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Info className="h-5 w-5 text-teal-600" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <P className="text-sm sm:text-base">
              This privacy policy explains how Roger Lee Cormier ("we," "our," or "us") collects, uses, and protects your personal information 
              when you use our AI-enhanced contact form and website services. We are committed to transparency and responsible AI use.
            </P>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 text-sm sm:text-base mb-1">
                    AI-Enhanced Services Notice
                  </h4>
                  <p className="text-blue-800 text-xs sm:text-sm">
                    Our contact form uses artificial intelligence to analyze your messages and provide personalized recommendations. 
                    This processing is optional and requires your explicit consent.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection and Use */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Database className="h-5 w-5 text-teal-600" />
              Data Collection and Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {dataCategories.map((category) => (
                <div key={category.title} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{category.title}</h3>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-gray-700">What we collect:</span>
                      <p className="text-gray-600 mt-1">{category.description}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Purpose:</span>
                      <p className="text-gray-600 mt-1">{category.purpose}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Retention:</span>
                      <p className="text-gray-600 mt-1">{category.retention}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Features and Processing */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Cpu className="h-5 w-5 text-teal-600" />
              AI Features and Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <P className="text-sm sm:text-base mb-6">
              Our contact form uses artificial intelligence to enhance your experience and provide personalized recommendations. 
              Here's how AI processing works:
            </P>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {aiFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-1">{feature.title}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-6" />
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900 text-sm sm:text-base mb-2">
                    AI Processing Safeguards
                  </h4>
                  <ul className="text-green-800 text-xs sm:text-sm space-y-1">
                    <li>• <strong>Consent Required:</strong> AI analysis only occurs with your explicit consent</li>
                    <li>• <strong>PII Protection:</strong> Sensitive information is automatically redacted before AI processing</li>
                    <li>• <strong>No Training Data:</strong> Your messages are not used to train or improve AI models</li>
                    <li>• <strong>Real-time Processing:</strong> Messages are processed in real-time and not stored after analysis</li>
                    <li>• <strong>Transparency:</strong> You can see exactly what AI analysis was performed on your message</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Lock className="h-5 w-5 text-teal-600" />
              Security Measures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <P className="text-sm sm:text-base mb-6">
              We implement industry-standard security measures to protect your personal information:
            </P>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {securityMeasures.map((measure) => (
                <div key={measure.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <measure.icon className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-1">{measure.title}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">{measure.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="h-5 w-5 text-teal-600" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <P className="text-sm sm:text-base mb-6">
              Under applicable data protection laws, you have the following rights regarding your personal information:
            </P>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userRights.map((right) => (
                <div key={right.title} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">{right.title}</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">{right.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <P className="text-sm text-gray-700">
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:roger@rcormier.dev" className="text-teal-600 hover:text-teal-700 font-medium">
                  roger@rcormier.dev
                </a>
                . We will respond to your request within 30 days.
              </P>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <P className="text-sm sm:text-base">
              We use the following third-party services to provide our AI-enhanced features:
            </P>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Cloudflare AI</h4>
                <p className="text-gray-600 text-xs sm:text-sm mb-2">
                  Used for AI message analysis and processing. Data is processed according to Cloudflare's privacy policy.
                </p>
                <a 
                  href="https://www.cloudflare.com/privacypolicy/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-700 text-xs sm:text-sm font-medium"
                >
                  View Cloudflare Privacy Policy →
                </a>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Email Service Providers</h4>
                <p className="text-gray-600 text-xs sm:text-sm mb-2">
                  Used for sending email communications. Contact information is shared only for email delivery purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8 sm:mb-12">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <P className="text-sm sm:text-base mb-4">
              If you have any questions about this privacy policy or our data practices, please contact us:
            </P>
            <div className="space-y-2 text-sm sm:text-base">
              <p><strong>Email:</strong> <a href="mailto:roger@rcormier.dev" className="text-teal-600 hover:text-teal-700">roger@rcormier.dev</a></p>
              <p><strong>Website:</strong> <a href="https://rcormier.dev" className="text-teal-600 hover:text-teal-700">rcormier.dev</a></p>
              <p><strong>Location:</strong> Wellsville, NY, United States</p>
            </div>
          </CardContent>
        </Card>

        {/* Updates to Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <P className="text-sm sm:text-base">
              We may update this privacy policy from time to time to reflect changes in our practices or applicable laws. 
              We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date.
            </P>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
