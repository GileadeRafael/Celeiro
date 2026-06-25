import React, { useEffect, useRef, useState } from 'react';
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
  List,
  Sparkles,
  Mic,
  MoreHorizontal,
  Music,
  Plus
} from 'lucide-react';
import { Track, Playlist } from '../types';

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
  customPlaylists?: Playlist[];
  onAddToPlaylist?: (playlistId: string, trackId: string) => void;
  
  // Carousel flow props
  trackList: Track[];
  queue: string[];
  playbackHistory: string[];
  onSelectTrack: (trackId: string) => void;
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
  synthActive = false,
  customPlaylists = [],
  onAddToPlaylist,
  
  trackList = [],
  queue = [],
  playbackHistory = [],
  onSelectTrack
}: FullScreenPlayerProps) {
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!track) return null;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === undefined) return '0:00';
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
  }, [currentLineIndex, showLyrics]);

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

  // Construct previous and next tracks for Cover Flow
  const getCurrentCarouselTracks = () => {
    const currentIndex = trackList.findIndex(t => t.id === track.id);
    
    // Previous 2 songs
    let prev1: Track | null = null;
    let prev2: Track | null = null;
    
    if (playbackHistory.length > 1) {
      const p1Id = playbackHistory[1];
      prev1 = trackList.find(t => t.id === p1Id) || null;
    }
    if (playbackHistory.length > 2) {
      const p2Id = playbackHistory[2];
      prev2 = trackList.find(t => t.id === p2Id) || null;
    }
    
    // Fallback to trackList indices if not found in history
    if (!prev1 && currentIndex > 0) {
      prev1 = trackList[currentIndex - 1];
    }
    if (!prev2 && currentIndex > 1) {
      prev2 = trackList[currentIndex - 2];
    } else if (!prev2 && prev1) {
      const pIndex = trackList.indexOf(prev1);
      if (pIndex > 0) prev2 = trackList[pIndex - 1];
    }

    // Next 2 songs
    let next1: Track | null = null;
    let next2: Track | null = null;
    
    if (queue.length > 0) {
      const n1Id = queue[0];
      next1 = trackList.find(t => t.id === n1Id) || null;
    }
    if (queue.length > 1) {
      const n2Id = queue[1];
      next2 = trackList.find(t => t.id === n2Id) || null;
    }
    
    // Fallback to trackList indices if not found in queue
    if (!next1 && currentIndex < trackList.length - 1) {
      next1 = trackList[currentIndex + 1];
    }
    if (!next2 && currentIndex < trackList.length - 2) {
      next2 = trackList[currentIndex + 2];
    } else if (!next2 && next1) {
      const nIndex = trackList.indexOf(next1);
      if (nIndex < trackList.length - 1) next2 = trackList[nIndex + 1];
    }

    return { prev2, prev1, current: track, next1, next2 };
  };

  const { prev2, prev1, current, next1, next2 } = getCurrentCarouselTracks();

  return (
    <div 
      id="immersive-player-overlay" 
      className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-[#121214] text-white transition-all duration-500 font-sans select-none"
    >
      
      {/* Top Header Row (Just close button) */}
      <header className="relative z-10 flex items-center justify-between p-6 md:px-12 shrink-0">
        <button
          id="close-immersive-btn"
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all text-stone-300 hover:text-white"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-10" /> {/* spacer */}
      </header>

      {/* Main Body View Layout */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        
        {/* 3D Cover Flow Carousel Container */}
        <div className="flex items-center justify-center gap-4 md:gap-8 my-4 md:my-8 h-60 md:h-80 relative w-full max-w-5xl overflow-hidden [perspective:1200px] select-none">
          {/* prev2 */}
          {prev2 && (
            <div 
              onClick={() => onSelectTrack(prev2.id)}
              className="absolute left-[-10%] md:left-[5%] opacity-20 scale-50 md:scale-60 cursor-pointer transition-all duration-500 hover:opacity-45 hover:scale-65 z-10 shrink-0"
              style={{
                transform: 'rotateY(35deg) translateZ(-120px)',
                transformStyle: 'preserve-3d'
              }}
            >
              <img 
                src={prev2.coverUrl} 
                alt={prev2.title} 
                className="w-32 h-32 md:w-48 md:h-48 rounded-[20px] object-cover shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-white/5"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* prev1 */}
          {prev1 && (
            <div 
              onClick={() => onSelectTrack(prev1.id)}
              className="absolute left-[8%] md:left-[18%] opacity-60 scale-75 cursor-pointer transition-all duration-500 hover:opacity-85 hover:scale-80 z-20 shrink-0"
              style={{
                transform: 'rotateY(25deg) translateZ(-60px)',
                transformStyle: 'preserve-3d'
              }}
            >
              <img 
                src={prev1.coverUrl} 
                alt={prev1.title} 
                className="w-36 h-36 md:w-56 md:h-56 rounded-[24px] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* current */}
          {current && (
            <div 
              className="relative scale-100 z-30 shrink-0 transition-all duration-500"
              style={{
                transform: 'rotateY(0deg) translateZ(60px)',
                transformStyle: 'preserve-3d'
              }}
            >
              <img 
                src={current.coverUrl} 
                alt={current.title} 
                className="w-48 h-48 md:w-72 md:h-72 rounded-[32px] object-cover shadow-[0_30px_70px_rgba(0,0,0,0.9)] border border-white/20"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* next1 */}
          {next1 && (
            <div 
              onClick={() => onSelectTrack(next1.id)}
              className="absolute right-[8%] md:right-[18%] opacity-60 scale-75 cursor-pointer transition-all duration-500 hover:opacity-85 hover:scale-80 z-20 shrink-0"
              style={{
                transform: 'rotateY(-25deg) translateZ(-60px)',
                transformStyle: 'preserve-3d'
              }}
            >
              <img 
                src={next1.coverUrl} 
                alt={next1.title} 
                className="w-36 h-36 md:w-56 md:h-56 rounded-[24px] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* next2 */}
          {next2 && (
            <div 
              onClick={() => onSelectTrack(next2.id)}
              className="absolute right-[-10%] md:right-[5%] opacity-20 scale-50 md:scale-60 cursor-pointer transition-all duration-500 hover:opacity-45 hover:scale-65 z-10 shrink-0"
              style={{
                transform: 'rotateY(-35deg) translateZ(-120px)',
                transformStyle: 'preserve-3d'
              }}
            >
              <img 
                src={next2.coverUrl} 
                alt={next2.title} 
                className="w-32 h-32 md:w-48 md:h-48 rounded-[20px] object-cover shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-white/5"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Dynamic centered Song Name and Artist Pill */}
        <div className="flex justify-center my-4 animate-fade-in shrink-0">
          <div className="bg-white/[0.06] border border-white/10 px-8 py-3.5 rounded-full text-center inline-flex flex-col items-center justify-center backdrop-blur-md shadow-lg min-w-[240px] max-w-md">
            <span className="text-base md:text-lg font-black text-white leading-tight truncate w-full px-2">
              {current.title}
            </span>
            <span className="text-xs md:text-sm text-[#8e8e93] font-semibold mt-1 truncate w-full px-2">
              {current.artist}
            </span>
          </div>
        </div>

        {/* Slidable Karaoke Lyrics Pane */}
        {showLyrics && (
          <div className="absolute right-6 top-6 bottom-6 w-80 md:w-96 bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/10 z-40 p-6 flex flex-col rounded-[24px] shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Mic className="w-4.5 h-4.5 text-[#dfb26f]" /> Letra da Música
              </h3>
              <button onClick={() => setShowLyrics(false)} className="text-xs text-stone-400 hover:text-white font-bold transition-all">
                Fechar
              </button>
            </div>
            <div 
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto pr-2 space-y-5 scroll-smooth select-none custom-scrollbar pb-10"
            >
              {current.lyrics.length === 0 ? (
                <div className="h-full flex items-center justify-center text-stone-500 text-sm italic">
                  Nenhuma letra disponível para esta música.
                </div>
              ) : (
                current.lyrics.map((line, index) => {
                  const isLineActive = index === currentLineIndex;

                  return (
                    <button
                      key={index}
                      ref={isLineActive ? activeLineRef : null}
                      onClick={() => onSeek(line.time)}
                      className={`w-full text-left text-sm md:text-base font-bold tracking-tight transition-all duration-300 block cursor-pointer outline-none ${
                        isLineActive 
                          ? 'text-[#dfb26f] scale-100 opacity-100 drop-shadow-[0_4px_12px_rgba(223,178,111,0.25)]' 
                          : 'text-stone-400/40 hover:text-stone-300'
                      }`}
                    >
                      {line.text}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Slidable Queue Pane */}
        {showQueue && (
          <div className="absolute right-6 top-6 bottom-6 w-80 md:w-96 bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/10 z-40 p-6 flex flex-col rounded-[24px] shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <List className="w-4.5 h-4.5 text-[#dfb26f]" /> Seguintes
              </h3>
              <button onClick={() => setShowQueue(false)} className="text-xs text-stone-400 hover:text-white font-bold transition-all">
                Fechar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar pb-10">
              {(() => {
                const upcoming = queue.length > 0 
                  ? queue.map(id => trackList.find(t => t.id === id)).filter((t): t is Track => !!t)
                  : trackList.filter(t => t.id !== current.id);

                if (upcoming.length === 0) {
                  return (
                    <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl text-stone-500 text-xs">
                      Nenhuma música a seguir.
                    </div>
                  );
                }

                return upcoming.map((trackItem, idx) => {
                  return (
                    <div 
                      key={`${trackItem.id}-${idx}`}
                      onClick={() => {
                        onSelectTrack(trackItem.id);
                        setShowQueue(false);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] group transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img src={trackItem.coverUrl} className="w-10 h-10 rounded-lg object-cover border border-white/5" />
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-stone-200 truncate group-hover:text-white transition-colors">{trackItem.title}</span>
                          <span className="block text-[10px] text-[#8e8e93] truncate mt-0.5">{trackItem.artist}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#8e8e93] pl-2">{formatTime(trackItem.duration)}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

      </div>

      {/* Identical Floating Bottom Media Player bar */}
      <footer className="p-6 md:p-10 shrink-0 w-full flex justify-center z-10">
        <div 
          id="immersive-floating-player" 
          className="w-[95%] md:w-[85%] max-w-4xl rounded-full bg-[#1c1c1e]/90 border border-white/10 px-6 py-3.5 shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4 md:gap-6 select-none backdrop-blur-xl"
        >
          
          {/* 1. LEFT CONTROLS SECTION */}
          <div className="flex items-center gap-2.5 md:gap-3 text-stone-400 shrink-0">
            {/* Shuffle */}
            <button
              id="immersive-shuffle-toggle"
              onClick={onShuffleToggle}
              className={`p-1.5 rounded-full hover:bg-white/5 transition-all active:scale-95 ${
                isShuffle ? 'text-[#dfb26f]' : 'text-[#8e8e93] hover:text-white'
              }`}
              title="Ordem Aleatória"
            >
              <Shuffle className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>

            {/* Previous */}
            <button
              id="immersive-skip-back"
              onClick={onPrevious}
              className="p-1.5 rounded-full text-[#8e8e93] hover:text-white hover:bg-white/5 transition-all active:scale-95"
              title="Anterior"
            >
              <SkipBack className="w-4 h-4 md:w-4.5 md:h-4.5 fill-current" />
            </button>

            {/* Play / Pause */}
            <button
              id="immersive-play-pause"
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
              id="immersive-skip-forward"
              onClick={onNext}
              className="p-1.5 rounded-full text-[#8e8e93] hover:text-white hover:bg-white/5 transition-all active:scale-95"
              title="Próxima"
            >
              <SkipForward className="w-4 h-4 md:w-4.5 md:h-4.5 fill-current" />
            </button>

            {/* Repeat */}
            <button
              id="immersive-repeat-toggle"
              onClick={onRepeatToggle}
              className={`p-1.5 rounded-full hover:bg-white/5 transition-all active:scale-95 relative ${
                repeatMode !== 'none' ? 'text-[#dfb26f]' : 'text-[#8e8e93] hover:text-white'
              }`}
              title="Repetir"
            >
              <Repeat className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {repeatMode === 'one' && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#dfb26f] text-black text-[5px] font-bold rounded-full flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          {/* 2. MIDDLE METADATA & SEEKER SECTION */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {/* Cover thumbnail */}
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg overflow-hidden shrink-0 border border-white/5 shadow-md">
              <img 
                src={current.coverUrl} 
                alt={current.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Text information + Seeker line */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="block text-xs md:text-sm font-bold text-white truncate leading-tight">
                    {current.title}
                  </span>
                  <span className="block text-[10px] md:text-xs text-[#8e8e93] truncate leading-tight">
                    {current.artist}
                  </span>
                </div>

                <span className="text-[10px] md:text-xs font-mono font-bold text-stone-400 shrink-0 select-none">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Scrubber track line */}
              <div className="flex items-center w-full">
                <input
                  id="immersive-player-scrubber"
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => onSeek(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#dfb26f] focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #dfb26f 0%, #dfb26f ${((currentTime / (duration || 100)) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) ${((currentTime / (duration || 100)) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) 100%)`
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
                id="immersive-options-button"
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
                    <Heart className={`w-4 h-4 ${isFavorite ? 'text-[#dfb26f] fill-current' : 'text-[#8e8e93]'}`} />
                    <span>{isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</span>
                  </button>

                  <div className="my-1.5 border-t border-white/5" />

                  {/* Add to Playlist section */}
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                    Adicionar à Playlist
                  </div>

                  <div className="max-h-36 overflow-y-auto custom-scrollbar px-1 space-y-0.5">
                    {!customPlaylists || customPlaylists.length === 0 ? (
                      <div className="px-2 py-2 text-[11px] text-[#8e8e93] italic">
                        Nenhuma playlist criada.
                      </div>
                    ) : (
                      customPlaylists.map(playlist => (
                        <button
                          key={playlist.id}
                          onClick={() => {
                            if (onAddToPlaylist) {
                              onAddToPlaylist(playlist.id, current.id);
                            }
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

            {/* Show Lyrics Microphone Button */}
            <button
              onClick={() => {
                setShowLyrics(!showLyrics);
                setShowQueue(false);
              }}
              className={`p-1.5 rounded-full transition-all active:scale-95 ${
                showLyrics ? 'text-[#dfb26f] bg-[#dfb26f]/10' : 'text-[#8e8e93] hover:text-white'
              }`}
              title="Letra"
            >
              <Mic className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* List Queue button (Toggles sliding right-side list) */}
            <button
              id="immersive-queue-toggle"
              onClick={() => {
                setShowQueue(!showQueue);
                setShowLyrics(false);
              }}
              className={`p-1.5 rounded-full hover:bg-white/5 transition-all active:scale-95 ${
                showQueue ? 'text-[#dfb26f] bg-[#dfb26f]/10' : 'text-[#8e8e93] hover:text-white'
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
                id="immersive-volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-14 md:w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#dfb26f] focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #dfb26f 0%, #dfb26f ${((isMuted ? 0 : volume) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) ${((isMuted ? 0 : volume) * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) 100%)`
                }}
              />
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
