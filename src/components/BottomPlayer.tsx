import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX, 
  List,
  MoreHorizontal,
  Heart,
  Plus,
  Music
} from 'lucide-react';
import { Track, Playlist } from '../types';

interface BottomPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'none' | 'all' | 'one';
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onMuteToggle: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  onOpenFullScreen: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isDownloaded: boolean;
  onToggleDownload: () => void;
  onToggleQueueDrawer: () => void;
  isQueueDrawerOpen: boolean;
  synthActive?: boolean;
  customPlaylists: Playlist[];
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
}

export default function BottomPlayer({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onShuffleToggle,
  onRepeatToggle,
  onOpenFullScreen,
  onToggleQueueDrawer,
  isQueueDrawerOpen,
  isFavorite,
  onToggleFavorite,
  customPlaylists,
  onAddToPlaylist,
}: BottomPlayerProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === undefined) return '0:00';
    const mins = Math.floor(secs / 60);
    const remain = Math.floor(secs % 60);
    return `${mins}:${remain < 10 ? '0' : ''}${remain}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentTrack) return null;

  return (
    <div 
      id="global-floating-player" 
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] md:w-[85%] max-w-4xl rounded-full bg-[#1c1c1e] border border-white/10 px-6 py-3.5 shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4 md:gap-6 select-none animate-fade-in"
    >
      
      {/* 1. LEFT CONTROLS SECTION */}
      <div className="flex items-center gap-2.5 md:gap-3 text-stone-400 shrink-0">
        {/* Shuffle */}
        <button
          id="player-shuffle-toggle"
          onClick={onShuffleToggle}
          className={`p-1.5 rounded-full hover:bg-white/5 transition-all active:scale-95 ${
            isShuffle ? 'text-[#fa2d48]' : 'text-[#8e8e93] hover:text-white'
          }`}
          title="Ordem Aleatória"
        >
          <Shuffle className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>

        {/* Previous */}
        <button
          id="player-skip-back"
          onClick={onPrevious}
          className="p-1.5 rounded-full text-[#8e8e93] hover:text-white hover:bg-white/5 transition-all active:scale-95"
          title="Anterior"
        >
          <SkipBack className="w-4 h-4 md:w-4.5 md:h-4.5 fill-current" />
        </button>

        {/* Play / Pause */}
        <button
          id="player-play-pause"
          onClick={onPlayPause}
          className="p-1.5 rounded-full text-white hover:bg-white/5 transition-all active:scale-95"
          title={isPlaying ? 'Pausar' : 'Tocar'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 md:w-5.5 md:h-5.5 fill-current" />
          ) : (
            <Play className="w-5 h-5 md:w-5.5 md:h-5.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Next */}
        <button
          id="player-skip-forward"
          onClick={onNext}
          className="p-1.5 rounded-full text-[#8e8e93] hover:text-white hover:bg-white/5 transition-all active:scale-95"
          title="Próxima"
        >
          <SkipForward className="w-4 h-4 md:w-4.5 md:h-4.5 fill-current" />
        </button>

        {/* Repeat */}
        <button
          id="player-repeat-toggle"
          onClick={onRepeatToggle}
          className={`p-1.5 rounded-full hover:bg-white/5 transition-all active:scale-95 relative ${
            repeatMode !== 'none' ? 'text-[#fa2d48]' : 'text-[#8e8e93] hover:text-white'
          }`}
          title="Repetir"
        >
          <Repeat className="w-3.5 h-3.5 md:w-4 md:h-4" />
          {repeatMode === 'one' && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#fa2d48] text-black text-[5px] font-bold rounded-full flex items-center justify-center">
              1
            </span>
          )}
        </button>
      </div>

      {/* 2. MIDDLE METADATA & SEEKER SECTION */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        {/* Cover thumbnail */}
        <div 
          onClick={onOpenFullScreen}
          className="w-10 h-10 md:w-11 md:h-11 rounded-lg overflow-hidden shrink-0 border border-white/5 cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-md"
        >
          <img 
            src={currentTrack.coverUrl} 
            alt={currentTrack.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Text information + Seeker line */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="min-w-0 flex-1 cursor-pointer" onClick={onOpenFullScreen}>
              <span className="block text-xs md:text-sm font-bold text-white truncate hover:underline leading-tight">
                {currentTrack.title}
              </span>
              <span className="block text-[10px] md:text-xs text-[#8e8e93] truncate leading-tight">
                {currentTrack.artist}
              </span>
            </div>

            {/* Live exact minutage instead of "Prévia" */}
            <span className="text-[10px] md:text-xs font-mono font-bold text-stone-400 shrink-0 select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Scrubber track line */}
          <div className="flex items-center w-full">
            <input
              id="bottom-player-scrubber"
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#fa2d48] focus:outline-none"
              style={{
                background: `linear-gradient(to right, #fa2d48 0%, #fa2d48 ${((currentTime / (duration || 100)) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) ${((currentTime / (duration || 100)) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. RIGHT ACTIONS & VOLUME SECTION */}
      <div className="flex items-center gap-2.5 md:gap-3 shrink-0 relative">
        {/* Three dots option */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="player-options-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-1.5 rounded-full hover:bg-white/5 transition-all active:scale-95 ${
              isDropdownOpen ? 'text-white bg-white/5' : 'text-[#8e8e93] hover:text-white'
            }`}
            title="Mais opções"
          >
            <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Mini Popup/Dropdown inside the player */}
          {isDropdownOpen && (
            <div className="absolute bottom-14 right-0 w-56 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-50 py-2.5 px-1 animate-fade-in text-stone-200">
              {/* Favorites action */}
              <button
                onClick={() => {
                  onToggleFavorite();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold hover:bg-white/5 rounded-xl transition-all text-left"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'text-[#fa2d48] fill-current' : 'text-[#8e8e93]'}`} />
                <span>{isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</span>
              </button>

              <div className="my-1.5 border-t border-white/5" />

              {/* Add to Playlist section */}
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Adicionar à Playlist
              </div>

              <div className="max-h-36 overflow-y-auto custom-scrollbar px-1 space-y-0.5">
                {customPlaylists.length === 0 ? (
                  <div className="px-2 py-2 text-[11px] text-[#8e8e93] italic">
                    Nenhuma playlist criada.
                  </div>
                ) : (
                  customPlaylists.map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => {
                        onAddToPlaylist(playlist.id, currentTrack.id);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs font-medium hover:bg-white/5 rounded-lg transition-all text-left truncate"
                    >
                      <Music className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" />
                      <span className="truncate">{playlist.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* List Queue button (Toggles sliding right-side list) */}
        <button
          id="bottom-queue-toggle"
          onClick={onToggleQueueDrawer}
          className={`p-1.5 rounded-full hover:bg-white/5 transition-all active:scale-95 ${
            isQueueDrawerOpen ? 'text-[#fa2d48] bg-[#fa2d48]/10' : 'text-[#8e8e93] hover:text-white'
          }`}
          title="Seguintes"
        >
          <List className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMuteToggle}
            className="p-1 rounded-full text-[#8e8e93] hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 md:w-4.5 md:h-4.5 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
            )}
          </button>
          <input
            id="volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-14 md:w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#fa2d48] focus:outline-none"
            style={{
              background: `linear-gradient(to right, #fa2d48 0%, #fa2d48 ${((isMuted ? 0 : volume) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) ${((isMuted ? 0 : volume) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) 100%)`
            }}
          />
        </div>
      </div>

    </div>
  );
}
