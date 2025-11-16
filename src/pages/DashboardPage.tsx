import { useCameraData } from "../hooks/useCameraData";
import MapAndChartsLayout from "../components/MapAndChartsLayout";
import Dashboard from "../components/Dashboard";
import CameraTable from "../components/CameraTable";

export default function DashboardPage() {
  const { data, isLoading, error } = useCameraData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F172A]">
        <div className="text-lg text-[#F8FAFC]">Loading camera data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F172A]">
        <div className="text-lg text-[#EF4444]">
          Failed to load cameras. {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#0F172A] min-h-screen text-[#F8FAFC]">
      <div>
        <h1 className="text-3xl font-bold">
          <span className="text-xl text-[#F8FAFC]">PipeWatch</span>
          <span className="text-sm text-[#94A3B8]">
            &nbsp;- Real-time monitoring of sewer pipe camera system status
          </span>
        </h1>
      </div>

      <Dashboard cameras={data} />

      <MapAndChartsLayout cameras={data} />

      <div>
        <h2 className="text-xl font-semibold mb-3 text-[#F8FAFC]">Camera Details</h2>
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4">
          <CameraTable cameras={data} />
        </div>
      </div>
    </div>
  );
}

