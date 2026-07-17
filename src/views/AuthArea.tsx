import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  Briefcase, 
  ChevronRight,
  RefreshCw,
  KeyRound,
  Sparkles,
  Check
} from "lucide-react";

interface AuthAreaProps {
  onSuccess?: () => void;
  onNavigateBack?: () => void;
  initialMode?: "login" | "register" | "recover" | "change-password";
}

export default function AuthArea({ onSuccess, onNavigateBack, initialMode = "login" }: AuthAreaProps) {
  const { 
    registerWithFirebase, 
    loginWithFirebase, 
    recoverPasswordWithFirebase, 
    changePasswordWithFirebase, 
    verifyEmailWithFirebase,
    currentUser, 
    logoutWithFirebase,
    firebaseAuthLoading 
  } = useApp();

  const [mode, setMode] = useState<"login" | "register" | "recover" | "verify" | "change-password">(
    currentUser ? "verify" : initialMode
  );

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.CLIENTE);
  
  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear states when mode changes
  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithFirebase(email, password);
      setSuccessMsg("Sessão iniciada com sucesso!");
      if (onSuccess) {
        setTimeout(onSuccess, 1000);
      }
    } catch (e: any) {
      // Human-friendly error translation
      let msg = "Falha ao iniciar sessão. Verifique as suas credenciais.";
      if (e.code === "auth/invalid-credential") {
        msg = "Email ou palavra-passe incorretos.";
      } else if (e.code === "auth/user-not-found") {
        msg = "Nenhum utilizador registado com este endereço de email.";
      } else if (e.code === "auth/wrong-password") {
        msg = "Palavra-passe incorreta.";
      } else if (e.code === "auth/too-many-requests") {
        msg = "Acesso temporariamente bloqueado devido a múltiplas tentativas malsucedidas.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Preencha todos os campos obrigatórios (*).");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("A palavra-passe deve conter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("As palavras-passe introduzidas não coincidem.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await registerWithFirebase(name, email, password, role, phone);
      setSuccessMsg("Conta criada com sucesso! Verifique a sua caixa de entrada para ativar o seu email.");
      setMode("verify");
    } catch (e: any) {
      console.error("SignUp form error detail:", e);
      let msg = "Erro ao criar conta. Tente novamente.";
      if (e && e.code) {
        if (e.code === "auth/email-already-in-use") {
          msg = "Este endereço de email já se encontra registado.";
        } else if (e.code === "auth/invalid-email") {
          msg = "Endereço de email inválido.";
        } else if (e.code === "auth/weak-password") {
          msg = "A palavra-passe escolhida é demasiado fraca (mínimo 6 caracteres).";
        } else if (e.code === "auth/operation-not-allowed") {
          msg = "O registo com e-mail e palavra-passe não está ativado no Firebase.";
        } else {
          msg = `Erro (${e.code}): ${e.message || "Por favor, verifique os seus dados."}`;
        }
      } else if (e && e.message) {
        msg = e.message;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Por favor, introduza o seu email.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await recoverPasswordWithFirebase(email);
      setSuccessMsg("Enviámos um link de recuperação para o seu email. Verifique também a pasta de spam.");
    } catch (e: any) {
      let msg = "Erro ao enviar email de recuperação.";
      if (e.code === "auth/user-not-found") {
        msg = "Nenhum utilizador encontrado com este endereço de email.";
      } else if (e.code === "auth/invalid-email") {
        msg = "Endereço de email inválido.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("A palavra-passe deve conter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("As novas palavras-passe não coincidem.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await changePasswordWithFirebase(password);
      setSuccessMsg("Palavra-passe alterada com sucesso!");
      setPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      let msg = "Erro ao alterar palavra-passe. Se necessário, inicie sessão novamente.";
      if (e.code === "auth/requires-recent-login") {
        msg = "Por questões de segurança, esta operação requer autenticação recente. Faça logout e volte a iniciar sessão.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await verifyEmailWithFirebase();
      setSuccessMsg("Email de verificação enviado! Por favor, consulte a sua caixa de correio.");
    } catch (e: any) {
      setErrorMsg("Erro ao enviar email de verificação. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] sm:min-h-[calc(100vh-72px)] w-full flex items-center justify-center py-12 px-4 overflow-hidden" id="firebase-auth-container">
      {/* Immersive background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ 
          backgroundImage: mode === "login" 
            ? `url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&auto=format&fit=crop')` 
            : `url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop')`
        }} 
      />
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-[#0c0d0e] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden z-10">
        
        {/* Glow styling element using official Verde color */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#2B7A5D]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 bg-[#2B7A5D]/15 rounded-2xl text-[#DCE82D] mb-2 border border-[#2B7A5D]/35">
            <KeyRound className="w-6 h-6" />
          </div>
          
          <h2 className="text-2xl font-black tracking-tight text-white font-display">
            {mode === "login" && "Iniciar Sessão"}
            {mode === "register" && "Criar Nova Conta"}
            {mode === "recover" && "Recuperar Palavra-passe"}
            {mode === "verify" && "Verificação de Conta"}
            {mode === "change-password" && "Alterar Palavra-passe"}
          </h2>
          
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            {mode === "login" && "Inicie sessão na TicketAngola para gerir os seus bilhetes e aceder ao painel."}
            {mode === "register" && "Registe-se em segundos para comprar bilhetes ou publicar os seus eventos."}
            {mode === "recover" && "Introduza o seu email e receberá um link para redefinir a sua palavra-passe."}
            {mode === "verify" && "Proteja a sua conta ativando a verificação por email oficial do Firebase."}
            {mode === "change-password" && "Escolha uma palavra-passe forte e segura para a sua conta."}
          </p>
        </div>

        {/* Global Feedback Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-[#E26850]/15 border border-[#E26850]/45 rounded-2xl flex items-start gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-[#E26850] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Ocorreu um Erro</p>
              <p className="text-xs text-gray-350">{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-[#2B7A5D]/20 border border-[#2B7A5D]/50 rounded-2xl flex items-start gap-3 text-left">
            <CheckCircle className="w-5 h-5 text-[#DCE82D] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Sucesso</p>
              <p className="text-xs text-gray-350">{successMsg}</p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            MODE: LOGIN
            ------------------------------------------------------------------ */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço de Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@dominio.ao"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Palavra-passe</label>
                <button
                  type="button"
                  onClick={() => handleModeChange("recover")}
                  className="text-[10px] font-bold text-[#DCE82D] hover:underline uppercase tracking-wider"
                >
                  Esqueceu-se?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2B7A5D] hover:bg-[#379472] text-white font-bold py-3.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2B7A5D]/15 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Entrar com Segurança</span>
                  <ArrowRight className="w-4 h-4 text-[#DCE82D]" />
                </>
              )}
            </button>

            <div className="pt-4 text-center">
              <p className="text-xs text-gray-400">
                Ainda não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange("register")}
                  className="text-[#DCE82D] font-bold hover:underline"
                >
                  Registe-se aqui
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------------
            MODE: REGISTER
            ------------------------------------------------------------------ */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome Completo *</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu Nome e Apelido"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium"
                />
                <UserIcon className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço de Email *</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@dominio.ao"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contacto de Telefone</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+244 9XX XXX XXX"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium"
                />
                <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senha *</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mín. 6 chars"
                    required
                    className="w-full pl-3 pr-2 py-3 rounded-2xl text-xs font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirmar *</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    required
                    className="w-full pl-3 pr-2 py-3 rounded-2xl text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2B7A5D] hover:bg-[#379472] text-white font-bold py-3.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2B7A5D]/15 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Criar Conta & Ativar</span>
                  <ArrowRight className="w-4 h-4 text-[#DCE82D]" />
                </>
              )}
            </button>

            <div className="pt-4 text-center">
              <p className="text-xs text-gray-400">
                Já tem uma conta oficial?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  className="text-[#DCE82D] font-bold hover:underline"
                >
                  Iniciar Sessão
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------------
            MODE: RECOVER PASSWORD
            ------------------------------------------------------------------ */}
        {mode === "recover" && (
          <form onSubmit={handleRecovery} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço de Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@dominio.ao"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2B7A5D] hover:bg-[#379472] text-white font-bold py-3.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>Enviar Link de Recuperação</span>
              )}
            </button>

            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => handleModeChange("login")}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Voltar para Iniciar Sessão
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------------
            MODE: VERIFY EMAIL / ACCOUNT DETAILS
            ------------------------------------------------------------------ */}
        {mode === "verify" && (
          <div className="space-y-6 text-left">
            <div className="bg-[#121416] p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#DCE82D]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Conta Registada</span>
              </div>
              <p className="text-xs text-gray-300">
                Sessão ativa como: <span className="font-bold text-white">{currentUser?.name}</span> ({currentUser?.email})
              </p>
              <p className="text-xs text-gray-300">
                Perfil Oficial do Firebase: <span className="font-mono text-[10px] bg-[#2B7A5D]/20 text-[#DCE82D] px-2 py-0.5 rounded-full font-bold">{currentUser?.role}</span>
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verificação de Email</h4>
              <p className="text-xs text-gray-450 leading-relaxed">
                Por favor, verifique a sua caixa de correio eletrónico. O Firebase envia um link de verificação obrigatório para validar a autenticidade da sua conta antes de continuar.
              </p>
              
              <button
                onClick={handleSendVerification}
                disabled={loading}
                className="w-full bg-[#121416] hover:bg-[#1d2024] border border-[#2B7A5D]/30 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#DCE82D] ${loading ? "animate-spin" : ""}`} />
                <span>Reenviar Link de Verificação</span>
              </button>
            </div>

            <div className="border-t border-white/10 pt-4 flex gap-3">
              <button
                onClick={() => {
                  if (onSuccess) onSuccess();
                }}
                className="flex-grow bg-[#2B7A5D] hover:bg-[#379472] text-white font-bold py-3 rounded-2xl text-xs transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Aceder à Plataforma</span>
                <ChevronRight className="w-4 h-4 text-[#DCE82D]" />
              </button>
              
              <button
                onClick={async () => {
                  await logoutWithFirebase();
                  handleModeChange("login");
                }}
                className="px-4 py-3 bg-[#E26850]/10 hover:bg-[#E26850]/20 text-[#E26850] font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Sair
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            MODE: CHANGE PASSWORD
            ------------------------------------------------------------------ */}
        {mode === "change-password" && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nova Palavra-passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                required
                className="w-full px-4 py-3 rounded-2xl text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirmar Nova Palavra-passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova palavra-passe"
                required
                className="w-full px-4 py-3 rounded-2xl text-xs font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2B7A5D] hover:bg-[#379472] text-white font-bold py-3.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>Confirmar Alteração</span>
              )}
            </button>

            {onNavigateBack && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={onNavigateBack}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Voltar
                </button>
              </div>
            )}
          </form>
        )}

        {/* Secondary Back Link */}
        {onNavigateBack && mode !== "change-password" && (
          <div className="pt-6 border-t border-white/5 mt-6 text-center">
            <button
              onClick={onNavigateBack}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Voltar para a Navegação Pública
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
