export interface CauseCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
  sdgNumber?: number;
  color: string;
}

export const CAUSES_LIST: CauseCategory[] = [
  {
    id: 'healthcare',
    name: 'Healthcare & Medical Relief',
    description: 'Providing critical emergency care, surgeries, medical supplies, and mobile clinics.',
    iconName: 'HeartPulse',
    sdgNumber: 3,
    color: '#e11d48'
  },
  {
    id: 'education',
    name: 'Education & Literacy',
    description: 'Scholarships, school infrastructure, digital literacy, and books for underprivileged youth.',
    iconName: 'GraduationCap',
    sdgNumber: 4,
    color: '#2563eb'
  },
  {
    id: 'food_nutrition',
    name: 'Food & Nutrition Security',
    description: 'Zero hunger initiatives, midday meal programs, malnutrition rehabilitation, and ration kits.',
    iconName: 'Utensils',
    sdgNumber: 2,
    color: '#d97706'
  },
  {
    id: 'women_children',
    name: 'Women & Child Welfare',
    description: 'Maternal health, protection against violence, self-help groups, and vocational training.',
    iconName: 'Users',
    sdgNumber: 5,
    color: '#9333ea'
  },
  {
    id: 'elderly_care',
    name: 'Elderly Care & Support',
    description: 'Geriatric healthcare, senior citizen shelter, palliative care, and companionship programs.',
    iconName: 'HandHeart',
    sdgNumber: 10,
    color: '#0d9488'
  },
  {
    id: 'disaster_relief',
    name: 'Disaster Relief & Rehabilitation',
    description: 'Rapid emergency response to floods, cyclones, earthquakes, and climate rehabilitation.',
    iconName: 'ShieldAlert',
    sdgNumber: 11,
    color: '#ea580c'
  },
  {
    id: 'environment',
    name: 'Environment & Clean Water',
    description: 'Reforestation, clean drinking water filtration, waste management, and solar microgrids.',
    iconName: 'Sprout',
    sdgNumber: 6,
    color: '#16a34a'
  },
  {
    id: 'disability_support',
    name: 'Disability & Inclusion',
    description: 'Assistive devices, prosthetics, accessible education, and inclusive livelihood programs.',
    iconName: 'Accessibility',
    sdgNumber: 10,
    color: '#4f46e5'
  }
];

export const STATES_AND_CITIES: Record<string, string[]> = {
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
  'Delhi NCR': ['New Delhi', 'North Delhi', 'South Delhi', 'Noida', 'Gurugram'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Kanpur', 'Agra', 'Prayagraj'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri']
};

export const COMMON_SKILLS = [
  'First Aid & Triage',
  'Teaching & Tutoring',
  'Field Logistics & Driving',
  'Meal Prep & Ration Packaging',
  'Doctor / Nursing Support',
  'Counseling & Mental Health',
  'Photography & Media',
  'Translation (Bengali/Hindi/English)',
  'Data Entry & Surveying',
  'Legal Aid & Rights Counseling'
];
