import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, CheckCircle, Calendar, MessageSquare, AlertCircle } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { cn } from '@/lib/utils'
import type { AIAnalysisResult } from '@/api/aiContactAnalyzer'

interface AIMeetingSchedulerProps {
  analysis: AIAnalysisResult
  onMeetingScheduled: (meetingData: MeetingData) => void
  onSendMessageInstead?: () => void
  className?: string
}

// Use the same interface as ContactPage to avoid conflicts
interface MeetingData {
  date: Date
  time: string
  duration: string
  type: string
  timezone: string
  analysis: AIAnalysisResult
}

export function AIMeetingScheduler({ analysis, onMeetingScheduled, onSendMessageInstead, className }: AIMeetingSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [userTimezone, setUserTimezone] = useState<string>('')
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduled, setScheduled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get user's timezone and recommend available slots
  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setUserTimezone(timezone)
      
      // Set default date to next business day
      const tomorrow = addDays(new Date(), 1)
      setSelectedDate(tomorrow)
      
      // Set default time based on AI recommendations
      if (analysis.recommendedTimeSlots.includes('morning')) {
        setSelectedTime('09:00')
      } else if (analysis.recommendedTimeSlots.includes('afternoon')) {
        setSelectedTime('14:00')
      } else {
        setSelectedTime('16:00')
      }
    } catch {
      setError('Failed to initialize scheduler')
    }
  }, [analysis])

  // Generate available time slots based on AI recommendations
  const generateTimeSlots = () => {
    try {
      const slots = []
      
      if (analysis.recommendedTimeSlots.includes('morning')) {
        slots.push('09:00', '09:30', '10:00', '10:30', '11:00', '11:30')
      }
      if (analysis.recommendedTimeSlots.includes('afternoon')) {
        slots.push('13:00', '13:30', '14:00', '14:30', '15:00', '15:30')
      }
      if (analysis.recommendedTimeSlots.includes('evening')) {
        slots.push('16:00', '16:30', '17:00', '17:30')
      }
      
      // Ensure we always have at least some slots
      if (slots.length === 0) {
        slots.push('09:00', '14:00', '16:00')
      }
      
      return slots
    } catch {
      return ['09:00', '14:00', '16:00'] // Fallback slots
    }
  }

  const handleScheduleMeeting = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time')
      return
    }
    
    setIsScheduling(true)
    setError(null)
    
    try {
      const meetingData: MeetingData = {
        date: selectedDate,
        time: selectedTime,
        duration: analysis.meetingDuration,
        type: analysis.meetingType,
        timezone: userTimezone,
        analysis
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onMeetingScheduled(meetingData)
      setScheduled(true)
      
    } catch {
      setError('Failed to schedule meeting. Please try again.')
    } finally {
      setIsScheduling(false)
    }
  }

  // Validate business hours (basic validation) - can be used for future enhancements
  // const isValidTime = (time: string) => {
  //   const hour = parseInt(time.split(':')[0])
  //   return hour >= 9 && hour <= 17 // 9 AM to 5 PM
  // }

  if (scheduled) {
    return (
      <Card className={`border-l-4 border-l-green-500 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Meeting Scheduled Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              You'll receive a confirmation email with meeting details shortly.
            </p>
            <Badge variant="outline" className="text-sm">
              {format(selectedDate!, 'EEEE, MMMM do, yyyy')} at {selectedTime}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error && !selectedDate && !selectedTime) {
    return (
      <Card className={`border-l-4 border-l-teal-500 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <AlertCircle className="h-16 w-16 text-teal-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-teal-900 mb-2">
              Scheduler Error
            </h3>
            <p className="text-teal-600 mb-4">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-l-4 border-l-teal-500 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
            📅
          </div>
          AI-Recommended Meeting
          <Badge variant="outline" className="text-xs">
            {analysis.meetingType.replace('-', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Meeting Recommendation */}
        <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
          <p className="text-sm text-teal-800">
            <strong>AI Recommendation:</strong> Based on your inquiry, I recommend scheduling a{' '}
            <strong>{analysis.meetingDuration}</strong> {analysis.meetingType.replace('-', ' ')} meeting.
          </p>
        </div>

        {/* Meeting Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined
                setSelectedDate(date)
              }}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {generateTimeSlots().map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Meeting Summary */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">{analysis.meetingDuration}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-medium capitalize">
                {analysis.meetingType.replace('-', ' ')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Priority:</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "ml-2 text-xs",
                  analysis.priorityLevel === 'high' && "border-red-200 text-red-700",
                  analysis.priorityLevel === 'medium' && "border-yellow-200 text-yellow-700",
                  analysis.priorityLevel === 'low' && "border-green-200 text-green-700"
                )}
              >
                {analysis.priorityLevel}
              </Badge>
            </div>
            <div>
              <span className="text-gray-600">Scope:</span>
              <span className="ml-2 font-medium capitalize">{analysis.projectScope}</span>
            </div>
          </div>
        </div>

        {/* Timezone Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>Your timezone: {userTimezone}</span>
        </div>

        {/* Instructions */}
        <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-200">
          <p className="text-sm text-teal-800 mb-2">
            <strong>Use the meeting scheduler above</strong> to select your preferred date and time, then click the "Schedule Meeting" button in the scheduler.
          </p>
        </div>

        {/* Schedule Button */}
        <Button
          onClick={handleScheduleMeeting}
          disabled={!selectedDate || !selectedTime || isScheduling}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
        >
          {isScheduling ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Scheduling Meeting...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </>
          )}
        </Button>

        {/* Send Message Instead Link */}
        <div className="text-center">
          <button
            onClick={onSendMessageInstead || (() => window.location.href = '#contact-form')}
            className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Or just send a message instead</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}