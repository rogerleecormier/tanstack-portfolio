import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { sendEmail } from '@/api/emailService'

interface SchedulingFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

interface SchedulingData {
  name: string
  email: string
  company?: string
  date: Date | undefined
  time: string
  duration: string
  topic: string
  description: string
}

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
]

const durationOptions = [
  '30 minutes',
  '1 hour',
  '1.5 hours',
  '2 hours'
]

export function SchedulingForm({ onSuccess, onError, className }: SchedulingFormProps) {
  const [formData, setFormData] = useState<SchedulingData>({
    name: '',
    email: '',
    company: '',
    date: undefined,
    time: '',
    duration: '1 hour',
    topic: '',
    description: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, date }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.time) {
      onError?.('Please select a date and time for the meeting.')
      return
    }

    setIsSubmitting(true)
    
    try {
      const formattedDate = format(formData.date, 'EEEE, MMMM do, yyyy')
      const meetingTime = `${formattedDate} at ${formData.time}`
      
      const emailData = {
        to_name: 'Roger',
        from_name: formData.name,
        from_email: formData.email,
        company: formData.company || 'Not specified',
        subject: `Meeting Request: ${formData.topic}`,
        message: `
Meeting Request Details:

Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company || 'Not specified'}
Date & Time: ${meetingTime}
Duration: ${formData.duration}
Topic: ${formData.topic}

Description:
${formData.description}

This meeting request was submitted through the portfolio website scheduling form.
        `.trim(),
        reply_to: formData.email
      }

      await sendEmail(emailData)
      setIsSubmitted(true)
      onSuccess?.()
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      onError?.('Failed to schedule meeting. Please try again or contact directly via email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Meeting Request Submitted!
            </h3>
            <p className="text-gray-600 mb-4">
              Thank you for your meeting request. I'll review your details and get back to you within 24 hours to confirm the meeting.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
            >
              Schedule Another Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-teal-600" />
          Schedule a Meeting
        </CardTitle>
        <CardDescription>
          Select your preferred date and time, and I'll get back to you to confirm the meeting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
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

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Company (Optional)
            </label>
            <Input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Your company or organization"
            />
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time *
              </label>
              <select
                id="time"
                name="time"
                required
                value={formData.time}
                onChange={handleSelectChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select a time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Duration
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-teal-500"
            >
              {durationOptions.map((duration) => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Topic *
            </label>
            <Input
              id="topic"
              name="topic"
              type="text"
              required
              value={formData.topic}
              onChange={handleInputChange}
              placeholder="Brief description of what you'd like to discuss"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Any additional context or specific questions you'd like to address..."
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Request Meeting
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            I'll review your request and get back to you within 24 hours to confirm the meeting details.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
