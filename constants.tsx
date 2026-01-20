
import { Language, TransportMode, Translations } from './types';
import L from 'leaflet';

// Security Origin for LimeSurvey Integration
export const TARGET_ORIGIN = "https://imiq-panel.et.uni-magdeburg.de";

// Centered on OVGU Campus / Science Port area
export const MAGDEBURG_CENTER: [number, number] = [52.1396, 11.6456];
export const BRAND_MAROON = "#93132B"; 

export const SACHSEN_ANHALT_BOUNDS = L.latLngBounds(
  L.latLng(50.9, 10.5), 
  L.latLng(53.1, 13.2)  
);

export const NOMINATIM_VIEWBOX = "10.5,53.1,13.2,50.9";

export const FREQUENCY_ICONS: Record<number, string> = {
  0: "⏱️", 
  1: "🗓️", 
  2: "📆", 
  3: "🔥"  
};

export const SACHSEN_ANHALT_GEOJSON: any = {
  "type": "Feature",
  "properties": { "name": "Sachsen-Anhalt" },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [11.53, 53.05], [11.83, 53.03], [12.21, 53.01], [12.44, 52.89], [12.65, 52.92],
      [12.98, 52.81], [13.12, 52.55], [13.01, 52.19], [12.82, 52.05], [12.95, 51.72],
      [12.71, 51.52], [12.42, 51.55], [12.31, 51.22], [12.05, 50.98], [11.72, 51.02],
      [11.51, 50.92], [11.22, 51.12], [10.88, 51.42], [10.62, 51.55], [10.55, 51.82],
      [10.82, 51.98], [10.65, 52.22], [10.92, 52.52], [11.22, 52.82], [11.53, 53.05]
    ]]
  }
};

export const WORLD_MASK_GEOJSON: any = {
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]],
      SACHSEN_ANHALT_GEOJSON.geometry.coordinates[0]
    ]
  }
};

export const TRANSLATIONS: Record<Language, Translations> = {
  [Language.EN]: {
    title: "OVGU Mobility Tracker",
    imiqProject: "IMIQ Project",
    searchPlaceholder: "Search for places (e.g. Campus, Home, Edeka)...",
    addPoi: "Add POI",
    addedPois: "Your Weekly Routine",
    dragHint: "Tap a location to set details",
    saveData: "Submit Mobility Profile",
    noPois: "Identify 3 to 6 locations you visit regularly during a normal week.",
    frequencyLabel: "Weekly Frequency",
    transportLabel: "Primary Transport Mode",
    finalizeTitle: "Summary of Habits",
    finalizeDesc: "Please review your profile before final submission.",
    confirmSelection: "Add to Profile",
    clearSelection: "Discard",
    pendingCount: "points marked",
    processing: "Identifying...",
    clearAll: "Reset",
    clearAllConfirm: "Are you sure you want to clear your current profile?",
    cancel: "Back",
    confirm: "Reset",
    resetTransport: "Clear mode",
    storeData: "Submit to OVGU Research",
    storingData: "Uploading habits...",
    successMessage: "Submission Complete!",
    successDesc: "Your mobility data has been recorded. This contributes directly to improving infrastructure and planning in Magdeburg. Thank you!",
    summaryPrefix: "Your current mobility profile for the Magdeburg region:",
    summaryIn: "Habits in",
    summaryNoTransport: "undefined transport mode",
    summaryFooter: "Your input is critical for urban and campus development.",
    summaryPointLabel: "Point",
    modeMissing: "Mode not set",
    done: "Finish",
    viewList: "My Locations",
    close: "Close",
    modes: {
      [TransportMode.WALKING]: "Walking",
      [TransportMode.CYCLING]: "Cycling",
      [TransportMode.E_BIKE]: "E-Bike",
      [TransportMode.TRAM]: "Tram",
      [TransportMode.BUS]: "Bus",
      [TransportMode.CAR_DRIVER]: "Car (Driver)",
      [TransportMode.CAR_PASSENGER]: "Car (Passenger)",
      [TransportMode.E_SCOOTER]: "E-Scooter",
      [TransportMode.TRAIN]: "Train/S-Bahn",
      [TransportMode.MOTORBIKE]: "Motorbike",
      [TransportMode.TAXI]: "Taxi",
      [TransportMode.CARSHARING]: "Car Sharing",
      [TransportMode.BIKESHARING]: "Bike Sharing"
    },
    frequencies: ["Occasionally", "2-3 days/week", "4-5 days/week", "Daily"],
    tutorialNext: "Next",
    tutorialClose: "Skip",
    tutorialStart: "Let's Go",
    tutorialFinish: "Finish Tutorial",
    tutorialSteps: [
      {
        title: "The Mission: 3 to 6 Locations",
        description: "Identify exactly 3 to 6 places you visit in a typical week. Think about your Home, the University Campus, your Office, or where you buy groceries like 'Edeka' or 'Rewe'.",
        icon: "🎯"
      },
      {
        title: "Interact with the Map",
        description: "Click anywhere on the map to mark a new spot. Notice the small maroon dots? Those are recognized locations! Click them to automatically snap to a real PDI like 'University Library'.",
        icon: "📍"
      },
      {
        title: "Power Search",
        description: "Need precision? Use the search bar for specific names like 'Studentenwerk' or 'Nordpark'. We'll even give you smart AI suggestions for places you might like!",
        icon: "🔍"
      },
      {
        title: "Define Your Habits",
        description: "Tap any added location to set your primary transport mode (e.g., Tram, Bike) and how often you visit. This data is the core of our infrastructure research.",
        icon: "⚡"
      },
      {
        title: "Contribute to Magdeburg",
        description: "Once 3-6 spots are fully detailed, click 'Submit'. Your input directly impacts future campus and city planning. Thank you for participating!",
        icon: "🏗️"
      }
    ]
  },
  [Language.DE]: {
    title: "OVGU Mobilitäts-Tracker",
    imiqProject: "IMIQ Projekt",
    searchPlaceholder: "Orte suchen (z.B. Campus, Wohnung, Edeka)...",
    addPoi: "Ort hinzufügen",
    addedPois: "Ihre wöchentliche Routine",
    dragHint: "Tippen Sie zum Bearbeiten",
    saveData: "Mobilitätsprofil absenden",
    noPois: "Markieren Sie 3 bis 6 Orte, die Sie in einer normalen Woche regelmäßig besuchen.",
    frequencyLabel: "Wöchentliche Häufigkeit",
    transportLabel: "Hauptverkehrsmittel",
    finalizeTitle: "Zusammenfassung",
    finalizeDesc: "Bitte überprüfen Sie Ihr Profil vor der endgültigen Übermittlung.",
    confirmSelection: "Zum Profil hinzufügen",
    clearSelection: "Verwerfen",
    pendingCount: "Punkte markiert",
    processing: "Wird bestimmt...",
    clearAll: "Zurücksetzen",
    clearAllConfirm: "Möchten Sie Ihr aktuelles Profil wirklich löschen?",
    cancel: "Zurück",
    confirm: "Löschen",
    resetTransport: "Modus löschen",
    storeData: "An OVGU-Forschung senden",
    storingData: "Daten werden übertragen...",
    successMessage: "Übermittlung erfolgreich!",
    successDesc: "Ihre Mobilitätsdaten wurden aufgezeichnet. Dies hilft direkt dabei, die Infrastruktur in Magdeburg zu verbessern. Vielen Dank!",
    summaryPrefix: "Ihr aktuelles Mobilitätsprofil für die Region Magdeburg:",
    summaryIn: "Zusammenfassung in",
    summaryNoTransport: "nicht angegebenes Verkehrsmittel",
    summaryFooter: "Ihre Angaben sind entscheidend für die Stadt- und Campusentwicklung.",
    summaryPointLabel: "Punkt",
    modeMissing: "Modus fehlt",
    done: "Fertig",
    viewList: "Meine Orte",
    close: "Schließen",
    modes: {
      [TransportMode.WALKING]: "Zu Fuß",
      [TransportMode.CYCLING]: "Fahrrad",
      [TransportMode.E_BIKE]: "E-Bike",
      [TransportMode.TRAM]: "Straßenbahn",
      [TransportMode.BUS]: "Bus",
      [TransportMode.CAR_DRIVER]: "Auto (Fahrer)",
      [TransportMode.CAR_PASSENGER]: "Auto (Beifahrer)",
      [TransportMode.E_SCOOTER]: "E-Scooter",
      [TransportMode.TRAIN]: "Zug/S-Bahn",
      [TransportMode.MOTORBIKE]: "Motorrad",
      [TransportMode.TAXI]: "Taxi",
      [TransportMode.CARSHARING]: "Car-Sharing",
      [TransportMode.BIKESHARING]: "Leihrad"
    },
    frequencies: ["Gelegentlich", "2-3 Tage/Woche", "4-5 Tage/Woche", "Täglich"],
    tutorialNext: "Weiter",
    tutorialClose: "Überspringen",
    tutorialStart: "Los geht's",
    tutorialFinish: "Tutorial beenden",
    tutorialSteps: [
      {
        title: "Ihre Mission: 3 bis 6 Orte",
        description: "Markieren Sie 3 bis 6 Orte Ihrer normalen Woche. Denken Sie an: Wohnung, Uni-Campus, Arbeitsplatz oder Supermärkte wie 'Edeka' oder 'Rewe'.",
        icon: "🎯"
      },
      {
        title: "Karten-Interaktion",
        description: "Klicken Sie auf die Karte, um Orte zu markieren. Die kleinen weinroten Punkte sind erkannte Orte! Klicken Sie darauf, um z.B. die 'UB' direkt zu übernehmen.",
        icon: "📍"
      },
      {
        title: "Intelligente Suche",
        description: "Nutzen Sie die Suche für Orte wie 'Studentenwerk' oder 'Nordpark'. Wir nutzen KI, um Ihnen passende Vorschläge in Magdeburg zu machen!",
        icon: "🔍"
      },
      {
        title: "Gewohnheiten festlegen",
        description: "Tippen Sie auf einen Marker, um Modus (z.B. Bahn, Rad) und Häufigkeit zu wählen. Dies ist der wichtigste Teil für unsere Forschung.",
        icon: "⚡"
      },
      {
        title: "Beitrag für Magdeburg",
        description: "Wenn 3-6 Orte fertig sind, klicken Sie auf 'Absenden'. Ihre Daten beeinflussen direkt die zukünftige Stadtplanung. Vielen Dank!",
        icon: "🏗️"
      }
    ]
  }
};

export const TRANSPORT_ICONS: Record<TransportMode, string> = {
  [TransportMode.WALKING]: "🚶",
  [TransportMode.CYCLING]: "🚲",
  [TransportMode.E_BIKE]: "⚡🚲",
  [TransportMode.TRAM]: "🚃",
  [TransportMode.BUS]: "🚌",
  [TransportMode.CAR_DRIVER]: "🚗",
  [TransportMode.CAR_PASSENGER]: "🚙",
  [TransportMode.E_SCOOTER]: "🛴",
  [TransportMode.TRAIN]: "🚆",
  [TransportMode.MOTORBIKE]: "🏍️",
  [TransportMode.TAXI]: "🚕",
  [TransportMode.CARSHARING]: "🏢🚗",
  [TransportMode.BIKESHARING]: "🏢🚲"
};
