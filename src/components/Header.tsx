import React from 'react';
import { Search, Menu, Wifi, WifiOff, RefreshCw, Sparkles } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  offlineMode: boolean;
  setOfflineMode: (offline: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
  onShuffleAll: () => void;
  onClearCache?: () => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  offlineMode,
  setOfflineMode,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  onShuffleAll,
  onClearCache
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-[#0E0B09]/80 backdrop-blur-md border-b border-[#261E17] text-white">
      {/* Left: Mobile Menu Trigger + Context Title */}
      <div className="flex items-center gap-4">
        <button
          id="mobile-menu-trigger"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-stone-900 md:hidden text-stone-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-mono text-brand/80 bg-brand/5 border border-brand/10 px-2 py-1 rounded-full flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3 h-3 text-brand animate-pulse" />
            SOM DIGITAL ACOUSTIC HQ
          </span>
        </div>
      </div>

      {/* Middle: Apple Music search experience */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
          <input
            id="main-search-input"
            type="text"
            placeholder="Buscar músicas, artistas ou álbuns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-stone-900 hover:bg-stone-850 focus:bg-stone-950 text-white placeholder-stone-500 rounded-lg border border-[#261E17] focus:border-brand/50 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-stone-500 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Right: Network state simulator + Mix Actions */}
      <div className="flex items-center gap-3">
        {/* Offline Mode Switcher */}
        <button
          id="offline-toggle-button"
          onClick={() => setOfflineMode(!offlineMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            offlineMode
              ? 'bg-brand/10 text-brand border-brand/30'
              : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-850 hover:text-white'
          }`}
          title={offlineMode ? 'Você está em modo offline' : 'Mudar para modo offline'}
        >
          {offlineMode ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-brand" />
              <span className="hidden xs:inline">Modo Offline</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden xs:inline font-medium">Modo Online</span>
            </>
          )}
        </button>

        {/* Quick Shuffle Play */}
        <button
          id="header-shuffle-btn"
          onClick={onShuffleAll}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand to-brand/80 text-white font-bold text-xs shadow-md shadow-brand/10 hover:brightness-110 active:scale-95 transition-all"
        >
          Mix Aleatório
        </button>
      </div>
    </header>
  );
}
