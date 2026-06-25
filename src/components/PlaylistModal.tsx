import React, { useState } from 'react';
import { X, Music, Sparkles, FolderPlus, AlignLeft, Image as ImageIcon } from 'lucide-react';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, coverUrl: string) => void;
}

// Beautiful vector-based default 16:9 cover image showing a stylized serif "C" for Celeiro
const DEFAULT_C_COVER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23dfb26f" /><stop offset="50%" stop-color="%232c2110" /><stop offset="100%" stop-color="%23121214" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)" /><circle cx="400" cy="225" r="90" fill="%23121214" fill-opacity="0.6" stroke="%23dfb26f" stroke-opacity="0.3" stroke-width="2" /><text x="50%" y="54%" font-family="'Times New Roman', Georgia, serif" font-weight="900" font-size="130" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">C</text><text x="50%" y="82%" font-family="'Courier New', monospace" font-weight="bold" font-size="14" fill="%23dfb26f" letter-spacing="6" text-anchor="middle" opacity="0.9">CELEIRO WORSHIP</text></svg>`;

const PRESET_COVERS = [
  { id: '1', name: 'Adoração Profunda', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80' },
  { id: '2', name: 'Luzes do Altar', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80' },
  { id: '3', name: 'Louvor e Comunhão', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' },
  { id: '4', name: 'Céu e Nuvens', url: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=600&q=80' },
];

export default function PlaylistModal({ isOpen, onClose, onCreate }: PlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedCover, setUploadedCover] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCover = selectedPreset 
    ? (PRESET_COVERS.find(c => c.id === selectedPreset)?.url || DEFAULT_C_COVER)
    : (uploadedCover || DEFAULT_C_COVER);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedCover(reader.result);
          setSelectedPreset(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
    setUploadedCover('');
    setSelectedPreset(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Dynamic Heights Large Modal Container (No aspect ratio to avoid squishing and scrollbars) */}
      <div className="relative w-full max-w-4xl bg-[#1a1a1c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 animate-scale-up text-white flex flex-col md:flex-row select-none md:items-stretch h-auto">
        
        {/* Left Side: 16:9 Dynamic Preview Frame */}
        <div className="w-full md:w-[42%] bg-[#121214] border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between relative overflow-hidden">
          
          <div className="absolute inset-0 bg-gradient-to-b from-[#dfb26f]/5 via-transparent to-black/40 pointer-events-none" />

          <div className="relative z-10 text-left">
            <h4 className="text-sm font-black text-white">Capa da sua Playlist</h4>
            <p className="text-[11px] text-stone-400 mt-1">Veja em tempo real como ficará a identidade visual da sua coleção de louvor.</p>
          </div>

          {/* 16:9 Cover Frame Card */}
          <div className="my-6 relative z-10 w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-[#1c1c1e] shadow-2xl group transition-all duration-300">
            <img 
              src={currentCover} 
              alt="Cover Preview" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Dark vinyl text overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-left">
              <span className="text-[9px] font-extrabold text-[#dfb26f] uppercase tracking-widest">
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
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-center relative text-left">
          
          {/* Close Button */}
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-stone-400 hover:text-white transition-all hover:bg-white/10 active:scale-95 cursor-pointer z-20"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-4">
            {/* Title / Description Header */}
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2 text-white">
                <FolderPlus className="w-5 h-5 text-[#dfb26f]" />
                Criar Nova Playlist
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">Inicie uma nova lista de reprodução com os louvores que tocam seu coração.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Name field */}
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-1 px-1">
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
                    className="w-full bg-[#121214] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-stone-600 font-medium focus:outline-none focus:border-[#dfb26f] focus:ring-1 focus:ring-[#dfb26f] transition-all"
                  />
                </div>
              </div>

              {/* Description field */}
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-1 px-1">
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
                    className="w-full bg-[#121214] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-stone-600 font-medium focus:outline-none focus:border-[#dfb26f] focus:ring-1 focus:ring-[#dfb26f] transition-all"
                  />
                </div>
              </div>

              {/* Cover Image Selection Options */}
              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-1.5 px-1">
                  Escolha uma capa predefinida
                </label>

                {/* Cover presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {PRESET_COVERS.map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => {
                        setSelectedPreset(preset.id);
                        setUploadedCover('');
                      }}
                      className={`relative aspect-[16/9] rounded-lg overflow-hidden border transition-all cursor-pointer group ${
                        selectedPreset === preset.id
                          ? 'border-[#dfb26f] ring-2 ring-[#dfb26f]/50'
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

                {/* File Upload Area */}
                <div>
                  <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-1.5 px-1">
                    Ou envie uma imagem do seu dispositivo
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      id="playlist-cover-upload"
                      className="hidden"
                    />
                    <label
                      htmlFor="playlist-cover-upload"
                      className="flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-[#dfb26f]/50 bg-[#121214] hover:bg-[#121214]/80 rounded-xl py-3 px-4 text-center cursor-pointer transition-all group"
                    >
                      <ImageIcon className="w-5 h-5 text-stone-500 group-hover:text-[#dfb26f] mb-1 transition-colors" />
                      {uploadedCover ? (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-emerald-400 block">✓ Imagem carregada com sucesso</span>
                          <span className="text-[9px] text-stone-500 block">Clique para alterar a imagem</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-stone-300 group-hover:text-white transition-colors">Escolher imagem de capa</span>
                          <span className="text-[9px] text-stone-500 block">Formatos aceitos: JPG, PNG, WEBP</span>
                        </div>
                      )}
                    </label>
                    {uploadedCover && (
                      <button 
                        type="button"
                        onClick={() => setUploadedCover('')}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-stone-400 hover:text-white text-xs hover:bg-black/80 transition-all cursor-pointer"
                        title="Remover imagem enviada"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {!selectedPreset && !uploadedCover && (
                  <p className="text-[9px] text-[#dfb26f] mt-1.5 font-semibold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#dfb26f] animate-pulse" />
                    Capa padrão com um "C" será definida automaticamente.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-white/5 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/5 text-stone-300 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#dfb26f] hover:bg-[#cf9e58] text-white flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#dfb26f]/15 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
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
