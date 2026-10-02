import type { 
  UserAccount, 
  HelpRequest, 
  Project, 
  VolunteerOpportunity, 
  VolunteerApplication, 
  Donation, 
  FundUtilization, 
  AuditLog, 
  ComplaintReport, 
  NotificationItem 
} from '../types/models';

export const SEED_USERS: UserAccount[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'rajesh.mondal@example.com',
    role: 'BENEFICIARY',
    status: 'ACTIVE',
    createdAt: '2026-01-10T10:00:00Z',
    profile: {
      name: 'Rajesh Mondal',
      phone: '+91 98301 23456',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      bio: 'Daily wage artisan seeking specialized cardiac surgery support for younger brother.'
    }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'contact@preronamission.org',
    role: 'NGO',
    status: 'ACTIVE',
    createdAt: '2025-06-15T08:30:00Z',
    profile: {
      name: 'Dr. Ananya Sen',
      organizationName: 'Prerona Rural Relief Mission',
      designation: 'Executive Director',
      phone: '+91 33 2489 1100',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      bio: 'Dedicated to rapid rural healthcare, disaster response, and maternal care across eastern India.',
      ngoDetails: {
        ngoId: 'ngo_prerona_01',
        registrationNumber: 'WB/2012/0048291',
        foundedYear: 2012,
        mission: 'Bridging healthcare and nutritional disparity in remote Sundarbans and South Bengal delta villages.',
        causes: ['healthcare', 'food_nutrition', 'disaster_relief'],
        serviceAreas: ['Kolkata', 'Howrah', 'South 24 Parganas'],
        taxExemption80G: true,
        csr1Number: 'CSR00018492',
        verificationStatus: 'VERIFIED',
        totalBeneficiariesServed: 24500,
        activeProjectCount: 3
      }
    }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'director@vidyajyoti.org',
    role: 'NGO',
    status: 'ACTIVE',
    createdAt: '2025-08-20T11:00:00Z',
    profile: {
      name: 'Priya Sharma',
      organizationName: 'Vidya Jyoti Foundation',
      designation: 'Founder & Head of Ops',
      phone: '+91 22 2650 9988',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      bio: 'Empowering first-generation learners and girls with digital literacy and STEM infrastructure.',
      ngoDetails: {
        ngoId: 'ngo_vidya_02',
        registrationNumber: 'MH/2016/0091823',
        foundedYear: 2016,
        mission: 'Transforming public schooling through solar-powered smart classes and vocational computer labs.',
        causes: ['education', 'women_children'],
        serviceAreas: ['Mumbai', 'Pune', 'Thane'],
        taxExemption80G: true,
        csr1Number: 'CSR00024901',
        verificationStatus: 'VERIFIED',
        totalBeneficiariesServed: 18200,
        activeProjectCount: 2
      }
    }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    email: 'arjun.mehta@example.com',
    role: 'VOLUNTEER',
    status: 'ACTIVE',
    createdAt: '2026-02-01T14:15:00Z',
    profile: {
      name: 'Arjun Mehta',
      phone: '+91 98200 44556',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      bio: 'Software engineer & weekend community educator with experience in teaching science and robotics.',
      volunteerDetails: {
        skills: ['Teaching & Tutoring', 'Photography & Media', 'Data Entry & Surveying'],
        causes: ['education', 'environment'],
        availability: 'WEEKENDS',
        hoursLogged: 48,
        experienceYears: 3
      }
    }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    email: 'kavita.deshmukh@example.com',
    role: 'DONOR',
    status: 'ACTIVE',
    createdAt: '2025-11-12T09:20:00Z',
    profile: {
      name: 'Kavita Deshmukh',
      phone: '+91 98111 88990',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      bio: 'Tech entrepreneur committed to child nutrition and emergency medical access.',
      donorDetails: {
        preferredCauses: ['healthcare', 'food_nutrition', 'women_children'],
        taxPan: 'AAACD1234F',
        totalDonated: 125000,
        isAnonymousPreferred: false
      }
    }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    email: 'csr@tatanetworks.com',
    role: 'CSR',
    status: 'ACTIVE',
    createdAt: '2025-04-10T16:00:00Z',
    profile: {
      name: 'Vikramaditya Oberoi',
      organizationName: 'Tata Networks CSR Foundation',
      designation: 'Head of Social Investments',
      phone: '+91 11 4100 2233',
      city: 'New Delhi',
      state: 'Delhi NCR',
      country: 'India',
      bio: 'Deploying strategic Corporate Social Responsibility capital aligned with Schedule VII priorities.',
      csrDetails: {
        companyName: 'Tata Networks Ltd',
        cinNumber: 'L72200DL1998PLC092144',
        annualBudget: 5000000,
        focusStates: ['West Bengal', 'Maharashtra', 'Odisha'],
        preferredCauses: ['education', 'healthcare', 'environment'],
        grantsCommitted: 1850000
      }
    }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    email: 'dm.kolkata@wb.gov.in',
    role: 'GOVERNMENT',
    status: 'ACTIVE',
    createdAt: '2025-01-05T12:00:00Z',
    profile: {
      name: 'Debashis Mukherjee, IAS',
      organizationName: 'Department of Women & Child Welfare',
      designation: 'District Welfare Nodal Officer',
      phone: '+91 33 2214 5566',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      bio: 'Institutional oversight for public welfare coordination and NGO partnerships.',
      governmentDetails: {
        department: 'Dept. of Social Welfare & Disaster Management',
        officialJurisdiction: 'Kolkata & Suburbs District Unit',
        designation: 'Joint Director of Monitoring',
        authorizedIdNumber: 'GOV-WB-SW-2021-994'
      }
    }
  },
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    email: 'admin@ngodigitalconnect.org',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    profile: {
      name: 'Platform Oversight Officer',
      designation: 'Chief Compliance & Integrity Lead',
      city: 'New Delhi',
      state: 'Delhi NCR',
      country: 'India',
      bio: 'Responsible for NGO KYC accreditation, fraud monitoring, and platform governance.'
    }
  }
];

export const SEED_CASES: HelpRequest[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    beneficiaryId: 'a0000000-0000-0000-0000-000000000001',
    beneficiaryName: 'Rajesh Mondal',
    contactPhone: '+91 98301 23456',
    title: 'Urgent Pediatric Heart Valve Surgery for 9-year-old Subham',
    category: 'healthcare',
    urgency: 'CRITICAL',
    description: 'Subham was diagnosed with congenital mitral valve stenosis at Nil Ratan Sircar Medical College. Family income is ₹8,000/month from pottery. Immediate surgical intervention required within 3 weeks.',
    location: {
      city: 'Kolkata',
      state: 'West Bengal',
      address: 'Lane 4, Kumartuli, North Kolkata',
      postalCode: '700005'
    },
    requiredSupportType: 'MEDICAL',
    estimatedCost: 180000,
    documents: [
      { name: 'Hospital_Cost_Estimate_NRS.pdf', url: '#', type: 'application/pdf' },
      { name: 'Echocardiogram_Diagnosis_Report.pdf', url: '#', type: 'application/pdf' }
    ],
    status: 'IN_PROGRESS',
    assignedNgoId: 'a0000000-0000-0000-0000-000000000002',
    assignedNgoName: 'Prerona Rural Relief Mission',
    assignedStaffName: 'Dr. Ananya Sen',
    linkedProjectId: 'b0000000-0000-0000-0000-000000000001',
    submittedAt: '2026-03-01T10:30:00Z',
    updatedAt: '2026-03-15T12:00:00Z',
    statusHistory: [
      { status: 'SUBMITTED', updatedAt: '2026-03-01T10:30:00Z', updatedBy: 'Rajesh Mondal', note: 'Initial submission' },
      { status: 'UNDER_REVIEW', updatedAt: '2026-03-02T11:00:00Z', updatedBy: 'Platform Admin', note: 'Documents checked for completeness' },
      { status: 'VERIFIED', updatedAt: '2026-03-03T15:30:00Z', updatedBy: 'Platform Admin', note: 'Hospital medical super verification successful' },
      { status: 'ACCEPTED', updatedAt: '2026-03-04T09:00:00Z', updatedBy: 'Dr. Ananya Sen (Prerona)', note: 'Accepted under Pediatric Cardiac Care Initiative' },
      { status: 'IN_PROGRESS', updatedAt: '2026-03-06T14:00:00Z', updatedBy: 'Dr. Ananya Sen (Prerona)', note: 'Pre-surgery tests scheduled; ₹1,20,000 allocated from project funds' }
    ]
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    beneficiaryId: 'a0000000-0000-0000-0000-000000000001',
    beneficiaryName: 'Sunita Devi',
    contactPhone: '+91 97110 33445',
    title: 'School Fee & Books Support for Two Orphaned Sisters',
    category: 'education',
    urgency: 'HIGH',
    description: 'Following the demise of both parents during seasonal floods, two girls (ages 11 and 13) risk dropping out of St. Xavier Boarding School in Purulia. Annual boarding and uniform fees need coverage.',
    location: {
      city: 'Howrah',
      state: 'West Bengal',
      address: 'Vill: Bagnan, Dist Howrah',
      postalCode: '711303'
    },
    requiredSupportType: 'EDUCATION',
    estimatedCost: 45000,
    status: 'VERIFIED',
    assignedNgoId: 'a0000000-0000-0000-0000-000000000002',
    assignedNgoName: 'Prerona Rural Relief Mission',
    submittedAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-03-12T16:20:00Z',
    statusHistory: [
      { status: 'SUBMITTED', updatedAt: '2026-03-10T08:00:00Z', updatedBy: 'Sunita Devi (Guardian)' },
      { status: 'UNDER_REVIEW', updatedAt: '2026-03-11T09:15:00Z', updatedBy: 'Platform Admin' },
      { status: 'VERIFIED', updatedAt: '2026-03-12T16:20:00Z', updatedBy: 'Platform Admin', note: 'School bonafide certificate verified' }
    ]
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    beneficiaryId: 'a0000000-0000-0000-0000-000000000001',
    beneficiaryName: 'Ramesh Patel',
    title: 'Solar Microgrid & Water Filter for Coastal Fishing Hamlet',
    category: 'environment',
    urgency: 'MEDIUM',
    description: '45 tribal fishing families in Gosaba Island lack clean drinking water due to saline intrusion and no electricity grid. Requesting deep tube-well community filter and solar inverter.',
    location: {
      city: 'Kolkata',
      state: 'West Bengal',
      address: 'Gosaba Block, Sundarbans',
      postalCode: '743370'
    },
    requiredSupportType: 'EQUIPMENT',
    estimatedCost: 320000,
    status: 'RESOLVED',
    assignedNgoId: 'a0000000-0000-0000-0000-000000000002',
    assignedNgoName: 'Prerona Rural Relief Mission',
    linkedProjectId: 'b0000000-0000-0000-0000-000000000002',
    resolutionNotes: 'Successfully installed 1,000 LPH RO water filtration plant powered by 3kW solar microgrid. Benefiting 45 households.',
    resolutionEvidenceUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    submittedAt: '2025-10-01T10:00:00Z',
    updatedAt: '2026-01-20T17:00:00Z',
    statusHistory: [
      { status: 'SUBMITTED', updatedAt: '2025-10-01T10:00:00Z', updatedBy: 'Ramesh Patel' },
      { status: 'VERIFIED', updatedAt: '2025-10-05T11:00:00Z', updatedBy: 'Platform Admin' },
      { status: 'ACCEPTED', updatedAt: '2025-10-10T14:00:00Z', updatedBy: 'Prerona Mission' },
      { status: 'IN_PROGRESS', updatedAt: '2025-11-01T09:00:00Z', updatedBy: 'Prerona Mission' },
      { status: 'RESOLVED', updatedAt: '2026-01-20T17:00:00Z', updatedBy: 'Prerona Mission', note: 'Filter functional and handed over to Village Committee' }
    ]
  }
];

export const SEED_PROJECTS: Project[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    ngoId: 'a0000000-0000-0000-0000-000000000002',
    ngoName: 'Prerona Rural Relief Mission',
    title: 'Lifeline Sundarbans: Pediatric Cardiac Care & Mobile Health Vans',
    description: 'Providing subsidized heart surgeries, diagnostic sonography, and emergency river-boat medical clinics across remote mangrove delta communities.',
    cause: 'healthcare',
    location: {
      city: 'Kolkata',
      state: 'West Bengal'
    },
    targetBeneficiaries: 500,
    reachedBeneficiaries: 340,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    fundingTarget: 1500000,
    fundingRaised: 1120000,
    volunteersNeeded: 25,
    volunteersEnrolled: 18,
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    allowOverfunding: true,
    milestones: [
      {
        id: 'ms_01',
        title: 'Launch 2 River-Boat Mobile Medical Clinics',
        targetDate: '2026-02-15',
        isCompleted: true,
        completedDate: '2026-02-10',
        notes: 'Two solar-retrofitted clinics operational in Gosaba and Basanti blocks.'
      },
      {
        id: 'ms_02',
        title: 'Screen 1,000 Children for Congenital Heart Anomalies',
        targetDate: '2026-05-30',
        isCompleted: true,
        completedDate: '2026-03-01',
        notes: 'Screened 1,120 children; 14 critical cases scheduled for surgery.'
      },
      {
        id: 'ms_03',
        title: 'Complete 25 Specialized Valve Surgeries',
        targetDate: '2026-10-31',
        isCompleted: false,
        notes: '11 surgeries completed at partner super-specialty hospital.'
      }
    ],
    updates: [
      {
        id: 'up_01',
        date: '2026-03-15',
        title: 'Boat Clinic Reaches Rangabelia Delta',
        content: 'Our medical crew delivered maternal supplements and pediatric checks to 140 families cut off by recent high tides.'
      }
    ]
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    ngoId: 'a0000000-0000-0000-0000-000000000003',
    ngoName: 'Vidya Jyoti Foundation',
    title: 'Digital Disha: Solar Smart Classrooms in Slum Communities',
    description: 'Transforming municipal schools in Dharavi and Govandi with Raspberry Pi digital learning pods, coding bootcamps, and STEM kits for 2,000 girls.',
    cause: 'education',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    targetBeneficiaries: 2000,
    reachedBeneficiaries: 1450,
    startDate: '2025-07-01',
    endDate: '2026-06-30',
    fundingTarget: 800000,
    fundingRaised: 800000,
    volunteersNeeded: 30,
    volunteersEnrolled: 30,
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    milestones: [
      {
        id: 'ms_04',
        title: 'Set Up 10 High-Efficiency Solar Battery Pods',
        targetDate: '2025-09-15',
        isCompleted: true,
        completedDate: '2025-09-10'
      },
      {
        id: 'ms_05',
        title: 'Train 50 School Teachers on Digital Curriculum',
        targetDate: '2025-12-20',
        isCompleted: true,
        completedDate: '2025-12-18'
      },
      {
        id: 'ms_06',
        title: 'Conduct Girls Coding Hackathon for 500 Students',
        targetDate: '2026-04-30',
        isCompleted: false
      }
    ],
    updates: [
      {
        id: 'up_02',
        date: '2026-02-28',
        title: 'Classroom Attendance Increases by 38%',
        content: 'With interactive visual learning tablets, student engagement scores improved significantly in primary math assessments.'
      }
    ]
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    ngoId: 'a0000000-0000-0000-0000-000000000002',
    ngoName: 'Prerona Rural Relief Mission',
    title: 'Sundarbans Saline Soil Agri-Restoration & Women Seed Banks',
    description: 'Helping 800 women farmers overcome cyclone salinization using indigenous salt-tolerant paddy seeds and organic vermicomposting beds.',
    cause: 'environment',
    location: {
      city: 'Kolkata',
      state: 'West Bengal'
    },
    targetBeneficiaries: 800,
    reachedBeneficiaries: 620,
    startDate: '2025-05-01',
    endDate: '2026-04-30',
    fundingTarget: 600000,
    fundingRaised: 490000,
    volunteersNeeded: 15,
    volunteersEnrolled: 12,
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    milestones: [
      {
        id: 'ms_07',
        title: 'Establish 4 Community Seed Vaults',
        targetDate: '2025-08-30',
        isCompleted: true,
        completedDate: '2025-08-25'
      },
      {
        id: 'ms_08',
        title: 'Soil Desalination of 120 Acres of Farmland',
        targetDate: '2026-03-31',
        isCompleted: false
      }
    ],
    updates: []
  }
];

export const SEED_OPPORTUNITIES: VolunteerOpportunity[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    projectId: 'b0000000-0000-0000-0000-000000000001',
    projectTitle: 'Lifeline Sundarbans: Pediatric Cardiac Care',
    ngoId: 'a0000000-0000-0000-0000-000000000002',
    ngoName: 'Prerona Rural Relief Mission',
    title: 'Weekend Health Camp Triage & Patient Navigator',
    cause: 'healthcare',
    description: 'Assist doctors with patient queue management, basic pulse-oximetry checks, and demographic record-keeping during our riverboat mobile health camp.',
    location: {
      city: 'Kolkata',
      state: 'West Bengal',
      mode: 'ON_FIELD'
    },
    date: 'Every Saturday & Sunday',
    duration: '6 Hours / Day',
    skillsRequired: ['First Aid & Triage', 'Translation (Bengali/Hindi/English)', 'Data Entry & Surveying'],
    slotsTotal: 10,
    slotsFilled: 8,
    status: 'OPEN',
    requirements: ['Age 18+', 'Basic conversational Bengali', 'COVID-19 vaccination certificate']
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    projectId: 'b0000000-0000-0000-0000-000000000002',
    projectTitle: 'Digital Disha: Solar Smart Classrooms',
    ngoId: 'a0000000-0000-0000-0000-000000000003',
    ngoName: 'Vidya Jyoti Foundation',
    title: 'Weekend Python & Scratch Coding Mentor for Girls',
    cause: 'education',
    description: 'Conduct fun, hands-on block programming and digital creativity sessions for grade 6-8 girls in Govandi municipal community center.',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      mode: 'ON_FIELD'
    },
    date: 'Saturdays, 10 AM - 1 PM',
    duration: '3 Hours / Week',
    skillsRequired: ['Teaching & Tutoring', 'Photography & Media'],
    slotsTotal: 15,
    slotsFilled: 15,
    status: 'FULL',
    requirements: ['Basic programming knowledge', 'Comfortable working with high-school students']
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    projectId: 'b0000000-0000-0000-0000-000000000003',
    projectTitle: 'Sundarbans Saline Soil Agri-Restoration',
    ngoId: 'a0000000-0000-0000-0000-000000000002',
    ngoName: 'Prerona Rural Relief Mission',
    title: 'Organic Composting Field Trainer & Soil Tester',
    cause: 'environment',
    description: 'Work with self-help groups to demonstrate bio-fertilizer preparation and conduct simple pH testing on salinized farmland plots.',
    location: {
      city: 'Kolkata',
      state: 'West Bengal',
      mode: 'HYBRID'
    },
    date: 'Flexible Bi-Weekly',
    duration: '4 Hours / Visit',
    skillsRequired: ['Field Logistics & Driving', 'Translation (Bengali/Hindi/English)'],
    slotsTotal: 8,
    slotsFilled: 5,
    status: 'OPEN',
    requirements: ['Interest in agriculture and environmental sustainability']
  }
];

export const SEED_APPLICATIONS: VolunteerApplication[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    opportunityId: 'd0000000-0000-0000-0000-000000000002',
    opportunityTitle: 'Weekend Python & Scratch Coding Mentor for Girls',
    volunteerId: 'a0000000-0000-0000-0000-000000000004',
    volunteerName: 'Arjun Mehta',
    ngoId: 'a0000000-0000-0000-0000-000000000003',
    appliedAt: '2026-02-10T14:30:00Z',
    status: 'ACCEPTED',
    hoursLogged: 24,
    feedback: 'Arjun has been brilliant in keeping the kids engaged with interactive Scratch games.'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    opportunityId: 'd0000000-0000-0000-0000-000000000001',
    opportunityTitle: 'Weekend Health Camp Triage & Patient Navigator',
    volunteerId: 'a0000000-0000-0000-0000-000000000004',
    volunteerName: 'Arjun Mehta',
    ngoId: 'a0000000-0000-0000-0000-000000000002',
    appliedAt: '2026-03-02T09:15:00Z',
    status: 'PENDING'
  }
];

export const SEED_DONATIONS: Donation[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    donorId: 'a0000000-0000-0000-0000-000000000005',
    donorName: 'Kavita Deshmukh',
    projectId: 'b0000000-0000-0000-0000-000000000001',
    projectTitle: 'Lifeline Sundarbans: Pediatric Cardiac Care',
    ngoId: 'a0000000-0000-0000-0000-000000000002',
    ngoName: 'Prerona Rural Relief Mission',
    amount: 50000,
    currency: 'INR',
    donatedAt: '2026-02-14T11:20:00Z',
    receiptNumber: '80G-PRERONA-2026-0042',
    paymentMethod: 'UPI / NetBanking',
    status: 'SUCCESSFUL',
    isAnonymous: false,
    donorMessage: 'Praying for speedy recovery of all little champions in Sundarbans.'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    donorId: 'a0000000-0000-0000-0000-000000000005',
    donorName: 'Kavita Deshmukh',
    projectId: 'b0000000-0000-0000-0000-000000000002',
    projectTitle: 'Digital Disha: Solar Smart Classrooms',
    ngoId: 'a0000000-0000-0000-0000-000000000003',
    ngoName: 'Vidya Jyoti Foundation',
    amount: 75000,
    currency: 'INR',
    donatedAt: '2026-03-01T16:45:00Z',
    receiptNumber: '80G-VIDYA-2026-0089',
    paymentMethod: 'Credit Card',
    status: 'SUCCESSFUL',
    isAnonymous: false,
    donorMessage: 'Dedicated in memory of my grandmother who was a primary school teacher.'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    donorId: 'a0000000-0000-0000-0000-000000000006',
    donorName: 'Tata Networks CSR Foundation',
    projectId: 'b0000000-0000-0000-0000-000000000001',
    projectTitle: 'Lifeline Sundarbans: Pediatric Cardiac Care',
    ngoId: 'a0000000-0000-0000-0000-000000000002',
    ngoName: 'Prerona Rural Relief Mission',
    amount: 750000,
    currency: 'INR',
    donatedAt: '2026-01-20T10:00:00Z',
    receiptNumber: 'CSR-PRERONA-2026-0005',
    paymentMethod: 'Institutional Wire (RTGS)',
    status: 'SUCCESSFUL',
    isAnonymous: false,
    donorMessage: 'Schedule VII Grant allocated for Rural Medical Infrastructure.'
  }
];

export const SEED_UTILIZATIONS: FundUtilization[] = [
  {
    id: '80000000-0000-0000-0000-000000000001',
    projectId: 'b0000000-0000-0000-0000-000000000001',
    ngoId: 'a0000000-0000-0000-0000-000000000002',
    category: 'MEDICAL_SUPPLIES',
    amount: 320000,
    description: 'Procurement of 2 portable echocardiogram probes and surgical stent bundles from Philips Healthcare.',
    spentDate: '2026-02-05',
    vendorName: 'Philips MedTech Eastern Dist',
    invoiceProofUrl: '#',
    recordedBy: 'Dr. Ananya Sen'
  },
  {
    id: '80000000-0000-0000-0000-000000000002',
    projectId: 'b0000000-0000-0000-0000-000000000001',
    ngoId: 'a0000000-0000-0000-0000-000000000002',
    category: 'LOGISTICS_TRANSPORT',
    amount: 145000,
    description: 'Refurbishing hull, solar roof panels, and GPS marine radio for Mobile Clinic Boat-2.',
    spentDate: '2026-02-18',
    vendorName: 'Canning Boat Builders Guild',
    invoiceProofUrl: '#',
    recordedBy: 'Dr. Ananya Sen'
  },
  {
    id: '80000000-0000-0000-0000-000000000003',
    projectId: 'b0000000-0000-0000-0000-000000000001',
    ngoId: 'a0000000-0000-0000-0000-000000000002',
    category: 'DIRECT_RELIEF',
    amount: 180000,
    description: 'Direct hospital surgical fee payment for 2 valve replacements (including Case #c0000000-0000-0000-0000-000000000001 pre-payment).',
    spentDate: '2026-03-08',
    vendorName: 'NRS Medical College Trust Acct',
    invoiceProofUrl: '#',
    recordedBy: 'Dr. Ananya Sen'
  },
  {
    id: '80000000-0000-0000-0000-000000000004',
    projectId: 'b0000000-0000-0000-0000-000000000002',
    ngoId: 'a0000000-0000-0000-0000-000000000003',
    category: 'EDUCATION_KITS',
    amount: 450000,
    description: '50 touch-enabled tablets and 10 Raspberry Pi 5 server kits preloaded with Maharashtra state curriculum.',
    spentDate: '2025-10-14',
    vendorName: 'Tech4All Education Solutions',
    invoiceProofUrl: '#',
    recordedBy: 'Priya Sharma'
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_001',
    timestamp: '2026-03-04T09:00:00Z',
    actorId: 'a0000000-0000-0000-0000-000000000002',
    actorName: 'Dr. Ananya Sen',
    actorRole: 'NGO',
    action: 'CASE_ACCEPTED',
    targetEntity: 'CASE',
    targetId: 'c0000000-0000-0000-0000-000000000001',
    details: 'Case #c0000000-0000-0000-0000-000000000001 accepted and attached to Lifeline Sundarbans project.'
  },
  {
    id: 'log_002',
    timestamp: '2026-03-08T11:00:00Z',
    actorId: 'a0000000-0000-0000-0000-000000000002',
    actorName: 'Dr. Ananya Sen',
    actorRole: 'NGO',
    action: 'FUND_UTILIZATION_LOGGED',
    targetEntity: 'PROJECT',
    targetId: 'b0000000-0000-0000-0000-000000000001',
    details: 'Logged ₹1,80,000 direct hospital surgery expense under Medical Relief.'
  },
  {
    id: 'log_003',
    timestamp: '2026-01-15T14:30:00Z',
    actorId: 'a0000000-0000-0000-0000-000000000008',
    actorName: 'Platform Oversight Officer',
    actorRole: 'ADMIN',
    action: 'NGO_VERIFICATION_APPROVED',
    targetEntity: 'NGO',
    targetId: 'a0000000-0000-0000-0000-000000000002',
    details: 'Prerona Rural Relief Mission verified following 12A/80G and CSR-1 registration audit.'
  }
];

export const SEED_COMPLAINTS: ComplaintReport[] = [
  {
    id: 'comp_001',
    reporterId: 'a0000000-0000-0000-0000-000000000004',
    reporterName: 'Arjun Mehta',
    targetType: 'PROJECT',
    targetId: 'b0000000-0000-0000-0000-000000000003',
    targetTitle: 'Sundarbans Saline Soil Agri-Restoration',
    reason: 'Incorrect location coordinates in listing',
    description: 'The location pin initially indicated North 24 Parganas instead of South 24 Parganas Gosaba cluster.',
    reportedAt: '2026-02-20T11:00:00Z',
    status: 'RESOLVED',
    resolutionNote: 'Coordinates verified and updated with the NGO coordinator.'
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_001',
    userId: 'a0000000-0000-0000-0000-000000000001',
    title: 'Case Update: In Progress',
    message: 'Prerona Relief Mission has assigned Dr. Ananya Sen to your medical request #c0000000-0000-0000-0000-000000000001.',
    type: 'SUCCESS',
    createdAt: '2026-03-06T14:05:00Z',
    isRead: false
  },
  {
    id: 'notif_002',
    userId: 'a0000000-0000-0000-0000-000000000002',
    title: 'New Critical Help Request',
    message: 'A critical medical need has been submitted in Kolkata requiring cardiac surgery.',
    type: 'ALERT',
    createdAt: '2026-03-01T10:35:00Z',
    isRead: true
  },
  {
    id: 'notif_003',
    userId: 'a0000000-0000-0000-0000-000000000005',
    title: 'Donation Impact Receipt',
    message: 'Your 80G tax receipt for ₹50,000 to Lifeline Sundarbans is now ready for download.',
    type: 'INFO',
    createdAt: '2026-02-14T11:21:00Z',
    isRead: true
  },
  {
    id: 'notif_004',
    userId: 'a0000000-0000-0000-0000-000000000004',
    title: 'Application Accepted',
    message: 'Vidya Jyoti Foundation accepted your application for the Coding Mentor opportunity.',
    type: 'SUCCESS',
    createdAt: '2026-02-11T10:00:00Z',
    isRead: true
  }
];
