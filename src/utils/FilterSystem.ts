// filterSystem.ts

import type { 
  Camera, 
  FilterOptions, 
  FilterPreset, 
  CameraWithSeverity 
} from './types';
import { analyzeCamerasWithSeverity } from './criticalitySystem';

/**
 * Keywords for description-based filtering
 */
const URGENCY_KEYWORDS = ['urgent', 'emergency', 'immediate', 'critical', 'severe', 'backup', 'overflow'];
const OBSTRUCTION_KEYWORDS = ['blockage', 'clog', 'debris', 'obstruction', 'restricted', 'blocked'];
const STRUCTURAL_KEYWORDS = ['crack', 'collapse', 'breach', 'root', 'damage', 'broken', 'fracture'];
const BUILDUP_KEYWORDS = ['grease', 'sediment', 'scale', 'buildup', 'accumulation', 'deposit'];
const FLOW_KEYWORDS = ['slow', 'standing', 'stagnant', 'pooling', 'backup'];
const BIO_KEYWORDS = ['odor', 'smell', 'biofilm', 'slime', 'growth', 'bacteria'];

/**
 * Check if description contains any keywords from a category
 */
function hasKeywords(description: string | undefined, keywords: string[]): boolean {
  if (!description) return false;
  const lower = description.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword));
}

/**
 * Filter cameras by multiple criteria (INVERTED AWARE + DESCRIPTION FILTERING)
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
  
  // DESCRIPTION KEYWORD FILTERING
  if (filters.descriptionKeywords && filters.descriptionKeywords.length > 0) {
    filtered = filtered.filter(cam => {
      if (!cam.ViewDescription) return false;
      const lower = cam.ViewDescription.toLowerCase();
      return filters.descriptionKeywords!.some(keyword => 
        lower.includes(keyword.toLowerCase())
      );
    });
  }
  
  // Filter by keyword categories
  if (filters.hasUrgencyKeywords) {
    filtered = filtered.filter(cam => hasKeywords(cam.ViewDescription, URGENCY_KEYWORDS));
  }
  
  if (filters.hasObstructionKeywords) {
    filtered = filtered.filter(cam => hasKeywords(cam.ViewDescription, OBSTRUCTION_KEYWORDS));
  }
  
  if (filters.hasStructuralKeywords) {
    filtered = filtered.filter(cam => hasKeywords(cam.ViewDescription, STRUCTURAL_KEYWORDS));
  }
  
  if (filters.hasBuildupKeywords) {
    filtered = filtered.filter(cam => hasKeywords(cam.ViewDescription, BUILDUP_KEYWORDS));
  }
  
  if (filters.hasFlowKeywords) {
    filtered = filtered.filter(cam => hasKeywords(cam.ViewDescription, FLOW_KEYWORDS));
  }
  
  if (filters.hasBioKeywords) {
    filtered = filtered.filter(cam => hasKeywords(cam.ViewDescription, BIO_KEYWORDS));
  }
  
  // Abnormally high water activity
  if (filters.abnormalWater) {
    filtered = filtered.filter(cam => cam.Water > 0.7);
  }
  
  // Multiple factors critical (Level 3+ AND (WARNING status OR high water))
  if (filters.multiFactor) {
    const analyzed = analyzeCamerasWithSeverity(filtered);
    filtered = analyzed.filter(cam => 
      cam.severity.level <= 3 && (cam.Status === 'WARNING' || cam.Water > 0.6)
    );
  }
  
  // Unreliable sensors (LOWLIGHT or WARNING)
  if (filters.unreliableSensors) {
    filtered = filtered.filter(cam => cam.Status !== 'OK');
  }
  
  // High risk score
  if (filters.highRisk) {
    const analyzed = analyzeCamerasWithSeverity(filtered);
    filtered = analyzed.filter(cam => {
      const riskScore = calculateRiskScore(cam);
      return riskScore > 70;
    });
  }
  
  return filtered;
}

/**
 * Calculate risk score for a camera (0-100, higher = more risk)
 */
function calculateRiskScore(camera: CameraWithSeverity): number {
  const severityScore = (6 - camera.severity.level) * 20;
  const waterScore = camera.Water * 30;
  const statusScore = camera.Status === 'WARNING' ? 20 : camera.Status === 'LOWLIGHT' ? 10 : 0;
  const descriptionScore = hasKeywords(camera.ViewDescription, URGENCY_KEYWORDS) ? 10 : 0;
  
  return Math.min(100, severityScore + waterScore + statusScore + descriptionScore);
}

/**
 * Predefined filter presets (INVERTED AWARE + ENHANCED)
 */
export const FILTER_PRESETS: Record<string, FilterPreset> = {
  // Critical area filters
  criticalOnly: {
    name: "Critical Areas (Level 1-3)",
    description: "Show cameras requiring attention",
    filters: { maxSeverity: 3 }
  },
  
  immediateAction: {
    name: "Immediate Action (Level 1-2)",
    description: "Urgent problems needing dispatch",
    filters: { maxSeverity: 2 }
  },
  
  level1Critical: {
    name: "Level 1 - Critical Only",
    description: "Most severe obstructions",
    filters: { severityLevel: 1 }
  },
  
  // Safe cameras
  safeCameras: {
    name: "Safe Cameras (Level 4-5)",
    description: "Cameras in good condition",
    filters: { minSeverity: 4 }
  },
  
  // Water activity
  highWater: {
    name: "High Water Activity (>80%)",
    description: "Full or near-full submersion",
    filters: { waterMin: 0.8 }
  },
  
  abnormalWater: {
    name: "Abnormally High Water (>70%)",
    description: "Unusual water levels",
    filters: { abnormalWater: true }
  },
  
  moderateWater: {
    name: "Moderate Water (50-80%)",
    description: "Partial submersion",
    filters: { waterMin: 0.5, waterMax: 0.8 }
  },
  
  // Light/darkness
  highLight: {
    name: "Dark Pipes (Light >0.6)",
    description: "High light values = dark pipes",
    filters: { lightMin: 0.6 }
  },
  
  veryDark: {
    name: "Very Dark (Light >0.9)",
    description: "Potentially obstructed",
    filters: { lightMin: 0.9 }
  },
  
  // Camera status
  warningStatus: {
    name: "WARNING Status",
    description: "Hardware/environmental issues",
    filters: { status: 'WARNING' }
  },
  
  lowlightStatus: {
    name: "LOWLIGHT Status",
    description: "Lighting unreliable",
    filters: { status: 'LOWLIGHT' }
  },
  
  unreliableCameras: {
    name: "Unreliable Sensors",
    description: "LOWLIGHT or WARNING status",
    filters: { unreliableSensors: true }
  },
  
  // Combined risk factors
  multiFactor: {
    name: "Multi-Factor Critical",
    description: "Level 3+ with WARNING or high water",
    filters: { multiFactor: true }
  },
  
  highRisk: {
    name: "High Risk Score (>70)",
    description: "Combined risk assessment",
    filters: { highRisk: true }
  },
  
  // Description-based
  urgentDescription: {
    name: "Urgent Keywords",
    description: "Emergency, critical, immediate, etc.",
    filters: { hasUrgencyKeywords: true }
  },
  
  obstructionReported: {
    name: "Obstruction Keywords",
    description: "Blockage, clog, debris, etc.",
    filters: { hasObstructionKeywords: true }
  },
  
  structuralIssues: {
    name: "Structural Keywords",
    description: "Cracks, damage, root intrusion",
    filters: { hasStructuralKeywords: true }
  },
  
  buildupIssues: {
    name: "Buildup Keywords",
    description: "Grease, sediment, scale, etc.",
    filters: { hasBuildupKeywords: true }
  },
  
  flowProblems: {
    name: "Flow Keywords",
    description: "Slow drain, standing water, etc.",
    filters: { hasFlowKeywords: true }
  },
  
  bioGrowth: {
    name: "Bio/Odor Keywords",
    description: "Biofilm, odor, slime, etc.",
    filters: { hasBioKeywords: true }
  },
  
  // Composite presets
  todaysPriorities: {
    name: "Today's Priorities",
    description: "Level 1-2 OR (Level 3 + high water/WARNING)",
    filters: { multiFactor: true, maxSeverity: 2 }
  },
  
  hiddenProblems: {
    name: "Potential Hidden Problems",
    description: "Unreliable sensors + borderline readings",
    filters: { unreliableSensors: true, minSeverity: 3, maxSeverity: 4 }
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

/**
 * Get preset by category
 */
export function getPresetsByCategory(): Record<string, string[]> {
  return {
    'Critical Areas': ['criticalOnly', 'immediateAction', 'level1Critical', 'todaysPriorities'],
    'Safe Areas': ['safeCameras'],
    'Water Activity': ['highWater', 'abnormalWater', 'moderateWater'],
    'Darkness/Light': ['highLight', 'veryDark'],
    'Camera Status': ['warningStatus', 'lowlightStatus', 'unreliableCameras'],
    'Risk Factors': ['multiFactor', 'highRisk', 'hiddenProblems'],
    'Description-Based': [
      'urgentDescription', 
      'obstructionReported', 
      'structuralIssues', 
      'buildupIssues', 
      'flowProblems', 
      'bioGrowth'
    ]
  };
}

/**
 * Export keyword lists for UI
 */
export const KEYWORD_CATEGORIES = {
  urgency: URGENCY_KEYWORDS,
  obstruction: OBSTRUCTION_KEYWORDS,
  structural: STRUCTURAL_KEYWORDS,
  buildup: BUILDUP_KEYWORDS,
  flow: FLOW_KEYWORDS,
  bio: BIO_KEYWORDS
};