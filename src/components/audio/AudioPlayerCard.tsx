import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2 } from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import { formatDuration } from '../../utils/format';

interface AudioPlayerCardProps {
  src: string;
  fileName: string;
  durationSec: number;
  languageLabel?: string;
  compact?: boolean;
}

export function AudioPlayerCard({
  src,
  fileName,
  durationSec,
  languageLabel,
  compact = false,
}: AudioPlayerCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [resolvedDuration, setResolvedDuration] = useState(durationSec);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setResolvedDuration(durationSec);
  }, [src, durationSec]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const progress = resolvedDuration > 0 ? Math.min(1, currentTime / resolvedDuration) : 0;

  return (
    <div
      className={`bg-[#101010] border border-white/[0.08] rounded-xl ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const dur = e.currentTarget.duration;
          if (Number.isFinite(dur) && dur > 0) {
            setResolvedDuration(Math.round(dur));
          }
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
          className="w-10 h-10 rounded-full bg-[#FF7139] hover:bg-[#ff824f] text-[#101010] flex items-center justify-center transition-colors shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-[#F5F0E8] truncate">{fileName}</span>
            <span className="text-xs font-mono tabular-nums text-[#929292] shrink-0">
              {formatDuration(currentTime)} / {formatDuration(resolvedDuration)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              const audio = audioRef.current;
              if (!audio || !resolvedDuration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              audio.currentTime = ratio * resolvedDuration;
              setCurrentTime(audio.currentTime);
            }}
            aria-label="Seek voice note"
            className="w-full block text-left"
          >
            <WaveformVisualizer
              bars={compact ? 24 : 34}
              active={isPlaying}
              progress={progress || 0.02}
              heightClass={compact ? 'h-7' : 'h-9'}
            />
          </button>

          {languageLabel && (
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#929292]">
              <Volume2 className="w-3 h-3 text-[#FF7139]" aria-hidden="true" />
              <span>{languageLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
