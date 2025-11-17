# PipeWatch - Sewer Camera Monitoring System

![Landing Page](public/landing.png)
![Landing Page 2](public/landing2.png)
![Landing Page 3](public/landing3.png)

A comprehensive React + TypeScript application for real-time monitoring of sewer pipe camera systems. This application provides interactive map visualization, trend analysis, AI-powered insights, and detailed reporting capabilities.

## Features

- **Interactive Map Visualization**: Coordinate-based map using React Flow with circular segment nodes
- **Real-time Updates**: WebSocket integration for live camera data updates (every 6 seconds)
- **Historical Data Playback**: Timeline slider to scrub through the last 60 seconds of sensor history
- **Trend Charts**: Time-series visualization for water levels, light levels, and status changes using Recharts
- **AI Insights & Analytics**: Floating sidebar with AI-generated analysis, critical areas, and average values
- **Criticality System**: Sensor-weighted criticality calculation based on Light, Water, and Status
- **PDF Report Generation**: Comprehensive inspection reports with AI-generated summaries and dashboard screenshots
- **Data Export**: CSV/JSON export for the last 1 minute of historical data
- **Segment Selection**: Multiple selection methods (map click, hover, or circular buttons)
- **Dark Mode Theme**: Professional engineering monitoring theme with high contrast colors

## Tech Stack

**Frontend:** React 19 + TypeScript + Vite, Tailwind CSS v4, React Flow, Recharts, TanStack Query, Axios, html2canvas-pro, jsPDF

**Backend:** Express.js + WebSocket (ws), TypeScript, tsx

**Development:** ESLint, Nodemon, PostCSS

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0 recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

**Terminal 1 - Backend Server:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- WebSocket: ws://localhost:4000

## Project Structure

```
src/
├── api/                    # API service layer
├── components/             # React components (MapView, TrendCharts, Dashboard, etc.)
├── hooks/                  # Custom React hooks (useCameraData, useWebSocket, useHistoricalData, useScreenshot)
├── pages/                  # Page components
└── utils/                  # Utility functions (insights, criticality, colors)

server/
├── server.ts               # Express + WebSocket server
└── seed.json               # Sample camera data
```

## Camera Data Structure

Each camera entry contains:
- `Position`: [X, Y] coordinates relative to starting point (0,0)
- `SegmentID`: Unique identifier for the camera
- `Water`: Water submersion percentage (0-1)
- `Light`: Light level (1-5 scale, where 5 is brightest)
- `Status`: Camera status (OK, LOWLIGHT, WARNING)
- `ViewDescription`: Optional descriptive text

## Status Indicators

- **OK** (Green): Normal operation
- **LOWLIGHT** (Yellow): Insufficient lighting detected (Light ≤ 2)
- **WARNING** (Red): High water level (>0.8) or critical issue

## Criticality Levels

The system calculates criticality (1-5) based on Light level, Water submersion, and Camera status:
- **Level 1 - Critical**: Immediate attention required
- **Level 2 - Severe**: High priority
- **Level 3 - Moderate**: Monitor closely
- **Level 4 - Minor**: Low priority
- **Level 5 - Safe**: Normal operation

## API Endpoints

- `GET /api/cameras` - Get current camera data
- `GET /api/history` - Get historical data (last 60 seconds)
- `GET /api/export/csv` - Export data as CSV
- `GET /api/export/json` - Export data as JSON
- `GET /api/insights` - Get AI insights and analytics

WebSocket provides real-time camera updates every 6 seconds.

## Usage

- **Selecting Segments**: Click on map nodes, hover over segments, or use circular buttons in the tab bar
- **Viewing Trends**: Select a segment for individual trends, or deselect to view aggregated trends
- **Generating Reports**: Click "PDF Report" in the header for comprehensive inspection reports
- **Exporting Data**: Use "CSV" or "JSON" buttons to export the last 1 minute of data

## Development

```bash
npm run build    # Build for production
npm run preview # Preview production build
```
