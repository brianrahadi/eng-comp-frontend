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
  
  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateAIInsights(cameras);
      if (result.success) {
        setAnalysis(result.analysis);
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
      <h3 className="font-bold text-lg mb-4">🤖 AI Analysis</h3>
      
      {/* Info about inverted scale */}
      <div className="mb-4 p-2 bg-blue-50 rounded text-xs">
        <strong>Note:</strong> Using inverted scale (Level 5=best, Level 1=worst)
      </div>
      
      <button 
        onClick={runAnalysis}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400 mb-4"
      >
        {loading ? (
          <span>🔄 Analyzing System...</span>
        ) : (
          <span>🧠 Generate AI Insights</span>
        )}
      </button>
      
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
      
      {analysis && (
        <div className="bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
          {typeof analysis === 'string' ? (
            <div className="text-sm whitespace-pre-wrap">{analysis}</div>
          ) : (
            <div className="space-y-3">
              {analysis.map((insight: any, idx: number) => (
                <div key={idx} 
                     className="p-3 bg-white rounded border-l-4"
                     style={{ borderLeftColor: insight.priority === 1 ? '#DC2626' : '#EA580C' }}>
                  <div className="font-semibold text-sm">{insight.message}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Action: {insight.action}
                  </div>
                  {insight.cameras && (
                    <div className="text-xs text-gray-500 mt-1">
                      Cameras: {insight.cameras.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}