import type { Camera } from "../api/types";
import { calculateCriticality, getCriticalityLabel } from "../utils/criticality";

interface InsightsCardProps {
  cameras: Camera[];
  selectedSegmentId: number | null;
}

interface Insight {
  type: "critical" | "general";
  segmentId: number;
  title: string;
  message: string;
  severity: "warning" | "error" | "info" | "ok";
}

export default function InsightsCard({ cameras, selectedSegmentId }: InsightsCardProps) {
  const getInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const filteredCameras = selectedSegmentId !== null
      ? cameras.filter(c => c.SegmentID === selectedSegmentId)
      : cameras;

    filteredCameras.forEach((camera) => {
      const criticality = calculateCriticality(camera.Light ?? 3, camera.Water, camera.Status);
      const critical: Insight[] = [];
      const general: Insight[] = [];

      if (criticality.criticalityLevel <= 2) {
        critical.push({
          type: "critical",
          segmentId: camera.SegmentID,
          title: `Criticality Level ${criticality.criticalityLevel} - ${getCriticalityLabel(criticality.criticalityLevel)}`,
          message: `Final Light Severity: ${criticality.finalLightSeverity.toFixed(3)}. Raw: ${criticality.rawLightValue.toFixed(2)}, Status Factor: ${criticality.statusFactor}, WIF: ${criticality.waterImpactFactor.toFixed(2)}${criticality.overrideTriggered ? ` (Override: ${criticality.overrideReason})` : ""}`,
          severity: criticality.criticalityLevel === 1 ? "error" : "warning",
        });
      } else if (selectedSegmentId !== null) {
        general.push({
          type: "general",
          segmentId: camera.SegmentID,
          title: `Criticality Level ${criticality.criticalityLevel} - ${getCriticalityLabel(criticality.criticalityLevel)}`,
          message: `Final Light Severity: ${criticality.finalLightSeverity.toFixed(3)}. Operating normally.`,
          severity: "ok",
        });
      }

      if (camera.Water > 0.8) {
        critical.push({
          type: "critical",
          segmentId: camera.SegmentID,
          title: "High Water Level",
          message: `Water level is ${(camera.Water * 100).toFixed(2)}% - Above threshold`,
          severity: "error",
        });
      } else if (selectedSegmentId !== null) {
        general.push({
          type: "general",
          segmentId: camera.SegmentID,
          title: "Water Level Normal",
          message: `Water level: ${(camera.Water * 100).toFixed(2)}%`,
          severity: "ok",
        });
      }

      if (camera.Light <= 2) {
        critical.push({
          type: "critical",
          segmentId: camera.SegmentID,
          title: "Low Light Level",
          message: `Light level is ${camera.Light}/5 - Below threshold`,
          severity: "warning",
        });
      } else if (selectedSegmentId !== null) {
        general.push({
          type: "general",
          segmentId: camera.SegmentID,
          title: "Light Level Normal",
          message: `Light level: ${camera.Light}/5`,
          severity: "ok",
        });
      }

      if (camera.Status === "WARNING" || camera.Status === "LOWLIGHT") {
        critical.push({
          type: "critical",
          segmentId: camera.SegmentID,
          title: `Status: ${camera.Status}`,
          message: camera.Status === "WARNING" 
            ? "Warning condition detected" 
            : "Low light condition detected",
          severity: camera.Status === "WARNING" ? "error" : "warning",
        });
      } else if (selectedSegmentId !== null) {
        general.push({
          type: "general",
          segmentId: camera.SegmentID,
          title: "Status: OK",
          message: "Segment operating normally",
          severity: "ok",
        });
      }

      if (camera.ViewDescription) {
        critical.push({
          type: "critical",
          segmentId: camera.SegmentID,
          title: "View Description",
          message: camera.ViewDescription,
          severity: "info",
        });
      }

      if (selectedSegmentId !== null) {
        insights.push(...critical, ...general);
      } else {
        insights.push(...critical);
      }
    });

    const severityOrder: Record<string, number> = {
      error: 1,
      warning: 2,
      info: 3,
      ok: 4,
    };

    return insights.sort((a, b) => {
      const orderA = severityOrder[a.severity] ?? 5;
      const orderB = severityOrder[b.severity] ?? 5;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.segmentId - b.segmentId;
    });
  };

  const insights = getInsights();

  const getSeverityColor = (severity: Insight["severity"]) => {
    switch (severity) {
      case "error":
        return "border-[#EF4444] bg-[#7F1D1D]/20";
      case "warning":
        return "border-[#FBBF24] bg-[#B45309]/20";
      case "info":
        return "border-[#3B82F6] bg-[#1E3A8A]/20";
      case "ok":
        return "border-[#10B981] bg-[#065F46]/20";
      default:
        return "border-[#334155] bg-[#1E293B]";
    }
  };

  const getSeverityTextColor = (severity: Insight["severity"]) => {
    switch (severity) {
      case "error":
        return "text-[#EF4444]";
      case "warning":
        return "text-[#FBBF24]";
      case "info":
        return "text-[#3B82F6]";
      case "ok":
        return "text-[#10B981]";
      default:
        return "text-[#F8FAFC]";
    }
  };

  if (insights.length === 0) {
    return (
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 h-full">
        <h3 className="text-lg font-semibold mb-4 text-[#F8FAFC]">Insights</h3>
        <div className="text-[#94A3B8] text-sm">
          {selectedSegmentId !== null
            ? "No insights available for this segment."
            : "No critical issues detected. All segments operating normally."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 h-full">
      <h3 className="text-lg font-semibold mb-4 text-[#F8FAFC]">
        {selectedSegmentId !== null ? `Segment ${selectedSegmentId} Insights` : "Critical Insights"}
      </h3>
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {insights.map((insight, index) => (
          <div
            key={`${insight.segmentId}-${index}`}
            className={`p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className={`font-semibold text-sm ${getSeverityTextColor(insight.severity)}`}>
                {insight.title}
              </h4>
              {selectedSegmentId === null && (
                <span className="text-[#94A3B8] ml-2">Seg {insight.segmentId}</span>
              )}
            </div>
            <p className="text-sm text-[#CBD5E1]">{insight.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

