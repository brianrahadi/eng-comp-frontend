import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface InsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InsightsPanel({ isOpen, onClose }: InsightsPanelProps) {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [criticalAreas, setCriticalAreas] = useState<any[]>([]);
  const [averages, setAverages] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/insights`);
      setInsights(response.data.insights);
      setCriticalAreas(response.data.criticalAreas || []);
      setAverages(response.data.averages || []);
      setSummary(response.data.summary || null);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
      setInsights("Failed to load insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-4 right-4 bottom-4 w-[500px] max-w-[90vw] z-50 shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto rounded-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(51, 65, 85, 0.5)",
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#F8FAFC]">AI Insights & Analytics</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchInsights}
                disabled={loading}
                className="px-3 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded text-sm disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#334155] rounded text-[#F8FAFC]"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#334155] rounded p-3 border border-[#475569]">
            <div className="text-xs text-[#94A3B8]">Data Points</div>
            <div className="text-lg font-bold text-[#F8FAFC]">{summary.totalDataPoints}</div>
          </div>
          <div className="bg-[#334155] rounded p-3 border border-[#475569]">
            <div className="text-xs text-[#94A3B8]">Critical Events</div>
            <div className="text-lg font-bold text-[#EF4444]">{summary.totalCriticalEvents}</div>
          </div>
          <div className="bg-[#334155] rounded p-3 border border-[#475569]">
            <div className="text-xs text-[#94A3B8]">Avg Water</div>
            <div className="text-lg font-bold text-[#3B82F6]">{(parseFloat(summary.avgWaterOverall) * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-[#334155] rounded p-3 border border-[#475569]">
            <div className="text-xs text-[#94A3B8]">Avg Light</div>
            <div className="text-lg font-bold text-[#FBBF24]">{parseFloat(summary.avgLightOverall).toFixed(1)}/5</div>
          </div>
        </div>
      )}

      <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155] mb-4">
        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">AI Analysis</h3>
        <div className="text-sm text-[#CBD5E1] whitespace-pre-line font-mono">
          {insights || "Loading insights..."}
        </div>
      </div>

      {criticalAreas.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">Critical Areas (Last Minute)</h3>
          <div className="space-y-2">
            {criticalAreas.map((area, idx) => (
              <div key={idx} className="bg-[#7F1D1D]/20 border border-[#EF4444] rounded p-2 text-xs">
                <div className="text-[#EF4444] font-semibold">
                  {new Date(area.timestamp).toLocaleTimeString()} - {area.count} critical segment(s)
                </div>
                <div className="text-[#CBD5E1] mt-1">
                  Segments: {area.segments.map((s: any) => s.segmentId).join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {averages.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">Average Values (Last Minute)</h3>
          <div className="space-y-1">
            {averages.map((avg, idx) => (
              <div key={idx} className="bg-[#334155] rounded p-2 text-xs border border-[#475569]">
                <div className="text-[#F8FAFC] font-medium">
                  {new Date(avg.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-[#CBD5E1] mt-1">
                  Water: {(parseFloat(avg.avgWater) * 100).toFixed(1)}% | 
                  Light: {parseFloat(avg.avgLight).toFixed(1)}/5
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
}

