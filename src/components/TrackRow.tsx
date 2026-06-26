import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  Download, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Trash2,
  ListPlus,
  Volume2,
  CheckCircle,
  FolderPlus
} from 'lucide-react';
import { Track, Playlist } from '../types';

interface TrackRowProps {
  key?: React.Key;
  track: Track;
  index: number;
  currentTrackId: string | null;
  isPlaying: boolean;
  isFavorite: boolean;
  isDownloaded: boolean;
  onPlayPause: (trackId: string) => void;
  onToggleFavorite: (trackId: string) => void;
  onToggleDownload: (trackId: string) => void;
  onAddToQueue: (trackId: string) => void;
  onPlayNext: (trackId: string) => void;
  customPlaylists: Playlist[];
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
  onRemoveFromPlaylist?: (trackId: string) => void; // If in a custom playlist
  showRemoveOption?: boolean;
  onCreatePlaylist?: () => void;
}

export default function TrackRow({
  track,
  index,
  currentTrackId,
  isPlaying,
  isFavorite,
  isDownloaded,
  onPlayPause,
  onToggleFavorite,
  onToggleDownload,
  onAddToQueue,
  onPlayNext,
  customPlaylists,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  showRemoveOption = false,
  onCreatePlaylist
}: TrackRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isActive = currentTrackId === track.id;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remain = Math.floor(secs % 60);
    return `${mins}:${remain < 10 ? '0' : ''}${remain}`;
  };

  return (
    <tr
      id={`track-row-${track.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
      className={`group border-b border-[#261E17]/30 hover:bg-stone-900/40 transition-colors ${
        isActive ? 'bg-brand/5' : ''
      }`}
    >
      {/* Index / Play / Pause Button */}
      <td className="py-3 pl-4 w-12 text-center text-sm font-medium">
        <div className="relative flex items-center justify-center w-6 h-6 mx-auto">
          {isHovered ? (
            <button
              id={`play-row-${track.id}`}
              onClick={() => onPlayPause(track.id)}
              className="text-brand hover:scale-110 active:scale-95 transition-transform"
            >
              {isActive && isPlaying ? (
                <Pause className="w-4 h-4 fill-brand" />
              ) : (
                <Play className="w-4 h-4 fill-brand" />
              )}
            </button>
          ) : isActive ? (
            isPlaying ? (
              /* Beautiful active equalizer simulation */
              <div className="flex items-end gap-0.5 w-3.5 h-3.5">
                <span className="w-0.5 bg-brand rounded-full animate-[bounce_0.8s_infinite_100ms]" style={{ height: '60%' }} />
                <span className="w-0.5 bg-brand rounded-full animate-[bounce_1s_infinite_300ms]" style={{ height: '100%' }} />
                <span className="w-0.5 bg-brand rounded-full animate-[bounce_0.7s_infinite_500ms]" style={{ height: '40%' }} />
              </div>
            ) : (
              <Volume2 className="w-4 h-4 text-brand" />
            )
          ) : (
            <span className="text-stone-500 text-xs font-mono">{index + 1}</span>
          )}
        </div>
      </td>

      {/* Title & Artist & Cover */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-10 h-10 rounded-md object-cover flex-shrink-0 shadow-md border border-[#261E17]/40"
          />
          <div className="min-w-0">
            <span
              className={`block text-sm font-medium truncate ${
                isActive ? 'text-brand font-semibold' : 'text-stone-200'
              }`}
            >
              {track.title}
            </span>
            <span className="block text-xs text-stone-400 truncate group-hover:text-stone-300">
              {track.artist}
            </span>
          </div>
        </div>
      </td>

      {/* Album (Hidden on mobile) */}
      <td className="py-3 px-3 hidden md:table-cell text-sm text-stone-400 group-hover:text-stone-300 truncate max-w-[200px]">
        {track.album}
      </td>

      {/* Duration & Quick Actions */}
      <td className="py-3 pr-4 w-40 text-right">
        <div className="flex items-center justify-end gap-3 text-stone-500">
          {/* Quick Favorite Icon (Always visible or hovered) */}
          <button
            id={`fav-btn-${track.id}`}
            onClick={() => onToggleFavorite(track.id)}
            className={`p-1 rounded-full hover:bg-stone-850 transition-colors ${
              isFavorite 
                ? 'text-brand hover:text-brand-hover' 
                : 'text-stone-500 hover:text-stone-300 md:opacity-0 md:group-hover:opacity-100'
            }`}
            title={isFavorite ? 'Remover das Favoritas' : 'Favoritar'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Offline Download */}
          <button
            id={`download-btn-${track.id}`}
            onClick={() => onToggleDownload(track.id)}
            className={`p-1 rounded-full hover:bg-stone-850 transition-colors ${
              isDownloaded
                ? 'text-brand hover:text-brand-hover'
                : 'text-stone-500 hover:text-stone-300 md:opacity-0 md:group-hover:opacity-100'
            }`}
            title={isDownloaded ? 'Música Baixada (Offline)' : 'Baixar para Ouvir Offline'}
          >
            {isDownloaded ? (
              <CheckCircle className="w-3.5 h-3.5 text-brand fill-brand/10" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Album duration */}
          <span className="text-xs font-mono text-stone-500 group-hover:text-stone-300 w-10 text-right">
            {formatTime(track.duration)}
          </span>

          {/* Options Dropdown Menu */}
          <div className="relative">
            <button
              id={`track-menu-btn-${track.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-full hover:bg-stone-850 text-stone-500 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-lg bg-[#16120E] border border-[#2B221A] shadow-2xl z-50 py-1 text-left animate-fade-in"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => {
                    onPlayNext(track.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-300 hover:bg-brand hover:text-stone-950 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Tocar a Seguir
                </button>
                <button
                  onClick={() => {
                    onAddToQueue(track.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-300 hover:bg-brand hover:text-stone-950 transition-colors"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  Adicionar à Fila
                </button>

                {/* Favorites option */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(track.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-300 hover:bg-brand hover:text-stone-950 transition-colors"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-[#dfb26f]' : ''}`} />
                  {isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                </button>

                {/* Playlist Sub-list */}
                <div className="border-t border-[#261E17]/60 my-1 py-1">
                  <p className="px-3 py-1 text-[9px] font-bold text-brand/60 uppercase tracking-wider">Adicionar à Playlist</p>
                  {customPlaylists.length > 0 ? (
                    customPlaylists.map(pl => (
                      <button
                        key={pl.id}
                        onClick={() => {
                          onAddToPlaylist(pl.id, track.id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-stone-400 hover:bg-stone-800 hover:text-white transition-colors truncate pl-5"
                      >
                        <FolderPlus className="w-3 h-3 text-brand/50" />
                        <span className="truncate">{pl.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-1 text-[10px] text-stone-500 italic">
                      Nenhuma playlist
                    </div>
                  )}

                  {onCreatePlaylist && (
                    <button
                      onClick={() => {
                        onCreatePlaylist();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#dfb26f] hover:bg-stone-800 hover:text-white transition-colors pl-5"
                    >
                      <Plus className="w-3 h-3 text-[#dfb26f]" />
                      <span>Nova Playlist...</span>
                    </button>
                  )}
                </div>

                {showRemoveOption && onRemoveFromPlaylist && (
                  <button
                    onClick={() => {
                      onRemoveFromPlaylist(track.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-600 hover:text-white transition-colors border-t border-[#261E17]/60"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover da Playlist
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
