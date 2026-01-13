
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

export enum MapLayer {
  STANDARD = 'f4_2d',
  BUILDINGS_3D = 'f4_3d'
}

export interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  transportMode: TransportMode | null;
  frequencyIndex: number; 
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
  successDesc: string;
  summaryPrefix: string;
  summaryIn: string;
  summaryNoTransport: string;
  summaryFooter: string;
  summaryPointLabel: string;
  modeMissing: string;
  done: string;
  modes: Record<TransportMode, string>;
  frequencies: string[];
  layerStandard: string;
  layer3D: string;
  layerNight: string;
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
