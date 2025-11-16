# Sewer Camera Monitoring System

A React + TypeScript application for monitoring sewer pipe camera systems in real-time. This application visualizes camera data on an interactive map, provides insights dashboard, and displays detailed camera information.

## Features

- **Interactive Map Visualization**: View all cameras on a coordinate-based map using React Flow
- **Real-time Updates**: WebSocket integration for live camera data updates
- **Insights Dashboard**: Overview of system health metrics
- **Detailed Camera Table**: Comprehensive view of all camera data
- **Tooltips**: Hover over camera nodes to see detailed information

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: TanStack Query (React Query)
- **Visualization**: React Flow
- **Styling**: Tailwind CSS
- **Backend**: Express.js + WebSocket (mock server)

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0 recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

You need to run both the frontend and backend server:

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
├── api/              # API service layer
│   ├── types.ts      # TypeScript interfaces
│   └── cameraService.ts  # REST API client
├── components/       # React components
│   ├── MapView.tsx   # Main map visualization
│   ├── CameraTooltip.tsx  # Tooltip component
│   ├── Dashboard.tsx # Insights dashboard
│   └── CameraTable.tsx    # Data table
├── hooks/            # Custom React hooks
│   ├── useCameraData.ts   # Camera data fetching
│   └── useWebSocket.ts    # WebSocket connection
├── pages/            # Page components
│   └── DashboardPage.tsx  # Main dashboard page
└── utils/            # Utility functions
    └── insights.ts   # Insight calculations

server/
├── server.ts         # Express + WebSocket server
└── seed.json         # Sample camera data
```

## Camera Data Structure

Each camera entry contains:
- `Position`: [X, Y] coordinates relative to starting point (0,0)
- `SegmentID`: Unique identifier for the camera
- `Water`: Water submersion percentage (0-1)
- `Light`: Light level (0-255 scale, normalized)
- `Status`: Camera status (OK, LOWLIGHT, WARNING)
- `ViewDescription`: Optional descriptive text

## Coordinate System

- Starting point: (0, 0)
- X > 0: Right of starting point
- Y > 0: Downward from starting point
- Negative values: Exit points (-1)

## Status Indicators

- **OK** (Green): Normal operation
- **LOWLIGHT** (Yellow): Insufficient lighting detected
- **WARNING** (Red): High water level or critical issue

## Development

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Future Improvements

- Historical data playback with time slider
- Alert thresholds configuration
- Auto-layout connections between segments
- Export insights to CSV
- Multi-camera comparison panel
- Authentication and user management

## Competition Notes

This application is designed for the Engineering Competition 2025 Programming Category. It demonstrates:

- Clean, maintainable code architecture
- Real-time data visualization
- Consumer-friendly interface
- REST API and WebSocket integration
- Responsive design with modern UI
