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
    <div className="bg-[#1E293B] rounded-lg p-3 border border-[#334155]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onPlayPause}
            className="px-3 py-1.5 bg-[#3B82F6] text-white rounded hover:bg-[#2563EB] text-sm"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => onTimeChange(null)}
            className="px-3 py-1.5 bg-[#334155] text-[#F8FAFC] rounded hover:bg-[#475569] text-sm"
          >
            Live
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between text-xs text-[#94A3B8] mb-1">
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
          <span className="text-[#CBD5E1]">Duration: {duration} min</span>
          {currentTime !== null && (
            <div className="bg-[#B45309] border border-[#FBBF24] rounded px-2 py-1 text-[#FBBF24]">
              ⏱ Playback Mode
            </div>
          )}
        </div>
        {currentTime !== null && (
          <div className="text-sm font-medium text-[#F8FAFC]">
            {formatTime(currentTime)}
          </div>
        )}
      </div>
    </div>
  );
}

