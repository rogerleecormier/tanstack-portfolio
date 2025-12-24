/**
 * Career Timeline Data
 *
 * Chronologically ordered career milestones for Roger Lee Cormier
 * Used by TimelineCompact (About page) and TimelineVertical (Timeline page)
 */

export type TimelineCategory = 'military' | 'education' | 'certification' | 'career';
export type TimelineSide = 'left' | 'right';

export interface TimelineEntry {
  id: string;
  startDate: string;       // "Jul 2008" or "2024"
  endDate?: string;        // "Dec 2015" or "Present"
  title: string;
  organization: string;
  location?: string;
  description: string;
  category: TimelineCategory;
  side: TimelineSide;      // left = education, right = career/military
  icon: string;
  badges?: string[];
  highlights?: string[];
}

export const timelineData: TimelineEntry[] = [
  // ==================== EDUCATION (LEFT SIDE) ====================
  
  // MS Org Leadership (Current)
  {
    id: 'ms-leadership',
    startDate: 'Jul 2024',
    endDate: 'Jun 2026',
    title: 'Master of Science, Organizational Leadership',
    organization: 'Excelsior University',
    description: 'Technology & Data Analytics concentration. Advancing strategic leadership capabilities for enterprise digital transformation.',
    category: 'education',
    side: 'left',
    icon: 'GraduationCap',
    badges: ['In Progress', 'GPA: 3.8'],
  },

  // BS Information Technology
  {
    id: 'bs-it',
    startDate: 'Jan 2012',
    endDate: 'Jun 2024',
    title: 'Bachelor of Science, Information Technology',
    organization: 'Excelsior College',
    description: 'Comprehensive IT education completed while serving in military and civilian technical roles.',
    category: 'education',
    side: 'left',
    icon: 'GraduationCap',
    badges: ['B.S.'],
  },

  // AAS Technical Studies
  {
    id: 'aas-tech',
    startDate: 'Jan 2009',
    endDate: 'Jan 2011',
    title: 'Associate of Applied Science, Technical Studies',
    organization: 'Excelsior College',
    description: 'Computer Technologies concentration. Built foundation in network operations and systems administration.',
    category: 'education',
    side: 'left',
    icon: 'GraduationCap',
    badges: ['A.A.S.'],
  },

  // ==================== CERTIFICATIONS (LEFT SIDE) ====================

  // PMP
  {
    id: 'pmp-certification',
    startDate: '2024',
    title: 'Project Management Professional (PMP)',
    organization: 'Project Management Institute',
    description: 'Industry-recognized certification validating expertise in project management, strategic planning, and team leadership.',
    category: 'certification',
    side: 'left',
    icon: 'Award',
    badges: ['PMP®'],
  },

  // ==================== CAREER (RIGHT SIDE) ====================

  // Vertex Education
  {
    id: 'vertex-education',
    startDate: 'Oct 2022',
    endDate: 'Present',
    title: 'Technical Project Manager',
    organization: 'Vertex Education',
    location: 'Remote',
    description: 'Leading enterprise technology integration strategy, M&A technical alignment, and AI-augmented workflow implementation.',
    category: 'career',
    side: 'right',
    icon: 'Briefcase',
    badges: ['Current', 'Remote'],
    highlights: [
      'Spearheaded NetSuite + Ramp integration, cutting AP effort by 70%',
      'Implemented AI workflows reducing admin overhead by 40%',
      'Directing Box to SharePoint migration for 300+ users',
    ],
  },

  // Ravyx US
  {
    id: 'ravyx-us',
    startDate: 'Jan 2016',
    endDate: 'May 2023',
    title: 'Technical Project Manager / Integrations Specialist',
    organization: 'Ravyx US',
    location: 'Endwell, NY',
    description: 'Directed enterprise POS and payment system architecture for 150+ retail locations. Built DevOps automation frameworks.',
    category: 'career',
    side: 'right',
    icon: 'Server',
    badges: ['POS Systems', 'DevOps'],
    highlights: [
      'Managed Toshiba, Verifone, Ingenico platform lifecycle',
      'Developed 30+ automation scripts accelerating deployments 300%',
      'Established 50+ virtualized QA/test environments',
    ],
  },

  // ==================== MILITARY (RIGHT SIDE) ====================

  // Fort Drum
  {
    id: 'army-fort-drum',
    startDate: 'Jan 2012',
    endDate: 'Dec 2015',
    title: 'Telecommunications Systems Manager',
    organization: 'U.S. Army',
    location: 'Fort Drum, NY',
    description: 'Led technical teams engineering secure global communications networks. Commanded 24/7 NOC operations. Governed $35M+ in telecommunications equipment.',
    category: 'military',
    side: 'right',
    icon: 'Shield',
    badges: ['Signal Corps', 'NOC Command'],
  },

  // Fort Bragg (Post-Deployment)
  {
    id: 'army-bragg-post',
    startDate: 'Dec 2011',
    endDate: 'Jan 2012',
    title: 'Telecommunications Systems Manager',
    organization: 'U.S. Army',
    location: 'Fort Bragg, NC',
    description: 'Reintegration and transition support following Operation New Dawn deployment.',
    category: 'military',
    side: 'right',
    icon: 'Shield',
    badges: ['Signal Corps'],
  },

  // Iraq Deployment
  {
    id: 'army-iraq',
    startDate: 'Jan 2011',
    endDate: 'Dec 2011',
    title: 'Telecommunications Systems Manager',
    organization: 'U.S. Army',
    location: 'Camp Victory & Al Asad Air Base, Iraq',
    description: 'Deployed to Operation New Dawn (Iraq drawdown). Managed satellite & RF communications in high-stakes environments ensuring 100% mission uptime.',
    category: 'military',
    side: 'right',
    icon: 'Shield',
    badges: ['Operation New Dawn', 'Combat Zone'],
    highlights: [
      'Joint Service Commendation Medal',
      'Ensured 100% mission uptime for SATCOM, WAN, RF networks',
    ],
  },

  // Fort Bragg (Pre-Deployment)
  {
    id: 'army-bragg-pre',
    startDate: 'Jan 2009',
    endDate: 'Jan 2011',
    title: 'Telecommunications Systems Operator',
    organization: 'U.S. Army',
    location: 'Fort Bragg, NC',
    description: 'Operated and maintained tactical communications systems. Prepared for overseas deployment operations.',
    category: 'military',
    side: 'right',
    icon: 'Shield',
    badges: ['Signal Corps', '82nd Airborne'],
  },

  // AIT
  {
    id: 'army-ait',
    startDate: 'Sep 2008',
    endDate: 'Jan 2009',
    title: 'Advanced Individual Training (AIT)',
    organization: 'U.S. Army',
    location: 'Fort Gordon, GA',
    description: 'Signal Corps MOS training. Specialized in telecommunications systems operation and maintenance.',
    category: 'military',
    side: 'right',
    icon: 'Shield',
    badges: ['Signal Corps', 'MOS Training'],
  },

  // Basic Training
  {
    id: 'army-basic',
    startDate: 'Jul 2008',
    endDate: 'Sep 2008',
    title: 'Basic Combat Training (BCT)',
    organization: 'U.S. Army',
    location: 'Fort Jackson, SC',
    description: 'Completed U.S. Army Basic Combat Training. Foundation of military discipline, physical fitness, and combat readiness.',
    category: 'military',
    side: 'right',
    icon: 'Shield',
    badges: ['BCT Graduate'],
  },
];

// Get entries for compact timeline (key milestones only)
export const getCompactTimeline = (): TimelineEntry[] => {
  const keyIds = ['ms-leadership', 'vertex-education', 'pmp-certification', 'ravyx-us', 'army-iraq'];
  return timelineData.filter(entry => keyIds.includes(entry.id));
};

// Helper to parse date string to sortable number
const parseDate = (d: string): number => {
  if (d.includes(' ')) {
    const parts = d.split(' ');
    const month = parts[0] ?? '';
    const year = parts[1] ?? '2000';
    const monthNum = new Date(`${month} 1, 2000`).getMonth();
    return parseInt(year) * 12 + monthNum;
  }
  return parseInt(d) * 12;
};

// Get education entries (left side)
export const getEducationTimeline = (): TimelineEntry[] => {
  return timelineData
    .filter(entry => entry.side === 'left')
    .sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate));
};

// Get career/military entries (right side)
export const getCareerTimeline = (): TimelineEntry[] => {
  return timelineData
    .filter(entry => entry.side === 'right')
    .sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate));
};

// Get all entries sorted by date descending
export const getFullTimeline = (): TimelineEntry[] => {
  return [...timelineData].sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate));
};

// Category colors for styling
export const categoryColors: Record<TimelineCategory, { bg: string; text: string; border: string }> = {
  military: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
  },
  education: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  certification: {
    bg: 'bg-strategy-gold/10',
    text: 'text-strategy-gold',
    border: 'border-strategy-gold/30',
  },
  career: {
    bg: 'bg-strategy-gold/15',
    text: 'text-strategy-gold',
    border: 'border-strategy-gold/40',
  },
};

// Format date range for display
export const formatDateRange = (startDate: string, endDate?: string): string => {
  if (!endDate) return startDate;
  return `${startDate} – ${endDate}`;
};
