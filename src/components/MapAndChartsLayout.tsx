import { useState, useEffect } from "react";
import MapView from "./MapView";
import TrendCharts from "./TrendCharts";
import type { Camera } from "../api/types";
import { useHistoricalData } from "../hooks/useHistoricalData";

interface MapAndChartsLayoutProps {
  cameras: Camera[];
}

type Tab = "map" | "charts" | "both";

export default function MapAndChartsLayout({ cameras }: MapAndChartsLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>("both");
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);
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
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("map")}
          className={`px-4 py-2 font-medium ${
            activeTab === "map"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setActiveTab("charts")}
          className={`px-4 py-2 font-medium ${
            activeTab === "charts"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Charts
        </button>
        <button
          onClick={() => setActiveTab("both")}
          className={`px-4 py-2 font-medium ${
            activeTab === "both"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
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
              onSegmentSelect={setSelectedSegmentId}
              isPlaybackMode={playbackTime !== null}
            />
          </div>
        )}

        {(activeTab === "charts" || activeTab === "both") && (
          <div>
            <div className="bg-gray-50 rounded-lg h-[600px] overflow-y-auto">
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

