import React from 'react';
import { 
  Home, 
  Search, 
  ExternalLink,
  Play,
  User,
  LogOut,
  Heart,
  Clock,
  Plus,
  Music
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
  onProfileClick: () => void;
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
  onLogout,
  onProfileClick
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#dfb26f] to-[#f4d7a8] flex items-center justify-center shadow-md shadow-[#dfb26f]/20">
            <Play className="w-4 h-4 text-stone-950 fill-current ml-0.5" />
          </div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-white font-sans">
            Celeiro
          </h1>
        </div>
      </div>

      {/* Main Navigation and Library Scroll Container */}
      <div className="px-3 pt-6 flex-1 overflow-y-auto scrollbar-none space-y-6">
        <div>
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
                        ? 'bg-white/[0.08] text-[#dfb26f] font-semibold border border-white/[0.05]'
                        : 'hover:bg-white/[0.04] text-stone-300 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#dfb26f]' : 'text-stone-400'}`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Library Section (Only visible when user is logged in) */}
        {userProfile && (
          <div className="space-y-5 animate-fade-in pt-2 border-t border-white/[0.06]">
            <div>
              <p className="px-3.5 text-[10px] font-extrabold text-stone-500 uppercase tracking-widest mb-2">Minha Biblioteca</p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('library-favorites');
                      setSelectedPlaylistId(null);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 text-left cursor-pointer ${
                      activeTab === 'library-favorites' && !selectedPlaylistId
                        ? 'bg-white/[0.08] text-[#dfb26f] font-semibold border border-white/[0.05]'
                        : 'hover:bg-white/[0.04] text-stone-300 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${activeTab === 'library-favorites' && !selectedPlaylistId ? 'text-[#dfb26f] fill-current' : 'text-stone-400'}`} />
                    Favoritos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('library-history');
                      setSelectedPlaylistId(null);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 text-left cursor-pointer ${
                      activeTab === 'library-history' && !selectedPlaylistId
                        ? 'bg-white/[0.08] text-[#dfb26f] font-semibold border border-white/[0.05]'
                        : 'hover:bg-white/[0.04] text-stone-300 hover:text-white'
                    }`}
                  >
                    <Clock className={`w-4 h-4 ${activeTab === 'library-history' && !selectedPlaylistId ? 'text-[#dfb26f]' : 'text-stone-400'}`} />
                    Histórico
                  </button>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between px-3.5 mb-2">
                <p className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Playlists</p>
                <button
                  onClick={onCreatePlaylist}
                  className="p-1 rounded-md hover:bg-white/10 text-[#dfb26f] transition-colors cursor-pointer"
                  title="Criar nova playlist"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <ul className="space-y-1 max-h-[160px] overflow-y-auto scrollbar-none">
                {customPlaylists.length === 0 ? (
                  <li className="px-3.5 py-2 text-[11px] text-stone-500 italic">Nenhuma playlist criada</li>
                ) : (
                  customPlaylists.map((pl) => {
                    const isSelected = selectedPlaylistId === pl.id;
                    return (
                      <li key={pl.id}>
                        <button
                          onClick={() => {
                            setActiveTab('library-playlists');
                            setSelectedPlaylistId(pl.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 text-left cursor-pointer ${
                            isSelected
                              ? 'bg-[#dfb26f]/10 text-[#dfb26f] font-bold border border-[#dfb26f]/20'
                              : 'hover:bg-white/[0.03] text-stone-400 hover:text-white'
                          }`}
                        >
                          <Music className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#dfb26f]' : 'text-stone-500'}`} />
                          <span className="truncate flex-1">{pl.name}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>
        )}
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
            <Play className="w-4 h-4 text-[#dfb26f]" />
            <span>Cenáculo Music</span>
            <ExternalLink className="w-3 h-3 text-stone-500" />
          </a>

          {userProfile ? (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.04] border border-white/15 shadow-md">
              <div 
                onClick={onProfileClick}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                title="Ver e editar perfil"
              >
                <img 
                  src={userProfile.photoUrl} 
                  alt={userProfile.name} 
                  className="w-9 h-9 rounded-full border border-white/20 object-cover bg-stone-900" 
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-white font-bold text-xs truncate leading-tight">{userProfile.name}</p>
                  <p className="text-[#8e8e93] text-[10px] truncate leading-tight mt-0.5">{userProfile.email}</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="text-stone-400 hover:text-[#dfb26f] shrink-0 transition-colors p-1.5 hover:bg-white/5 rounded-lg cursor-pointer"
                title="Sair da sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="sidebar-signin-btn"
              onClick={onLoginClick}
              className="w-full bg-[#dfb26f] hover:bg-[#cf9e58] text-stone-950 font-extrabold text-sm py-3 rounded-full text-center transition-all shadow-lg shadow-[#dfb26f]/15 flex items-center justify-center gap-2 active:scale-[0.96] cursor-pointer"
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
