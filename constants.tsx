
import { Language, TransportMode, Translations } from './types';
import L from 'leaflet';

export const MAGDEBURG_CENTER: [number, number] = [52.1307, 11.6250];
export const BRAND_MAROON = "#93132B";

export const SACHSEN_ANHALT_BOUNDS = L.latLngBounds(
  L.latLng(52.03, 11.45),
  L.latLng(52.23, 11.78)
);

export const NOMINATIM_VIEWBOX = "11.45,52.23,11.78,52.03";

// Fix: Exported FREQUENCY_ICONS which was missing and causing a compilation error in FrequencySource.tsx
export const FREQUENCY_ICONS: string[] = ["📉", "📅", "🗓️", "🔥"];

export const TRANSLATIONS: Record<Language, Translations> = {
  [Language.EN]: {
    title: "OVGU Mobility Tracker",
    imiqProject: "IMIQ Project",
    searchPlaceholder: "Search in Magdeburg...",
    addPoi: "Add POI",
    addedPois: "Your Locations",
    dragHint: "Drop mode here",
    saveData: "Confirm Selections",
    noPois: "Mark your key locations on the map.",
    frequencyLabel: "Frequency",
    transportLabel: "Transport",
    finalizeTitle: "Finalize Data",
    finalizeDesc: "Review your mobility profile before submitting.",
    confirmSelection: "Add Points",
    clearSelection: "Cancel",
    pendingCount: "points",
    processing: "Processing...",
    clearAll: "Reset",
    clearAllConfirm: "Delete all locations?",
    cancel: "Cancel",
    confirm: "Reset",
    resetTransport: "Clear",
    storeData: "Submit to OVGU",
    storingData: "Syncing...",
    successMessage: "Successfully submitted!",
    summaryPrefix: "Your Profile:",
    summaryFooter: "Thank you for contributing to the IMIQ project.",
    modes: {
      [TransportMode.WALKING]: "Walking",
      [TransportMode.CYCLING]: "Cycling",
      [TransportMode.E_BIKE]: "E-Bike",
      [TransportMode.TRAM]: "Tram",
      [TransportMode.BUS]: "Bus",
      [TransportMode.CAR_DRIVER]: "Car (Driver)",
      [TransportMode.CAR_PASSENGER]: "Car (Pass.)",
      [TransportMode.E_SCOOTER]: "E-Scooter",
      [TransportMode.TRAIN]: "Train",
      [TransportMode.MOTORBIKE]: "Motorbike",
      [TransportMode.TAXI]: "Taxi",
      [TransportMode.CARSHARING]: "Carsharing",
      [TransportMode.BIKESHARING]: "Bikesharing"
    },
    frequencies: ["Occasionally", "2-3 days/week", "4-5 days/week", "Daily"],
    // Added missing English tutorial content for Tutorial component
    tutorialStart: "Get Started",
    tutorialNext: "Next",
    tutorialFinish: "Ready!",
    tutorialClose: "Skip",
    tutorialSteps: [
      { icon: "📍", title: "Add Locations", description: "Search for addresses or click on the map to mark your frequent destinations in Magdeburg." },
      { icon: "🚲", title: "Assign Transport", description: "Drag and drop transport icons onto your locations to specify how you get there." },
      { icon: "⏱️", title: "Set Frequency", description: "Use the dropdown or drag frequency labels to tell us how often you visit these places." },
      { icon: "📤", title: "Submit Data", description: "Review your summary and send your data to help improve Magdeburg's mobility infrastructure." }
    ]
  },
  [Language.DE]: {
    title: "OVGU Mobilitäts-Tracker",
    imiqProject: "IMIQ Projekt",
    searchPlaceholder: "Suche in Magdeburg...",
    addPoi: "Ort hinzufügen",
    addedPois: "Ihre Ziele",
    dragHint: "Modus ablegen",
    saveData: "Auswahl bestätigen",
    noPois: "Markieren Sie Ihre Ziele auf der Karte.",
    frequencyLabel: "Häufigkeit",
    transportLabel: "Verkehrsmittel",
    finalizeTitle: "Daten abschließen",
    finalizeDesc: "Überprüfen Sie Ihr Profil vor dem Absenden.",
    confirmSelection: "Hinzufügen",
    clearSelection: "Abbrechen",
    pendingCount: "Punkte",
    processing: "Verarbeitung...",
    clearAll: "Reset",
    clearAllConfirm: "Alle Orte löschen?",
    cancel: "Abbrechen",
    confirm: "Reset",
    resetTransport: "Löschen",
    storeData: "An OVGU senden",
    storingData: "Synchronisierung...",
    successMessage: "Erfolgreich gesendet!",
    summaryPrefix: "Ihr Profil:",
    summaryFooter: "Vielen Dank für Ihre Teilnahme am IMIQ-Projekt.",
    modes: {
      [TransportMode.WALKING]: "Zu Fuß",
      [TransportMode.CYCLING]: "Fahrrad",
      [TransportMode.E_BIKE]: "E-Bike",
      [TransportMode.TRAM]: "Straßenbahn",
      [TransportMode.BUS]: "Bus",
      [TransportMode.CAR_DRIVER]: "Auto (Fahrer)",
      [TransportMode.CAR_PASSENGER]: "Auto (Beif.)",
      [TransportMode.E_SCOOTER]: "E-Scooter",
      [TransportMode.TRAIN]: "Zug",
      [TransportMode.MOTORBIKE]: "Motorrad",
      [TransportMode.TAXI]: "Taxi",
      [TransportMode.CARSHARING]: "Carsharing",
      [TransportMode.BIKESHARING]: "Leihrad"
    },
    frequencies: ["Gelegentlich", "2-3 Tage/Woche", "4-5 Tage/Woche", "Täglich"],
    // Added missing German tutorial content for Tutorial component
    tutorialStart: "Los geht's",
    tutorialNext: "Weiter",
    tutorialFinish: "Fertig!",
    tutorialClose: "Überspringen",
    tutorialSteps: [
      { icon: "📍", title: "Orte hinzufügen", description: "Suchen Sie nach Adressen oder klicken Sie auf die Karte, um Ihre Ziele in Magdeburg zu markieren." },
      { icon: "🚲", title: "Verkehrsmittel", description: "Ziehen Sie die Symbole auf Ihre Orte, um anzugeben, wie Sie dorthin gelangen." },
      { icon: "⏱️", title: "Häufigkeit", description: "Wählen Sie aus, wie oft Sie diese Orte besuchen – per Dropdown oder Drag & Drop." },
      { icon: "📤", title: "Daten senden", description: "Überprüfen Sie Ihre Zusammenfassung und helfen Sie, die Mobilität in Magdeburg zu verbessern." }
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
