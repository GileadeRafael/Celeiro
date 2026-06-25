import React, { useState } from 'react';
import { X, Music, Sparkles, FolderPlus, AlignLeft } from 'lucide-react';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, coverUrl: string) => void;
}

export default function PlaylistModal({ isOpen, onClose, onCreate }: PlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('acoustic');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate a beautiful cover image based on the chosen theme and name
    const seed = encodeURIComponent(name.trim() + '-' + theme);
    let coverUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}`;
    
    // Add variations for a cozy rural/acoustic style
    if (theme === 'wood') {
      coverUrl = `https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=300&q=80`; // dark wood
    } else if (theme === 'sunset') {
      coverUrl = `https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=300&q=80`; // rustic field at sunset
    } else if (theme === 'campfire') {
      coverUrl = `https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=300&q=80`; // campfire
    } else if (theme === 'guitar') {
      coverUrl = `https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=300&q=80`; // acoustic guitar
    }

    onCreate(name.trim(), description.trim() || 'Minha playlist acústica personalizada', coverUrl);
    setName('');
    setDescription('');
    setTheme('acoustic');
    onClose();
  };

  const themes = [
    { id: 'acoustic', name: 'Formas Abstratas', icon: '🎨' },
    { id: 'wood', name: 'Rústico Madeira', icon: '🪵' },
    { id: 'sunset', name: 'Entardecer no Campo', icon: '🌅' },
    { id: 'campfire', name: 'Fogueira & Luar', icon: '🔥' },
    { id: 'guitar', name: 'Viola Acústica', icon: '🎸' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Playlist Modal Container */}
      <div className="relative w-full max-w-md bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 animate-scale-up text-white select-none">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 text-stone-400 hover:text-white transition-colors active:scale-95 cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-left mb-5 pb-3 border-b border-white/5">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#fa2d48]" />
            Nova Playlist
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">Crie uma nova coleção para organizar suas violações e modas de viola.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field */}
          <div className="text-left">
            <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1 px-1">
              Nome da Playlist *
            </label>
            <div className="relative flex items-center">
              <Music className="absolute left-3.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Minhas Preferidas de Viola"
                maxLength={40}
                className="w-full bg-[#121214] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-stone-600 font-medium focus:outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48] transition-all"
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="text-left">
            <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1 px-1">
              Descrição (opcional)
            </label>
            <div className="relative flex items-center">
              <AlignLeft className="absolute left-3.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Modas de viola caipira e sertanejo raiz para o final de tarde"
                maxLength={100}
                className="w-full bg-[#121214] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-stone-600 font-medium focus:outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48] transition-all"
              />
            </div>
          </div>

          {/* Theme Selection Cover */}
          <div className="text-left">
            <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-2 px-1">
              Tema / Estilo da Capa
            </label>
            
            <div className="grid grid-cols-1 gap-2">
              {themes.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                    theme === t.id
                      ? 'bg-[#fa2d48]/10 border-[#fa2d48] text-[#fa2d48]'
                      : 'bg-white/[0.02] border-white/5 text-stone-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/5 text-stone-300 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3 rounded-xl text-xs font-black bg-[#fa2d48] hover:bg-[#ff2d55] text-white flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#fa2d48]/15 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Criar Playlist
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
