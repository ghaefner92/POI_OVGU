
import { Language, TransportMode, Translations } from './types';
import L from 'leaflet';

export const MAGDEBURG_CENTER: [number, number] = [52.1307, 11.6250];
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
    tutorialStart: "Start Now",
    tutorialFinish: "Ready!",
    tutorialSteps: [
      {
        title: "Your Weekly Goal",
        description: "Mark between 3 and 6 locations that define your normal week. Think of: Home, University (Campus), Workplace, Gym, or your favorite Grocery Store.",
        icon: "🎯"
      },
      {
        title: "Locate & Mark",
        description: "Search for a specific name or click directly on the map. You can mark multiple points at once and then confirm them.",
        icon: "📍"
      },
      {
        title: "Quick Habit Slot",
        description: "Once a location is added, tap its marker or card. A 'Quick Action' menu will pop up to let you set your Transport Mode and Frequency in seconds.",
        icon: "⚡"
      },
      {
        title: "Be Precise",
        description: "For each place, choose the mode you use most often. Does it change? Pick the one you used last week!",
        icon: "🚲"
      },
      {
        title: "Finish the Task",
        description: "Once you have at least 3 locations fully detailed, hit the 'Submit' button. Quality data helps us build a better Magdeburg.",
        icon: "📤"
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
    tutorialStart: "Jetzt starten",
    tutorialFinish: "Bereit!",
    tutorialSteps: [
      {
        title: "Ihr Wochen-Ziel",
        description: "Markieren Sie 3 bis 6 Orte Ihrer normalen Woche. Denken Sie an: Wohnung, Universität, Arbeitsplatz, Fitnessstudio oder Ihren Supermarkt.",
        icon: "🎯"
      },
      {
        title: "Suchen & Markieren",
        description: "Suchen Sie nach Namen oder klicken Sie direkt in die Karte. Sie können mehrere Punkte gleichzeitig markieren und dann bestätigen.",
        icon: "📍"
      },
      {
        title: "Schnell-Auswahl",
        description: "Tippen Sie auf einen Marker oder eine Karte. Ein HUD-Menü erscheint, in dem Sie Modus und Häufigkeit sofort festlegen können.",
        icon: "⚡"
      },
      {
        title: "Präzision zählt",
        description: "Wählen Sie für jeden Ort das Verkehrsmittel, das Sie am häufigsten nutzen. Nutzen Sie das, was Sie letzte Woche verwendet haben!",
        icon: "🚲"
      },
      {
        title: "Abschließen",
        description: "Sobald Sie mindestens 3 Orte mit Details versehen haben, klicken Sie auf 'Absenden'. Ihre Daten helfen Magdeburg!",
        icon: "📤"
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
