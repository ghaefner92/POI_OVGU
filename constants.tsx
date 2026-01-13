import { Language, TransportMode, Translations } from './types';
import L from 'leaflet';

export const MAGDEBURG_CENTER: [number, number] = [52.1307, 11.6250];
export const BRAND_MAROON = "#93132B"; 
export const FLUORESCENT_CYAN = "#00F2FF";

// Restricted bounds for the city area
export const SACHSEN_ANHALT_BOUNDS = L.latLngBounds(
  L.latLng(52.03, 11.45), 
  L.latLng(52.23, 11.78)
);

// Bounding box for Nominatim search (minLon, maxLat, maxLon, minLat)
export const NOMINATIM_VIEWBOX = "11.45,52.23,11.78,52.03";

// We use CartoDB Voyager. Set maxNativeZoom to 19 to prevent gray tiles at zoom 20+
export const URBAN_TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
export const TILE_OPTIONS = {
  maxZoom: 22,
  maxNativeZoom: 19,
  detectRetina: true,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
};

export const FREQUENCY_ICONS: Record<number, string> = {
  0: "⏱️", 
  1: "🗓️", 
  2: "📆", 
  3: "🔥"  
};

export const TRANSPORT_ICONS: Record<TransportMode, string> = {
  [TransportMode.WALKING]: "🚶",
  [TransportMode.CYCLING]: "🚲",
  [TransportMode.E_BIKE]: "⚡",
  [TransportMode.TRAM]: "🚃",
  [TransportMode.BUS]: "🚌",
  [TransportMode.CAR_DRIVER]: "🚗",
  [TransportMode.CAR_PASSENGER]: "👨‍👩‍👧",
  [TransportMode.E_SCOOTER]: "🛴",
  [TransportMode.TRAIN]: "🚆",
  [TransportMode.MOTORBIKE]: "🏍️",
  [TransportMode.TAXI]: "🚕",
  [TransportMode.CARSHARING]: "🚙",
  [TransportMode.BIKESHARING]: "🚲"
};

export const TRANSLATIONS: Record<Language, Translations> = {
  [Language.EN]: {
    title: "POI Selector",
    imiqProject: "Urban Research",
    searchPlaceholder: "Search for places...",
    addPoi: "Add POI",
    addedPois: "Your Frequented Locations",
    dragHint: "Drag transport mode here",
    saveData: "Confirm All Selections",
    noPois: "Click the map or search for a place.",
    frequencyLabel: "Weekly Frequency",
    transportLabel: "Main Transport Mode",
    finalizeTitle: "Mobility Summary",
    finalizeDesc: "Please review the summary of your mobility habits before submitting.",
    confirmSelection: "Confirm Locations",
    clearSelection: "Cancel",
    pendingCount: "points marked",
    processing: "Identifying locations...",
    clearAll: "Reset Map",
    clearAllConfirm: "This will remove all your added locations. Continue?",
    cancel: "Go Back",
    confirm: "Yes, Reset",
    resetTransport: "Reset transport",
    storeData: "Submit data",
    storingData: "Syncing data...",
    successMessage: "Data successfully submitted! Thank you.",
    summaryPrefix: "You have selected the following mobility profile:",
    summaryIn: "Summary in",
    summaryNoTransport: "an unspecified mode of transport",
    summaryFooter: "Your input will help improve urban planning and accessibility.",
    modeMissing: "Info needed",
    helpTooltip: "Show Tutorial",
    openNewTab: "Open in new tab",
    poiRequirement: "Please select between 3 and 6 locations.",
    poiTooMany: "Too many locations (Max 6).",
    poiNeeded: "More locations needed (Min 3).",
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
    frequencies: ["Occasionally", "2-3 days", "4-5 days", "Daily"],
    tutorialNext: "Next",
    tutorialClose: "Skip Tutorial",
    tutorialStart: "Let's Start",
    tutorialFinish: "Got it!",
    tutorialSteps: [
      {
        title: "Welcome!",
        description: "Mark 3 to 6 locations in Magdeburg where you spend time regularly (e.g. work, home, hobbies).",
        icon: "🏢"
      },
      {
        title: "Find Your Spots",
        description: "Use the search bar to find exact addresses or simply click anywhere on the map to drop a pin.",
        icon: "🔍"
      },
      {
        title: "City Boundaries",
        description: "The bright cyan line shows the city limits. Please stay within these borders for your selection.",
        icon: "🏙️"
      },
      {
        title: "Drag & Drop",
        description: "Drag the transport icons from the bottom and drop them onto your locations in the sidebar.",
        icon: "🚲"
      },
      {
        title: "Almost There",
        description: "Ensure all 3-6 locations have a transport mode and frequency set before clicking Confirm All.",
        icon: "✅"
      }
    ]
  },
  [Language.DE]: {
    title: "POI Selector",
    imiqProject: "Urbane Forschung",
    searchPlaceholder: "Suche nach Orten...",
    addPoi: "Ort hinzufügen",
    addedPois: "Ihre Ziele",
    dragHint: "Verkehrsmittel ziehen",
    saveData: "Alle Auswahl bestätigen",
    noPois: "Klicken Sie auf die Karte oder suchen Sie einen Ort.",
    frequencyLabel: "Wöchentliche Häufigkeit",
    transportLabel: "Hauptverkehrsmittel",
    finalizeTitle: "Zusammenfassung",
    finalizeDesc: "Bitte überprüfen Sie die Zusammenfassung Ihrer Mobilitätsgewohnheiten vor dem Absenden.",
    confirmSelection: "Orte bestätigen",
    clearSelection: "Abbrechen",
    pendingCount: "Punkte markiert",
    processing: "Orte werden bestimmt...",
    clearAll: "Reset",
    clearAllConfirm: "Möchten Sie wirklich alle Punkte entfernen? Dies kann nicht rückgängig gemacht werden.",
    cancel: "Abbrechen",
    confirm: "Ja, Reset",
    resetTransport: "Verkehrsmittel löschen",
    storeData: "Speichern",
    storingData: "Sync...",
    successMessage: "Gespeichert! Vielen Dank.",
    summaryPrefix: "Mobilitätsprofil:",
    summaryIn: "Zusammenfassung in",
    summaryNoTransport: "nicht angegeben",
    summaryFooter: "Ihre Angaben tragen zur Stadtplanung bei.",
    modeMissing: "Mehr Info",
    helpTooltip: "Tutorial",
    openNewTab: "In neuem Tab öffnen",
    poiRequirement: "Bitte wählen Sie zwischen 3 und 6 Orten aus.",
    poiTooMany: "Zu viele Orte (Max 6).",
    poiNeeded: "Mehr Orte benötigt (Min 3).",
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
      [TransportMode.BIKESHARING]: "Bike-Sharing"
    },
    frequencies: ["Gelegentlich", "2-3 Tage", "4-5 Tage", "Täglich"],
    tutorialNext: "Weiter",
    tutorialClose: "Ende",
    tutorialStart: "Los",
    tutorialFinish: "Ok!",
    tutorialSteps: [
      {
        title: "Willkommen!",
        description: "Markieren Sie 3 bis 6 Orte in Magdeburg, an denen Sie regelmäßig Zeit verbringen (z.B. Arbeit, Zuhause).",
        icon: "🏢"
      },
      {
        title: "Orte finden",
        description: "Nutzen Sie die Suche für Adressen oder klicken Sie direkt auf die Karte, um einen Pin zu setzen.",
        icon: "🔍"
      },
      {
        title: "Stadtgrenze",
        description: "Die hellblaue Linie zeigt die Stadtgrenzen. Bitte wählen Sie Orte innerhalb dieser Grenzen.",
        icon: "🏙️"
      },
      {
        title: "Ziehen & Ablegen",
        description: "Ziehen Sie die Verkehrsmittel-Icons von unten auf Ihre Orte in der Seitenleiste.",
        icon: "🚲"
      },
      {
        title: "Fast fertig",
        description: "Stellen Sie sicher, dass alle 3-6 Orte ein Verkehrsmittel und eine Häufigkeit haben.",
        icon: "✅"
      }
    ]
  }
};