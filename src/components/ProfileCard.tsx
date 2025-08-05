import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProfileCardProps {
  name: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
  badges: Array<{
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
    className?: string
  }>
}

export function ProfileCard({
  name,
  title,
  description,
  imageUrl,
  imageAlt,
  badges
}: ProfileCardProps) {
  return (
    <div className="not-prose mb-12">
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <div className="flex-shrink-0 flex justify-center sm:justify-start">
              <div className="w-50 h-60 rounded-full border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {name}
                </h2>
                <hr className="border-gray-300 dark:border-gray-600 mb-3" />
                <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
                  {title}
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {description}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {badges.map((badge, index) => (
                  <Badge 
                    key={index}
                    variant={badge.variant || "secondary"}
                    className={badge.className}
                  >
                    {badge.text}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}