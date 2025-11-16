import type { Camera } from "../api/types";

export default function CameraTooltip({ cam }: { cam: Camera }) {
  return (
    <div className="rounded border border-[#334155] bg-[#1E293B] p-3 shadow-lg text-sm min-w-[200px] text-[#F8FAFC]" style={{ boxShadow: "0 4px 6px rgba(56, 189, 248, 0.2)" }}>
      <div className="font-semibold text-base mb-2 text-[#F8FAFC]">Segment {cam.SegmentID}</div>
      <div className="space-y-1">
        <div>
          <span className="font-medium text-[#CBD5E1]">Status:</span>{" "}
          <span
            className={
              cam.Status === "WARNING"
                ? "text-[#EF4444]"
                : cam.Status === "LOWLIGHT"
                ? "text-[#FBBF24]"
                : "text-[#10B981]"
            }
          >
            {cam.Status}
          </span>
        </div>
        <div className="text-[#CBD5E1]">
          <span className="font-medium">Water:</span> {(cam.Water * 100).toFixed(1)}%
        </div>
        <div className="text-[#CBD5E1]">
          <span className="font-medium">Light:</span> {cam.Light.toFixed(2)}
        </div>
        <div className="text-[#CBD5E1]">
          <span className="font-medium">Position:</span> [{cam.Position[0].toFixed(2)}, {cam.Position[1].toFixed(2)}]
        </div>
        {cam.ViewDescription && (
          <div className="italic mt-2 pt-2 border-t border-[#334155] text-xs text-[#94A3B8]">
            {cam.ViewDescription}
          </div>
        )}
      </div>
    </div>
  );
}

