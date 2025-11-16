import type { Camera } from "../api/types";

function getStatusBadgeColor(status: Camera["Status"]): string {
  if (status === "WARNING") return "bg-[#7F1D1D] text-[#EF4444]";
  if (status === "LOWLIGHT") return "bg-[#B45309] text-[#FBBF24]";
  return "bg-[#065F46] text-[#10B981]";
}

export default function CameraTable({ cameras }: { cameras: Camera[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#334155] border-b border-[#475569]">
            <th className="p-3 text-left font-semibold text-[#F8FAFC]">Segment ID</th>
            <th className="p-3 text-left font-semibold text-[#F8FAFC]">Water %</th>
            <th className="p-3 text-left font-semibold text-[#F8FAFC]">Light</th>
            <th className="p-3 text-left font-semibold text-[#F8FAFC]">Status</th>
            <th className="p-3 text-left font-semibold text-[#F8FAFC]">Position (X, Y)</th>
          </tr>
        </thead>
        <tbody>
          {cameras.map((c) => (
            <tr key={c.SegmentID} className="border-b border-[#334155] hover:bg-[#334155]">
              <td className="p-3 font-medium text-[#F8FAFC]">{c.SegmentID}</td>
              <td className="p-3 text-[#CBD5E1]">{(c.Water * 100).toFixed(1)}%</td>
              <td className="p-3 text-[#CBD5E1]">{c.Light.toFixed(2)}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

