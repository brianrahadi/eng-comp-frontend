import { useState, useMemo } from "react";
import type { Camera } from "../api/types";
import { calculateCriticality, getCriticalityLabel, getCriticalityColor } from "../utils/criticality";

function getStatusBadgeColor(status: Camera["Status"]): string {
  if (status === "WARNING") return "bg-[#7F1D1D] text-[#EF4444]";
  if (status === "LOWLIGHT") return "bg-[#B45309] text-[#FBBF24]";
  return "bg-[#065F46] text-[#10B981]";
}

type SortColumn = "SegmentID" | "Criticality" | "Water" | "Light" | "Status" | "Position" | null;
type SortDirection = "asc" | "desc" | null;

export default function CameraTable({ cameras }: { cameras: Camera[] }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedCameras = useMemo(() => {
    if (!sortColumn || !sortDirection) return cameras;

    const sorted = [...cameras].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "SegmentID":
          comparison = a.SegmentID - b.SegmentID;
          break;
        case "Criticality": {
          const critA = calculateCriticality(a.Light ?? 3, a.Water, a.Status);
          const critB = calculateCriticality(b.Light ?? 3, b.Water, b.Status);
          comparison = critA.criticalityLevel - critB.criticalityLevel;
          break;
        }
        case "Water":
          comparison = a.Water - b.Water;
          break;
        case "Light":
          comparison = (a.Light ?? 3) - (b.Light ?? 3);
          break;
        case "Status": {
          const statusOrder: Record<string, number> = { OK: 0, LOWLIGHT: 1, WARNING: 2 };
          comparison = statusOrder[a.Status] - statusOrder[b.Status];
          break;
        }
        case "Position": {
          const posA = a.Position[0] + a.Position[1];
          const posB = b.Position[0] + b.Position[1];
          comparison = posA - posB;
          break;
        }
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [cameras, sortColumn, sortDirection]);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#334155] border-b border-[#475569]">
            <th
              className="p-3 text-left font-semibold text-[#F8FAFC] cursor-pointer hover:bg-[#475569] select-none"
              onClick={() => handleSort("SegmentID")}
            >
              <div className="flex items-center gap-2">
                ID
                {sortColumn === "SegmentID" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="p-3 text-left font-semibold text-[#F8FAFC] cursor-pointer hover:bg-[#475569] select-none"
              onClick={() => handleSort("Criticality")}
            >
              <div className="flex items-center gap-2">
                Criticality
                {sortColumn === "Criticality" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="p-3 text-left font-semibold text-[#F8FAFC] cursor-pointer hover:bg-[#475569] select-none"
              onClick={() => handleSort("Water")}
            >
              <div className="flex items-center gap-2">
                Water %
                {sortColumn === "Water" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="p-3 text-left font-semibold text-[#F8FAFC] cursor-pointer hover:bg-[#475569] select-none"
              onClick={() => handleSort("Light")}
            >
              <div className="flex items-center gap-2">
                Light (1-5)
                {sortColumn === "Light" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="p-3 text-left font-semibold text-[#F8FAFC] cursor-pointer hover:bg-[#475569] select-none"
              onClick={() => handleSort("Status")}
            >
              <div className="flex items-center gap-2">
                Status
                {sortColumn === "Status" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="p-3 text-left font-semibold text-[#F8FAFC] cursor-pointer hover:bg-[#475569] select-none"
              onClick={() => handleSort("Position")}
            >
              <div className="flex items-center gap-2">
                Position
                {sortColumn === "Position" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCameras.map((c) => {
            const criticality = calculateCriticality(c.Light ?? 3, c.Water, c.Status);
            return (
              <tr key={c.SegmentID} className="border-b border-[#334155] hover:bg-[#334155]">
                <td className="p-3 font-medium text-[#F8FAFC]">{c.SegmentID}</td>
                <td className="p-3">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${getCriticalityColor(criticality.criticalityLevel)}20`,
                      color: getCriticalityColor(criticality.criticalityLevel),
                      border: `1px solid ${getCriticalityColor(criticality.criticalityLevel)}`,
                    }}
                  >
                    Level {criticality.criticalityLevel} - {getCriticalityLabel(criticality.criticalityLevel)}
                  </span>
                </td>
                <td className="p-3 text-[#CBD5E1]">{(c.Water * 100).toFixed(1)}%</td>
                <td className="p-3 text-[#CBD5E1]">{c.Light ?? 3}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                      c.Status
                    )}`}
                  >
                    {c.Status}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs text-[#94A3B8]">
                  [{c.Position[0].toFixed(2)}, {c.Position[1].toFixed(2)}]
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

