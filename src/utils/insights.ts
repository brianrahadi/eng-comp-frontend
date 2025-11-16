import type { Camera } from "../api/types";

export function computeInsights(cams: Camera[]) {
  if (!cams?.length) {
    return { avgWater: 0, lowlight: 0, warnings: 0, total: 0 };
  }

  const avgWater = cams.reduce((sum, c) => sum + c.Water, 0) / cams.length;
  const lowlight = cams.filter((c) => c.Status === "LOWLIGHT").length;
  const warnings = cams.filter((c) => c.Status === "WARNING").length;

  return {
    avgWater,
    lowlight,
    warnings,
    total: cams.length,
  };
}

