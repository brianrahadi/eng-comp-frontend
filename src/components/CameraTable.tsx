import type { Camera } from "../api/types";

function getStatusBadgeColor(status: Camera["Status"]): string {
  if (status === "WARNING") return "bg-red-100 text-red-800";
  if (status === "LOWLIGHT") return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
}

export default function CameraTable({ cameras }: { cameras: Camera[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-3 text-left font-semibold">Segment ID</th>
            <th className="p-3 text-left font-semibold">Water %</th>
            <th className="p-3 text-left font-semibold">Light</th>
            <th className="p-3 text-left font-semibold">Status</th>
            <th className="p-3 text-left font-semibold">Position (X, Y)</th>
          </tr>
        </thead>
        <tbody>
          {cameras.map((c) => (
            <tr key={c.SegmentID} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{c.SegmentID}</td>
              <td className="p-3">{(c.Water * 100).toFixed(1)}%</td>
              <td className="p-3">{c.Light.toFixed(2)}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                    c.Status
                  )}`}
                >
                  {c.Status}
                </span>
              </td>
              <td className="p-3 font-mono text-xs">
                [{c.Position[0].toFixed(2)}, {c.Position[1].toFixed(2)}]
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

