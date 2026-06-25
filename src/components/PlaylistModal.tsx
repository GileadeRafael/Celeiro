import React, { useState } from 'react';
import { X, Music, Sparkles, FolderPlus, AlignLeft, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, coverUrl: string) => void;
}

// Beautiful vector-based default 16:9 cover image showing a stylized serif "C" for Celeiro
const DEFAULT_C_COVER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fa2d48" /><stop offset="50%" stop-color="%232c1015" /><stop offset="100%" stop-color="%23121214" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)" /><circle cx="400" cy="225" r="90" fill="%23121214" fill-opacity="0.6" stroke="%23fa2d48" stroke-opacity="0.3" stroke-width="2" /><text x="50%" y="54%" font-family="'Times New Roman', Georgia, serif" font-weight="900" font-size="130" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">C</text><text x="50%" y="82%" font-family="'Courier New', monospace" font-weight="bold" font-size="14" fill="%23fa2d48" letter-spacing="6" text-anchor="middle" opacity="0.9">CELEIRO WORSHIP</text></svg>`;

const PRESET_COVERS = [
  { id: '1', name: 'Adoração Profunda', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80' },
  { id: '2', name: 'Luzes do Altar', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80' },
  { id: '3', name: 'Louvor e Comunhão', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' },
  { id: '4', name: 'Momento de Paz', url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80' },
];

export default function PlaylistModal({ isOpen, onClose, onCreate }: PlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCover = selectedPreset 
    ? (PRESET_COVERS.find(c => c.id === selectedPreset)?.url || DEFAULT_C_COVER)
    : (customUrl.trim() || DEFAULT_C_COVER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate(
      name.trim(), 
      description.trim() || 'Minha playlist de adoração personalizada', 
      currentCover
    );
    
    // Reset fields
    setName('');
    setDescription('');
    setCustomUrl('');
    setSelectedPreset(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* 16:9 Ratio Inspired Large Modal Container */}
      <div className="relative w-full max-w-4xl aspect-[16/10] md:aspect-[16/9.5] bg-[#1a1a1c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 animate-scale-up text-white flex flex-col md:flex-row select-none">
        
        {/* Left Side: 16:9 Dynamic Preview Frame */}
        <div className="w-full md:w-[45%] bg-[#121214] border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between relative overflow-hidden">
          
          <div className="absolute inset-0 bg-gradient-to-b from-[#fa2d48]/5 via-transparent to-black/40 pointer-events-none" />

          <div className="relative z-10 text-left">
            <span className="text-[10px] font-extrabold text-[#fa2d48] uppercase tracking-widest bg-[#fa2d48]/10 px-2.5 py-1 rounded-full border border-[#fa2d48]/20">
              Visualização 16:9
            </span>
            <h4 className="text-sm font-black text-white mt-4">Capa da sua Playlist</h4>
            <p className="text-[11px] text-stone-400 mt-1">Veja em tempo real como ficará a identidade visual da sua coleção de louvor.</p>
          </div>

          {/* 16:9 Cover Frame Card */}
          <div className="my-4 relative z-10 w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-[#1c1c1e] shadow-2xl group transition-all duration-300">
            <img 
              src={currentCover} 
              alt="Cover Preview" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Dark vinyl text overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-left">
              <span className="text-[9px] font-extrabold text-[#fa2d48] uppercase tracking-widest">
                Celeiro Worship
              </span>
              <h3 className="text-sm font-black text-white truncate drop-shadow-md">
                {name.trim() || 'Minhas de Adoração'}
              </h3>
              <p className="text-[10px] text-stone-300 line-clamp-1 opacity-90">
                {description.trim() || 'As melhores músicas de louvor e comunhão.'}
              </p>
            </div>
          </div>

          <div className="relative z-10 text-left">
            <p className="text-[10px] text-stone-500 font-mono">
              Formato: JPEG/PNG/SVG • Sincronizado com Nuvem
            </p>
          </div>
        </div>

        {/* Right Side: Setup Form fields */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto relative text-left">
          
          {/* Close Button */}
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-stone-400 hover:text-white transition-all hover:bg-white/10 active:scale-95 cursor-pointer z-20"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-6">
            {/* Title / Description Header */}
            <div>
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
                <FolderPlus className="w-5.5 h-5.5 text-[#fa2d48]" />
                Criar Nova Playlist
              </h3>
              <p className="text-xs text-stone-400 mt-1">Inicie uma nova lista de reprodução com os louvores que tocam seu coração.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name field */}
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-1.5 px-1">
                  Nome da Playlist *
                </label>
                <div className="relative flex items-center">
                  <Music className="absolute left-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Louvores de Domingo"
                    maxLength={40}
                    className="w-full bg-[#121214] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-stone-600 font-medium focus:outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48] transition-all"
                  />
                </div>
              </div>

              {/* Description field */}
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-1.5 px-1">
                  Descrição (opcional)
                </label>
                <div className="relative flex items-center">
                  <AlignLeft className="absolute left-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Seleção especial com canções para oração e intimidade."
                    maxLength={100}
                    className="w-full bg-[#121214] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-stone-600 font-medium focus:outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48] transition-all"
                  />
                </div>
              </div>

              {/* Cover Image Selection Options */}
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-2 px-1">
                  Selecione ou Cole uma Imagem de Capa
                </label>

                {/* Cover presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {PRESET_COVERS.map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => {
                        setSelectedPreset(preset.id);
                        setCustomUrl('');
                      }}
                      className={`relative aspect-[16/9] rounded-lg overflow-hidden border transition-all cursor-pointer group ${
                        selectedPreset === preset.id
                          ? 'border-[#fa2d48] ring-2 ring-[#fa2d48]/50'
                          : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="text-[9px] font-extrabold text-white text-center px-1 truncate w-full">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom URL Input with indicator */}
                <div className="relative flex items-center">
                  <LinkIcon className="absolute left-3.5 w-4 h-4 text-stone-500" />
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      setSelectedPreset(null);
                    }}
                    placeholder="Ou cole o link de uma imagem personalizada (ex: https://...)"
                    className="w-full bg-[#121214] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-stone-600 font-medium focus:outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48] transition-all"
                  />
                  {customUrl && (
                    <button 
                      type="button"
                      onClick={() => setCustomUrl('')}
                      className="absolute right-3.5 text-xs text-stone-500 hover:text-white"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {!selectedPreset && !customUrl && (
                  <p className="text-[10px] text-[#fa2d48] mt-2 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fa2d48] animate-pulse" />
                    Capa padrão com um "C" será definida automaticamente.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
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

      </div>
    </div>
  );
}
