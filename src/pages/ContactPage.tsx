import React, { useState } from 'react'
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
  Calendar, 
  Send, 
  CheckCircle,
  Linkedin,
  Github,
  Clock,
  Building,
  User,
  MessageSquare,
  ArrowLeft
} from 'lucide-react'
import { FaLinkedin } from 'react-icons/fa'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { sendEmail } from '@/api/emailService'
import { SchedulingForm } from '@/components/SchedulingForm'

interface ContactForm {
  name: string
  email: string
  company: string
  subject: string
  message: string
}

type ContactMode = 'choice' | 'message' | 'schedule'

export default function ContactPage() {
  const [contactMode, setContactMode] = useState<ContactMode>('choice')
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Send email using our email service
      const emailData = {
        to_name: 'Roger',
        from_name: formData.name,
        from_email: formData.email,
        company: formData.company || 'Not specified',
        subject: formData.subject,
        message: formData.message,
        reply_to: formData.email,
      }

      const success = await sendEmail(emailData)
      
      if (success) {
        setIsSubmitted(true)
        // Reset form after successful submission
        setTimeout(() => {
          setIsSubmitted(false)
          setFormData({
            name: '',
            email: '',
            company: '',
            subject: '',
            message: ''
          })
        }, 5000)
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send message. Please try again or email me directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetToChoice = () => {
    setContactMode('choice')
    setFormData({
      name: '',
      email: '',
      company: '',
      subject: '',
      message: ''
    })
    setError(null)
    setIsSubmitted(false)
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <H1 className="text-4xl font-bold text-gray-900 mb-4">
              Let's Connect
            </H1>
            <P className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to discuss your next strategic technology initiative? Choose how you'd like to get in touch.
            </P>
          </div>

                     {/* Main Contact Options - More Prominent */}
           <div className="mb-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
               {/* Quick Message Card - Enhanced for Clickability */}
               <Card 
                 className="group cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-teal-200 hover:border-teal-400 hover:shadow-xl bg-gradient-to-br from-white to-teal-50"
                 onClick={() => setContactMode('message')}
               >
                 <CardContent className="pt-8 pb-8">
                   <div className="text-center">
                     <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-200 transition-colors">
                       <MessageSquare className="h-10 w-10 text-teal-600" />
                     </div>
                     <H2 className="text-2xl font-semibold text-gray-900 mb-4">
                       Quick Message
                     </H2>
                     <P className="text-gray-600 mb-6">
                       Have a question or want to discuss a project? Send me a message and I'll get back to you within 24 hours.
                     </P>
                     <div className="space-y-3 text-sm text-gray-500 mb-6">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                         <span>General inquiries</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                         <span>Project discussions</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                         <span>Quick questions</span>
                       </div>
                     </div>
                     <div className="inline-flex items-center gap-2 text-teal-600 font-medium group-hover:text-teal-700 transition-colors">
                       <span>Send Message</span>
                       <div className="w-4 h-4 border-r-2 border-b-2 border-teal-600 rotate-45 group-hover:translate-x-1 transition-transform"></div>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Schedule Meeting Card - Enhanced for Clickability */}
               <Card 
                 className="group cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-teal-200 hover:border-teal-400 hover:shadow-xl bg-gradient-to-br from-white to-teal-50"
                 onClick={() => setContactMode('schedule')}
               >
                 <CardContent className="pt-8 pb-8">
                   <div className="text-center">
                     <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-200 transition-colors">
                       <Calendar className="h-10 w-10 text-teal-600" />
                     </div>
                     <H2 className="text-2xl font-semibold text-gray-900 mb-4">
                       Schedule Meeting
                     </H2>
                     <P className="text-gray-600 mb-6">
                       Ready for a detailed consultation? Schedule a meeting and I'll get back to you to confirm the details.
                     </P>
                     <div className="space-y-3 text-sm text-gray-500 mb-6">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                         <span>In-depth discussions</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                         <span>Project planning</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                         <span>Strategy sessions</span>
                       </div>
                     </div>
                     <div className="inline-flex items-center gap-2 text-teal-600 font-medium group-hover:text-teal-700 transition-colors">
                       <span>Book Meeting</span>
                       <div className="w-4 h-4 border-r-2 border-b-2 border-teal-600 rotate-45 group-hover:translate-x-1 transition-transform"></div>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>
           </div>

           {/* Supporting Information - More Compact */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
             {/* Contact Methods */}
             <Card className="border border-gray-200 bg-white">
               <CardHeader className="pb-4">
                 <CardTitle className="flex items-center gap-2 text-lg">
                   <User className="h-5 w-5 text-teal-600" />
                   Contact Methods
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {contactMethods.map((method) => (
                   <div key={method.title} className="flex items-start gap-3">
                     <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                       <method.icon className="h-5 w-5 text-teal-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-medium text-gray-900">{method.title}</h4>
                       {method.href ? (
                         <a
                           href={method.href}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-sm text-teal-600 hover:text-teal-700 font-medium block"
                         >
                           {method.value}
                         </a>
                       ) : (
                         <p className="text-sm text-gray-600 font-medium">{method.value}</p>
                       )}
                       <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                     </div>
                   </div>
                 ))}
               </CardContent>
             </Card>

             {/* Areas of Expertise - More Prominent */}
             <Card className="border border-gray-200 bg-white">
               <CardHeader className="pb-4">
                 <CardTitle className="flex items-center gap-2 text-lg">
                   <Building className="h-5 w-5 text-teal-600" />
                   Areas of Expertise
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="flex flex-wrap gap-2">
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
               <CardHeader className="pb-4">
                 <CardTitle className="flex items-center gap-2 text-lg">
                   <Linkedin className="h-5 w-5 text-teal-600" />
                   Connect & Follow
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-3">
                   <a
                     href="https://linkedin.com/in/rogerleecormier"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                   >
                     <FaLinkedin className="h-4 w-4" />
                     LinkedIn
                   </a>
                   <a
                     href="https://github.com/rogerleecormier"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                   >
                     <Github className="h-4 w-4" />
                     GitHub
                   </a>
                 </div>
               </CardContent>
             </Card>
           </div>



          {/* Additional Information */}
          <div className="mt-16">
            <Separator className="mb-8" />
            <div className="text-center">
              <H2 className="text-2xl font-semibold text-gray-900 mb-4">
                Why Choose to Work With Me?
              </H2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Experience</h3>
                  <p className="text-gray-600 text-sm">
                    Deep expertise in large-scale system modernization and cross-functional project delivery
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Proven Results</h3>
                  <p className="text-gray-600 text-sm">
                    Track record of delivering complex projects on time and within budget constraints
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Leadership Focus</h3>
                  <p className="text-gray-600 text-sm">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button and Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={resetToChoice}
              className="mb-6 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contact Options
            </Button>
            
            <div className="text-center">
              <H1 className="text-4xl font-bold text-gray-900 mb-4">
                Send a Quick Message
              </H1>
              <P className="text-xl text-gray-600 max-w-2xl mx-auto">
                Have a question or want to discuss a project? Fill out the form below and I'll get back to you within 24 hours.
              </P>
            </div>
          </div>

          {/* Message Form */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <H2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Message Sent Successfully!
                  </H2>
                  <P className="text-gray-600 mb-4">
                    Thank you for reaching out. I'll review your message and get back to you soon.
                  </P>
                  <Button 
                    onClick={resetToChoice}
                    variant="outline"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Company / Organization
                      </label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
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
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="resize-none"
                    />
                  </div>
                   
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm flex items-center gap-2">
                        <span className="text-red-500">⚠</span>
                        {error}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Schedule Meeting Form
  if (contactMode === 'schedule') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button and Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={resetToChoice}
              className="mb-6 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contact Options
            </Button>
            
            <div className="text-center">
              <H1 className="text-4xl font-bold text-gray-900 mb-4">
                Schedule a Meeting
              </H1>
              <P className="text-xl text-gray-600 max-w-2xl mx-auto">
                Ready for a detailed consultation? Schedule a meeting and I'll get back to you within 24 hours to confirm the details.
              </P>
            </div>
          </div>

          {/* Scheduling Form */}
          <div className="max-w-2xl mx-auto">
            <SchedulingForm />
          </div>
        </div>
      </div>
    )
  }

  return null
}
