import type { Camera } from "../api/types";
import { computeInsights } from "../utils/insights";

export default function Dashboard({ cameras }: { cameras: Camera[] }) {
  const insights = computeInsights(cameras);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
      <div className="p-4 rounded-lg border bg-white shadow-sm">
        <div className="text-sm text-gray-600">Total Cameras</div>
        <div className="text-2xl font-bold">{insights.total}</div>
      </div>
      <div className="p-4 rounded-lg border bg-white shadow-sm">
        <div className="text-sm text-gray-600">Avg Water Level</div>
        <div className="text-2xl font-bold text-blue-600">
          {(insights.avgWater * 100).toFixed(1)}%
        </div>
      </div>
      <div className="p-4 rounded-lg border bg-white shadow-sm">
        <div className="text-sm text-gray-600">Low Light Cameras</div>
        <div className="text-2xl font-bold text-yellow-600">
          {insights.lowlight}
        </div>
      </div>
      <div className="p-4 rounded-lg border bg-white shadow-sm">
        <div className="text-sm text-gray-600">Warnings</div>
        <div className="text-2xl font-bold text-red-600">
          {insights.warnings}
        </div>
      </div>
    </div>
  );
}

