import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { H1, H2, P } from '@/components/ui/typography'
import { 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle,
  Linkedin,
  Github,
  Clock,
  Building,
  User,
  MessageSquare,
  ArrowLeft,
  Calendar
} from 'lucide-react'
import { FaLinkedin } from 'react-icons/fa'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { sendEmail } from '@/api/emailService'
import { format } from 'date-fns'
import { AIContactAnalysis } from '@/components/AIContactAnalysis'
import { AIMeetingScheduler } from '@/components/AIMeetingScheduler'
import { analyzeContactForm, type AIAnalysisResult, AIAnalysisError } from '@/api/aiContactAnalyzer'

// Dynamic Action Button Component
interface DynamicActionButtonProps {
  aiAnalysis: AIAnalysisResult | null
  isAnalyzing: boolean
  meetingScheduled: boolean
  showMessageForm: boolean
  isSubmitting: boolean
  onScheduleMeeting?: () => void
}

function DynamicActionButton({
  aiAnalysis,
  isAnalyzing,
  meetingScheduled,
  showMessageForm,
  isSubmitting,
  onScheduleMeeting
}: DynamicActionButtonProps) {
  // Button is disabled until AI analysis is complete
  if (isAnalyzing) {
    return (
      <Button
        type="button"
        disabled
        className="w-full bg-gray-400 text-white py-2 sm:py-3 cursor-not-allowed text-sm sm:text-base"
      >
        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
        Analyzing your message...
      </Button>
    )
  }

  // If AI recommends scheduling a meeting and no meeting is scheduled yet
  if (aiAnalysis && aiAnalysis.shouldScheduleMeeting && !meetingScheduled) {
    return (
      <Button
        type="button"
        disabled={isSubmitting}
        onClick={onScheduleMeeting}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 sm:py-3 text-sm sm:text-base"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
            Scheduling Meeting...
          </>
        ) : (
          <>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Schedule Meeting
          </>
        )}
      </Button>
    )
  }

  // If user chose to send message instead
  if (showMessageForm) {
    return (
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 sm:py-3 text-sm sm:text-base"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
            Sending Message...
          </>
        ) : (
          <>
            <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Send Message
          </>
        )}
      </Button>
    )
  }



  // Show greyed-out button initially, only enable after AI analysis
  if (!aiAnalysis) {
    return (
      <Button
        type="button"
        disabled
        className="w-full bg-gray-400 text-white py-2 sm:py-3 cursor-not-allowed text-sm sm:text-base"
      >
               <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
       Send Message (AI analysis in progress...)
      </Button>
    )
  }

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 sm:py-3 text-sm sm:text-base"
    >
      {isSubmitting ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
          Sending Message...
        </>
      ) : (
        <>
          <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Send Message
        </>
      )}
    </Button>
  )
}

interface ContactForm {
  name: string
  email: string
  company: string
  subject: string
  message: string
  consent: boolean
  honeypot: string // Hidden field for spam prevention
}

interface MeetingData {
  date: Date
  time: string
  duration: string
  type: string
  timezone: string
  analysis: AIAnalysisResult
}

type ContactMode = 'choice' | 'message'

export default function ContactPage() {
  const [contactMode, setContactMode] = useState<ContactMode>('choice')
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    consent: false,
    honeypot: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [meetingScheduled, setMeetingScheduled] = useState(false)
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update document title and meta tags
  useDocumentTitle({
    title: 'Contact - Roger Lee Cormier',
    description: 'Get in touch to discuss strategic technology initiatives, enterprise integration projects, or leadership opportunities.',
    keywords: ['Contact', 'Consultation', 'Project Management', 'Technology Leadership', 'Enterprise Integration'],
    type: 'website'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const triggerAIAnalysis = useCallback(async () => {
    // Progressive AI analysis - trigger with message, enhance with more fields
    if (formData.message.length > 20) {
      setIsAnalyzing(true)
      setError(null) // Clear any previous errors
      try {
        const analysis = await analyzeContactForm({
          name: formData.name || 'Anonymous User',
          email: formData.email || 'user@example.com',
          company: formData.company || '',
          subject: formData.subject || 'General Inquiry',
          message: formData.message,
          consent: formData.consent,
          honeypot: formData.honeypot
        })
        
        if (analysis) {
          setAiAnalysis(analysis)
        } else {
          throw new Error('AI analysis returned null')
        }
             } catch (error: unknown) {
         if (error instanceof AIAnalysisError) {
           setError(error.message)
         } else {
           setError('AI analysis is required to send your message. Please try again or refresh the page.')
         }
         // Block the form since AI analysis is required
       } finally {
        setIsAnalyzing(false)
      }
    }
  }, [formData])

  // Debounced AI analysis function
  const debouncedAIAnalysis = useCallback(() => {
    // Clear any existing timeout
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current)
    }

    // Set new timeout for debounced analysis
    const timeout = setTimeout(() => {
      if (formData.message.length > 20) {
        triggerAIAnalysis()
      }
    }, 1500) // 1.5 second delay for better mobile experience

    analysisTimeoutRef.current = timeout
  }, [formData.message, triggerAIAnalysis])

  // Retry AI analysis function
  const retryAIAnalysis = useCallback(async () => {
    if (formData.message.length > 20) {
      setError(null)
      await triggerAIAnalysis()
    }
  }, [formData.message.length, triggerAIAnalysis])

  // Monitor message field length and trigger debounced AI analysis when appropriate
  useEffect(() => {
    if (formData.message.length > 20) {
      debouncedAIAnalysis()
    } else if (formData.message.length <= 20) {
      // Clear analysis if message is too short
      setAiAnalysis(null)
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
        analysisTimeoutRef.current = null
      }
    }
  }, [formData.message, debouncedAIAnalysis])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
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
        ai_analysis: aiAnalysis || undefined,
        meeting_data: meetingData || undefined
      }

      const success = await sendEmail(emailData)
      
      if (success) {
        setIsSubmitted(true)
        // Don't auto-reset - let user choose to send another message
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message. Please try again or email me directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMeetingScheduled = (meetingData: MeetingData) => {
    setMeetingScheduled(true)
    setMeetingData(meetingData)
    
    // Send confirmation email to user
    sendConfirmationEmail(meetingData)
  }

  const sendConfirmationEmail = async (meetingData: MeetingData) => {
    try {
      const confirmationData = {
        to_name: formData.name || 'User',
        from_name: 'Roger Lee Cormier',
        from_email: 'roger@rcormier.dev',
        company: 'Roger Lee Cormier',
        subject: `Meeting Confirmed: ${meetingData.type} on ${format(meetingData.date, 'MMM do, yyyy')}`,
        message: `Hi ${formData.name || 'there'},

Your meeting has been successfully scheduled!

Meeting Details:
- Date: ${format(meetingData.date, 'EEEE, MMMM do, yyyy')}
- Time: ${meetingData.time} (${meetingData.timezone})
- Duration: ${meetingData.duration}
- Type: ${meetingData.type.replace('-', ' ')}

I'll send you a calendar invite shortly. Looking forward to our discussion!

Best regards,
Roger Lee Cormier`,
        reply_to: 'roger@rcormier.dev'
      }

      await sendEmail(confirmationData)
    } catch {
      // Silently handle confirmation email failure
    }
  }

  const resetToChoice = () => {
    setContactMode('choice')
    setFormData({
      name: '',
      email: '',
      company: '',
      subject: '',
      message: '',
      consent: false,
      honeypot: ''
    })
         setError(null)
     setIsSubmitted(false)
     setShowMessageForm(false)
  }

     const handleSendMessageInstead = () => {
     setShowMessageForm(true)
   }

  const handleScheduleMeeting = async () => {
    if (!aiAnalysis) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Create meeting data with current form data
      const meetingData: MeetingData = {
        date: new Date(), // This will be set by the meeting scheduler
        time: '09:00', // This will be set by the meeting scheduler
        duration: aiAnalysis.meetingDuration,
        type: aiAnalysis.meetingType,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        analysis: aiAnalysis
      }
      
      // Call the meeting scheduled handler
      handleMeetingScheduled(meetingData)
      
    } catch {
      setError('Failed to schedule meeting. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'roger@rcormier.dev',
      href: 'mailto:roger@rcormier.dev',
      description: 'Direct email for urgent inquiries'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Wellsville, NY',
      description: 'Available for remote and on-site work'
    },
    {
      icon: Clock,
      title: 'Response Time',
      value: '< 24 hours',
      description: 'Typical response time for inquiries'
    }
  ]

  const expertiseAreas = [
    'Enterprise Systems Modernization',
    'SaaS Integration & Optimization',
    'DevOps & CI/CD Implementation',
    'Strategic Technology Planning',
    'Cross-functional Team Leadership',
    'Process Automation & Optimization'
  ]

  // Choice Selection Screen
  if (contactMode === 'choice') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <H1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Let's Connect
            </H1>
            <P className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Ready to discuss your next strategic technology initiative? Send me a message and I'll get back to you within 24 hours.
            </P>
          </div>

          {/* Main Contact Option - Single Message Card */}
          <div className="mb-8 sm:mb-12">
            <div className="max-w-2xl mx-auto px-2">
              <Card 
                className="group cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-teal-200 hover:border-teal-400 hover:shadow-xl bg-gradient-to-br from-white to-teal-50"
                onClick={() => {
                  // Reset all form state when transitioning to message form
                  setFormData({
                    name: '',
                    email: '',
                    company: '',
                    subject: '',
                    message: '',
                    consent: false,
                    honeypot: ''
                  })
                  setAiAnalysis(null)
                  setIsAnalyzing(false)
                                     setMeetingScheduled(false)
                   setMeetingData(null)
                   setShowMessageForm(false)
                   setError(null)
                  setIsSubmitted(false)
                  setContactMode('message')
                }}
              >
                <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-teal-200 transition-colors">
                      <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-teal-600" />
                    </div>
                    <H2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                      Send a Message
                    </H2>
                                         <P className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                       Have a question or want to discuss a project? Send me a message and I'll get back to you within 24 hours. 
                       I'll analyze your message and recommend the best way to proceed.
                     </P>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                        <span>General inquiries & project discussions</span>
                      </div>
                                             <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                         <span>Smart analysis & recommendations</span>
                       </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                        <span>Meeting scheduling when appropriate</span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 text-teal-600 font-medium group-hover:text-teal-700 transition-colors">
                      <span>Send Message</span>
                      <div className="w-4 h-4 border-r-2 border-b-2 border-teal-600 rotate-45 group-hover:translate-x-1 transition-transform"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Supporting Information - More Compact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* Contact Methods */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                  Contact Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                {contactMethods.map((method) => (
                  <div key={method.title} className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <method.icon className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900">{method.title}</h4>
                      {method.href ? (
                        <a
                          href={method.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-medium block break-all"
                        >
                          {method.value}
                        </a>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">{method.value}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Areas of Expertise - More Prominent */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                  Areas of Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {expertiseAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="text-xs bg-teal-100 text-teal-800 hover:bg-teal-200">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Connect & Follow */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                  Connect & Follow
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-2 sm:space-y-3">
                  <a
                    href="https://linkedin.com/in/rogerleecormier"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm"
                  >
                    <FaLinkedin className="h-3 w-3 sm:h-4 sm:w-4" />
                    LinkedIn
                  </a>
                  <a
                    href="https://github.com/rogerleecormier"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm"
                  >
                    <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                    GitHub
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="mt-12 sm:mt-16">
            <Separator className="mb-6 sm:mb-8" />
            <div className="text-center">
              <H2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                Why Choose to Work With Me?
              </H2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Building className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Enterprise Experience</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Deep expertise in large-scale system modernization and cross-functional project delivery
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Proven Results</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Track record of delivering complex projects on time and within budget constraints
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Leadership Focus</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Military-trained leadership philosophy emphasizing accountability and team success
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quick Message Form
  if (contactMode === 'message') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Back Button and Header */}
          <div className="mb-6 sm:mb-8">
            <Button
              variant="ghost"
              onClick={resetToChoice}
              className="mb-4 sm:mb-6 text-teal-600 hover:text-teal-700 hover:bg-teal-50 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contact Options
            </Button>
            
            <div className="text-center">
              <H1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Send a Message
              </H1>
              <P className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2">
                Have a question or want to discuss a project? Fill out the form below and I'll get back to you within 24 hours.
              </P>
            </div>
          </div>

          {/* Confirmation State - Show when message sent OR meeting scheduled */}
          {(isSubmitted || meetingScheduled) ? (
            <div className="max-w-2xl mx-auto px-2">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-6 px-4 sm:px-6">
                  <div className="text-center py-6 sm:py-8">
                    <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                    <H2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                      {isSubmitted ? 'Message Sent Successfully!' : 'Meeting Scheduled Successfully!'}
                    </H2>
                    <P className="text-gray-600 mb-4 text-sm sm:text-base">
                      {isSubmitted 
                        ? "Thank you for reaching out. I'll review your message and get back to you soon."
                        : "Your meeting has been scheduled! You'll receive a confirmation email with meeting details shortly."
                      }
                    </P>
                    {meetingData && (
                      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                        <Badge variant="outline" className="text-xs sm:text-sm mb-2">
                          {format(meetingData.date, 'EEEE, MMMM do, yyyy')} at {meetingData.time}
                        </Badge>
                        <p className="text-xs sm:text-sm text-green-700">
                          {meetingData.duration} {meetingData.type.replace('-', ' ')} meeting
                        </p>
                      </div>
                    )}
                    <Button 
                      onClick={resetToChoice}
                      variant="outline"
                      className="bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100 text-sm sm:text-base"
                    >
                      Send Another Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Message Form with AI Analysis and Meeting Scheduler - All in One Form */
            <div className="max-w-7xl mx-auto">
              <div className="max-w-4xl mx-auto px-2">
                <Card>
                  <CardContent className="pt-6 px-4 sm:px-6">
                    <form id="contact-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                      {/* Form Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Full Name *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                            className="text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Email Address *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@company.com"
                            className="text-sm sm:text-base"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label htmlFor="company" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Company / Organization
                          </label>
                          <Input
                            id="company"
                            name="company"
                            type="text"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Your company name"
                            className="text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Subject *
                          </label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            required
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="What can I help you with?"
                            className="text-sm sm:text-base"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Message *
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell me about your project, challenge, or opportunity..."
                          className="resize-none text-sm sm:text-base"
                        />
                                                 {formData.message.length > 0 && formData.message.length < 20 && (
                           <p className="text-xs sm:text-sm text-gray-500 mt-1">
                             Type {20 - formData.message.length} more characters to enable AI analysis
                           </p>
                         )}
                                                 {formData.message.length >= 20 && !aiAnalysis && !isAnalyzing && (
                           <p className="text-xs sm:text-sm text-blue-600 mt-1">
                             ✨ Analysis will start in 1.5 seconds after you stop typing...
                           </p>
                         )}
                         {formData.message.length >= 20 && isAnalyzing && (
                           <p className="text-xs sm:text-sm text-blue-600 mt-1 flex items-center gap-2">
                             <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                             Analyzing your message...
                           </p>
                         )}
                         {formData.message.length >= 20 && aiAnalysis && !isAnalyzing && (
                           <p className="text-xs sm:text-sm text-green-600 mt-1 flex items-center gap-2">
                             <CheckCircle className="h-3 w-3" />
                             ✅ Analysis complete
                           </p>
                         )}
                      </div>

                      {/* Consent Checkbox */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="consent"
                          name="consent"
                          checked={formData.consent}
                          onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                          className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          required
                        />
                                                 <label htmlFor="consent" className="text-xs sm:text-sm text-gray-700">
                           I consent to AI analysis of my message to receive personalized recommendations and meeting scheduling options. 
                           Your message content is processed securely and not stored. 
                           <span className="text-red-500">*</span>
                         </label>
                      </div>

                      {/* Honeypot field - hidden from users */}
                      <div className="hidden">
                        <input
                          type="text"
                          name="honeypot"
                          value={formData.honeypot}
                          onChange={handleInputChange}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>

                                             {/* Message Analysis - Above Meeting Scheduler */}
                       {(aiAnalysis || isAnalyzing) && (
                         <div className="pt-3 sm:pt-4 border-t border-gray-200">
                           <AIContactAnalysis 
                             analysis={aiAnalysis} 
                             isLoading={isAnalyzing}
                             className="border-l-4 border-l-teal-500"
                             onRetry={retryAIAnalysis}
                           />
                         </div>
                       )}

                                               {/* Meeting Scheduler - Below Analysis */}
                        {aiAnalysis && aiAnalysis.shouldScheduleMeeting && !meetingScheduled && (
                          <div className="pt-3 sm:pt-4 border-t border-gray-200">
                            <AIMeetingScheduler
                              analysis={aiAnalysis}
                              className="border-l-4 border-l-teal-500"
                            />
                          </div>
                        )}

                                             {/* Dynamic Action Button - Always at the bottom */}
                       <div className="pt-3 sm:pt-4 border-t border-gray-200">
                         <DynamicActionButton
                           aiAnalysis={aiAnalysis}
                           isAnalyzing={isAnalyzing}
                           meetingScheduled={meetingScheduled}
                           showMessageForm={showMessageForm}
                           isSubmitting={isSubmitting}
                           onScheduleMeeting={handleScheduleMeeting}
                         />
                         
                                                   {/* Send Message Instead Link - Only show when meeting is recommended */}
                          {aiAnalysis && aiAnalysis.shouldScheduleMeeting && !meetingScheduled && (
                            <div className="text-center mt-3">
                              <button
                                onClick={handleSendMessageInstead}
                                className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span>Or just send a message instead</span>
                              </button>
                            </div>
                          )}
                       </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

                     {error && (
             <div className="mt-4 sm:mt-6 bg-red-50 border border-red-200 rounded-md p-3 max-w-2xl mx-auto">
               <p className="text-red-600 text-xs sm:text-sm flex items-center gap-2">
                 <span className="text-red-500">⚠</span>
                 {error}
               </p>
             </div>
           )}

                       {/* AI Disclosure */}
            <div className="mt-8 sm:mt-12 text-center">
              <p className="text-xs text-gray-400">
                This site uses AI to analyze messages and provide personalized recommendations. 
                Message content is processed securely and not stored. 
                <a href="/privacy" className="text-teal-600 hover:text-teal-700 ml-1">Privacy Policy</a>
              </p>
            </div>
        </div>
      </div>
    )
  }

  return null
}
