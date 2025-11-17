// aiAnalysis.ts

import type { 
  Camera, 
  AIAnalysisResult, 
  SystemSummary, 
  CameraDetail,
  Insight 
} from './types';
import { 
  analyzeCamerasWithSeverity, 
  calculateSystemHealth,
  calculateSeverityLevel
} from './criticalitySystem';

const GEMINI_API_KEY = "lol";

/**
 * Generate AI-powered insights for critical areas using Gemini API (INVERTED AWARE)
 */
export async function generateAIInsights(cameras: Camera[]): Promise<AIAnalysisResult> {
  const analyzed = analyzeCamerasWithSeverity(cameras);
  const critical = analyzed.filter(cam => cam.severity.level <= 3);  // INVERTED: Lower = worse
  const immediate = analyzed.filter(cam => cam.severity.level <= 2); // INVERTED: Levels 1-2
  const systemHealth = calculateSystemHealth(cameras);
  
  // Prepare data summary for AI
  const summary: SystemSummary = {
    total: cameras.length,
    critical: critical.length,
    severe: immediate.length,
    statusBreakdown: {
      OK: cameras.filter(c => c.Status === 'OK').length,
      LOWLIGHT: cameras.filter(c => c.Status === 'LOWLIGHT').length,
      WARNING: cameras.filter(c => c.Status === 'WARNING').length
    },
    averageWater: (cameras.reduce((sum, c) => sum + c.Water, 0) / cameras.length).toFixed(2),
    averageLight: (cameras.reduce((sum, c) => sum + c.Light, 0) / cameras.length).toFixed(2),
    systemHealth: systemHealth
  };
  
  // Build detailed camera list for AI context
  const cameraDetails: CameraDetail[] = critical.map(cam => ({
    id: cam.SegmentID,
    position: cam.Position,
    water: (cam.Water * 100).toFixed(1) + '%',
    light: cam.Light.toFixed(3),
    status: cam.Status,
    severityLevel: cam.severity.level,
    interpretation: cam.severity.interpretation,
    action: cam.severity.action,
    adjustedLight: cam.severity.adjustedLight.toFixed(3),
    finalLight: cam.severity.finalLight.toFixed(3),
    notes: cam.ViewDescription || 'None'
  }));
  
  const prompt = `
You are an expert sewer system analyst. Analyze this sewer camera monitoring data and provide actionable insights.

IMPORTANT: The severity scale is INVERTED:
- Level 5 = BEST (Safe/Clear pipe)
- Level 4 = Minor obstruction
- Level 3 = Moderate buildup
- Level 2 = Severe accumulation
- Level 1 = WORST (Critical/Dark - major obstruction)

SYSTEM OVERVIEW:
- Total Cameras: ${summary.total}
- System Health: ${systemHealth.toFixed(1)}%
- Critical Areas (Level 1-3): ${summary.critical}
- Immediate Action Required (Level 1-2): ${immediate.length}
- Camera Status: ${summary.statusBreakdown.OK} OK, ${summary.statusBreakdown.LOWLIGHT} LOWLIGHT, ${summary.statusBreakdown.WARNING} WARNING
- Average Water Level: ${summary.averageWater}
- Average Light Intensity: ${summary.averageLight}

SEVERITY SYSTEM (INVERTED):
Level 5 (Safe/Clear): Clean pipe, no obstruction - BEST
Level 4 (Minor): Early buildup
Level 3 (Moderate): Noticeable accumulation
Level 2 (Severe): Heavy buildup, partial restriction
Level 1 (Critical/Dark): Major obstruction, immediate action - WORST

CRITICAL CAMERAS (Level 1-3):
${JSON.stringify(cameraDetails, null, 2)}

Please provide:
1. **Root Cause Analysis**: Identify patterns and likely causes of issues
2. **Priority Ranking**: Which cameras need attention first and why (focus on Level 1-2)
3. **Maintenance Recommendations**: Specific actions for each severity level
4. **Risk Assessment**: What happens if these issues aren't addressed
5. **System Health**: Overall assessment (${systemHealth.toFixed(1)}% health score)

Format your response as a professional report with clear sections and actionable recommendations.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract text from Gemini response format
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis generated';
    
    return {
      success: true,
      analysis: analysisText,
      summary: summary,
      criticalCameras: cameraDetails,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: generateFallbackInsights(cameras)
    };
  }
}

/**
 * Generate fallback insights if AI is unavailable (INVERTED AWARE)
 */
function generateFallbackInsights(cameras: Camera[]): Insight[] {
  const analyzed = analyzeCamerasWithSeverity(cameras);
  const critical = analyzed.filter(cam => cam.severity.level <= 3);  // INVERTED
  const immediate = analyzed.filter(cam => cam.severity.level <= 2); // INVERTED
  
  const insights: Insight[] = [];
  
  // INVERTED: Level 1-2 are worst
  if (immediate.length > 0) {
    insights.push({
      type: "CRITICAL_ALERT",
      priority: 1,
      message: `${immediate.length} camera(s) require immediate action (Level 1-2)`,
      cameras: immediate.map(c => c.SegmentID),
      action: "Dispatch maintenance crew immediately"
    });
  }
  
  // INVERTED: Level 1-3 are problematic
  if (critical.length > 3) {
    insights.push({
      type: "SYSTEM_DEGRADATION",
      priority: 2,
      message: `${critical.length} cameras showing moderate to critical issues (Level 1-3)`,
      action: "System-wide inspection recommended"
    });
  }
  
  const unreliable = cameras.filter(c => c.Status !== 'OK');
  if (unreliable.length > cameras.length * 0.3) {
    insights.push({
      type: "RELIABILITY_CONCERN",
      priority: 2,
      message: `${unreliable.length} cameras have reliability issues (LOWLIGHT/WARNING)`,
      action: "Schedule camera maintenance and recalibration"
    });
  }
  
  // System health insight
  const systemHealth = calculateSystemHealth(cameras);
  if (systemHealth < 60) {
    insights.push({
      type: "SYSTEM_HEALTH",
      priority: 2,
      message: `System health at ${systemHealth.toFixed(0)}% - below target`,
      action: "Review maintenance schedule and address critical cameras"
    });
  } else if (systemHealth >= 80) {
    insights.push({
      type: "SYSTEM_HEALTH",
      priority: 4,
      message: `System health excellent at ${systemHealth.toFixed(0)}%`,
      action: "Continue routine monitoring"
    });
  }
  
  return insights;
}

/**
 * Quick AI analysis for specific camera using Gemini API (INVERTED AWARE)
 */
export async function analyzeSingleCamera(camera: Camera): Promise<string> {
  const severity = calculateSeverityLevel(camera);
  
  const prompt = `
Analyze this sewer camera and provide specific recommendations.

IMPORTANT: Severity scale is INVERTED (Level 5 = best, Level 1 = worst).

Camera ${camera.SegmentID}:
- Position: (${camera.Position[0].toFixed(2)}, ${camera.Position[1].toFixed(2)})
- Water Level: ${(camera.Water * 100).toFixed(1)}%
- Light Intensity: ${camera.Light.toFixed(3)} (higher = darker pipe)
- Status: ${camera.Status}
- Severity Level: ${severity.level} - ${severity.interpretation}
- Adjusted Light: ${severity.adjustedLight.toFixed(3)}
- Final Light: ${severity.finalLight.toFixed(3)}
${camera.ViewDescription ? `- Notes: ${camera.ViewDescription}` : ''}

Provide:
1. Likely cause of this issue
2. Specific maintenance action needed
3. Urgency level and timeline
4. Impact if not addressed

Be concise and specific.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                        `Camera ${camera.SegmentID}: ${severity.interpretation}\nAction: ${severity.action}`;
    
    return analysisText;
  } catch (error) {
    return `Camera ${camera.SegmentID}: ${severity.interpretation}\nAction: ${severity.action}`;
  }
}