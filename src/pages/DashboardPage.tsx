import { useRef, useState } from "react";
import { useCameraData } from "../hooks/useCameraData";
import MapAndChartsLayout from "../components/MapAndChartsLayout";
import Dashboard from "../components/Dashboard";
import CameraTable from "../components/CameraTable";
import Header from "../components/Header";
import InsightsCard from "../components/InsightsCard";

export default function DashboardPage() {
  const { data, isLoading, error } = useCameraData();
  const pageRef = useRef<HTMLDivElement>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);

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
    <div className="bg-[#0F172A] min-h-screen text-[#F8FAFC]">
      <Header pageRef={pageRef} />
      <div ref={pageRef} className="py-1 px-6 space-y-6">
        <Dashboard cameras={data} />

        <MapAndChartsLayout
          cameras={data}
          selectedSegmentId={selectedSegmentId}
          onSegmentSelect={setSelectedSegmentId}
        />

        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InsightsCard cameras={data} selectedSegmentId={selectedSegmentId} />
            <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4">
              <CameraTable cameras={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

