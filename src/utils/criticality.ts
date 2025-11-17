import type { Camera } from "../api/types";

export interface CriticalityResult {
  finalLightSeverity: number;
  criticalityLevel: 1 | 2 | 3 | 4 | 5;
  rawLightValue: number;
  statusFactor: number;
  waterImpactFactor: number;
  overrideTriggered: boolean;
  overrideReason?: string;
}

const LIGHT_MAP: Record<number, number> = {
  1: 1.30,
  2: 1.05,
  3: 0.75,
  4: 0.45,
  5: 0.15,
};

const STATUS_FACTOR: Record<string, number> = {
  OK: 1.00,
  LOWLIGHT: 1.25,
  WARNING: 1.50,
};

function getWaterImpactFactor(water: number): number {
  if (water >= 0.0 && water < 0.2) return 1.00;
  if (water >= 0.2 && water < 0.5) return 1.10;
  if (water >= 0.5 && water < 0.8) return 1.25;
  if (water >= 0.8 && water <= 1.0) return 1.50;
  return 1.00;
}

function getCriticalityLevel(finalLight: number): 1 | 2 | 3 | 4 | 5 {
  if (finalLight >= 0.00 && finalLight < 0.30) return 5;
  if (finalLight >= 0.30 && finalLight < 0.60) return 4;
  if (finalLight >= 0.60 && finalLight < 0.90) return 3;
  if (finalLight >= 0.90 && finalLight < 1.20) return 2;
  return 1;
}

function checkHardOverrides(
  light: number,
  water: number,
  status: string
): { overrideTriggered: boolean; reason?: string } {
  if (water >= 0.85) {
    return { overrideTriggered: true, reason: "Water ≥ 0.85" };
  }
  if (status === "WARNING" && water > 0.40) {
    return { overrideTriggered: true, reason: "WARNING status with Water > 0.40" };
  }
  if (light === 1) {
    return { overrideTriggered: true, reason: "Light = 1 (darkest)" };
  }
  return { overrideTriggered: false };
}

export function calculateCriticality(
  light: number,
  water: number,
  status: string
): CriticalityResult {
  const rawLightValue = LIGHT_MAP[light] ?? 0.75;
  const statusFactor = STATUS_FACTOR[status] ?? 1.00;
  const adjustedLight = rawLightValue * statusFactor;
  const waterImpactFactor = getWaterImpactFactor(water);
  const finalLightSeverity = adjustedLight * waterImpactFactor;

  const override = checkHardOverrides(light, water, status);
  const criticalityLevel = override.overrideTriggered
    ? 1
    : getCriticalityLevel(finalLightSeverity);

  return {
    finalLightSeverity,
    criticalityLevel,
    rawLightValue,
    statusFactor,
    waterImpactFactor,
    overrideTriggered: override.overrideTriggered,
    overrideReason: override.reason,
  };
}

export function getCriticalityLabel(level: number): string {
  const labels: Record<number, string> = {
    1: "Critical",
    2: "Severe",
    3: "Moderate",
    4: "Minor",
    5: "Safe",
  };
  return labels[level] || "Unknown";
}

export function getCriticalityColor(level: number): string {
  const colors: Record<number, string> = {
    1: "#EF4444",
    2: "#F97316",
    3: "#FBBF24",
    4: "#3B82F6",
    5: "#10B981",
  };
  return colors[level] || "#94A3B8";
}

