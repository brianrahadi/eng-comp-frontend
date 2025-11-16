// criticalitySystem.ts

import type { 
  Camera, 
  CameraStatus, 
  SeverityResult, 
  SeverityLevel, 
  CameraWithSeverity 
} from './types';

/**
 * Calculate severity level based on INVERTED technical specification v2.0
 * INVERTED SCALE: Level 1 = Critical (worst), Level 5 = Safe (best)
 */
export function calculateSeverityLevel(camera: Camera): SeverityResult {
  const { Light: rawLight, Water: water, Status: status } = camera;
  
  // Step 1: Apply Status Sensitivity Factor
  const sensitivityFactor = getSensitivityFactor(status);
  const adjustedLight = rawLight * sensitivityFactor;
  
  // Step 2: Apply Water Factor
  const waterFactor = getWaterFactor(water);
  const finalLight = adjustedLight * waterFactor;
  
  // Step 3: Map to INVERTED Severity Level (5 = best, 1 = worst)
  const level = mapToInvertedSeverityLevel(finalLight);
  
  // Step 4: Get recommended action
  const action = getRecommendedAction(level, status, water);
  
  return {
    rawLight,
    adjustedLight,
    finalLight,
    waterFactor,
    sensitivityFactor,
    level,
    action,
    interpretation: getLevelInterpretation(level)
  };
}

/**
 * Get sensitivity factor based on camera status
 */
function getSensitivityFactor(status: CameraStatus): number {
  const factors: Record<CameraStatus, number> = {
    'OK': 1.0,
    'LOWLIGHT': 1.25,
    'WARNING': 1.5
  };
  return factors[status];
}

/**
 * Get water factor based on water submersion level
 */
function getWaterFactor(water: number): number {
  if (water >= 0.8) return 0.7;      // Full / lens submerged
  if (water >= 0.5) return 0.8;      // Moderate
  if (water >= 0.2) return 0.9;      // Partial
  return 1.0;                         // Dry / minimal
}

/**
 * Map final light value to INVERTED severity level (5 = best, 1 = worst)
 * Higher light = darker pipe = worse condition = LOWER level number
 */
function mapToInvertedSeverityLevel(finalLight: number): SeverityLevel {
  if (finalLight > 1.20) return 1;   // Critical / Dark (WORST)
  if (finalLight > 0.90) return 2;   // Severe
  if (finalLight > 0.60) return 3;   // Moderate
  if (finalLight > 0.30) return 4;   // Minor Obstruction
  return 5;                           // Safe / Clear (BEST)
}

/**
 * Get level interpretation (INVERTED SCALE)
 */
function getLevelInterpretation(level: SeverityLevel): string {
  const interpretations: Record<SeverityLevel, string> = {
    5: "Safe / Clear - Clean, reflective pipe",
    4: "Minor Obstruction - Early buildup",
    3: "Moderate - Noticeable accumulation",
    2: "Severe - Heavy buildup / partial restriction",
    1: "Critical / Dark - Major obstruction; immediate action"
  };
  return interpretations[level];
}

/**
 * Get recommended action based on INVERTED level, status, and water
 */
function getRecommendedAction(
  level: SeverityLevel, 
  status: CameraStatus, 
  water: number
): string {
  const actions: Record<SeverityLevel, string> = {
    5: "Log; routine monitoring",
    4: "Watch segment; re-inspect sooner",
    3: status !== 'OK' 
       ? "Maintenance queue; schedule cleaning; confirm reading due to camera status"
       : "Maintenance queue; schedule cleaning",
    2: status !== 'OK'
       ? "High-priority cleaning; confirm reading if sensor unreliable"
       : "High-priority cleaning within days",
    1: "Immediate dispatch; escalate operations; act even if status LOWLIGHT/WARNING"
  };
  return actions[level];
}

/**
 * Get all cameras with severity levels
 */
export function analyzeCamerasWithSeverity(cameras: Camera[]): CameraWithSeverity[] {
  return cameras.map(camera => ({
    ...camera,
    severity: calculateSeverityLevel(camera)
  }));
}

/**
 * Get critical areas (Level 1-3) - INVERTED: Lower numbers are worse
 */
export function getCriticalAreas(cameras: Camera[]): CameraWithSeverity[] {
  const analyzed = analyzeCamerasWithSeverity(cameras);
  return analyzed.filter(cam => cam.severity.level <= 3);
}

/**
 * Get immediate action required (Level 1-2) - INVERTED
 */
export function getImmediateActionRequired(cameras: Camera[]): CameraWithSeverity[] {
  const analyzed = analyzeCamerasWithSeverity(cameras);
  return analyzed.filter(cam => cam.severity.level <= 2);
}

/**
 * Get safe/good cameras (Level 4-5) - INVERTED
 */
export function getSafeCameras(cameras: Camera[]): CameraWithSeverity[] {
  const analyzed = analyzeCamerasWithSeverity(cameras);
  return analyzed.filter(cam => cam.severity.level >= 4);
}

/**
 * Get color for INVERTED severity level (1 = worst/red, 5 = best/green)
 */
export function getSeverityColor(level: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    1: '#991B1B',  // Dark Red - Critical (WORST)
    2: '#DC2626',  // Red - Severe
    3: '#EA580C',  // Orange - Moderate
    4: '#CA8A04',  // Yellow - Minor
    5: '#16A34A'   // Green - Safe (BEST)
  };
  return colors[level];
}

/**
 * Get background color for INVERTED severity level
 */
export function getSeverityBgColor(level: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    1: '#FEE2E2',  // Light Red - Critical
    2: '#FEE2E2',  // Light Red - Severe
    3: '#FFEDD5',  // Light Orange - Moderate
    4: '#FEF9C3',  // Light Yellow - Minor
    5: '#DCFCE7'   // Light Green - Safe
  };
  return colors[level];
}

/**
 * Get icon for INVERTED severity level
 */
export function getSeverityIcon(level: SeverityLevel): string {
  const icons: Record<SeverityLevel, string> = {
    1: '🔴',  // Critical (worst)
    2: '🚨',  // Severe
    3: '⚠️',  // Moderate
    4: '⚡',  // Minor
    5: '✅'   // Safe (best)
  };
  return icons[level];
}

/**
 * Calculate system health percentage (INVERTED AWARE)
 * Higher percentage = better system health
 * 
 * FIXED: TypeScript error with reduce - explicitly type accumulator as number
 */
export function calculateSystemHealth(cameras: Camera[]): number {
  if (!cameras || cameras.length === 0) return 0;
  
  const analyzed = analyzeCamerasWithSeverity(cameras);
  
  // Weight: Level 5 = 100%, Level 4 = 75%, Level 3 = 50%, Level 2 = 25%, Level 1 = 0%
  const weights: Record<SeverityLevel, number> = {
    5: 100,
    4: 75,
    3: 50,
    2: 25,
    1: 0
  };
  
  // FIXED: Add <number> generic to reduce to explicitly type the accumulator
  const totalScore = analyzed.reduce<number>((sum, cam) => sum + weights[cam.severity.level], 0);
  const maxScore = cameras.length * 100;
  
  return (totalScore / maxScore) * 100;
}