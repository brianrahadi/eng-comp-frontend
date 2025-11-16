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
      <div className="flex gap-2 border-b border-[#334155]">
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

