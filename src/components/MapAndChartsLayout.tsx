import { useState, useEffect } from "react";
import MapView from "./MapView";
import TrendCharts from "./TrendCharts";
import PlaybackControls from "./PlaybackControls";
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

      <div className="space-y-2">
        <PlaybackControls
          timeRange={timeRange}
          currentTime={playbackTime}
          onTimeChange={setPlaybackTime}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
        {playbackTime !== null && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm text-yellow-800">
            ⏱ Playback Mode: Viewing historical data. Click "Live" to return to real-time.
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
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Camera Map</h2>
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
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Trend Charts</h2>
            <div className="bg-gray-50 rounded-lg h-[600px] overflow-y-auto">
              <TrendCharts
                selectedSegmentId={selectedSegmentId}
                history={history}
                currentTime={playbackTime}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

