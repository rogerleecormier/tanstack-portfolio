import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface ProfileCardProps {
  name: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
  badges: Array<{
    text: string
    className: string
  }>
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  title,
  description,
  imageUrl,
  imageAlt,
  badges
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-24 h-24 rounded-full object-cover border-3 border-teal-200 shadow-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {name}
            </h2>
            <p className="text-lg text-teal-600 dark:text-teal-400 font-medium mb-3">
              {title}
            </p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge key={index} variant="outline" className={badge.className}>
                  {badge.text}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
