import { useCameraData } from "../hooks/useCameraData";
import MapView from "../components/MapView";
import Dashboard from "../components/Dashboard";
import CameraTable from "../components/CameraTable";

export default function DashboardPage() {
  const { data, isLoading, error } = useCameraData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading camera data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">
          Failed to load cameras. {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Sewer Camera Monitor</h1>
        <p className="text-gray-600 mt-1">
          Real-time monitoring of sewer pipe camera system status
        </p>
      </div>

      <Dashboard cameras={data} />

      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Camera Map</h2>
        <MapView cameras={data} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Camera Details</h2>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <CameraTable cameras={data} />
        </div>
      </div>
    </div>
  );
}

