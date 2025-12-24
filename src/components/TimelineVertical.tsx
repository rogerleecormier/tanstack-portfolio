/**
 * TimelineVertical Component
 *
 * Single unified vertical timeline:
 * - Left side: Education & Certifications cards
 * - Center: Timeline spine with icons
 * - Right side: Career & Military cards
 */

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  categoryColors,
  formatDateRange,
  getFullTimeline,
  type TimelineEntry,
} from '@/data/timeline';
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
      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${colors.bg} ${colors.border} border-2 shadow-md`}
    >
      <IconComponent className={`size-5 ${colors.text}`} />
    </div>
  );
}

function TimelineCard({ entry }: { entry: TimelineEntry }) {
  const colors = categoryColors[entry.category];
  const dateRange = formatDateRange(entry.startDate, entry.endDate);

  return (
    <Card className='group border border-border-subtle bg-surface-elevated transition-all duration-300 hover:border-strategy-gold/50 hover:shadow-lg'>
      <CardHeader className='pb-3'>
        {/* Date Range Badge */}
        <div className='mb-2 flex flex-wrap items-center gap-2'>
          <span className='rounded-md bg-surface-base px-2 py-1 text-sm font-semibold text-strategy-gold'>
            {dateRange}
          </span>
          <Badge className={`${colors.bg} ${colors.text} ${colors.border} border text-xs`}>
            {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
          </Badge>
        </div>

        <CardTitle className='text-lg text-text-foreground transition-colors group-hover:text-strategy-gold'>
          {entry.title}
        </CardTitle>
        <CardDescription className='flex flex-wrap items-center gap-2 text-sm'>
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
        <p className='mb-3 text-sm leading-relaxed text-text-secondary'>
          {entry.description}
        </p>

        {entry.highlights && entry.highlights.length > 0 && (
          <ul className='mb-3 space-y-1'>
            {entry.highlights.map((highlight, idx) => (
              <li
                key={idx}
                className='flex items-start gap-2 text-xs text-text-secondary'
              >
                <span className='mt-1.5 size-1 shrink-0 rounded-full bg-strategy-gold' />
                {highlight}
              </li>
            ))}
          </ul>
        )}

        {entry.badges && entry.badges.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {entry.badges.map((badge) => (
              <Badge
                key={badge}
                className='border-strategy-gold/20 bg-strategy-gold/10 text-xs text-strategy-gold'
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
  const allEntries = getFullTimeline();

  return (
    <div className='relative'>
      {/* Center Timeline Spine */}
      <div className='absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-strategy-gold via-strategy-gold/50 to-transparent' />

      {/* Timeline Entries */}
      <div className='space-y-8'>
        {allEntries.map((entry) => {
          const isLeft = entry.side === 'left';

          return (
            <div
              key={entry.id}
              className='relative grid grid-cols-[1fr_auto_1fr] items-start gap-4'
            >
              {/* Left Side - Education/Certifications */}
              <div className={`flex justify-end ${isLeft ? '' : 'invisible'}`}>
                {isLeft && <TimelineCard entry={entry} />}
              </div>

              {/* Center Icon */}
              <div className='relative z-10 flex items-start justify-center pt-2'>
                <TimelineIcon entry={entry} />
              </div>

              {/* Right Side - Career/Military */}
              <div className={`flex justify-start ${isLeft ? 'invisible' : ''}`}>
                {!isLeft && <TimelineCard entry={entry} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* End marker */}
      <div className='relative mt-8 flex justify-center'>
        <div className='size-4 rounded-full border-2 border-strategy-gold/50 bg-surface-base'>
          <div className='m-0.5 size-2 rounded-full bg-strategy-gold/50' />
        </div>
      </div>
    </div>
  );
}
