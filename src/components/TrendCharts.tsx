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
  const { chartData, segmentIds } = useMemo(() => {
    if (history.length === 0) return { chartData: [], segmentIds: [] };

    const last30Seconds = history.filter(
      (point) => !currentTime || point.timestamp >= currentTime - 30000
    );

    const statuses = ["OK", "LOWLIGHT", "WARNING"];
    
    if (selectedSegmentId !== null) {
      const data = last30Seconds.map((point) => {
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
      }).filter(Boolean);
      
      return { chartData: data, segmentIds: [selectedSegmentId] };
    } else {
      const allSegmentIds = new Set<number>();
      last30Seconds.forEach((point) => {
        point.cameras.forEach((c) => allSegmentIds.add(c.SegmentID));
      });
      const segmentIdsArray = Array.from(allSegmentIds).sort((a, b) => a - b);

      const data = last30Seconds.map((point) => {
        if (point.cameras.length === 0) return null;

        const result: any = {
          time: new Date(point.timestamp).toLocaleTimeString(),
          timestamp: point.timestamp,
        };

        const avgWater = point.cameras.reduce((sum, c) => sum + c.Water, 0) / point.cameras.length;
        const avgLight = point.cameras.reduce((sum, c) => sum + c.Light, 0) / point.cameras.length;
        
        result.avgWater = avgWater * 100;
        result.avgLight = avgLight;

        segmentIdsArray.forEach((segmentId) => {
          const camera = point.cameras.find((c) => c.SegmentID === segmentId);
          if (camera) {
            result[`water_${segmentId}`] = camera.Water * 100;
            result[`light_${segmentId}`] = camera.Light;
            result[`status_${segmentId}`] = statuses.indexOf(camera.Status);
          }
        });

        return result;
      }).filter(Boolean);

      return { chartData: data, segmentIds: segmentIdsArray };
    }
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
          {selectedSegmentId !== null ? "Water Level (%)" : "Water Level (%) - All Segments"}
        </h4>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={40} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            {selectedSegmentId !== null ? (
              <Line
                type="monotone"
                dataKey="water"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                name="Water %"
              />
            ) : (
              <>
                {segmentIds.map((segmentId) => (
                  <Line
                    key={segmentId}
                    type="monotone"
                    dataKey={`water_${segmentId}`}
                    stroke="#94a3b8"
                    strokeWidth={1}
                    dot={false}
                    name={`Seg ${segmentId}`}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="avgWater"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Average"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg p-2 shadow-sm">
        <h4 className="text-xs font-medium mb-1 text-gray-700">
          {selectedSegmentId !== null ? "Light Level" : "Light Level - All Segments"}
        </h4>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={40} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            {selectedSegmentId !== null ? (
              <Line
                type="monotone"
                dataKey="light"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                name="Light"
              />
            ) : (
              <>
                {segmentIds.map((segmentId) => (
                  <Line
                    key={segmentId}
                    type="monotone"
                    dataKey={`light_${segmentId}`}
                    stroke="#94a3b8"
                    strokeWidth={1}
                    dot={false}
                    name={`Seg ${segmentId}`}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="avgLight"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Average"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg p-2 shadow-sm">
        <h4 className="text-xs font-medium mb-1 text-gray-700">
          {selectedSegmentId !== null ? "Status Changes" : "Status Changes - All Segments"}
        </h4>
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
            {selectedSegmentId !== null ? (
              <Line
                type="stepAfter"
                dataKey="statusValue"
                stroke="#ef4444"
                strokeWidth={1.5}
                dot={false}
                name="Status"
              />
            ) : (
              segmentIds.map((segmentId) => (
                <Line
                  key={segmentId}
                  type="stepAfter"
                  dataKey={`status_${segmentId}`}
                  stroke="#94a3b8"
                  strokeWidth={1}
                  dot={false}
                  name={`Seg ${segmentId}`}
                />
              ))
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

