import { useMemo } from "react";

interface PlaybackControlsProps {
  timeRange: { min: number; max: number };
  currentTime: number | null;
  onTimeChange: (time: number | null) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export default function PlaybackControls({
  timeRange,
  currentTime,
  onTimeChange,
  isPlaying,
  onPlayPause,
}: PlaybackControlsProps) {
  const sliderValue = useMemo(() => {
    if (currentTime === null) return 100;
    const range = timeRange.max - timeRange.min;
    if (range === 0) return 100;
    return ((currentTime - timeRange.min) / range) * 100;
  }, [currentTime, timeRange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = Number(e.target.value);
    const range = timeRange.max - timeRange.min;
    const newTime = timeRange.min + (range * percent) / 100;
    onTimeChange(newTime);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const duration = useMemo(() => {
    const minutes = Math.floor((timeRange.max - timeRange.min) / 60000);
    return minutes;
  }, [timeRange]);

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onPlayPause}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => onTimeChange(null)}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Live
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{formatTime(timeRange.min)}</span>
            <span>{formatTime(timeRange.max)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Duration: {duration} min</span>
          {currentTime !== null && (
            <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-yellow-800">
              ⏱ Playback Mode
            </div>
          )}
        </div>
        {currentTime !== null && (
          <div className="text-sm font-medium text-gray-700">
            {formatTime(currentTime)}
          </div>
        )}
      </div>
    </div>
  );
}

