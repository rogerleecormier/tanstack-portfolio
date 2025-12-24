/**
 * TimelineVertical Component
 *
 * Full vertical timeline with alternating left/right cards
 * Used on the dedicated Timeline page
 */

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { categoryColors, getFullTimeline, type TimelineEntry } from '@/data/timeline';
import {
  Award,
  Briefcase,
  GraduationCap,
  MapPin,
  Server,
  Shield,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Briefcase,
  Award,
  Server,
  Shield,
};

function TimelineIcon({ entry }: { entry: TimelineEntry }) {
  const IconComponent = iconMap[entry.icon] || Briefcase;
  const colors = categoryColors[entry.category];

  return (
    <div
      className={`flex size-14 shrink-0 items-center justify-center rounded-full ${colors.bg} ${colors.border} border-2 shadow-lg`}
    >
      <IconComponent className={`size-7 ${colors.text}`} />
    </div>
  );
}

function TimelineCard({
  entry,
  position,
}: {
  entry: TimelineEntry;
  position: 'left' | 'right';
}) {
  const colors = categoryColors[entry.category];

  return (
    <Card
      className={`group border border-border-subtle bg-surface-elevated transition-all duration-300 hover:border-strategy-gold/50 hover:shadow-xl ${
        position === 'left' ? 'md:mr-8' : 'md:ml-8'
      }`}
    >
      <CardHeader className='pb-3'>
        <div className='mb-2 flex flex-wrap items-center gap-2'>
          <Badge className={`${colors.bg} ${colors.text} ${colors.border} border`}>
            {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
          </Badge>
          <span className='text-sm font-semibold text-strategy-gold'>
            {entry.year}
            {entry.endYear && ` - ${entry.endYear}`}
          </span>
        </div>
        <CardTitle className='text-xl text-text-foreground transition-colors group-hover:text-strategy-gold'>
          {entry.title}
        </CardTitle>
        <CardDescription className='flex items-center gap-2 text-base'>
          <span className='font-medium'>{entry.organization}</span>
          {entry.location && (
            <>
              <span className='text-text-tertiary'>•</span>
              <span className='flex items-center gap-1 text-text-tertiary'>
                <MapPin className='size-3' />
                {entry.location}
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-0'>
        <p className='mb-4 leading-relaxed text-text-secondary'>
          {entry.description}
        </p>

        {entry.highlights && entry.highlights.length > 0 && (
          <ul className='mb-4 space-y-2'>
            {entry.highlights.map((highlight, idx) => (
              <li
                key={idx}
                className='flex items-start gap-2 text-sm text-text-secondary'
              >
                <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-strategy-gold' />
                {highlight}
              </li>
            ))}
          </ul>
        )}

        {entry.badges && entry.badges.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {entry.badges.map((badge) => (
              <Badge
                key={badge}
                className='border-strategy-gold/20 bg-strategy-gold/10 text-strategy-gold'
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TimelineVertical() {
  const timeline = getFullTimeline();

  return (
    <div className='relative'>
      {/* Center Line - Hidden on mobile */}
      <div className='absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-strategy-gold via-strategy-gold/50 to-transparent md:block' />

      {/* Mobile Line */}
      <div className='absolute left-7 top-0 h-full w-0.5 bg-gradient-to-b from-strategy-gold via-strategy-gold/50 to-transparent md:hidden' />

      <div className='space-y-8 md:space-y-12'>
        {timeline.map((entry, index) => {
          const position = index % 2 === 0 ? 'left' : 'right';

          return (
            <div
              key={entry.id}
              className='relative grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-8'
            >
              {/* Left Content (Desktop) */}
              <div
                className={`hidden md:block ${
                  position === 'left' ? '' : 'md:order-1'
                }`}
              >
                {position === 'left' && <TimelineCard entry={entry} position='left' />}
              </div>

              {/* Center Icon */}
              <div className='relative z-10 flex justify-start md:justify-center'>
                <div className='flex items-center gap-4 md:block'>
                  <TimelineIcon entry={entry} />
                  {/* Mobile Card */}
                  <div className='flex-1 md:hidden'>
                    <TimelineCard entry={entry} position='right' />
                  </div>
                </div>
              </div>

              {/* Right Content (Desktop) */}
              <div
                className={`hidden md:block ${
                  position === 'right' ? '' : 'md:order-first'
                }`}
              >
                {position === 'right' && (
                  <TimelineCard entry={entry} position='right' />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline End Marker */}
      <div className='relative mt-12 flex justify-center'>
        <div className='flex size-8 items-center justify-center rounded-full border-2 border-strategy-gold bg-surface-base'>
          <div className='size-3 rounded-full bg-strategy-gold' />
        </div>
      </div>
    </div>
  );
}
