export type OrientationType = 'Vertical' | 'Horizontal';

export const ORIENTATIONS: OrientationType[] = ['Vertical', 'Horizontal'];

export const SECTORS = [
  'Residential',
  'Commercial',
  'Industrial',
  'Infrastructure',
  'Institutional',
  'Utilities',
  'Mixed-Use',
  'Renovation / Retrofit',
  'Specialty Projects',
] as const;

export const VERTICAL_SUBTYPES: Record<string, string[]> = {
  Residential: [
    'Single Detached House',
    'Duplex / Townhouse',
    'Apartment Low-Rise',
    'Apartment High-Rise',
    'Condominium Tower',
    'Socialized Housing',
    'Subdivision Development (Vertical structures only)',
  ],
  Commercial: [
    'Office Building',
    'Retail Store',
    'Shopping Mall',
    'Hotel / Resort',
    'Restaurant Building',
    'Warehouse',
    'Logistics Center',
  ],
  Industrial: [
    'Factory Building',
    'Manufacturing Plant',
    'Cold Storage',
    'Data Center',
    'Power Plant Buildings',
  ],
  Institutional: [
    'School Building',
    'University Facility',
    'Hospital / Clinic',
    'Government Building',
    'Church / Religious Building',
  ],
  'Specialty Projects': [
    'Parking Building',
    'Airport Terminal Building',
    'Stadium / Arena Structure',
    'Convention Center',
    'Mixed-Use Tower',
  ],
  'Renovation / Retrofit': [
    'Building Renovation',
    'Interior Fit-Out',
    'Structural Retrofit',
    'Facade Upgrade',
    'Tenant Improvement',
  ],
  'Mixed-Use': ['Mixed-Use Tower'],
  Infrastructure: [],
  Utilities: [],
};

export const HORIZONTAL_SUBTYPES: Record<string, string[]> = {
  Infrastructure: [
    'Road Construction',
    'Highway Expansion',
    'Bridge Construction',
    'Flyover / Interchange',
    'Railway / MRT / LRT Track Works',
    'Airport Runway / Taxiway',
    'Port / Pier Works',
    'Site Development',
    'Earthworks / Cut & Fill',
    'Land Reclamation',
    'Retaining Walls',
    'Slope Protection',
    'Drainage System',
    'Flood Control',
  ],
  Utilities: [
    'Water Supply Network',
    'Sewerage System',
    'Stormwater Network',
    'Electrical Distribution Lines',
    'Telecom Fiber Network',
    'Gas Pipeline',
  ],
  Industrial: [
    'Plant Site Development',
    'Mining Haul Roads',
    'Solar Farm',
    'Wind Farm Foundation Grid',
    'Tank Farm Layout',
  ],
  Institutional: [
    'Parks Development',
    'Sports Field',
    'Cemetery Development',
    'Campus Infrastructure',
  ],
  'Renovation / Retrofit': [
    'Road Rehabilitation',
    'Bridge Strengthening',
    'Utility Replacement',
    'Pavement Overlay',
  ],
  Residential: [],
  Commercial: [],
  'Mixed-Use': [],
  'Specialty Projects': [],
};

export function getSubtypes(orientation: OrientationType | '', sector: string) {
  if (!orientation || !sector) return [];
  if (orientation === 'Vertical') return VERTICAL_SUBTYPES[sector] ?? [];
  return HORIZONTAL_SUBTYPES[sector] ?? [];
}
