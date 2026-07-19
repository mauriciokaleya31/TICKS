import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";
import { 
  Ticket, 
  Search, 
  User as UserIcon, 
  Menu, 
  X, 
  Globe, 
  Settings, 
  Briefcase, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  Heart
} from "lucide-react";

interface HeaderProps {
  onNavigate: (view: string, params?: any) => void;
  currentView: string;
}

export default function Header({ onNavigate, currentView }: HeaderProps) {
  const { currentUser, switchUserRole, language, setLanguage, cmsConfig } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Active submenus state tracker
  const [activeSubmenuId, setActiveSubmenuId] = useState<string | null>(null);

  const navigationItems = React.useMemo(() => {
    if (!cmsConfig?.header?.menuItems) return [];
    return cmsConfig.header.menuItems
      .filter(item => item.active)
      .sort((a, b) => a.order - b.order);
  }, [cmsConfig]);

  const handleLangChange = (lang: "PT" | "EN" | "FR") => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return "Administrador";
      case UserRole.ORGANIZADOR: return "Organizador";
      default: return "Cliente";
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return "bg-red-550/10 text-red-400 border-red-500/20";
      case UserRole.ORGANIZADOR: return "bg-emerald-550/10 text-emerald-400 border-emerald-500/20";
      default: return "bg-amber-550/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0f1115]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate("home")} 
          className="flex items-center gap-2.5 cursor-pointer group"
          id="brand-logo"
        >
          {cmsConfig?.header?.logoUrl ? (
            <img src={cmsConfig.header.logoUrl} className="h-9 w-auto object-contain rounded-lg" alt="Logo" />
          ) : (
            <div className="p-2 bg-amber-500 rounded-xl text-[#0a0b0d] shadow-md shadow-amber-500/15 group-hover:bg-amber-400 transition-all">
              <Ticket className="w-5 h-5 rotate-12 group-hover:rotate-0 transition-transform duration-300" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight text-white">
              {cmsConfig?.header?.platformName || "TicketAngola"}
            </span>
            <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest -mt-1 font-semibold">
              Bilheteira SaaS
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {navigationItems.map((item, i) => {
            const hasSubmenus = item.submenus && item.submenus.filter(s => s.active).length > 0;
            return (
              <div key={item.id || i} className="relative group/submenu">
                {hasSubmenus ? (
                  <div className="relative">
                    <button
                      onClick={() => setActiveSubmenuId(activeSubmenuId === item.id ? null : item.id)}
                      className={`font-sans text-sm font-medium transition-colors hover:text-amber-400 flex items-center gap-1 cursor-pointer ${
                        currentView === item.view ? "text-amber-500 font-semibold" : "text-gray-300"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px]">▼</span>
                    </button>
                    {/* Hover Submenu */}
                    <div className="absolute top-full left-0 mt-2 w-48 bg-[#0f1115] border border-white/10 rounded-xl p-1.5 hidden group-hover/submenu:block hover:block space-y-1 shadow-xl z-50">
                      {item.submenus!.filter(s => s.active).map((sub, sIdx) => (
                        <button
                          key={sub.id || sIdx}
                          onClick={() => onNavigate(sub.view, sub.params)}
                          className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onNavigate(item.view, item.params)}
                    className={`font-sans text-sm font-medium transition-colors hover:text-amber-400 cursor-pointer ${
                      currentView === item.view ? "text-amber-500 font-semibold" : "text-gray-300"
                    }`}
                  >
                    {item.label}
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Section Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Favorites shortcut */}
          <button 
            onClick={() => onNavigate("client-dashboard", { tab: "favorites" })}
            className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-white/5 transition-colors"
            title="Meus Favoritos"
          >
            <Heart className="w-4.5 h-4.5" />
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-300 hover:text-amber-400 border border-white/10 rounded-lg hover:bg-white/5 transition-all font-medium"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span>{language}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-24 bg-[#0f1115] border border-white/10 rounded-xl shadow-lg py-1 z-50">
                <button onClick={() => handleLangChange("PT")} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-amber-400">Português</button>
                <button onClick={() => handleLangChange("EN")} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-amber-400">English</button>
                <button onClick={() => handleLangChange("FR")} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-amber-400">Français</button>
              </div>
            )}
          </div>

          {/* Quick Dashboard Entry */}
          {currentUser && (
            <button
              onClick={() => {
                if (currentUser.role === UserRole.ADMIN) onNavigate("admin-dashboard");
                else if (currentUser.role === UserRole.ORGANIZADOR) onNavigate("organizer-dashboard");
                else onNavigate("client-dashboard");
              }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border font-semibold ${getRoleBadgeColor(currentUser.role)}`}
            >
              {currentUser.role === UserRole.ADMIN ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : currentUser.role === UserRole.ORGANIZADOR ? (
                <Briefcase className="w-3.5 h-3.5" />
              ) : (
                <Ticket className="w-3.5 h-3.5" />
              )}
              {getRoleLabel(currentUser.role)}
            </button>
          )}

          {/* Profile / Auth Dropdown */}
          <div className="relative">
            {currentUser ? (
              <>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={currentUser.name}
                    className="w-7.5 h-7.5 rounded-lg object-cover"
                  />
                  <div className="text-left pr-2 hidden xl:block">
                    <p className="text-xs font-semibold text-gray-250 line-clamp-1 w-20">{currentUser.name}</p>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-[#0f1115] border border-white/10 rounded-xl shadow-xl py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs text-gray-500 font-medium">Sessão iniciada como</p>
                      <p className="text-sm font-bold text-gray-200 line-clamp-1">{currentUser.name}</p>
                      <p className="text-xs text-gray-400 line-clamp-1 font-mono">{currentUser.email}</p>
                    </div>
                    
                    <button
                      onClick={() => { setProfileDropdownOpen(false); onNavigate("client-dashboard"); }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      Minha Área de Cliente
                    </button>
                    {(currentUser.role === UserRole.ORGANIZADOR || currentUser.role === UserRole.ADMIN) && (
                      <button
                        onClick={() => { setProfileDropdownOpen(false); onNavigate("organizer-dashboard"); }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                      >
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        Área do Organizador
                      </button>
                    )}
                    {currentUser.role === UserRole.ADMIN && (
                      <button
                        onClick={() => { setProfileDropdownOpen(false); onNavigate("admin-dashboard"); }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-gray-400" />
                        Painel de Administração
                      </button>
                    )}

                    <div className="border-t border-white/5 mt-1.5 pt-1.5">
                      <button
                        onClick={async () => { 
                          setProfileDropdownOpen(false); 
                          const { logoutWithFirebase } = useApp(); // Local query to get function safely if context extends
                          const context = useApp() as any;
                          if (context.logoutWithFirebase) {
                            await context.logoutWithFirebase();
                          } else {
                            switchUserRole(UserRole.CLIENTE);
                          }
                          onNavigate("home"); 
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#E26850] hover:bg-[#E26850]/10 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-[#E26850]" />
                        Terminar Sessão Oficial
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => onNavigate("login-auth")}
                className="px-4 py-2 bg-[#2B7A5D] hover:bg-[#379472] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-[#2B7A5D]/15 cursor-pointer flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation controls */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-300 hover:text-amber-500 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0f1115]/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-inner">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/10">
            {navigationItems.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(item.view, item.params);
                }}
                className={`text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors ${
                  currentView === item.view ? "text-amber-400 bg-amber-500/10" : "text-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-400 font-medium">Idioma:</span>
            <div className="flex gap-2">
              <button onClick={() => handleLangChange("PT")} className={`px-2 py-1 text-xs rounded border ${language === "PT" ? "bg-amber-500 text-[#0a0b0d] border-amber-500 font-semibold" : "bg-[#0f1115] text-gray-300 border-white/10"}`}>PT</button>
              <button onClick={() => handleLangChange("EN")} className={`px-2 py-1 text-xs rounded border ${language === "EN" ? "bg-amber-500 text-[#0a0b0d] border-amber-500 font-semibold" : "bg-[#0f1115] text-gray-300 border-white/10"}`}>EN</button>
              <button onClick={() => handleLangChange("FR")} className={`px-2 py-1 text-xs rounded border ${language === "FR" ? "bg-amber-500 text-[#0a0b0d] border-amber-500 font-semibold" : "bg-[#0f1115] text-gray-300 border-white/10"}`}>FR</button>
            </div>
          </div>

          {currentUser ? (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate("client-dashboard"); }}
                className="w-full text-center px-4 py-2 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors flex items-center justify-center gap-2 border border-amber-500/20"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Área do Cliente
              </button>
              {(currentUser.role === UserRole.ORGANIZADOR || currentUser.role === UserRole.ADMIN) && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate("organizer-dashboard"); }}
                  className="w-full text-center px-4 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors flex items-center justify-center gap-2 border border-emerald-500/20"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Área do Organizador
                </button>
              )}
              {currentUser.role === UserRole.ADMIN && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate("admin-dashboard"); }}
                  className="w-full text-center px-4 py-2 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-500/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Painel de Administração
                </button>
              )}
              
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  const context = useApp() as any;
                  if (context.logoutWithFirebase) {
                    await context.logoutWithFirebase();
                  } else {
                    switchUserRole(UserRole.CLIENTE);
                  }
                  onNavigate("home");
                }}
                className="w-full text-center px-4 py-2 text-xs font-semibold text-[#E26850] bg-[#E26850]/5 hover:bg-[#E26850]/15 rounded-lg transition-colors flex items-center justify-center gap-2 border border-[#E26850]/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                Terminar Sessão
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate("login-auth"); }}
                className="w-full text-center px-4 py-2 text-xs font-semibold text-white bg-[#2B7A5D] hover:bg-[#379472] rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Entrar / Criar Conta
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
