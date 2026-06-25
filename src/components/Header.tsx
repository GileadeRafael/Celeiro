import React from 'react';
import { Search, Menu, Play, Music, Wifi, WifiOff, Sparkles } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  offlineMode: boolean;
  setOfflineMode: (offline: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
  onShuffleAll: () => void;
  onClearCache?: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  offlineMode,
  setOfflineMode,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  onShuffleAll,
  onClearCache,
  activeTab,
  setActiveTab
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-transparent border-b border-white/10 text-white">
      {/* Left: Mobile Menu Trigger */}
      <div className="flex items-center gap-4">
        <button
          id="mobile-menu-trigger"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-stone-900 md:hidden text-stone-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Middle: Centered Pill Navigation Tabs (Matches requested modal tabs) */}
      <div className="flex-1 flex justify-center max-w-lg mx-auto">
        <div className="flex p-1 bg-[#18181b]/85 border border-white/10 rounded-full backdrop-blur-md shadow-lg">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-[#fa2d48] text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Ouvindo agora</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('search');
              setSearchQuery('');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-[#fa2d48] text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar</span>
          </button>

          <button
            onClick={() => setActiveTab('library-playlists')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'library-playlists'
                ? 'bg-[#fa2d48] text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Playlists</span>
          </button>
        </div>
      </div>

      {/* Right: Empty spacer to center the pill navigation */}
      <div className="flex items-center justify-end w-10 md:w-16"></div>
    </header>
  );
}
