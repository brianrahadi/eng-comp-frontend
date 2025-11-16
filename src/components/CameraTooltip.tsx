import type { Camera } from "../api/types";

export default function CameraTooltip({ cam }: { cam: Camera }) {
  return (
    <div className="rounded border bg-white p-3 shadow-lg text-sm min-w-[200px]">
      <div className="font-semibold text-base mb-2">Segment {cam.SegmentID}</div>
      <div className="space-y-1">
        <div>
          <span className="font-medium">Status:</span>{" "}
          <span
            className={
              cam.Status === "WARNING"
                ? "text-red-600"
                : cam.Status === "LOWLIGHT"
                ? "text-yellow-600"
                : "text-green-600"
            }
          >
            {cam.Status}
          </span>
        </div>
        <div>
          <span className="font-medium">Water:</span> {(cam.Water * 100).toFixed(1)}%
        </div>
        <div>
          <span className="font-medium">Light:</span> {cam.Light.toFixed(2)}
        </div>
        <div>
          <span className="font-medium">Position:</span> [{cam.Position[0].toFixed(2)}, {cam.Position[1].toFixed(2)}]
        </div>
        {cam.ViewDescription && (
          <div className="italic mt-2 pt-2 border-t text-xs text-gray-600">
            {cam.ViewDescription}
          </div>
        )}
      </div>
    </div>
  );
}

