import { useState, useEffect, useCallback, useRef } from "react";
import type { Camera } from "../api/types";

interface HistoricalDataPoint {
  timestamp: number;
  cameras: Camera[];
}

const MAX_HISTORY_MINUTES = 60;
const MAX_DATA_POINTS = MAX_HISTORY_MINUTES * 60 / 2;

export function useHistoricalData(cameras: Camera[] | undefined) {
  const [history, setHistory] = useState<HistoricalDataPoint[]>([]);
  const historyRef = useRef<HistoricalDataPoint[]>([]);

  useEffect(() => {
    if (!cameras || cameras.length === 0) return;

    const now = Date.now();
    const newPoint: HistoricalDataPoint = {
      timestamp: now,
      cameras: cameras.map(c => ({ ...c })),
    };

    const updated = [...historyRef.current, newPoint]
      .filter(point => now - point.timestamp <= MAX_HISTORY_MINUTES * 60 * 1000)
      .slice(-MAX_DATA_POINTS);

    historyRef.current = updated;
    setHistory(updated);
  }, [cameras]);

  const getDataAtTime = useCallback((timestamp: number): Camera[] | null => {
    if (historyRef.current.length === 0) return null;

    const exact = historyRef.current.find(p => p.timestamp === timestamp);
    if (exact) return exact.cameras;

    const before = historyRef.current.filter(p => p.timestamp <= timestamp);
    if (before.length === 0) return historyRef.current[0].cameras;

    return before[before.length - 1].cameras;
  }, []);

  const getTimeRange = useCallback(() => {
    if (historyRef.current.length === 0) {
      return { min: Date.now(), max: Date.now() };
    }
    return {
      min: historyRef.current[0].timestamp,
      max: historyRef.current[historyRef.current.length - 1].timestamp,
    };
  }, []);

  return {
    history,
    getDataAtTime,
    getTimeRange,
  };
}

