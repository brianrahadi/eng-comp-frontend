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
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center gap-4 mb-3">
        <button
          onClick={onPlayPause}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
        <button
          onClick={() => onTimeChange(null)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Live
        </button>
        <div className="text-sm text-gray-600">
          Duration: {duration} min
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
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
        {currentTime !== null && (
          <div className="text-center text-sm font-medium text-gray-700">
            {formatTime(currentTime)}
          </div>
        )}
      </div>
    </div>
  );
}

