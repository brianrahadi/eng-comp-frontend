import type { Camera } from "../api/types";
import { computeInsights } from "../utils/insights";

export default function Dashboard({ cameras }: { cameras: Camera[] }) {
  const insights = computeInsights(cameras);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
      <div className="p-4 rounded-lg border border-[#334155] bg-[#1E293B]">
        <div className="text-sm text-[#94A3B8]">Total Cameras</div>
        <div className="text-2xl font-bold text-[#F8FAFC]">{insights.total}</div>
      </div>
      <div className="p-4 rounded-lg border border-[#334155] bg-[#1E293B]">
        <div className="text-sm text-[#94A3B8]">Avg Water Level</div>
        <div className="text-2xl font-bold text-[#3B82F6]">
          {(insights.avgWater * 100).toFixed(1)}%
        </div>
      </div>
      <div className="p-4 rounded-lg border border-[#334155] bg-[#1E293B]">
        <div className="text-sm text-[#94A3B8]">Low Light Cameras</div>
        <div className="text-2xl font-bold text-[#FBBF24]">
          {insights.lowlight}
        </div>
      </div>
      <div className="p-4 rounded-lg border border-[#334155] bg-[#1E293B]">
        <div className="text-sm text-[#94A3B8]">Warnings</div>
        <div className="text-2xl font-bold text-[#EF4444]">
          {insights.warnings}
        </div>
      </div>
    </div>
  );
}

