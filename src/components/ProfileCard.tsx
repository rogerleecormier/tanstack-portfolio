import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import React from 'react';

interface ProfileCardProps {
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  badges: Array<{
    text: string;
    className: string;
  }>;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  title,
  description,
  imageUrl,
  imageAlt,
  badges,
}) => {
  return (
    <Card className='mx-auto max-w-4xl overflow-hidden'>
      <CardHeader className='pb-4'>
        <div className='flex items-start gap-6'>
          <div className='shrink-0'>
            <img
              src={imageUrl}
              alt={imageAlt}
              className='size-24 rounded-full border-[3px] border-border-subtle object-cover shadow-lg'
            />
          </div>
          <div className='min-w-0 flex-1'>
            <h2 className='mb-2 break-words text-2xl font-bold text-gray-900 dark:text-gray-100'>
              {name}
            </h2>
            <p className='mb-3 break-words text-lg font-medium text-strategy-gold dark:text-strategy-gold'>
              {title}
            </p>
            <div className='flex flex-wrap gap-2'>
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant='outline'
                  className={badge.className}
                >
                  {badge.text}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className='overflow-wrap-break-word whitespace-normal break-words text-base leading-relaxed text-gray-600 dark:text-gray-300'>
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
