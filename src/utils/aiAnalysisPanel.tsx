// AIAnalysisPanel.tsx
import { useState } from 'react';
import type { Camera } from './types';
import { generateAIInsights } from './aiAnalysis';

interface AIAnalysisPanelProps {
  cameras: Camera[];
}

export function AIAnalysisPanel({ cameras }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<string | any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  
  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateAIInsights(cameras);
      if (result.success) {
        setAnalysis(result.analysis);
        setSummary(result.summary);
      } else {
        setError(result.error || 'Unknown error');
        setAnalysis(result.fallback);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-4">🤖 AI Insights</h3>
      
      {/* Info about inverted scale */}
      <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
        <strong>💡 About AI Analysis:</strong>
        <p className="text-xs mt-1 text-gray-700">
          The AI analyzes your filtered cameras using the inverted severity scale 
          (Level 5 = best, Level 1 = worst) and provides actionable insights.
        </p>
      </div>
      
      <button 
        onClick={runAnalysis}
        disabled={loading || cameras.length === 0}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400 mb-4 font-semibold"
      >
        {loading ? (
          <span>🔄 Analyzing {cameras.length} cameras...</span>
        ) : (
          <span>🧠 Generate AI Insights ({cameras.length} cameras)</span>
        )}
      </button>
      
      {cameras.length === 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 mb-4">
          <p className="text-sm text-yellow-700">
            ⚠️ No cameras to analyze. Adjust your filters to include cameras.
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-3 mb-4">
          <p className="text-sm text-red-700">
            ⚠️ AI analysis unavailable: {error}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Showing fallback analysis instead.
          </p>
        </div>
      )}
      
      {/* Summary Stats */}
      {summary && (
        <div className="bg-gray-50 p-4 rounded border mb-4">
          <h4 className="font-semibold text-sm mb-2">📊 System Summary:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white rounded">
              <div className="text-gray-600">Total Cameras</div>
              <div className="font-bold text-lg">{summary.total}</div>
            </div>
            <div className="p-2 bg-white rounded">
              <div className="text-gray-600">System Health</div>
              <div className="font-bold text-lg">{summary.systemHealth.toFixed(0)}%</div>
            </div>
            <div className="p-2 bg-red-50 rounded">
              <div className="text-gray-600">Critical (L1-3)</div>
              <div className="font-bold text-lg text-red-600">{summary.critical}</div>
            </div>
            <div className="p-2 bg-orange-50 rounded">
              <div className="text-gray-600">Immediate (L1-2)</div>
              <div className="font-bold text-lg text-orange-600">{summary.severe}</div>
            </div>
            <div className="p-2 bg-blue-50 rounded">
              <div className="text-gray-600">Avg Water</div>
              <div className="font-bold text-lg text-blue-600">{summary.averageWater}</div>
            </div>
            <div className="p-2 bg-purple-50 rounded">
              <div className="text-gray-600">Status Issues</div>
              <div className="font-bold text-lg text-purple-600">
                {summary.statusBreakdown.LOWLIGHT + summary.statusBreakdown.WARNING}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Analysis Results */}
      {analysis && (
        <div className="bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
          <h4 className="font-semibold text-sm mb-3">📝 Analysis Results:</h4>
          {typeof analysis === 'string' ? (
            <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
              {analysis}
            </div>
          ) : (
            <div className="space-y-3">
              {analysis.map((insight: any, idx: number) => (
                <div 
                  key={idx} 
                  className="p-3 bg-white rounded border-l-4"
                  style={{ 
                    borderLeftColor: 
                      insight.priority === 1 ? '#DC2626' : 
                      insight.priority === 2 ? '#EA580C' : 
                      '#16A34A' 
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-semibold text-sm">{insight.message}</div>
                    <div className="text-xs px-2 py-1 rounded bg-gray-100">
                      P{insight.priority}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    <strong>Action:</strong> {insight.action}
                  </div>
                  {insight.cameras && insight.cameras.length > 0 && (
                    <div className="text-xs text-gray-500 mt-2">
                      <strong>Cameras:</strong> {insight.cameras.join(', ')}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {insight.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {!analysis && !loading && (
        <div className="text-center p-8 text-gray-400">
          <div className="text-4xl mb-2">🤖</div>
          <div className="text-sm">Click "Generate AI Insights" to analyze your cameras</div>
        </div>
      )}
    </div>
  );
}