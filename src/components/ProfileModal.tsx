import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  Camera, 
  Move, 
  ZoomIn, 
  Check, 
  AlertCircle, 
  Loader2,
  Calendar,
  CreditCard
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured, mockAuthService } from '../lib/supabase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: { name: string; email: string; photoUrl: string } | null;
  onProfileUpdate: (updatedProfile: { name: string; email: string; photoUrl: string }) => void;
  showToast: (msg: string) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdate,
  showToast
}: ProfileModalProps) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Crop & Size states
  const [cropMode, setCropMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageAspect, setImageAspect] = useState<number>(1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // Initialize values when modal opens
  useEffect(() => {
    if (userProfile && isOpen) {
      setPhotoUrl(userProfile.photoUrl);
      setPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setCropMode(false);
      setSelectedImage(null);
      setImageAspect(1);
    }
  }, [userProfile, isOpen]);

  if (!isOpen || !userProfile) return null;

  // Handles image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const resultStr = reader.result;
          const img = new Image();
          img.src = resultStr;
          img.onload = () => {
            setImageAspect(img.naturalWidth / img.naturalHeight);
            setSelectedImage(resultStr);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            setCropMode(true);
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag logic for image crop inside the circular frame
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setOffset({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.x;
    const dy = touch.clientY - dragStart.y;
    setOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Apply the cropped and scaled image onto Canvas
  const handleApplyCrop = () => {
    if (!selectedImage) return;

    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw circular mask clipping
        ctx.beginPath();
        ctx.arc(150, 150, 150, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Background color
        ctx.fillStyle = '#1c1c1e';
        ctx.fillRect(0, 0, 300, 300);

        // Map aspect ratio
        const imgAspect = img.naturalWidth / img.naturalHeight;
        let drawWidth = 300;
        let drawHeight = 300;

        if (imgAspect > 1) {
          drawWidth = 300 * imgAspect;
        } else {
          drawHeight = 300 / imgAspect;
        }

        // Base scaled sizes
        const scaledW = drawWidth * zoom;
        const scaledH = drawHeight * zoom;

        // Centered coordinates
        const xBase = (300 - scaledW) / 2;
        const yBase = (300 - scaledH) / 2;

        // Apply offsets adjusted for canvas ratio (300px vs 176px crop box size, roughly 1.7x scaling)
        const finalX = xBase + offset.x * 1.7;
        const finalY = yBase + offset.y * 1.7;

        ctx.drawImage(img, finalX, finalY, scaledW, scaledH);

        // Set photoUrl
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoUrl(croppedDataUrl);
        setCropMode(false);
        setSelectedImage(null);
        showToast('Ajuste de foto aplicado com sucesso!');
      }
    };
  };

  // Handle Saving Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password validations
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setErrorMsg('As senhas não coincidem.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('A nova senha deve conter no mínimo 6 caracteres.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg(null);

    const supabase = getSupabase();
    if (isSupabaseConfigured && supabase) {
      try {
        const updateData: any = {
          data: {
            avatar_url: photoUrl
          }
        };
        if (password) {
          updateData.password = password;
        }

        const { data, error } = await supabase.auth.updateUser(updateData);

        if (error) {
          setErrorMsg(error.message);
        } else {
          const updated = {
            name: userProfile.name,
            email: userProfile.email,
            photoUrl: photoUrl
          };
          onProfileUpdate(updated);
          showToast(password ? 'Senha e perfil atualizados no Supabase!' : 'Perfil atualizado com sucesso!');
          onClose();
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro ao sincronizar com o banco de dados.');
      } finally {
        setLoading(false);
      }
    } else {
      // Update in local Storage Mock Database
      const { data, error } = await mockAuthService.updateProfile(userProfile.email, photoUrl, password || undefined);
      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.user) {
        onProfileUpdate({
          name: data.user.name,
          email: data.user.email,
          photoUrl: data.user.photoUrl
        });
        showToast(password ? 'Senha e foto de perfil atualizadas com sucesso!' : 'Perfil atualizado com sucesso!');
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Profile Modal Container - Landscape 16:9-ish Aspect Ratio */}
      <div className="relative w-full max-w-[820px] bg-[#1c1c1e] border border-white/10 rounded-3xl p-8 shadow-2xl z-10 animate-scale-up text-white select-none max-h-[92vh] overflow-y-auto scrollbar-none">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-full bg-white/10 text-stone-400 hover:text-white transition-colors active:scale-95 cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title */}
        <div className="text-left mb-6 border-b border-white/5 pb-4">
          <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-[#dfb26f]" />
            Configurações da Conta
          </h3>
          <p className="text-xs text-stone-400 mt-1">Gerencie sua identidade, altere sua senha e visualize seu plano de assinatura</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 text-left animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Two Column Grid - 16:9 Dashboard feel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN: Profile Image Cropper or Avatar & Subscription */}
          <div className="col-span-1 md:col-span-5 flex flex-col justify-between space-y-6 md:border-r md:border-white/5 md:pr-8">
            
            {cropMode && selectedImage ? (
              /* IMAGE CROPPER IN-VIEW */
              <div className="flex flex-col items-center justify-center py-4 bg-black/25 rounded-2xl p-4 border border-white/5">
                <span className="text-[10px] font-bold text-stone-300 mb-3.5 flex items-center gap-1.5 uppercase tracking-wider">
                  <Move className="w-3.5 h-3.5 text-[#dfb26f]" />
                  Ajuste sua Foto
                </span>

                {/* Circular Mask Frame */}
                <div 
                  ref={cropContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="w-40 h-40 rounded-full overflow-hidden border-2 border-[#dfb26f] relative cursor-grab active:cursor-grabbing bg-[#121214] shadow-inner"
                >
                  <img 
                    ref={imageRef}
                    src={selectedImage} 
                    alt="Original" 
                    className="absolute origin-center pointer-events-none select-none max-w-none"
                    style={{
                      transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                      top: '50%',
                      left: '50%',
                      height: imageAspect > 1 ? '100%' : 'auto',
                      width: imageAspect > 1 ? 'auto' : '100%',
                    }}
                  />
                </div>

                {/* Scale Control / Zoom Slider */}
                <div className="w-full mt-4 flex items-center gap-2.5">
                  <ZoomIn className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <input 
                    type="range"
                    min="1"
                    max="3"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#dfb26f] focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, #dfb26f 0%, #dfb26f ${((zoom - 1) / 2 * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) ${((zoom - 1) / 2 * 100).toFixed(2)}%, rgba(255, 255, 255, 0.1) 100%)`
                    }}
                  />
                  <span className="text-[10px] font-mono text-stone-400 shrink-0 w-8 text-right">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                {/* Cropper Action Buttons */}
                <div className="flex gap-2 mt-4.5 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setCropMode(false);
                      setSelectedImage(null);
                    }}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border border-white/10 hover:bg-white/5 text-stone-300 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-bold bg-[#dfb26f] hover:bg-[#cf9e58] text-stone-950 flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Aplicar
                  </button>
                </div>
              </div>
            ) : (
              /* STANDARD AVATAR VIEW */
              <div className="flex flex-col items-center justify-center py-6 bg-white/[0.02] border border-white/5 rounded-2xl relative">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-2 border-white/15 overflow-hidden shadow-xl relative bg-stone-900">
                    <img 
                      src={photoUrl} 
                      alt={userProfile.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Camera overlay toggle */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-[#dfb26f] hover:bg-[#cf9e58] text-stone-950 transition-all shadow-md cursor-pointer hover:scale-110 active:scale-95"
                    title="Alterar foto de perfil"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <span className="text-[10px] font-bold text-stone-400 mt-3">Foto de Perfil</span>
                <p className="text-[9px] text-stone-500 mt-1">Toque no ícone para alterar e ajustar a imagem</p>
              </div>
            )}

            {/* Premium Subscription section */}
            <div className="text-left bg-gradient-to-br from-[#1c1c1e] to-[#25211a] border border-[#dfb26f]/15 rounded-2xl p-4.5 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                  Assinatura Celeiro
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#dfb26f]/90 bg-[#dfb26f]/10 border border-[#dfb26f]/15 px-2.5 py-1 rounded-full uppercase font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#dfb26f] animate-pulse" />
                  EM BREVE
                </span>
              </div>

              <div className="flex items-start gap-3 mt-3">
                <div className="p-2 bg-[#dfb26f]/10 rounded-xl border border-[#dfb26f]/15 shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4 text-[#dfb26f]" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    Plano Celeiro VIP Pass
                  </h4>
                  <p className="text-[10px] text-stone-400 mt-1 leading-normal">
                    Assinatura Celeiro VIP inclusa como cortesia de teste de desenvolvimento.
                  </p>
                  
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#dfb26f] mt-2.5">
                    <Calendar className="w-3 h-3" />
                    <span>Válido até: 31/12/2026</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: User Information & Password Redefinition Form */}
          <div className="col-span-1 md:col-span-7 flex flex-col justify-between">
            <form onSubmit={handleSaveProfile} className="space-y-5 flex-1 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Nome (Read only) */}
                <div className="text-left">
                  <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1.5 px-1">
                    Nome (não alterável)
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-stone-500" />
                    <input
                      type="text"
                      value={userProfile.name}
                      disabled
                      className="w-full bg-[#121214] border border-white/5 rounded-xl pl-11 pr-10 py-3 text-xs text-stone-500 font-bold focus:outline-none select-none cursor-not-allowed"
                    />
                    <Lock className="absolute right-3.5 w-3.5 h-3.5 text-stone-600" />
                  </div>
                </div>

                {/* Email (Read only) */}
                <div className="text-left">
                  <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1.5 px-1">
                    E-mail (não alterável)
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-stone-500" />
                    <input
                      type="email"
                      value={userProfile.email}
                      disabled
                      className="w-full bg-[#121214] border border-white/5 rounded-xl pl-11 pr-10 py-3 text-xs text-stone-500 font-bold focus:outline-none select-none cursor-not-allowed"
                    />
                    <Lock className="absolute right-3.5 w-3.5 h-3.5 text-stone-600" />
                  </div>
                </div>

                {/* Password modification separator heading */}
                <div className="pt-2 border-t border-white/5">
                  <h4 className="text-[10px] font-extrabold text-[#dfb26f] uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Redefinir Senha de Acesso
                  </h4>
                  <p className="text-[9px] text-stone-400 mt-1">Preencha os campos abaixo apenas se desejar redefinir sua senha de login</p>
                </div>

                {/* Nova Senha */}
                <div className="text-left">
                  <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1.5 px-1">
                    Nova Senha
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo de 6 caracteres"
                      className="w-full bg-[#121214] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-stone-600 font-medium focus:outline-none focus:border-[#dfb26f] focus:ring-1 focus:ring-[#dfb26f] transition-all"
                    />
                  </div>
                </div>

                {/* Confirmar Nova Senha */}
                <div className="text-left">
                  <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1.5 px-1">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua nova senha"
                      className="w-full bg-[#121214] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-stone-600 font-medium focus:outline-none focus:border-[#dfb26f] focus:ring-1 focus:ring-[#dfb26f] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons at the bottom */}
              <div className="flex gap-3.5 pt-6 mt-6 border-t border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/5 text-stone-300 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl text-xs font-black bg-[#dfb26f] hover:bg-[#cf9e58] text-stone-950 flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#dfb26f]/15 hover:shadow-[#dfb26f]/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
