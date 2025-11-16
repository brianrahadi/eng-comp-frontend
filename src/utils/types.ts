// types.ts

export interface Camera {
  Position: [number, number];
  SegmentID: number;
  Water: number;
  Light: number;
  Status: CameraStatus;
  ViewDescription?: string;
}

export type CameraStatus = 'OK' | 'LOWLIGHT' | 'WARNING';

export interface SeverityResult {
  rawLight: number;
  adjustedLight: number;
  finalLight: number;
  waterFactor: number;
  sensitivityFactor: number;
  level: SeverityLevel;
  action: string;
  interpretation: string;
}

// INVERTED SCALE: Level 5 = Best (Safe), Level 1 = Worst (Critical)
export type SeverityLevel = 1 | 2 | 3 | 4 | 5;

export interface CameraWithSeverity extends Camera {
  severity: SeverityResult;
}

export interface FilterOptions {
  status?: CameraStatus | 'ALL';
  waterMin?: number;
  waterMax?: number;
  lightMin?: number;
  lightMax?: number;
  severityLevel?: SeverityLevel;
  maxSeverity?: SeverityLevel; // Show cameras at or below this level (worse conditions)
  minSeverity?: SeverityLevel; // Show cameras at or above this level (better conditions)
  searchId?: string;
}

export interface FilterPreset {
  name: string;
  filters: FilterOptions;
}

export interface AIAnalysisResult {
  success: boolean;
  analysis?: string;
  summary?: SystemSummary;
  criticalCameras?: CameraDetail[];
  timestamp?: string;
  error?: string;
  fallback?: Insight[];
}

export interface SystemSummary {
  total: number;
  critical: number;
  severe: number;
  statusBreakdown: {
    OK: number;
    LOWLIGHT: number;
    WARNING: number;
  };
  averageWater: string;
  averageLight: string;
  systemHealth: number;
}

export interface CameraDetail {
  id: number;
  position: [number, number];
  water: string;
  light: string;
  status: CameraStatus;
  severityLevel: SeverityLevel;
  interpretation: string;
  action: string;
  adjustedLight: string;
  finalLight: string;
  notes: string;
}

export interface Insight {
  type: string;
  priority: number;
  message: string;
  cameras?: number[];
  action: string;
}