
import { Language, TransportMode, Translations, MapLayer } from './types';
import L from 'leaflet';

export const MAGDEBURG_CENTER: [number, number] = [52.1307, 11.6250];
export const BRAND_MAROON = "#93132B"; 

// Precise bounds for Sachsen-Anhalt to prevent unnecessary data loading
export const SACHSEN_ANHALT_BOUNDS = L.latLngBounds(
  L.latLng(50.9, 10.5), // Southwest
  L.latLng(53.07, 13.2)  // Northeast
);

// Viewbox for Nominatim search optimization (Left, Top, Right, Bottom)
export const NOMINATIM_VIEWBOX = "10.5,53.07,13.2,50.9";

export const LAYER_ICONS: Record<MapLayer, string> = {
  [MapLayer.STANDARD]: "🗺️",
  [MapLayer.BUILDINGS_3D]: "🏢"
};

export const FREQUENCY_ICONS: Record<number, string> = {
  0: "⏱️", 
  1: "🗓️", 
  2: "📆", 
  3: "🔥"  
};

// Simplified GeoJSON for Sachsen-Anhalt border
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

// World mask to darken everything outside Sachsen-Anhalt
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
    searchPlaceholder: "Search in Magdeburg...",
    addPoi: "Add POI",
    addedPois: "Your Frequented Locations",
    dragHint: "Drag transport mode here",
    saveData: "Confirm All Selections",
    noPois: "Click map or search to add places.",
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
    storeData: "Store data",
    storingData: "Syncing...",
    successMessage: "Data saved!",
    successDesc: "Thank you for supporting the IMIQ Project.",
    summaryPrefix: "Your mobility profile in Magdeburg:",
    summaryIn: "Summary in",
    summaryNoTransport: "unspecified transport",
    summaryFooter: "Your input helps improve urban planning.",
    summaryPointLabel: "Location",
    modeMissing: "Mode missing",
    done: "Done",
    modes: {
      [TransportMode.WALKING]: "Walking",
      [TransportMode.CYCLING]: "Cycling",
      [TransportMode.E_BIKE]: "E-Bike",
      [TransportMode.TRAM]: "Tram",
      [TransportMode.BUS]: "Bus",
      [TransportMode.CAR_DRIVER]: "Car (Driver)",
      [TransportMode.CAR_PASSENGER]: "Car (Passenger)",
      [TransportMode.E_SCOOTER]: "E-Scooter",
      [TransportMode.TRAIN]: "Train",
      [TransportMode.MOTORBIKE]: "Motorbike",
      [TransportMode.TAXI]: "Taxi",
      [TransportMode.CARSHARING]: "Car Sharing",
      [TransportMode.BIKESHARING]: "Bike Sharing"
    },
    frequencies: ["Occasionally", "2-3 days", "4-5 days", "Daily"],
    layerStandard: "Standard",
    layer3D: "3D View",
    layerNight: "Night View",
    tutorialNext: "Next",
    tutorialClose: "Skip",
    tutorialStart: "Start",
    tutorialFinish: "Done",
    tutorialSteps: [
      { title: "Welcome!", description: "Help us understand mobility in Magdeburg.", icon: "👋" },
      { title: "Add Places", description: "Search or click on the map.", icon: "📍" }
    ]
  },
  [Language.DE]: {
    title: "OVGU Mobilitäts-Tracker",
    imiqProject: "IMIQ Projekt",
    searchPlaceholder: "In Magdeburg suchen...",
    addPoi: "Ort hinzufügen",
    addedPois: "Ihre Ziele",
    dragHint: "Verkehrsmittel hierher ziehen",
    saveData: "Alle Auswahl bestätigen",
    noPois: "Klicken Sie auf die Karte oder suchen Sie einen Ort.",
    frequencyLabel: "Wöchentliche Häufigkeit",
    transportLabel: "Hauptverkehrsmittel",
    finalizeTitle: "Mobilitäts-Zusammenfassung",
    finalizeDesc: "Bitte überprüfen Sie Ihre Angaben vor dem Absenden.",
    confirmSelection: "Orte bestätigen",
    clearSelection: "Abbrechen",
    pendingCount: "Punkte markiert",
    processing: "Orte werden bestimmt...",
    clearAll: "Karte zurücksetzen",
    clearAllConfirm: "Möchten Sie wirklich alle Punkte entfernen?",
    cancel: "Abbrechen",
    confirm: "Ja, zurücksetzen",
    resetTransport: "Verkehrsmittel löschen",
    storeData: "Daten speichern",
    storingData: "Synchronisierung...",
    successMessage: "Daten gespeichert!",
    successDesc: "Vielen Dank für Ihre Unterstützung.",
    summaryPrefix: "Ihr Mobilitätsprofil in Magdeburg:",
    summaryIn: "Zusammenfassung in",
    summaryNoTransport: "nicht angegebenem Verkehrsmittel",
    summaryFooter: "Ihre Angaben helfen der Stadtplanung.",
    summaryPointLabel: "Ort",
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
      [TransportMode.TRAIN]: "Zug",
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
    tutorialClose: "Überspringen",
    tutorialStart: "Start",
    tutorialFinish: "Verstanden!",
    tutorialSteps: [
      { title: "Willkommen!", description: "Helfen Sie uns, die Mobilität zu verstehen.", icon: "👋" },
      { title: "Orte hinzufügen", description: "Suche nutzen oder Karte anklicken.", icon: "📍" }
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
