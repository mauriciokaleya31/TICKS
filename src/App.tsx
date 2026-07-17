import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WebsitePublic from "./views/WebsitePublic";
import ClientArea from "./views/ClientArea";
import OrganizerArea from "./views/OrganizerArea";
import AdminPanel from "./views/AdminPanel";
import AuthArea from "./views/AuthArea";
import { UserRole } from "./types";
import { ShieldAlert, LogOut, RefreshCw, KeyRound, ArrowRight } from "lucide-react";

function AppContent() {
  const { currentUser, switchUserRole, logoutWithFirebase, firebaseAuthLoading } = useApp();
  const [currentView, setCurrentView] = useState<string>("home");
  const [viewParams, setViewParams] = useState<any>(null);

  const handleNavigate = (view: string, params?: any) => {
    setCurrentView(view);
    setViewParams(params || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 1. Session and Role Authorization Interceptor
  const isClientDashboard = currentView === "client-dashboard";
  const isOrganizerDashboard = currentView === "organizer-dashboard";
  const isAdminDashboard = currentView === "admin-dashboard";
  const isAuthView = currentView === "login-auth";

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

          {/* SaaS Tester Quick Upgrade */}
          <div className="p-4 bg-[#2B7A5D]/10 border border-[#2B7A5D]/25 rounded-2xl text-left space-y-2.5">
            <p className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Simulador SaaS (Ambiente de Testes)</span>
            </p>
            <p className="text-[11px] text-gray-350">
              Quer testar como {requiredRole}? Clique abaixo para atualizar o seu perfil de testes instantaneamente.
            </p>
            <button
              onClick={() => {
                const targetRole = requiredRole === "Administrador" ? UserRole.ADMIN : UserRole.ORGANIZADOR;
                switchUserRole(targetRole);
              }}
              className="w-full py-2 bg-[#2B7A5D] hover:bg-[#379472] text-white font-bold text-[11px] rounded-xl transition-all cursor-pointer text-center"
            >
              Simular Perfil de {requiredRole}
            </button>
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
    <div className="flex flex-col min-h-screen bg-[#000000] font-sans antialiased text-[#ffffff] selection:bg-[#2B7A5D]/30 selection:text-[#DCE82D]">
      {/* Dynamic Navigation Header */}
      <Header onNavigate={handleNavigate} currentView={currentView} />

      {/* Main Content Router */}
      <div className="flex-grow">
        
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

      {/* Shared Footer block */}
      <Footer onNavigate={handleNavigate} />
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
