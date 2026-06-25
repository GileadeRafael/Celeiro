import React from 'react';
import { 
  Home, 
  Search, 
  ExternalLink,
  Play,
  User,
  LogOut
} from 'lucide-react';
import { Playlist } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  customPlaylists: Playlist[];
  onCreatePlaylist: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
  userProfile: { name: string; email: string; photoUrl: string } | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  selectedPlaylistId,
  setSelectedPlaylistId,
  customPlaylists,
  onCreatePlaylist,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  userProfile,
  onLoginClick,
  onLogout
}: SidebarProps) {
  
  const handleNavClick = (tab: any) => {
    setActiveTab(tab);
    setSelectedPlaylistId(null);
    setIsMobileSidebarOpen(false);
  };

  const mainNavItems = [
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'browse', label: 'Início', icon: Home },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1f1f1f]/60 border border-white/10 rounded-[24px] text-[#8e8e93] select-none backdrop-blur-xl shadow-2xl overflow-hidden">
      
      {/* Brand Logo - Celeiro Style */}
      <div className="pt-8 px-6 pb-2">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick('browse')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#fa2d48] to-[#ff5268] flex items-center justify-center shadow-md shadow-[#fa2d48]/20">
            <Play className="w-4 h-4 text-white fill-current ml-0.5" />
          </div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-white font-sans">
            Celeiro
          </h1>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-3 pt-6 flex-1">
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            // Map search tab or browse default tab
            const isActive = activeTab === item.id && !selectedPlaylistId;
            return (
              <li key={item.id}>
                <button
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 text-left cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.08] text-[#fa2d48] font-semibold border border-white/[0.05]'
                      : 'hover:bg-white/[0.04] text-stone-300 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#fa2d48]' : 'text-stone-400'}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sidebar Footer (Matches Screenshot 3 / Custom Request) */}
      <div className="p-4 border-t border-white/[0.08] text-xs">
        <div className="mb-2">
          <a
            href="https://youtube.com/@CenaculoMusic"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 text-stone-400 hover:text-white font-medium text-[13px] mb-4 px-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 text-[#fa2d48]" />
            <span>Cenáculo Music</span>
            <ExternalLink className="w-3 h-3 text-stone-500" />
          </a>

          {userProfile ? (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.04] border border-white/15 shadow-md">
              <img 
                src={userProfile.photoUrl} 
                alt={userProfile.name} 
                className="w-9 h-9 rounded-full border border-white/20 object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-white font-bold text-xs truncate leading-tight">{userProfile.name}</p>
                <p className="text-[#8e8e93] text-[10px] truncate leading-tight mt-0.5">{userProfile.email}</p>
              </div>
              <button 
                onClick={onLogout}
                className="text-stone-400 hover:text-[#fa2d48] shrink-0 transition-colors p-1.5 hover:bg-white/5 rounded-lg cursor-pointer"
                title="Sair da sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="sidebar-signin-btn"
              onClick={onLoginClick}
              className="w-full bg-[#fa2d48] hover:bg-[#ff2d55] text-white font-bold text-sm py-3 rounded-full text-center transition-all shadow-lg shadow-[#fa2d48]/15 flex items-center justify-center gap-2 active:scale-[0.96] cursor-pointer"
            >
              <User className="w-4 h-4 fill-current" />
              Iniciar sessão
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:block w-64 h-full flex-shrink-0 p-4 bg-[#1f1f1f]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Collapsible Overlay) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative w-64 max-w-xs h-full animate-slide-in p-4 bg-[#1f1f1f]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
