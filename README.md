# Vidyarthi Bus 🚌

**Vidyarthi Bus** is a real-time, crowdsourced bus tracking application designed specifically for students in the Hassan transit hub. It enables students to track bus locations, monitor density status, and find alternative transportation options like verified shared autos.

## 🌟 Key Features

- **Live Tracker (No Login Required)**: Anyone can access the transit network dashboard to see active routes and bus locations.
- **Real-time Density Status**: Crowdsourced reporting on bus occupancy (Seats available, Standing only, or Crush load).
- **Interactive Maps**: Route-specific telemetry showing the live position of reported buses using Leaflet.
- **Quick Reporting**: One-tap reporting for authenticated users to share bus status and location telemetry.
- **Alternative Fleets**: Directory of verified shared auto pilots with direct calling for routes where buses might be full.
- **Syncing Network**: High-performance real-time updates powered by Firebase Firestore.
- **Cross-Platform**: Built as a PWA with native Android support via Capacitor.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS.
- **UI/UX**: Motion (for animations), Lucide React (icons).
- **Backend/Real-time**: Firebase Authentication, Firestore.
- **Mapping**: Leaflet, OpenStreetMap.
- **Mobile Support**: Capacitor (Android).

## 🚀 How It Works

1. **Dashboard**: View the list of active transit routes in Hassan.
2. **Telemetry**: Select a route to see its current density status and live location on the map.
3. **Crowdsourcing**: Authenticated users can submit "Quick Reports" (Empty, Seated, Full). Each report captures GPS coordinates.
4. **Data Integrity**: Reports automatically expire after 15 minutes to ensure the tracking data is always fresh and accurate.

## 👥 User Roles

- **Public Users**: Can view routes, density status, and live maps.
- **Authenticated Students**: Can submit density reports and trigger telemetry.
- **Administrators**: Access to admin tools for route management and system maintenance.

---
*Vidyarthi Bus - Hassan Hub Online*
