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
    endDate: 'Present',
    title: 'Master of Science, Organizational Leadership',
    organization: 'Excelsior University',
    location: 'Albany, NY',
    description: 'Technology & Data Analytics emphasis. Advancing strategic leadership capabilities for enterprise digital transformation with focus on technology management and innovation.',
    category: 'education',
    side: 'left',
    icon: 'GraduationCap',
    badges: ['In Progress', 'SALUTE Honor Society'],
  },

  // BS Information Technology
  {
    id: 'bs-it',
    startDate: 'Jan 2012',
    endDate: 'Jun 2024',
    title: 'Bachelor of Science, Information Technology',
    organization: 'Excelsior University',
    location: 'Albany, NY',
    description: 'Comprehensive IT education completed while serving in military and civilian technical roles. Foundation in network systems, security, and enterprise technology.',
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
    location: 'Albany, NY',
    description: 'Computer Technologies concentration. Built foundation in network operations, systems administration, and IT infrastructure.',
    category: 'education',
    side: 'left',
    icon: 'GraduationCap',
    badges: ['A.A.S.'],
  },

  // AIT
  {
    id: 'army-ait',
    startDate: 'Sep 2008',
    endDate: 'Jan 2009',
    title: 'Advanced Individual Training (AIT)',
    organization: 'U.S. Army Signal School',
    location: 'Fort Gordon, GA',
    description: '25Q Multichannel Transmission Systems Operator-Maintainer MOS training. Specialized in tactical satellite terminals, HCLOS, tactical radios, and network systems.',
    category: 'military',
    side: 'left',
    icon: 'Shield',
    badges: ['Signal Corps', '25Q MOS'],
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
    side: 'left',
    icon: 'Shield',
    badges: ['BCT Graduate'],
  },

  // ==================== CERTIFICATIONS (LEFT SIDE) ====================

  // PMP
  {
    id: 'network-plus-certification',
    startDate: 'May 2009',
    title: 'Network+ Certification',
    organization: 'CompTIA',
    description: 'Industry-recognized certification validating expertise in network operations and security.',
    category: 'certification',
    side: 'left',
    icon: 'Award',
    badges: ['CompTIA'],
  },
  
  {
    id: 'pmp-certification',
    startDate: 'Jul 2025',
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
    description: 'Shape enterprise technology roadmap for multi-entity K-12 education network. Lead SaaS platform delivery, API integration architecture, and AI-augmented PMO practices across 150+ subsidiary organizations.',
    category: 'career',
    side: 'right',
    icon: 'Briefcase',
    badges: ['Current', 'Remote'],
    highlights: [
      'Led Ramp-NetSuite AP modernization reducing month-end close by 35%',
      'Directed 25TB Box to SharePoint migration for 300+ users',
      'Automated workflows reclaiming 100+ manual hours monthly',
    ],
  },

  // Ravyx US
  {
    id: 'ravyx-us',
    startDate: 'Jan 2016',
    endDate: 'May 2023',
    title: 'Technical Project Manager / Integrations Specialist',
    organization: 'Ravyx (formerly STCR)',
    location: 'Endwell, NY',
    description: 'Directed enterprise POS and payment system architecture across 150+ retail locations. Managed Toshiba TCxSky/4690 platforms, Verifone/Ingenico terminals, and PCI-compliant payment integrations.',
    category: 'career',
    side: 'right',
    icon: 'Server',
    badges: ['POS Systems', 'Payments'],
    highlights: [
      'Built 30+ automation scripts accelerating deployments 300%',
      'Managed 50+ VMware test environments for QA validation',
      'Drove 45% increase in self-checkout adoption through UX tuning',
    ],
  },

  // ==================== MILITARY (RIGHT SIDE) ====================

  // Fort Drum
  {
    id: 'army-fort-drum',
    startDate: 'Jan 2012',
    endDate: 'Dec 2015',
    title: 'Telecommunications Systems Manager / Logistics Manager',
    organization: 'U.S. Army',
    location: 'Fort Drum, NY',
    description: 'Led 24/7 NOC operations as NCOIC. Governed $35M+ in telecommunications and IT assets as unit Supply Sergeant, executing full lifecycle asset planning and logistics coordination.',
    category: 'military',
    side: 'right',
    icon: 'Shield',
    badges: ['Signal Corps', 'E-5 NCO'],
    highlights: [
      'Army Commendation Medal & Army Achievement Medal',
      'Implemented asset tracking system improving visibility by 50%',
      'Trained 800+ personnel on deployment readiness procedures',
    ],
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
    description: 'Deployed to Operation New Dawn. Engineered and maintained mission-critical SATCOM, WAN, and RF LOS networks ensuring 100% uptime in combat conditions. Supervised 24/7 NOC operations.',
    category: 'military',
    side: 'right',
    icon: 'Shield',
    badges: ['Operation New Dawn', 'Combat Zone'],
    highlights: [
      'Joint Service Commendation Medal',
      'Joint Meritorious Unit Award',
      '100% mission uptime for tactical communications',
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
    description: 'Operated and maintained tactical communications systems including STT satellite terminals, HCLOS, Harris radios, and Promina multiplexers. Prepared for overseas deployment.',
    category: 'military',
    side: 'right',
    icon: 'Shield',
    badges: ['Signal Corps', '18th Airborne Corps'],
    highlights: [
      'Good Conduct Medal',
      'Configured WIN-T infrastructure for encrypted tactical comms',
    ],
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
