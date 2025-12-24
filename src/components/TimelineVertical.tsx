/**
 * TimelineVertical Component
 *
 * Two-column vertical timeline:
 * - Left column: Education & Certifications
 * - Right column: Career & Military positions
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
  getCareerTimeline,
  getEducationTimeline,
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

function TimelineIcon({ entry, size = 'normal' }: { entry: TimelineEntry; size?: 'small' | 'normal' }) {
  const IconComponent = iconMap[entry.icon] || Briefcase;
  const colors = categoryColors[entry.category];
  const sizeClasses = size === 'small' ? 'size-10' : 'size-12';
  const iconSize = size === 'small' ? 'size-5' : 'size-6';

  return (
    <div
      className={`flex ${sizeClasses} shrink-0 items-center justify-center rounded-full ${colors.bg} ${colors.border} border-2 shadow-md`}
    >
      <IconComponent className={`${iconSize} ${colors.text}`} />
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

function TimelineColumn({
  title,
  subtitle,
  entries,
  align,
}: {
  title: string;
  subtitle: string;
  entries: TimelineEntry[];
  align: 'left' | 'right';
}) {
  return (
    <div className='flex flex-col'>
      {/* Column Header */}
      <div className={`mb-6 ${align === 'right' ? 'text-left' : 'text-left'}`}>
        <h3 className='text-xl font-bold text-text-foreground'>{title}</h3>
        <p className='text-sm text-text-secondary'>{subtitle}</p>
      </div>

      {/* Timeline Track */}
      <div className='relative flex-1'>
        {/* Vertical Line */}
        <div
          className={`absolute top-0 h-full w-0.5 bg-gradient-to-b from-strategy-gold via-strategy-gold/50 to-transparent ${
            align === 'left' ? 'left-5' : 'left-5'
          }`}
        />

        {/* Entries */}
        <div className='space-y-6'>
          {entries.map((entry) => (
            <div key={entry.id} className='relative flex items-start gap-4'>
              {/* Icon on the line */}
              <div className='relative z-10'>
                <TimelineIcon entry={entry} size='small' />
              </div>

              {/* Card */}
              <div className='flex-1 pb-2'>
                <TimelineCard entry={entry} />
              </div>
            </div>
          ))}
        </div>

        {/* End marker */}
        <div className='relative mt-6 flex'>
          <div className='ml-3 size-4 rounded-full border-2 border-strategy-gold/50 bg-surface-base'>
            <div className='m-0.5 size-2 rounded-full bg-strategy-gold/50' />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimelineVertical() {
  const educationEntries = getEducationTimeline();
  const careerEntries = getCareerTimeline();

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12'>
      {/* Left Column: Education & Certifications */}
      <TimelineColumn
        title='Education & Certifications'
        subtitle='Academic achievements and professional credentials'
        entries={educationEntries}
        align='left'
      />

      {/* Right Column: Career & Military */}
      <TimelineColumn
        title='Career & Military Service'
        subtitle='Professional positions and military assignments'
        entries={careerEntries}
        align='right'
      />
    </div>
  );
}
