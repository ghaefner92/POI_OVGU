
import { Language, TransportMode, Translations, MapLayer } from './types';
import L from 'leaflet';

export const MAGDEBURG_CENTER: [number, number] = [52.1307, 11.6250];
export const BRAND_MAROON = "#93132B"; // Official OVGU Maroon

// Restricted bounds for the city of Magdeburg to focus the app purely on the local area
export const SACHSEN_ANHALT_BOUNDS = L.latLngBounds(
  L.latLng(52.03, 11.45), // Southwest (Magdeburg vicinity)
  L.latLng(52.23, 11.78)  // Northeast (Magdeburg vicinity)
);

// Bounding box for Nominatim search (minLon, maxLat, maxLon, minLat)
export const NOMINATIM_VIEWBOX = "11.45,52.23,11.78,52.03";

export const LAYER_ICONS: Record<MapLayer, string> = {
  [MapLayer.STANDARD]: "🗺️",
  [MapLayer.BUILDINGS_3D]: "🏢"
};

export const FREQUENCY_ICONS: Record<number, string> = {
  0: "⏱️", // Occasionally / Gelegentlich
  1: "🗓️", // 2-3 days / 2-3 Tage
  2: "📆", // 4-5 days / 4-5 Tage
  3: "🔥"  // Daily / Täglich
};

export const TRANSLATIONS: Record<Language, Translations> = {
  [Language.EN]: {
    title: "OVGU Mobility Tracker",
    imiqProject: "IMIQ Project",
    searchPlaceholder: "Search for places in Magdeburg...",
    addPoi: "Add POI",
    addedPois: "Your Frequented Locations",
    dragHint: "Drag transport mode here",
    saveData: "Confirm All Selections",
    noPois: "Click the map or search for a place in Magdeburg.",
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
    storeData: "Store data in OVGU servers",
    storingData: "Syncing with OVGU servers...",
    successMessage: "Data successfully stored! Thank you for your contribution.",
    summaryPrefix: "You have selected the following mobility profile in the Magdeburg area:",
    summaryIn: "Summary in",
    summaryNoTransport: "an unspecified mode of transport",
    summaryFooter: "Your input will help improve urban planning and campus accessibility.",
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
    layerStandard: "Standard",
    layer3D: "3D Buildings",
    layerNight: "Night View",
    tutorialNext: "Next",
    tutorialClose: "Skip Tutorial",
    tutorialStart: "Let's Start",
    tutorialFinish: "Got it!",
    tutorialSteps: [
      {
        title: "Welcome!",
        description: "Help us understand mobility habits in Magdeburg by marking the places you visit most often.",
        icon: "👋"
      },
      {
        title: "Search Locations",
        description: "Search for specific addresses or buildings strictly within the city limits of Magdeburg.",
        icon: "🔍"
      },
      {
        title: "Mark the Map",
        description: "You can also click directly on the map to drop a pin. Multiple pins can be confirmed at once!",
        icon: "📍"
      },
      {
        title: "Transport Modes",
        description: "Drag the icons from the footer and drop them onto your locations to specify how you get there.",
        icon: "🚲"
      },
      {
        title: "View Modes",
        description: "Toggle between 2D, 3D views to better recognize buildings and landmarks.",
        icon: "🏢"
      },
      {
        title: "Finalize",
        description: "Once you've added your key locations, click 'Confirm All Selections' to submit your data.",
        icon: "✅"
      }
    ]
  },
  [Language.DE]: {
    title: "OVGU Mobilitäts-Tracker",
    imiqProject: "IMIQ Projekt",
    searchPlaceholder: "Suche nach Orten in Magdeburg...",
    addPoi: "Ort hinzufügen",
    addedPois: "Ihre Ziele",
    dragHint: "Verkehrsmittel hierher ziehen",
    saveData: "Alle Auswahl bestätigen",
    noPois: "Klicken Sie auf die Karte oder suchen Sie einen Ort in Magdeburg.",
    frequencyLabel: "Wöchentliche Häufigkeit",
    transportLabel: "Hauptverkehrsmittel",
    finalizeTitle: "Mobilitäts-Zusammenfassung",
    finalizeDesc: "Bitte überprüfen Sie die Zusammenfassung Ihrer Mobilitätsgewohnheiten vor dem Absenden.",
    confirmSelection: "Orte bestätigen",
    clearSelection: "Abbrechen",
    pendingCount: "Punkte markiert",
    processing: "Orte werden bestimmt...",
    clearAll: "Karte zurücksetzen",
    clearAllConfirm: "Möchten Sie wirklich alle Punkte entfernen? Dies kann nicht rückgängig gemacht werden.",
    cancel: "Abbrechen",
    confirm: "Ja, zurücksetzen",
    resetTransport: "Verkehrsmittel löschen",
    storeData: "Daten auf OVGU-Servern speichern",
    storingData: "Synchronisierung mit OVGU-Servern...",
    successMessage: "Daten erfolgreich gespeichert! Vielen Dank für Ihren Beitrag.",
    summaryPrefix: "Sie haben folgendes Mobilitätsprofil im Stadtgebiet Magdeburg erstellt:",
    summaryIn: "Zusammenfassung in",
    summaryNoTransport: "einem nicht angegebenen Verkehrsmittel",
    summaryFooter: "Ihre Angaben tragen dazu bei, die Stadtplanung und Campus-Erreichbarkeit zu verbessern.",
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
    frequencies: ["Gelegentlich", "2-3 Tage", "4-5 Tage", "Täglich"],
    layerStandard: "Standard",
    layer3D: "3D Gebäude",
    layerNight: "Nachtansicht",
    tutorialNext: "Weiter",
    tutorialClose: "Tutorial überspringen",
    tutorialStart: "Los geht's",
    tutorialFinish: "Verstanden!",
    tutorialSteps: [
      {
        title: "Willkommen!",
        description: "Helfen Sie uns, die Mobilitätsgewohnheiten in Magdeburg zu verstehen, indem Sie Ihre meistbesuchten Orte markieren.",
        icon: "👋"
      },
      {
        title: "Orte suchen",
        description: "Suchen Sie nach Adressen oder Gebäuden streng innerhalb der Stadtgrenzen von Magdeburg.",
        icon: "🔍"
      },
      {
        title: "Karte markieren",
        description: "Klicken Sie direkt auf die Karte, um Stecknadeln zu setzen. Mehrere Punkte können gleichzeitig bestätigt werden.",
        icon: "📍"
      },
      {
        title: "Verkehrsmittel",
        description: "Ziehen Sie die Symbole aus der Fußzeile auf Ihre Orte, um anzugeben, wie Sie dorthin gelangen.",
        icon: "🚲"
      },
      {
        title: "Ansichtsmodi",
        description: "Wechseln Sie zwischen 2D-, 3D-Ansichten, um Gebäude und Orientierungspunkte besser zu erkennen.",
        icon: "🏢"
      },
      {
        title: "Abschließen",
        description: "Wenn Sie Ihre wichtigsten Standorte hinzugefügt haben, klicken Sie auf 'Alle Auswahl bestätigen'.",
        icon: "✅"
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
