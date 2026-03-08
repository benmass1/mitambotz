
export enum AppTab {
  DASHBOARD = 'dashboard',
  MACHINES = 'machines',
  DIAGNOSIS = 'diagnosis',
  EDITOR = 'editor',
  VISUALIZER = 'visualizer',
  SEARCH = 'search',
  LIBRARY = 'library',
  LIVE = 'live',
  ADMIN = 'admin'
}

export interface LubricantSpec {
  component: string;
  type: string;
  quantity: string;
  specNumber: string;
}

export interface FilterSpec {
  name: string;
  quantity: string;
  location: string;
}

export interface ServiceInterval {
  hours: string;
  components: string[];
  description: string;
}

export interface TechExplanation {
  techName: string;
  explanation: string;
}

export interface SystemFlow {
  systemName: string;
  components: string[]; 
  description: string; 
  diagramUrl?: string; // Field for the technical drawing
}

export interface Machine {
  id: string;
  name: string;
  make: string;
  type: string;
  status: 'Healthy' | 'In Repair' | 'Critical';
  hours: number;
  lastService: string;
  specs?: {
    engine: string;
    transmission: string;
    differential: string;
    finalDrive: string;
    lubricants: LubricantSpec[];
    filters: FilterSpec[];
    systems: string[];
    technologies: string[];
    techExplanations?: TechExplanation[];
    sources?: GroundingSource[];
    tyres: string;
    serviceSchedule: ServiceInterval[];
    systemsEducation?: {
      engineDetails: string;
      hydraulicDetails: string;
      electricalDetails: string;
      transmissionDetails: string;
      brakeSteeringDetails: string;
    };
    operationGuide?: {
      symbolsAndAlerts: { symbol: string, meaning: string }[];
      preventiveMaintenanceTips: string[];
      correctOperationRules: string[];
    };
    internalSystemsFlow?: SystemFlow[];
  };
}

export interface DiagnosisResult {
  title: string;
  confidence: string;
  steps: string[];
  codes: string[];
  partsNeeded?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
