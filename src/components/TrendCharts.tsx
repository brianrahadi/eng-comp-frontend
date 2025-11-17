import { useMemo, useState } from "react";
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
import { SEGMENT_COLORS, getSegmentColor } from "../utils/colors";

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
  const [hoveredSegmentId, setHoveredSegmentId] = useState<number | null>(null);
  const [clickedSegmentId, setClickedSegmentId] = useState<number | null>(null);

  const activeSegmentId = clickedSegmentId ?? hoveredSegmentId;

  const formatWaterTooltip = (value: number) => {
    if (value === null || value === undefined) return value;
    return `${Number(value).toFixed(2)}%`;
  };

  const formatLightTooltip = (value: number) => {
    if (value === null || value === undefined) return value;
    return `${Number(value).toFixed(1)}/5`;
  };

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
      <div className="flex items-center justify-center h-full text-[#94A3B8]">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-3" style={{ position: "relative", zIndex: 1, backgroundColor: "#0F172A"}}>
      <PlaybackControls
        timeRange={timeRange}
        currentTime={currentTime}
        onTimeChange={onTimeChange}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
      />
      
      {clickedSegmentId !== null && selectedSegmentId === null && (
        <div className="bg-[#1E3A8A] border border-[#3B82F6] rounded px-3 py-2 text-xs text-[#3B82F6] flex items-center justify-between">
          <span>Showing Seg {clickedSegmentId} and Average. Click again to show all.</span>
          <button
            onClick={() => setClickedSegmentId(null)}
            className="text-[#60A5FA] hover:text-[#93C5FD] underline"
          >
            Show All
          </button>
        </div>
      )}

      <div className="bg-[#334155] rounded-lg p-2 border border-[#475569]" style={{ position: "relative" }}>
        <h4 className="text-xs font-medium mb-1 text-[#F8FAFC]">
          {selectedSegmentId !== null ? "Water Level (%)" : "Water Level (%) - All Segments"}
        </h4>
        <ResponsiveContainer width="100%" height={120} style={{ position: "relative" }}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94A3B8" }} stroke="#64748B" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} width={40} stroke="#64748B" />
            <Tooltip
              formatter={(value: number) => formatWaterTooltip(value)}
            />
            <Legend wrapperStyle={{ fontSize: "10px", color: "#F8FAFC" }} />
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
                {segmentIds.map((segmentId) => {
                  const isActive = activeSegmentId === segmentId || activeSegmentId === null;
                  const color = getSegmentColor(segmentId);
                  return (
                    <Line
                      key={segmentId}
                      type="monotone"
                      dataKey={`water_${segmentId}`}
                      stroke={color}
                      strokeWidth={isActive ? 1.5 : 0.5}
                      strokeOpacity={isActive ? 1 : 0.2}
                      dot={false}
                      name={`Seg ${segmentId}`}
                      onMouseEnter={() => setHoveredSegmentId(segmentId)}
                      onMouseLeave={() => setHoveredSegmentId(null)}
                      onClick={() => setClickedSegmentId(clickedSegmentId === segmentId ? null : segmentId)}
                      style={{ cursor: "pointer" }}
                    />
                  );
                })}
                <Line
                  type="monotone"
                  dataKey="avgWater"
                  stroke="#000000"
                  strokeWidth={2}
                  dot={false}
                  name="Average"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#334155] rounded-lg p-2 border border-[#475569]" style={{ position: "relative" }}>
        <h4 className="text-xs font-medium mb-1 text-[#F8FAFC]">
          {selectedSegmentId !== null ? "Light Level" : "Light Level - All Segments"}
        </h4>
        <ResponsiveContainer width="100%" height={120} style={{ position: "relative" }}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94A3B8" }} stroke="#64748B" />
            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} width={40} stroke="#64748B" />
            <Tooltip
              formatter={(value: number) => formatLightTooltip(value)}
            />
            <Legend wrapperStyle={{ fontSize: "10px", color: "#F8FAFC" }} />
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
                {segmentIds.map((segmentId) => {
                  const isActive = activeSegmentId === segmentId || activeSegmentId === null;
                  const color = getSegmentColor(segmentId);
                  return (
                    <Line
                      key={segmentId}
                      type="monotone"
                      dataKey={`light_${segmentId}`}
                      stroke={color}
                      strokeWidth={isActive ? 1.5 : 0.5}
                      strokeOpacity={isActive ? 1 : 0.2}
                      dot={false}
                      name={`Seg ${segmentId}`}
                      onMouseEnter={() => setHoveredSegmentId(segmentId)}
                      onMouseLeave={() => setHoveredSegmentId(null)}
                      onClick={() => setClickedSegmentId(clickedSegmentId === segmentId ? null : segmentId)}
                      style={{ cursor: "pointer" }}
                    />
                  );
                })}
                <Line
                  type="monotone"
                  dataKey="avgLight"
                  stroke="#000000"
                  strokeWidth={2}
                  dot={false}
                  name="Average"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#334155] rounded-lg p-2 border border-[#475569]" style={{ position: "relative" }}>
        <h4 className="text-xs font-medium mb-1 text-[#F8FAFC]">
          {selectedSegmentId !== null ? "Status Changes" : "Status Changes - All Segments"}
        </h4>
        <ResponsiveContainer width="100%" height={120} style={{ position: "relative" }}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94A3B8" }} stroke="#64748B" />
            <YAxis
              domain={[0, 3]}
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              width={40}
              stroke="#64748B"
              tickFormatter={(value) => {
                const statuses = ["OK", "LOWLIGHT", "WARNING"];
                return statuses[value] || "";
              }}
            />
            <Tooltip
              // contentStyle={{
              //   zIndex: 9999,
              //   opacity: 1,
              //   backgroundColor: "rgba(255, 255, 255, 1)",
              //   border: "1px solid #ccc",
              //   boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              //   pointerEvents: "auto",
              // }}
              wrapperStyle={{
                zIndex: 2,
                pointerEvents: "none",
              }}
              formatter={(value: number) => {
                const statuses = ["OK", "LOWLIGHT", "WARNING"];
                return statuses[value] || "";
              }}
            />
            <Legend wrapperStyle={{ fontSize: "10px", color: "#F8FAFC" }} />
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
              segmentIds.map((segmentId) => {
                const isActive = activeSegmentId === segmentId || activeSegmentId === null;
                const color = SEGMENT_COLORS[segmentId % SEGMENT_COLORS.length];
                return (
                  <Line
                    key={segmentId}
                    type="stepAfter"
                    dataKey={`status_${segmentId}`}
                    stroke={color}
                    strokeWidth={isActive ? 1.5 : 0.5}
                    strokeOpacity={isActive ? 1 : 0.2}
                    dot={false}
                    name={`Seg ${segmentId}`}
                    onMouseEnter={() => setHoveredSegmentId(segmentId)}
                    onMouseLeave={() => setHoveredSegmentId(null)}
                    onClick={() => setClickedSegmentId(clickedSegmentId === segmentId ? null : segmentId)}
                    style={{ cursor: "pointer" }}
                  />
                );
              })
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

