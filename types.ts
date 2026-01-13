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
  frequencyIndex: number; // Stored as index to allow language-switching of display values
}

export interface PendingMarker {
  lat: number;
  lng: number;
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
  summaryIn: string;
  summaryNoTransport: string;
  summaryFooter: string;
  modeMissing: string;
  helpTooltip: string;
  openNewTab: string;
  poiRequirement: string;
  poiTooMany: string;
  poiNeeded: string;
  modes: Record<TransportMode, string>;
  frequencies: string[];
  tutorialNext: string;
  tutorialClose: string;
  tutorialStart: string;
  tutorialFinish: string;
  tutorialSteps: {
    title: string;
    description: string;
    icon: string;
  }[];
}