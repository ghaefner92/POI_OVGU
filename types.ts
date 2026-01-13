
export enum Language {
  DE = 'de',
  EN = 'en'
}

export enum TransportMode {
  WALKING = 'WALKING',
  CYCLING = 'CYCLING',
  E_BIKE = 'E_BIKE',
  TRAM = 'TRAM',
  BUS = 'BUS',
  CAR_DRIVER = 'CAR_DRIVER',
  CAR_PASSENGER = 'CAR_PASSENGER',
  E_SCOOTER = 'E_SCOOTER',
  TRAIN = 'TRAIN',
  MOTORBIKE = 'MOTORBIKE',
  TAXI = 'TAXI',
  CARSHARING = 'CARSHARING',
  BIKESHARING = 'BIKESHARING'
}

export interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  transportMode: TransportMode | null;
  frequency: string;
}

export interface PendingMarker {
  lat: number;
  lng: number;
}

// Added TutorialStep interface for the Tutorial component structure
export interface TutorialStep {
  icon: string;
  title: string;
  description: string;
}

export interface Translations {
  title: string;
  imiqProject: string;
  searchPlaceholder: string;
  addPoi: string;
  addedPois: string;
  dragHint: string;
  saveData: string;
  noPois: string;
  frequencyLabel: string;
  transportLabel: string;
  finalizeTitle: string;
  finalizeDesc: string;
  confirmSelection: string;
  clearSelection: string;
  pendingCount: string;
  processing: string;
  clearAll: string;
  clearAllConfirm: string;
  cancel: string;
  confirm: string;
  resetTransport: string;
  storeData: string;
  storingData: string;
  successMessage: string;
  summaryPrefix: string;
  summaryFooter: string;
  modes: Record<TransportMode, string>;
  frequencies: string[];
  // Added missing tutorial translations to prevent runtime errors in Tutorial.tsx
  tutorialStart: string;
  tutorialNext: string;
  tutorialFinish: string;
  tutorialClose: string;
  tutorialSteps: TutorialStep[];
}
