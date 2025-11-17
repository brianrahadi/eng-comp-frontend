import { useState, useEffect } from "react";
import MapView from "./MapView";
import TrendCharts from "./TrendCharts";
import type { Camera } from "../api/types";
import { useHistoricalData } from "../hooks/useHistoricalData";

interface MapAndChartsLayoutProps {
  cameras: Camera[];
  selectedSegmentId: number | null;
  onSegmentSelect: (segmentId: number | null) => void;
}

type Tab = "map" | "charts" | "both";

export default function MapAndChartsLayout({ 
  cameras, 
  selectedSegmentId, 
  onSegmentSelect 
}: MapAndChartsLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>("both");
  const [playbackTime, setPlaybackTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { history, getDataAtTime, getTimeRange } = useHistoricalData(cameras);

  const timeRange = getTimeRange();

  useEffect(() => {
    if (!isPlaying) return;

    if (playbackTime === null) {
      setPlaybackTime(timeRange.min);
      return;
    }

    const interval = setInterval(() => {
      setPlaybackTime((prev) => {
        if (prev === null) return timeRange.min;
        const next = prev + 2000;
        if (next > timeRange.max) {
          setIsPlaying(false);
          return timeRange.max;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, playbackTime, timeRange]);

  const displayCameras = playbackTime !== null
    ? getDataAtTime(playbackTime) || cameras
    : cameras;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#334155] pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("map")}
            className={`px-4 py-2 font-medium ${
              activeTab === "map"
                ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                : "text-[#94A3B8] hover:text-[#CBD5E1]"
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`px-4 py-2 font-medium ${
              activeTab === "charts"
                ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                : "text-[#94A3B8] hover:text-[#CBD5E1]"
            }`}
          >
            Charts
          </button>
          <button
            onClick={() => setActiveTab("both")}
            className={`px-4 py-2 font-medium ${
              activeTab === "both"
                ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                : "text-[#94A3B8] hover:text-[#CBD5E1]"
            }`}
          >
            Both
          </button>
        </div>
        {activeTab === "both" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#94A3B8] mr-1">Segments:</span>
            <button
              onClick={() => onSegmentSelect(null)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs transition-all ${
                selectedSegmentId === null
                  ? "bg-[#3B82F6] text-white border-2 border-[#60A5FA] shadow-lg"
                  : "bg-[#334155] text-[#CBD5E1] border border-[#475569] hover:bg-[#475569]"
              }`}
              title="Show all segments"
            >
              All
            </button>
            {cameras
              .map(c => c.SegmentID)
              .sort((a, b) => a - b)
              .map(segmentId => (
                <button
                  key={segmentId}
                  onClick={() => onSegmentSelect(segmentId === selectedSegmentId ? null : segmentId)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs transition-all ${
                    selectedSegmentId === segmentId
                      ? "bg-[#3B82F6] text-white border-2 border-[#60A5FA] shadow-lg"
                      : "bg-[#334155] text-[#CBD5E1] border border-[#475569] hover:bg-[#475569]"
                  }`}
                  title={`Select segment ${segmentId}`}
                >
                  {segmentId}
                </button>
              ))}
          </div>
        )}
      </div>

      <div
        className={`grid gap-4 ${
          activeTab === "both"
            ? "grid-cols-1 lg:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {(activeTab === "map" || activeTab === "both") && (
          <div>
            <MapView
              cameras={displayCameras}
              selectedSegmentId={selectedSegmentId}
              onSegmentSelect={onSegmentSelect}
              isPlaybackMode={playbackTime !== null}
            />
          </div>
        )}

        {(activeTab === "charts" || activeTab === "both") && (
          <div>
            <div className="bg-[#1E293B] rounded-lg border border-[#334155]">
              <TrendCharts
                selectedSegmentId={selectedSegmentId}
                history={history}
                currentTime={playbackTime}
                timeRange={timeRange}
                onTimeChange={setPlaybackTime}
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

