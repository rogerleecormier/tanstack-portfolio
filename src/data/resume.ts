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
        'Led custom Python/API SaaS integrations connecting NetSuite ERP, Vena, Ramp AP, and Checkbook.io, transitioning legacy workflows using 10+ TB of data to unified cloud platforms (Vertex Hub) and reducing AP close cycles by 35%.',
        'Established technical PMO standards, intake governance, risk matrices, and status dashboards using Asana and Smartsheet to coordinate U.S. and offshore development teams.',
        'Designed date-triggered automated weekly status update summaries using generative AI integrations, reclaiming 100+ manual hours monthly (40% admin overhead cut).',
        'Collaborated on outsource data analytics services including enrollment forecasting and operational dashboards for 150+ education organizations.',
      ],
    },
    {
      role: 'Technical Project Manager / Integrations Specialist',
      company: 'Ravyx (formerly STCR) — Endwell, NY',
      period: 'February 2016 – May 2023',
      points: [
        'Managed enterprise point-of-sale (POS) systems across 150+ retail locations supporting Toshiba TCxSky/4690 and Verifone/Ingenico terminals.',
        'Coded custom script automations (30+ scripts in Python, VBScript, Batch) accelerating deployment and QA validation speeds by 300%.',
        'Provisioned, debugged, and maintained 50+ VMware virtual staging and QA sandbox environments.',
        'Drove a 45% increase in self-checkout customer adoption through user experience (UX) tuning and layout optimization.',
      ],
    },
    {
      role: 'Telecommunications Systems Manager / Logistics Manager',
      company: 'U.S. Army (Fort Drum, NY)',
      period: 'January 2012 – December 2015',
      points: [
        'Supervised 24/7 Network Operations Center (NOC) functions as NCOIC, ensuring 100% mission uptime for tactical networks.',
        'Governed $35M+ in telecommunications and IT assets as Unit Supply Sergeant, implementing tracking systems that improved inventory visibility by 50%.',
        'Standardized Command Supply Discipline Program (CSDP) SOPs ensuring 100% regulatory compliance and successful audits.',
        'Awarded Army Commendation Medal & Army Achievement Medal for outstanding operational readiness; trained 800+ personnel on deployment readiness.',
      ],
    },
    {
      role: 'Telecommunications Systems Manager (Operation New Dawn)',
      company: 'U.S. Army (Camp Victory & Al Asad Air Base, Iraq)',
      period: 'January 2011 – December 2011',
      points: [
        'Engineered and maintained mission-critical SATCOM, WAN, and RF Line-of-Sight networks, securing 100% uptime in high-stakes combat conditions.',
        'Supervised 24/7 tactical NOC operations, coordinating complex multi-stakeholder comms and satellite re-transmissions for command staff.',
        'Awarded the Joint Service Commendation Medal and Joint Meritorious Unit Award for exceptional deployment communication support.',
      ],
    },
    {
      role: 'Telecommunications Systems Operator',
      company: 'U.S. Army (Fort Bragg, NC)',
      period: 'July 2008 – January 2011',
      points: [
        'Operated and maintained tactical communications equipment including STT satellite terminals, HCLOS, Harris radios, and Promina multiplexers.',
        'Configured WIN-T (Warfighter Information Network-Tactical) infrastructure for encrypted tactical communications.',
        'Completed Advanced Individual Training (AIT) at U.S. Army Signal School (25Q MOS Multichannel Operator) and basic combat training; awarded Good Conduct Medal.',
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
    {
      degree: 'A.A.S., Technical Studies (Computer Technologies Concentration)',
      school: 'Excelsior College, Albany, NY',
      year: 'January 2011',
    },
  ],
  certifications: [
    'Project Management Professional (PMP) — PMI (August 2025)',
    'CompTIA Network+ — CompTIA (May 2009)',
  ],
};
