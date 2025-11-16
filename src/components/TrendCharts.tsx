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

interface TrendChartsProps {
  selectedSegmentId: number | null;
  history: Array<{ timestamp: number; cameras: Camera[] }>;
  currentTime: number | null;
}

export default function TrendCharts({
  selectedSegmentId,
  history,
  currentTime,
}: TrendChartsProps) {
  const chartData = useMemo(() => {
    if (!selectedSegmentId || history.length === 0) return [];

    const last30Seconds = history.filter(
      (point) => !currentTime || point.timestamp >= currentTime - 30000
    );

    const statuses = ["OK", "LOWLIGHT", "WARNING"];
    return last30Seconds.map((point) => {
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
  }, [selectedSegmentId, history, currentTime]);

  if (!selectedSegmentId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a camera node to view trends
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available for the selected camera
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Segment {selectedSegmentId} - Last 30 Seconds
        </h3>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-medium mb-3 text-gray-700">Water Level (%)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="water"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Water %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-medium mb-3 text-gray-700">Light Level</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="light"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Light"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-medium mb-3 text-gray-700">Status Changes</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              domain={[0, 3]}
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
            <Legend />
            <Line
              type="stepAfter"
              dataKey="statusValue"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Status"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

