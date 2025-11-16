// filterSystem.ts

import type { 
  Camera, 
  FilterOptions, 
  FilterPreset, 
  CameraWithSeverity 
} from './types';
import { analyzeCamerasWithSeverity } from './criticalitySystem';

/**
 * Filter cameras by multiple criteria (INVERTED AWARE)
 */
export function filterCameras(cameras: Camera[], filters: FilterOptions): Camera[] {
  let filtered: Camera[] = [...cameras];
  
  // Filter by status
  if (filters.status && filters.status !== 'ALL') {
    filtered = filtered.filter(cam => cam.Status === filters.status);
  }
  
  // Filter by water level
  if (filters.waterMin !== undefined) {
    filtered = filtered.filter(cam => cam.Water >= filters.waterMin!);
  }
  if (filters.waterMax !== undefined) {
    filtered = filtered.filter(cam => cam.Water <= filters.waterMax!);
  }
  
  // Filter by light intensity
  if (filters.lightMin !== undefined) {
    filtered = filtered.filter(cam => cam.Light >= filters.lightMin!);
  }
  if (filters.lightMax !== undefined) {
    filtered = filtered.filter(cam => cam.Light <= filters.lightMax!);
  }
  
  // Filter by exact severity level
  if (filters.severityLevel) {
    const analyzed = analyzeCamerasWithSeverity(filtered);
    filtered = analyzed.filter(cam => cam.severity.level === filters.severityLevel);
  }
  
  // Filter by max severity (show worse conditions: level <= maxSeverity)
  // INVERTED: Lower numbers = worse, so maxSeverity of 2 shows levels 1-2
  if (filters.maxSeverity) {
    const analyzed = analyzeCamerasWithSeverity(filtered);
    filtered = analyzed.filter(cam => cam.severity.level <= filters.maxSeverity!);
  }
  
  // Filter by min severity (show better conditions: level >= minSeverity)
  // INVERTED: Higher numbers = better, so minSeverity of 4 shows levels 4-5
  if (filters.minSeverity) {
    const analyzed = analyzeCamerasWithSeverity(filtered);
    filtered = analyzed.filter(cam => cam.severity.level >= filters.minSeverity!);
  }
  
  // Search by camera ID
  if (filters.searchId) {
    filtered = filtered.filter(cam => 
      cam.SegmentID.toString().includes(filters.searchId!.toString())
    );
  }
  
  return filtered;
}

/**
 * Predefined filter presets (INVERTED AWARE)
 */
export const FILTER_PRESETS: Record<string, FilterPreset> = {
  criticalOnly: {
    name: "Critical Areas Only (Level 1-3)",
    filters: { maxSeverity: 3 }  // INVERTED: Show levels 1, 2, 3 (worse conditions)
  },
  immediateAction: {
    name: "Immediate Action Required (Level 1-2)",
    filters: { maxSeverity: 2 }  // INVERTED: Show levels 1, 2 (worst conditions)
  },
  safeCameras: {
    name: "Safe Cameras (Level 4-5)",
    filters: { minSeverity: 4 }  // INVERTED: Show levels 4, 5 (best conditions)
  },
  highWater: {
    name: "High Water (>80%)",
    filters: { waterMin: 0.8 }
  },
  moderateWater: {
    name: "Moderate Water (50-80%)",
    filters: { waterMin: 0.5, waterMax: 0.8 }
  },
  highLight: {
    name: "High Light / Dark Pipes (>0.6)",
    filters: { lightMin: 0.6 }  // Higher light = darker pipes
  },
  warningStatus: {
    name: "Warning Status",
    filters: { status: 'WARNING' }
  },
  lowlightStatus: {
    name: "Low Light Status",
    filters: { status: 'LOWLIGHT' }
  },
  unreliableCameras: {
    name: "Unreliable Cameras (LOWLIGHT/WARNING)",
    filters: { status: 'WARNING' }  // Can be expanded
  }
};

/**
 * Apply preset filter
 */
export function applyPreset(cameras: Camera[], presetKey: string): Camera[] {
  const preset = FILTER_PRESETS[presetKey];
  if (!preset) return cameras;
  return filterCameras(cameras, preset.filters);
}

/**
 * Get filter preset keys
 */
export function getPresetKeys(): string[] {
  return Object.keys(FILTER_PRESETS);
}