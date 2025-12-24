/**
 * TimelineCompact Component
 *
 * Compressed horizontal timeline for the About page
 * Shows key career milestones with a "View Full Timeline" CTA
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  categoryColors,
  formatDateRange,
  getCompactTimeline,
  type TimelineEntry,
} from '@/data/timeline';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowRight,
  Award,
  Briefcase,
  GraduationCap,
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
      className={`flex size-12 shrink-0 items-center justify-center rounded-full ${colors.bg} ${colors.border} border`}
    >
      <IconComponent className={`size-6 ${colors.text}`} />
    </div>
  );
}

// Format compact date for display (e.g., "2022 - Now" or "2016 - 23")
function formatCompactDate(startDate: string, endDate?: string): string {
  // Extract year from startDate
  const startParts = startDate.split(' ');
  const startYear = startParts.length > 1 ? startParts[1] : startDate;
  
  if (!endDate) return startYear ?? startDate;
  if (endDate === 'Present') return `${startYear} - Now`;
  
  // Extract year from endDate and shorten
  const endParts = endDate.split(' ');
  const endYear = endParts.length > 1 ? endParts[1] : endDate;
  const shortEnd = endYear?.slice(-2) ?? endDate.slice(-2);
  
  return `${startYear} - ${shortEnd}`;
}

export function TimelineCompact() {
  const navigate = useNavigate();
  const timeline = getCompactTimeline();

  const handleViewFullTimeline = () => {
    void navigate({ to: '/timeline' });
  };

  return (
    <section className='py-16'>
      <div className='mb-8'>
        <h2 className='mb-2 text-3xl font-bold text-text-foreground md:text-4xl'>
          Career Journey
        </h2>
        <div className='my-4 h-1 w-16 rounded-full bg-gradient-to-r from-strategy-gold to-transparent' />
        <p className='max-w-2xl text-lg text-text-secondary'>
          15+ years of progressive technical leadership across military, enterprise, and strategic roles
        </p>
      </div>

      {/* Timeline Track */}
      <div className='relative'>
        {/* Mobile: Vertical Stack */}
        <div className='space-y-4 md:hidden'>
          {timeline.map((entry) => (
            <div
              key={entry.id}
              className='flex items-start gap-4 rounded-lg border border-border-subtle bg-surface-elevated p-4'
            >
              <TimelineIcon entry={entry} />
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-strategy-gold'>
                  {formatDateRange(entry.startDate, entry.endDate)}
                </p>
                <h3 className='truncate font-semibold text-text-foreground'>
                  {entry.title}
                </h3>
                <p className='text-sm text-text-secondary'>{entry.organization}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className='hidden md:block'>
          {/* Connector Line */}
          <div className='absolute left-0 right-0 top-6 h-0.5 bg-gradient-to-r from-strategy-gold via-strategy-gold/50 to-transparent' />

          <div className='grid grid-cols-5 gap-4'>
            {timeline.map((entry) => (
              <div key={entry.id} className='group relative pt-14'>
                {/* Connector Dot */}
                <div
                  className={`absolute left-1/2 top-4 size-4 -translate-x-1/2 rounded-full border-2 border-strategy-gold bg-surface-base transition-all group-hover:scale-125 group-hover:bg-strategy-gold`}
                />

                {/* Card */}
                <div className='rounded-lg border border-border-subtle bg-surface-elevated p-4 transition-all duration-300 hover:border-strategy-gold/50 hover:shadow-lg'>
                  <div className='mb-3 flex justify-center'>
                    <TimelineIcon entry={entry} />
                  </div>
                  <p className='mb-1 text-center text-sm font-semibold text-strategy-gold'>
                    {formatCompactDate(entry.startDate, entry.endDate)}
                  </p>
                  <h3 className='mb-1 text-center text-sm font-semibold leading-tight text-text-foreground'>
                    {entry.title.split(',')[0]}
                  </h3>
                  <p className='text-center text-xs text-text-secondary'>
                    {entry.organization}
                  </p>
                  {entry.badges && entry.badges.length > 0 && (
                    <div className='mt-3 flex flex-wrap justify-center gap-1'>
                      {entry.badges.slice(0, 2).map((badge) => (
                        <Badge
                          key={badge}
                          className='border-strategy-gold/20 bg-strategy-gold/10 text-xs text-strategy-gold'
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className='mt-8 text-center'>
        <Button
          onClick={handleViewFullTimeline}
          className='border border-strategy-gold/50 bg-strategy-gold/15 px-8 py-3 text-lg font-semibold text-strategy-gold transition-all duration-300 hover:border-strategy-gold hover:bg-strategy-gold/25'
        >
          View Full Timeline
          <ArrowRight className='ml-2 size-5' />
        </Button>
      </div>
    </section>
  );
}
