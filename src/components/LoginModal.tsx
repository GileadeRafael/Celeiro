import React, { useState } from 'react';
import { X, Play, AlertCircle, Info, Mail, Lock, User, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { getSupabase, isSupabaseConfigured, mockAuthService } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; photoUrl: string }) => void;
}

type AuthMode = 'signin' | 'signup';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Quick credentials guide to test with mock mode
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  if (!isOpen) return null;

  const handleToggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const supabase = getSupabase();
    if (isSupabaseConfigured && supabase) {
      // 1. Live Supabase Auth Login
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data?.user) {
          const profile = {
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
            email: data.user.email || '',
            photoUrl: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.user.email || '')}`
          };
          onLoginSuccess(profile);
          onClose();
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Ocorreu um erro ao autenticar.');
      } finally {
        setLoading(false);
      }
    } else {
      // 2. Beautiful Mock Supabase Auth Login
      const { data, error } = await mockAuthService.signIn(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else if (data?.user) {
        onLoginSuccess(data.user);
        onClose();
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const supabase = getSupabase();
    if (isSupabaseConfigured && supabase) {
      // 1. Live Supabase Auth Registration
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
            }
          }
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          // Attempt instant sign-in with password for a smooth experience
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (signInError) {
            // If they need to manually log in, show signin
            setMode('signin');
            setErrorMsg('Cadastro realizado com sucesso! Faça login com suas credenciais.');
          } else if (signInData?.user) {
            const profile = {
              name: signInData.user.user_metadata?.name || signInData.user.email?.split('@')[0] || 'Usuário',
              email: signInData.user.email || '',
              photoUrl: signInData.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(signInData.user.email || '')}`
            };
            onLoginSuccess(profile);
            onClose();
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro ao registrar.');
      } finally {
        setLoading(false);
      }
    } else {
      // 2. Mock Registration and auto-login
      const { error } = await mockAuthService.signUp(email, password, name);
      if (error) {
        setLoading(false);
        setErrorMsg(error.message);
      } else {
        const { data: signInData } = await mockAuthService.signIn(email, password);
        setLoading(false);
        if (signInData?.user) {
          onLoginSuccess(signInData.user);
          onClose();
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[460px] bg-[#1c1c1e] border border-white/10 rounded-3xl p-8 shadow-2xl z-10 animate-scale-up select-none text-center max-h-[90vh] overflow-y-auto scrollbar-none text-white">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 left-5 p-1.5 rounded-full bg-white/10 text-stone-400 hover:text-white transition-colors active:scale-95 cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Logo Header */}
        <div className="flex justify-center mt-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#fa2d48] to-[#ff5268] flex items-center justify-center shadow-lg shadow-[#fa2d48]/20">
            <Play className="w-8 h-8 text-white fill-current ml-1" />
          </div>
        </div>

        {/* Forms for login/signup */}
        <>
          {/* Title & Description */}
          <h3 className="text-2xl font-extrabold tracking-tight leading-tight">
            {mode === 'signin' ? 'Acesse o Celeiro' : 'Criar nova conta'}
          </h3>
          
          <p className="text-xs text-stone-400 mt-2.5 px-4 leading-relaxed">
            {mode === 'signin' 
              ? 'Entre com seu e-mail e senha para acessar seus favoritos, playlists e histórico de louvores.' 
              : 'Crie uma conta para salvar suas canções favoritas, criar playlists e se conectar com os melhores louvores.'}
          </p>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 text-left animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'signin' ? handleLogin : handleRegister} className="mt-6 space-y-3.5 text-left">
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1.5">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input 
                    type="text" 
                    placeholder="Ex: Sarah Lima"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#fa2d48] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input 
                  type="email" 
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#fa2d48] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider">Senha</label>
                {mode === 'signin' && (
                  <span className="text-[10px] text-stone-500 hover:text-[#fa2d48] cursor-pointer transition-colors" onClick={() => alert('Para redefinir a senha, configure as variáveis de ambiente do Supabase no applet.')}>
                    Esqueceu a senha?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input 
                  type="password" 
                  placeholder="No mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#fa2d48] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-stone-100 disabled:opacity-50 text-stone-950 font-extrabold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 mt-6 active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
              ) : (
                <span>{mode === 'signin' ? 'Iniciar Sessão' : 'Criar Conta'}</span>
              )}
            </button>
          </form>

          {/* Toggle Signin/Signup Link */}
          <p className="text-xs text-stone-500 mt-5">
            {mode === 'signin' ? 'Não possui uma conta? ' : 'Já possui uma conta? '}
            <button 
              onClick={handleToggleMode}
              className="text-[#fa2d48] font-bold hover:underline cursor-pointer"
            >
              {mode === 'signin' ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>

          {/* Config Details for Developers */}
          {!isSupabaseConfigured && (
            <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
              <div className="flex items-start gap-2.5 text-[#8e8e93] mb-3">
                <Info className="w-4 h-4 text-[#fa2d48] shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-white block">Ativo: Modo de Simulação Supabase</span>
                  Insira as variáveis <code className="text-[#fa2d48] font-mono px-1 rounded bg-black/40">VITE_SUPABASE_URL</code> e <code className="text-[#fa2d48] font-mono px-1 rounded bg-black/40">VITE_SUPABASE_ANON_KEY</code> nas Configurações para conectar a sua base real do Supabase.
                </div>
              </div>

              <button 
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full flex items-center justify-between text-[10px] text-stone-400 hover:text-white font-bold uppercase tracking-wider py-1"
              >
                <span>{showDemoAccounts ? 'Ocultar' : 'Ver'} Contas de Demonstração</span>
                <KeyRound className="w-3.5 h-3.5 text-[#fa2d48]" />
              </button>

              {showDemoAccounts && (
                <div className="mt-2.5 space-y-2 pt-2 border-t border-white/5 text-[10.5px]">
                  <div className="p-2 rounded bg-black/30 border border-white/5">
                    <p className="font-semibold text-stone-300">Criar Usuários Livres:</p>
                    <p className="text-[#8e8e93] mt-0.5">Use qualquer e-mail e senha para simular o fluxo completo.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>

      </div>
    </div>
  );
}
