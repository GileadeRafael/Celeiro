import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Heart, 
  Star,
  Download,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { Track } from '../types';

interface FullScreenPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'none' | 'all' | 'one';
  onClose: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onMuteToggle: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isDownloaded: boolean;
  onToggleDownload: () => void;
  synthActive?: boolean;
}

export default function FullScreenPlayer({
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  onClose,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onShuffleToggle,
  onRepeatToggle,
  isFavorite,
  onToggleFavorite,
  isDownloaded,
  onToggleDownload,
  synthActive = false
}: FullScreenPlayerProps) {
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLButtonElement>(null);

  if (!track) return null;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remain = Math.floor(secs % 60);
    return `${mins}:${remain < 10 ? '0' : ''}${remain}`;
  };

  // Find currently active lyric line based on currentTime
  const currentLineIndex = track.lyrics.reduce((activeIndex, line, index) => {
    if (currentTime >= line.time) {
      return index;
    }
    return activeIndex;
  }, -1);

  // Auto scroll lyrics container to keep active line centered
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentLineIndex]);

  // Map tracks to custom immersive gradient sets
  const getGradientClass = (trackId: string) => {
    const gradients: Record<string, string> = {
      'track-1': 'from-rose-950 via-[#3B0764]/80 to-stone-950',
      'track-2': 'from-amber-950 via-stone-900 to-stone-950',
      'track-3': 'from-[#450A0A]/90 via-stone-900 to-stone-950',
      'track-4': 'from-yellow-950/80 via-amber-950 to-stone-950',
      'track-5': 'from-emerald-950/90 via-yellow-950/20 to-stone-950',
      'track-6': 'from-orange-950/80 via-[#2E1065]/60 to-stone-950',
      'track-7': 'from-amber-900/40 via-stone-900 to-stone-950',
      'track-8': 'from-fuchsia-950/80 via-[#1E1B4B]/80 to-stone-950',
      'track-9': 'from-cyan-950/70 via-indigo-950 to-stone-950',
      'track-10': 'from-[#14532D]/70 via-amber-950/50 to-stone-950',
      'track-11': 'from-pink-950/50 via-indigo-950/60 to-stone-950',
      'track-12': 'from-[#7C2D12]/70 via-slate-900 to-stone-950',
    };
    return gradients[trackId] || 'from-stone-900 via-stone-950 to-black';
  };

  return (
    <div 
      id="immersive-player-overlay" 
      className={`fixed inset-0 z-50 overflow-hidden flex flex-col bg-gradient-to-b ${getGradientClass(track.id)} text-white transition-all duration-700`}
    >
      {/* Absolute Blurred Shifting Background Backdrop */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[60px] pointer-events-none z-0" />

      {/* Top Header Row */}
      <header className="relative z-10 flex items-center justify-between p-6 md:px-12 border-b border-white/5">
        <button
          id="close-immersive-btn"
          onClick={onClose}
          className="p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all text-stone-300 hover:text-white"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-[10px] font-mono tracking-widest text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full uppercase font-bold flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3 h-3 text-brand animate-pulse" />
          ESTÚDIO ACÚSTICO CELEIRO
        </span>

        <div className="w-9" /> {/* spacer */}
      </header>

      {/* Immersive Splitted View Container */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center p-6 md:px-16 gap-8 md:gap-16 overflow-hidden max-w-7xl mx-auto w-full">
        
        {/* Left Side: Stunning Large Artwork Plate */}
        <div className="w-full md:w-1/2 max-w-md flex flex-col items-center justify-center text-center">
          <div className="relative aspect-square w-[70vw] md:w-full max-w-[340px] md:max-w-md rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10 group">
            <img 
              src={track.coverUrl} 
              alt={track.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="mt-8 w-full flex items-center justify-between px-2">
            <div className="text-left min-w-0 flex-1">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight truncate text-white">
                {track.title}
              </h2>
              <p className="text-sm md:text-lg text-stone-300 truncate mt-1.5 font-medium">
                {track.artist}
              </p>
              <p className="text-xs text-stone-400/80 truncate mt-1">
                {track.album}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {/* Star/Favorite Star Button */}
              <button
                onClick={onToggleFavorite}
                className={`p-2 rounded-full transition-all border ${
                  isFavorite 
                    ? 'bg-brand/20 border-brand text-brand' 
                    : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                }`}
                title="Favoritar canção"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              {/* Download Option */}
              <button
                onClick={onToggleDownload}
                className={`p-2 rounded-full transition-all border ${
                  isDownloaded 
                    ? 'bg-brand/20 border-brand text-brand' 
                    : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                }`}
                title="Status Offline"
              >
                {isDownloaded ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {track.lyricsWriter && (
            <div className="text-left w-full mt-4 px-2 hidden md:block">
              <p className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">{track.lyricsWriter}</p>
            </div>
          )}
        </div>

        {/* Right Side: Karaoke Interactive Scrolling Lyrics Engine */}
        <div 
          className="w-full md:w-1/2 h-[35vh] md:h-[65vh] flex flex-col justify-center overflow-hidden relative"
        >
          {/* Top/Bottom Fade Gradients */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#120E0B]/0 via-[#120E0B]/0 to-transparent pointer-events-none z-10" />
          
          <div 
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto pr-4 space-y-6 md:space-y-8 scroll-smooth select-none custom-scrollbar pb-24 pt-24"
          >
            {track.lyrics.length === 0 ? (
              <div className="h-full flex items-center justify-center text-stone-500 text-sm">
                Nenhuma letra disponível para esta faixa
              </div>
            ) : (
              track.lyrics.map((line, index) => {
                const isLineActive = index === currentLineIndex;
                const isLinePast = index < currentLineIndex;

                return (
                  <button
                    key={index}
                    ref={isLineActive ? activeLineRef : null}
                    onClick={() => onSeek(line.time)}
                    className={`w-full text-left text-lg md:text-3xl font-bold tracking-tight transition-all duration-500 focus:outline-none block cursor-pointer outline-none hover:scale-[1.02] transform origin-left ${
                      isLineActive 
                        ? 'text-white scale-100 opacity-100 drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)] filter-none' 
                        : isLinePast
                        ? 'text-stone-400/40 scale-95 opacity-55 hover:text-stone-300'
                        : 'text-stone-400/40 scale-95 opacity-55 hover:text-stone-300'
                    }`}
                  >
                    {line.text}
                  </button>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Footer Controls & Scrubber */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-md p-6 md:px-12 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 justify-between">
          
          {/* Mobile progress display */}
          <div className="w-full md:w-1/3 flex items-center gap-3">
            <span className="text-[10px] font-mono text-stone-400">{formatTime(currentTime)}</span>
            <input
              id="immersive-slider"
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="flex-1 h-[3px] bg-white/10 rounded-full appearance-none cursor-pointer accent-brand focus:outline-none"
              style={{
                background: `linear-gradient(to right, #fa2d48 0%, #fa2d48 ${((currentTime / (duration || 100)) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) ${((currentTime / (duration || 100)) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) 100%)`
              }}
            />
            <span className="text-[10px] font-mono text-stone-400">-{formatTime(Math.max(0, duration - currentTime))}</span>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center gap-6">
            {/* Shuffle */}
            <button
              onClick={onShuffleToggle}
              className={`p-2 rounded-full transition-colors ${
                isShuffle ? 'text-brand bg-white/5' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Prev */}
            <button
              onClick={onPrevious}
              className="p-2 rounded-full text-stone-300 hover:text-white transition-transform active:scale-90"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={onPlayPause}
              className="w-14 h-14 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current text-stone-950" />
              ) : (
                <Play className="w-6 h-6 fill-current text-stone-950 ml-1" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              className="p-2 rounded-full text-stone-300 hover:text-white transition-transform active:scale-90"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={onRepeatToggle}
              className={`p-2 rounded-full transition-colors relative ${
                repeatMode !== 'none' ? 'text-brand bg-white/5' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Repeat className="w-5 h-5" />
              {repeatMode === 'one' && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand text-stone-950 text-[8px] font-bold rounded-full flex items-center justify-center">1</span>
              )}
            </button>
          </div>

          {/* Immersive volume panel */}
          <div className="hidden md:flex items-center gap-3 w-1/3 justify-end">
            <button
              onClick={onMuteToggle}
              className="text-stone-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-500" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              id="immersive-volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-24 h-[3px] bg-white/10 rounded-full appearance-none cursor-pointer accent-brand focus:outline-none"
              style={{
                background: `linear-gradient(to right, #fa2d48 0%, #fa2d48 ${((isMuted ? 0 : volume) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) ${((isMuted ? 0 : volume) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) 100%)`
              }}
            />
          </div>

        </div>
      </footer>
    </div>
  );
}
