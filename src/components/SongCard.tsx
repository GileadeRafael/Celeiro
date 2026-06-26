import React, { useState } from 'react';
import { Play, Disc, Radio, Heart, Lock } from 'lucide-react';
import { isSongLocked } from '../data/songs';

interface SongCardProps {
  key?: React.Key;
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  type: 'playlist' | 'album' | 'radio' | 'track';
  onClick: () => void;
  onPlayDirectly?: (e: React.MouseEvent) => void;
  badgeText?: string;
  isPopular?: boolean;
  isNew?: boolean;
}

export default function SongCard({
  id,
  title,
  subtitle,
  coverUrl,
  type,
  onClick,
  onPlayDirectly,
  badgeText,
  isPopular,
  isNew
}: SongCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const locked = isSongLocked(id);

  return (
    <div
      id={`song-card-${id}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className="group cursor-pointer select-none"
    >
      {/* Cover image container with zoom and trigger controls */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-950 border border-[#261E17]/50 shadow-lg group-hover:shadow-brand/5 transition-all duration-300">
        <img
          src={coverUrl}
          alt={title}
          className={`w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 ${locked ? 'blur-[4px] opacity-50 grayscale' : ''}`}
          referrerPolicy="no-referrer"
        />

        {/* Hover overlay glassmorphism */}
        {!locked && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center">
            {onPlayDirectly && (
              <button
                id={`card-play-direct-${id}`}
                onClick={onPlayDirectly}
                className="w-12 h-12 rounded-full bg-brand text-stone-950 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 hover:scale-110 active:scale-95 transition-all duration-300"
                title="Tocar Agora"
              >
                <Play className="w-6 h-6 fill-stone-950 pl-0.5" />
              </button>
            )}
          </div>
        )}

        {/* Locked Overlay - Persistent on Capa (No Hover needed) */}
        {locked && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3 text-center">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mb-1.5 shadow-md">
              <Lock className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-[10px] tracking-widest font-black uppercase text-amber-400 font-mono">
              Em Breve
            </span>
            <span className="text-xs font-bold text-white/90 mt-0.5 font-sans">
              16/07 às 12:00h
            </span>
          </div>
        )}

        {/* Live / Station Indicators */}
        {badgeText && !locked && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-brand text-stone-950 uppercase shadow-md flex items-center gap-1">
            {type === 'radio' && <Radio className="w-3 h-3 animate-pulse" />}
            {badgeText}
          </span>
        )}

        {isNew && !badgeText && !locked && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-brand text-stone-950 uppercase shadow-md">
            NOVO
          </span>
        )}

        {/* Beautiful vinyl record subtle visual accent (only on albums) */}
        {type === 'album' && !locked && (
          <div className="absolute right-2 bottom-2 w-5 h-5 rounded-full bg-black/80 border border-stone-700/60 flex items-center justify-center">
            <Disc className="w-3 h-3 text-stone-400 animate-[spin_8s_linear_infinite]" />
          </div>
        )}
      </div>

      {/* Meta Text details */}
      <div className="mt-3">
        <h3 className="text-sm font-semibold text-stone-100 group-hover:text-brand transition-colors truncate flex items-center gap-1.5">
          {title}
          {locked && <Lock className="w-3 h-3 text-amber-500/70" />}
        </h3>
        <p className="text-xs text-stone-400 truncate mt-0.5 font-medium">
          {locked ? 'Lançamento em Breve' : subtitle}
        </p>
      </div>
    </div>
  );
}
