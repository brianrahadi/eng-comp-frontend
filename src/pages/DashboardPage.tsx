import { useRef, useState } from "react";
import { useCameraData } from "../hooks/useCameraData";
import MapAndChartsLayout from "../components/MapAndChartsLayout";
import Dashboard from "../components/Dashboard";
import CameraTable from "../components/CameraTable";
import Header from "../components/Header";
import InsightsCard from "../components/InsightsCard";
import InsightsPanel from "../components/InsightsPanel";
import InsightsPanelInline from "../components/InsightsPanelInline";

export default function DashboardPage() {
  const { data, isLoading, error } = useCameraData();
  const pageRef = useRef<HTMLDivElement>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

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
      <Header pageRef={pageRef} onCaptureStart={() => setIsCapturing(true)} onCaptureEnd={() => setIsCapturing(false)} cameras={data} />
      <div ref={pageRef} className="py-1 px-6 space-y-6">
        <Dashboard cameras={data} />

        <MapAndChartsLayout 
          cameras={data} 
          selectedSegmentId={selectedSegmentId}
          onSegmentSelect={setSelectedSegmentId}
        />

        {!isInsightsOpen && (
          <button
            onClick={() => setIsInsightsOpen(true)}
            className="fixed right-4 top-24 z-30 p-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full shadow-lg transition-colors"
            title="Open AI Insights"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        )}

        <InsightsPanel isOpen={isInsightsOpen} onClose={() => setIsInsightsOpen(false)} />

        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InsightsCard cameras={data} selectedSegmentId={selectedSegmentId} />
            <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4">
              <CameraTable cameras={data} />
            </div>
          </div>
        </div>

        {isCapturing && (
          <div className="w-full">
            <InsightsPanelInline />
          </div>
        )}
      </div>
    </div>
  );
}

