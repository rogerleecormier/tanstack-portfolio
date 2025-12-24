/**
 * Career Timeline Data
 *
 * Chronologically ordered career milestones for Roger Lee Cormier
 * Used by TimelineCompact (About page) and TimelineVertical (Timeline page)
 */

export type TimelineCategory = 'military' | 'education' | 'certification' | 'career';

export interface TimelineEntry {
  id: string;
  year: string;
  endYear?: string;
  title: string;
  organization: string;
  location?: string;
  description: string;
  category: TimelineCategory;
  icon: string;
  badges?: string[];
  highlights?: string[];
}

export const timelineData: TimelineEntry[] = [
  // Education - MS Org Leadership (Current)
  {
    id: 'ms-leadership',
    year: '2024',
    endYear: '2026',
    title: 'Master of Science, Organizational Leadership',
    organization: 'Excelsior University',
    description:
      'Technology & Data Analytics concentration. Advancing strategic leadership capabilities for enterprise digital transformation.',
    category: 'education',
    icon: 'GraduationCap',
    badges: ['In Progress', 'GPA: 3.8'],
  },

  // Career - Vertex Education
  {
    id: 'vertex-education',
    year: '2022',
    endYear: 'Present',
    title: 'Technical Project Manager',
    organization: 'Vertex Education',
    location: 'Remote',
    description:
      'Leading enterprise technology integration strategy, M&A technical alignment, and AI-augmented workflow implementation.',
    category: 'career',
    icon: 'Briefcase',
    badges: ['Current', 'Enterprise', 'AI/Automation'],
    highlights: [
      'Spearheaded NetSuite + Ramp integration, cutting AP effort by 70%',
      'Implemented AI workflows reducing admin overhead by 40%',
      'Directing Box to SharePoint migration for 300+ users',
    ],
  },

  // Certification - PMP
  {
    id: 'pmp-certification',
    year: '2024',
    title: 'Project Management Professional (PMP)',
    organization: 'Project Management Institute',
    description:
      'Industry-recognized certification validating expertise in project management, strategic planning, and team leadership.',
    category: 'certification',
    icon: 'Award',
    badges: ['PMP®'],
  },

  // Career - Ravyx US
  {
    id: 'ravyx-us',
    year: '2016',
    endYear: '2023',
    title: 'Technical Project Manager / Integrations Specialist',
    organization: 'Ravyx US',
    location: 'Endwell, NY',
    description:
      'Directed enterprise POS and payment system architecture for 150+ retail locations. Built DevOps automation frameworks.',
    category: 'career',
    icon: 'Server',
    badges: ['POS Systems', 'DevOps', 'Retail'],
    highlights: [
      'Managed Toshiba, Verifone, Ingenico platform lifecycle',
      'Developed 30+ automation scripts accelerating deployments 300%',
      'Established 50+ virtualized QA/test environments',
    ],
  },

  // Education - BS Information Technology
  {
    id: 'bs-it',
    year: '2012',
    endYear: '2024',
    title: 'Bachelor of Science, Information Technology',
    organization: 'Excelsior College',
    description:
      'Comprehensive IT education completed while serving in military and civilian technical roles.',
    category: 'education',
    icon: 'GraduationCap',
    badges: ['B.S.'],
  },

  // Career - U.S. Army
  {
    id: 'us-army',
    year: '2008',
    endYear: '2015',
    title: 'Telecommunications Systems Manager / Logistics Manager',
    organization: 'U.S. Army',
    location: 'Fort Drum, NY',
    description:
      'Led technical teams engineering secure global communications networks. Commanded 24/7 NOC operations. Deployed to Operation New Dawn.',
    category: 'military',
    icon: 'Shield',
    badges: ['Operation New Dawn', 'Signal Corps', 'NOC'],
    highlights: [
      'Ensured 100% mission uptime for SATCOM, WAN, RF networks',
      'Governed $35M+ in telecommunications equipment',
      'Earned Joint Service Commendation Medal',
    ],
  },

  // Education - AAS Technical Studies
  {
    id: 'aas-tech',
    year: '2009',
    endYear: '2011',
    title: 'Associate of Applied Science, Technical Studies',
    organization: 'Excelsior College',
    description:
      'Computer Technologies concentration. Built foundation in network operations and systems administration.',
    category: 'education',
    icon: 'GraduationCap',
    badges: ['A.A.S.'],
  },
];

// Get entries for compact timeline (key milestones only)
export const getCompactTimeline = (): TimelineEntry[] => {
  const keyIds = ['ms-leadership', 'vertex-education', 'pmp-certification', 'ravyx-us', 'us-army'];
  return timelineData.filter(entry => keyIds.includes(entry.id));
};

// Get all entries sorted by year descending
export const getFullTimeline = (): TimelineEntry[] => {
  return [...timelineData].sort((a, b) => {
    const yearA = parseInt(a.year);
    const yearB = parseInt(b.year);
    return yearB - yearA;
  });
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
