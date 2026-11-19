import React from 'react';

interface WaveformVisualizerProps {
  bars?: number;
  active?: boolean;
  progress?: number; // 0 to 1
  heightClass?: string;
  color?: string;
  mutedColor?: string;
  className?: string;
}

const DEFAULT_AMPLITUDES = [
  28, 44, 62, 38, 84, 96, 72, 48, 88, 66, 94, 54, 40, 76, 98, 62, 46, 82, 90, 52,
  36, 70, 86, 60, 42, 78, 92, 58, 34, 64, 74, 48, 32, 56, 42, 26,
];

export function WaveformVisualizer({
  bars = 32,
  active = false,
  progress = 0,
  heightClass = 'h-12',
  color = '#FF7139',
  mutedColor = 'rgba(245, 240, 232, 0.22)',
  className = '',
}: WaveformVisualizerProps) {
  const count = Math.min(Math.max(bars, 12), 48);

  return (
    <div
      className={`flex items-center gap-[3px] ${heightClass} ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, idx) => {
        const amp = DEFAULT_AMPLITUDES[idx % DEFAULT_AMPLITUDES.length];
        const barPosition = (idx + 1) / count;
        const isPlayed = progress > 0 && barPosition <= progress;
        const barColor =
          progress > 0 ? (isPlayed ? color : mutedColor) : color;

        return (
          <span
            key={idx}
            className={`flex-1 rounded-full transition-colors duration-150 ${
              active ? 'echo-wave-bar' : ''
            }`}
            style={
              {
                height: `${amp}%`,
                backgroundColor: barColor,
                opacity: progress > 0 ? 1 : 0.45 + (amp / 100) * 0.55,
                '--wave-dur': `${1.15 + (idx % 5) * 0.22}s`,
                '--wave-delay': `${(idx % 7) * 0.11}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
