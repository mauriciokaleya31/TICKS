import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WebsitePublic from "./views/WebsitePublic";
import ClientArea from "./views/ClientArea";
import OrganizerArea from "./views/OrganizerArea";
import AdminPanel from "./views/AdminPanel";
import AuthArea from "./views/AuthArea";
import { UserRole } from "./types";
import { playSound } from "./lib/audio";
import { 
  ShieldAlert, 
  LogOut, 
  RefreshCw, 
  Home, 
  Compass, 
  Ticket, 
  Heart, 
  User, 
  Shield, 
  Briefcase, 
  X, 
  Smartphone, 
  Download, 
  Share 
} from "lucide-react";

function AppContent() {
  const { currentUser, switchUserRole, logoutWithFirebase, firebaseAuthLoading } = useApp();
  const [currentView, setCurrentView] = useState<string>("home");
  const [viewParams, setViewParams] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);

  useEffect(() => {
    // Show banner only if not dismissed already
    const isDismissed = localStorage.getItem("dismissed_pwa_banner") === "true";
    if (!isDismissed) {
      // Small delay for natural user entry feel
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNavigate = (view: string, params?: any) => {
    try { playSound.click(); } catch (e) {}
    setCurrentView(view);
    setViewParams(params || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDismissBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    try { playSound.click(); } catch (err) {}
    localStorage.setItem("dismissed_pwa_banner", "true");
    setShowInstallBanner(false);
  };

  const handleOpenInstallPrompt = () => {
    try { playSound.click(); } catch (err) {}
    setShowInstallPrompt(true);
  };

  const handleCloseInstallPrompt = () => {
    try { playSound.click(); } catch (err) {}
    setShowInstallPrompt(false);
  };

  const handleSimulateInstall = () => {
    try { playSound.success(); } catch (err) {}
    alert("✨ Obrigado por instalar o TicketAngola! O aplicativo foi adicionado com sucesso ao seu ecrã inicial de simulação.");
    localStorage.setItem("dismissed_pwa_banner", "true");
    setShowInstallBanner(false);
    setShowInstallPrompt(false);
  };

  // 1. Session and Role Authorization Interceptor
  const isClientDashboard = currentView === "client-dashboard";
  const isOrganizerDashboard = currentView === "organizer-dashboard";
  const isAdminDashboard = currentView === "admin-dashboard";
  const isAuthView = currentView === "login-auth";

  // Helper to check active tab of bottom nav
  const isHomeActive = currentView === "home";
  const isExploreActive = currentView === "events";
  const isTicketsActive = currentView === "client-dashboard" && viewParams?.tab === "tickets";
  const isProfileActive = (currentView === "client-dashboard" && (viewParams?.tab === "profile" || viewParams?.tab === "settings")) || currentView === "login-auth";
  
  // Middle tab checks
  const isDashboardActive = currentUser?.role === UserRole.ADMIN 
    ? currentView === "admin-dashboard" 
    : currentUser?.role === UserRole.ORGANIZADOR 
      ? currentView === "organizer-dashboard" 
      : currentView === "client-dashboard" && viewParams?.tab === "favorites";

  // If a private route is accessed and we are loading firebase session, show a clean, gorgeous loading spinner
  if (firebaseAuthLoading && (isClientDashboard || isOrganizerDashboard || isAdminDashboard)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-white">
        <RefreshCw className="w-8 h-8 text-[#DCE82D] animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider text-gray-400 font-display uppercase">Verificando credenciais...</p>
      </div>
    );
  }

  // Helper to render Access Denied message
  const renderAccessDenied = (requiredRole: string, currentRole: string) => {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#000000]">
        <div className="w-full max-w-md bg-[#0c0d0e] rounded-3xl border border-white/10 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#E26850]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex p-4 bg-[#E26850]/15 rounded-full text-[#E26850] border border-[#E26850]/30 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white font-display uppercase tracking-wider">Acesso Restrito</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Esta área privada requer privilégios de <span className="font-bold text-white">{requiredRole}</span>. 
              A sua conta atual está registada com o perfil de <span className="font-bold text-[#DCE82D] font-mono">{currentRole}</span>.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleNavigate("home")}
              className="flex-grow py-3 bg-[#121416] hover:bg-[#1d2024] border border-white/10 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer text-center"
            >
              Voltar ao Início
            </button>
            <button
              onClick={async () => {
                await logoutWithFirebase();
                handleNavigate("home");
              }}
              className="px-4 py-3 bg-[#E26850]/10 hover:bg-[#E26850]/20 text-[#E26850] font-bold rounded-2xl text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="Terminar Sessão"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#000000] font-sans antialiased text-[#ffffff] selection:bg-[#2B7A5D]/30 selection:text-[#DCE82D] relative">
      
      {/* Top Floating Mobile PWA Install Banner */}
      {showInstallBanner && (
        <div className="sticky top-16 z-40 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black px-4 py-2.5 shadow-xl md:hidden flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2.5" onClick={handleOpenInstallPrompt}>
            <div className="p-1.5 bg-black text-amber-500 rounded-lg shadow-md animate-bounce">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black tracking-tight leading-none text-black">Instalar App Oficial</p>
              <p className="text-[10px] font-semibold text-black/85 leading-none mt-0.5">Venda rápida e bilhetes 100% offline</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenInstallPrompt}
              className="bg-black text-amber-400 text-[10px] font-black px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
            >
              Instalar
            </button>
            <button 
              onClick={handleDismissBanner}
              className="p-1 hover:bg-black/10 rounded-full text-black/80"
              aria-label="Dispensar banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Navigation Header */}
      <Header onNavigate={handleNavigate} currentView={currentView} />

      {/* Main Content Router with extra padding on mobile to accommodate the bottom bar */}
      <div className="flex-grow pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        
        {/* Dedicated Login/Register Full Screen View */}
        {isAuthView && (
          <AuthArea 
            onSuccess={() => handleNavigate("client-dashboard")}
            onNavigateBack={() => handleNavigate("home")}
          />
        )}

        {/* Public Views */}
        {(currentView === "home" || 
          currentView === "events" || 
          currentView === "event-detail" || 
          currentView === "checkout" || 
          currentView === "blog" || 
          currentView === "faq" || 
          currentView === "about") && (
          <WebsitePublic 
            currentView={currentView} 
            onNavigate={handleNavigate} 
            viewParams={viewParams} 
          />
        )}

        {/* Client Portal Protection */}
        {isClientDashboard && (
          !currentUser ? (
            <AuthArea 
              onSuccess={() => handleNavigate("client-dashboard")} 
              onNavigateBack={() => handleNavigate("home")}
            />
          ) : (
            <ClientArea 
              onNavigate={handleNavigate} 
              initialTab={viewParams?.tab || "tickets"} 
            />
          )
        )}

        {/* Organizer Workspace Protection */}
        {isOrganizerDashboard && (
          !currentUser ? (
            <AuthArea 
              onSuccess={() => handleNavigate("organizer-dashboard")} 
              onNavigateBack={() => handleNavigate("home")}
            />
          ) : (
            currentUser.role !== UserRole.ORGANIZADOR && currentUser.role !== UserRole.ADMIN ? (
              renderAccessDenied("Organizador", currentUser.role)
            ) : (
              <OrganizerArea 
                onNavigate={handleNavigate} 
              />
            )
          )
        )}

        {/* Central Admin Portal Protection */}
        {isAdminDashboard && (
          !currentUser ? (
            <AuthArea 
              onSuccess={() => handleNavigate("admin-dashboard")} 
              onNavigateBack={() => handleNavigate("home")}
            />
          ) : (
            currentUser.role !== UserRole.ADMIN ? (
              renderAccessDenied("Administrador", currentUser.role)
            ) : (
              <AdminPanel />
            )
          )
        )}
      </div>

      {/* Mobile-Only Premium Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1115]/95 backdrop-blur-xl border-t border-white/10 px-2 pt-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] md:hidden flex justify-around items-center h-[calc(5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_30px_rgba(0,0,0,0.9)] rounded-t-3xl">
        {/* Tab 1: Home */}
        <button
          onClick={() => handleNavigate("home")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isHomeActive ? "text-amber-400 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <Home className={`w-5.5 h-5.5 ${isHomeActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Início</span>
          {isHomeActive && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-0.5 shadow-glow" />}
        </button>

        {/* Tab 2: Discover */}
        <button
          onClick={() => handleNavigate("events")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isExploreActive ? "text-amber-400 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <Compass className={`w-5.5 h-5.5 ${isExploreActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Explorar</span>
          {isExploreActive && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-0.5 shadow-glow" />}
        </button>

        {/* Tab 3: Centered Dynamic Action Tab (Admin Portal, Organizer Portal or Favorites) */}
        <button
          onClick={() => {
            if (currentUser?.role === UserRole.ADMIN) {
              handleNavigate("admin-dashboard");
            } else if (currentUser?.role === UserRole.ORGANIZADOR) {
              handleNavigate("organizer-dashboard");
            } else {
              handleNavigate("client-dashboard", { tab: "favorites" });
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative -top-3 ${
            isDashboardActive ? "text-amber-400" : "text-gray-400"
          }`}
        >
          <div className={`p-3 bg-gradient-to-tr ${
            isDashboardActive 
              ? "from-amber-500 to-amber-300 text-black shadow-lg shadow-amber-500/20 scale-110" 
              : "from-[#191d24] to-[#121418] text-white border border-white/10"
          } rounded-2xl transition-all duration-300 active:scale-95`}>
            {currentUser?.role === UserRole.ADMIN ? (
              <Shield className="w-5.5 h-5.5" />
            ) : currentUser?.role === UserRole.ORGANIZADOR ? (
              <Briefcase className="w-5.5 h-5.5" />
            ) : (
              <Heart className={`w-5.5 h-5.5 ${isDashboardActive ? "fill-black" : ""}`} />
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight text-center">
            {currentUser?.role === UserRole.ADMIN ? "Admin" : currentUser?.role === UserRole.ORGANIZADOR ? "Gestão" : "Favoritos"}
          </span>
        </button>

        {/* Tab 4: Tickets / Bilhetes */}
        <button
          onClick={() => {
            if (!currentUser) {
              handleNavigate("login-auth");
            } else {
              handleNavigate("client-dashboard", { tab: "tickets" });
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isTicketsActive ? "text-amber-400 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <Ticket className={`w-5.5 h-5.5 ${isTicketsActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Bilhetes</span>
          {isTicketsActive && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-0.5 shadow-glow" />}
        </button>

        {/* Tab 5: Account Profile or Login */}
        <button
          onClick={() => {
            if (!currentUser) {
              handleNavigate("login-auth");
            } else {
              handleNavigate("client-dashboard", { tab: "profile" });
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isProfileActive ? "text-amber-400 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          {currentUser?.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className={`w-6 h-6 rounded-full object-cover border-2 transition-all ${
                isProfileActive ? "border-amber-400 scale-110" : "border-white/20"
              }`}
            />
          ) : (
            <User className={`w-5.5 h-5.5 ${isProfileActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          )}
          <span className="text-[10px] font-bold mt-1 tracking-tight">Perfil</span>
          {isProfileActive && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-0.5 shadow-glow" />}
        </button>
      </nav>

      {/* PWA App Installation Tutorial Overlay */}
      {showInstallPrompt && (
        <div className="fixed inset-0 z-55 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#0c0d10] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 space-y-6 shadow-2xl relative animate-slide-up">
            
            {/* Close Button */}
            <button 
              onClick={handleCloseInstallPrompt}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-400">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">Adicionar TicketAngola</h3>
              <p className="text-xs text-gray-400">Instale no seu telemóvel para receber alertas de bilhetes e usar em modo offline.</p>
            </div>

            {/* Simulated instructions */}
            <div className="bg-[#12141c] rounded-2xl border border-white/5 p-4 space-y-3">
              <p className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black">1</span>
                <span>Instruções Rápidas:</span>
              </p>
              
              <div className="space-y-2 text-[11px] text-gray-400 pl-6">
                <p className="flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5 text-blue-400" />
                  <span>No iOS: Toque em <span className="text-white font-bold">Partilhar</span> e selecione <span className="text-white font-bold">"Ecrã Principal"</span>.</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No Android: Toque em <span className="text-white font-bold">Adicionar ao Ecrã Inicial</span> no menu do Chrome.</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseInstallPrompt}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-xs text-gray-300 font-bold transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleSimulateInstall}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-[#0c0d10] text-xs font-black rounded-2xl transition-all shadow-lg shadow-amber-500/10 active:scale-95"
              >
                Instalar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Footer block - Hidden on mobile screen dimensions for app-like clean visual hygiene */}
      <div className="hidden md:block">
        <Footer onNavigate={handleNavigate} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
