import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Camera } from "../api/types";
import PlaybackControls from "./PlaybackControls";

interface TrendChartsProps {
  selectedSegmentId: number | null;
  history: Array<{ timestamp: number; cameras: Camera[] }>;
  currentTime: number | null;
  timeRange: { min: number; max: number };
  onTimeChange: (time: number | null) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export default function TrendCharts({
  selectedSegmentId,
  history,
  currentTime,
  timeRange,
  onTimeChange,
  isPlaying,
  onPlayPause,
}: TrendChartsProps) {
  const chartData = useMemo(() => {
    if (history.length === 0) return [];

    const last30Seconds = history.filter(
      (point) => !currentTime || point.timestamp >= currentTime - 30000
    );

    const statuses = ["OK", "LOWLIGHT", "WARNING"];
    
    return last30Seconds.map((point) => {
      if (selectedSegmentId !== null) {
        const camera = point.cameras.find((c) => c.SegmentID === selectedSegmentId);
        if (!camera) return null;

        return {
          time: new Date(point.timestamp).toLocaleTimeString(),
          timestamp: point.timestamp,
          water: camera.Water * 100,
          light: camera.Light,
          status: camera.Status,
          statusValue: statuses.indexOf(camera.Status),
        };
      } else {
        if (point.cameras.length === 0) return null;

        const avgWater = point.cameras.reduce((sum, c) => sum + c.Water, 0) / point.cameras.length;
        const avgLight = point.cameras.reduce((sum, c) => sum + c.Light, 0) / point.cameras.length;
        
        const warningCount = point.cameras.filter((c) => c.Status === "WARNING").length;
        const lowlightCount = point.cameras.filter((c) => c.Status === "LOWLIGHT").length;
        const okCount = point.cameras.filter((c) => c.Status === "OK").length;
        
        const dominantStatus = warningCount > 0 ? "WARNING" : lowlightCount > 0 ? "LOWLIGHT" : "OK";
        
        return {
          time: new Date(point.timestamp).toLocaleTimeString(),
          timestamp: point.timestamp,
          water: avgWater * 100,
          light: avgLight,
          status: dominantStatus,
          statusValue: statuses.indexOf(dominantStatus),
          warningCount,
          lowlightCount,
          okCount,
        };
      }
    }).filter(Boolean);
  }, [selectedSegmentId, history, currentTime]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold">
          {selectedSegmentId !== null
            ? `Segment ${selectedSegmentId} - Last 30 Seconds`
            : "All Segments - Last 30 Seconds"}
        </h3>
        {currentTime !== null && (
          <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-xs text-yellow-800">
            ⏱ Playback Mode
          </div>
        )}
      </div>

      <PlaybackControls
        timeRange={timeRange}
        currentTime={currentTime}
        onTimeChange={onTimeChange}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
      />

      <div className="bg-white rounded-lg p-2 shadow-sm">
        <h4 className="text-xs font-medium mb-1 text-gray-700">
          {selectedSegmentId !== null ? "Water Level (%)" : "Average Water Level (%)"}
        </h4>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={40} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            <Line
              type="monotone"
              dataKey="water"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={false}
              name={selectedSegmentId !== null ? "Water %" : "Avg Water %"}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg p-2 shadow-sm">
        <h4 className="text-xs font-medium mb-1 text-gray-700">
          {selectedSegmentId !== null ? "Light Level" : "Average Light Level"}
        </h4>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={40} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            <Line
              type="monotone"
              dataKey="light"
              stroke="#f59e0b"
              strokeWidth={1.5}
              dot={false}
              name={selectedSegmentId !== null ? "Light" : "Avg Light"}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg p-2 shadow-sm">
        <h4 className="text-xs font-medium mb-1 text-gray-700">Status Changes</h4>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis
              domain={[0, 3]}
              tick={{ fontSize: 10 }}
              width={40}
              tickFormatter={(value) => {
                const statuses = ["OK", "LOWLIGHT", "WARNING"];
                return statuses[value] || "";
              }}
            />
            <Tooltip
              formatter={(value: number) => {
                const statuses = ["OK", "LOWLIGHT", "WARNING"];
                return statuses[value] || "";
              }}
            />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            <Line
              type="stepAfter"
              dataKey="statusValue"
              stroke="#ef4444"
              strokeWidth={1.5}
              dot={false}
              name="Status"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

