export interface Experience {
  role: string;
  company: string;
  period: string;
  points: string[];
}

export interface Education {
  degree: string;
  school: string;
  year: string;
  details?: string;
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: string[];
}

export const resumeData: ResumeData = {
  name: 'Roger Lee Cormier',
  title: 'PMP Technical Project Manager & SaaS Integration Leader',
  email: 'rogerleecormier@gmail.com',
  phone: '(585) 808-6213',
  location: 'Davenport, Florida',
  summary:
    'PMP-certified Technical Project Manager with 15+ years experience spanning SaaS platform integrations (NetSuite, Vena, Ramp AP), cloud transformation (Azure, Cloudflare), secure communications, and U.S. Army network operations command.',
  skills: [
    'SaaS Integration & Governance',
    'API Architecture & Python Scripting',
    'PMO Setup & RACI Design',
    'NetSuite ERP Administration',
    'Cloud Solutions (Azure, Cloudflare)',
    'Logistics & Property Management',
    'AI Prompt Engineering & Workflows',
    'Network Engineering & WIN-T',
  ],
  experience: [
    {
      role: 'Technical Project Manager',
      company: 'Vertex Education (Remote)',
      period: 'October 2022 – Present',
      points: [
        'Led custom Python/API SaaS integrations connecting NetSuite ERP, Vena, Ramp AP, Checkbook.io, and Box/SharePoint (25TB migration).',
        'Established technical PMO standards, intake governance, risk matrices, and status dashboards using Asana and Smartsheet.',
        'Designed date-triggered automated weekly status update summaries using generative AI integrations, saving 40% admin time.',
        'Collaborated on outsource data analytics services including enrollment forecasting and operational dashboards for 150+ entities.',
      ],
    },
    {
      role: 'Technical Project Manager',
      company: 'Ravyx (formerly STCR)',
      period: 'February 2016 – March 2023',
      points: [
        'Managed enterprise point-of-sale (POS) systems across 150+ retail locations supporting Toshiba TCxSky and Verifone systems.',
        'Coded custom script automations (30+ scripts in Python, VBScript, Batch) increasing deployment speeds by 300%.',
        'Provisioned, debugged, and maintained 50+ VMware virtual staging and QA sandbox environments.',
      ],
    },
    {
      role: 'Telecommunications Systems Manager / Supply Sergeant',
      company: 'U.S. Army (Fort Drum)',
      period: 'July 2008 – December 2015',
      points: [
        'Supervised 24/7 Network Operations Center (NOC) functions, managing deployable SATCOM, LAN/WAN, and RF LOS terminals.',
        'Managed Property accountability for $35M+ signal signal systems, utilizing GCSS-Army ERP and SAMS-E inventory systems.',
        'Standardized Command Supply Discipline Program (CSDP) SOPs ensuring 100% regulatory compliance and successful audits.',
      ],
    },
  ],
  education: [
    {
      degree:
        'M.S., Organizational Leadership (Emphasis: Technology and Data Analytics)',
      school: 'Excelsior University, Albany, NY',
      year: 'Expected July 2026',
      details: 'Honors: SALUTE National Honor Society (Pending)',
    },
    {
      degree: 'B.S., Information Technology',
      school: 'Excelsior University, Albany, NY',
      year: 'July 2024',
    },
  ],
  certifications: [
    'Project Management Professional (PMP) — PMI (August 2025)',
    'CompTIA Network+ — CompTIA (May 2009)',
  ],
};
