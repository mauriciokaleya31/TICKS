import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Ticket, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Globe, 
  ShieldCheck, 
  Heart,
  Send,
  HelpCircle
} from "lucide-react";

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { language, cmsConfig } = useApp();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#0f1115] text-gray-400 border-t border-white/10" id="main-footer">
      {/* Top Banner section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="space-y-2">
            <h3 className="text-white font-display font-bold text-lg tracking-tight">
              Fique por dentro de todos os espetáculos
            </h3>
            <p className="text-gray-400 text-sm">
              Subscreva a nossa newsletter para receber convites exclusivos, descontos e os principais eventos de Angola.
            </p>
          </div>
          <div className="lg:col-span-2">
            <form onSubmit={handleSubscribe} className="flex gap-2.5 max-w-md lg:ml-auto">
              <div className="relative flex-grow">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Introduza o seu email"
                  required
                  className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-gray-500 font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-amber-500 text-[#0a0b0d] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 cursor-pointer"
              >
                {subscribed ? (
                  <span>Subscrito!</span>
                ) : (
                  <>
                    <span>Subscrever</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main links structure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {cmsConfig?.footer?.logoUrl ? (
              <img src={cmsConfig.footer.logoUrl} className="w-10 h-10 object-contain rounded-lg" alt="Logo" />
            ) : (
              <div className="p-2 bg-amber-500 rounded-lg text-[#0a0b0d]">
                <Ticket className="w-4.5 h-4.5 rotate-12" />
              </div>
            )}
            <span className="font-display font-bold text-lg text-white tracking-tight">
              {cmsConfig?.header?.platformName || "TicketAngola"}
            </span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            {cmsConfig?.footer?.institutionalText || "A mais avançada plataforma SaaS para venda de bilhetes e gestão de eventos em Angola. Segurança total, facilidade de compra e controlo de entradas sem fricção."}
          </p>
          <div className="flex items-center gap-3.5 pt-2">
            {cmsConfig?.footer?.socials?.facebook && (
              <a href={cmsConfig.footer.socials.facebook} target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/5 hover:border-amber-500 hover:bg-amber-500 rounded-lg hover:text-[#0a0b0d] transition-colors" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {cmsConfig?.footer?.socials?.instagram && (
              <a href={cmsConfig.footer.socials.instagram} target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/5 hover:border-amber-500 hover:bg-amber-500 rounded-lg hover:text-[#0a0b0d] transition-colors" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {cmsConfig?.footer?.socials?.twitter && (
              <a href={cmsConfig.footer.socials.twitter} target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/5 hover:border-amber-500 hover:bg-amber-500 rounded-lg hover:text-[#0a0b0d] transition-colors" title="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Categories navigation */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
            Categorias de Eventos
          </h4>
          <ul className="space-y-2 text-xs">
            {cmsConfig?.categories?.filter(c => c.active).sort((a,b) => a.order - b.order).map((cat) => (
              <li key={cat.id}>
                <button onClick={() => onNavigate("events", { category: cat.name })} className="hover:text-amber-400 text-gray-400 text-left transition-colors cursor-pointer">
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Useful platform links */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
            Links Úteis
          </h4>
          <ul className="space-y-2 text-xs">
            {cmsConfig?.footer?.quickLinks?.map((link, i) => (
              <li key={i}>
                <button onClick={() => onNavigate(link.view)} className="hover:text-amber-400 text-gray-400 text-left transition-colors cursor-pointer">
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Local Office Contacts */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
            Contactos
          </h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{cmsConfig?.footer?.address || "Avenida de Talatona, Edifício Premium, Piso 4, Luanda, Angola"}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{cmsConfig?.footer?.phones?.join(" / ") || "+244 923 456 789"}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{cmsConfig?.footer?.email || "suporte@ticketangola.com"}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{cmsConfig?.footer?.workingHours || "Suporte Técnico 24/7"}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Corporate compliance and credit footer */}
      <div className="bg-[#0a0b0d] text-gray-500 py-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
          <div>
            &copy; {new Date().getFullYear()} TicketAngola. Todos os direitos reservados.
          </div>
          <div className="flex flex-wrap gap-4 md:gap-7">
            <a href="#" className="hover:text-gray-300 transition-colors">Termos e Condições</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Cookies</a>
          </div>
          <div className="flex items-center gap-1">
            <span>Desenvolvido com</span>
            <Heart className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>para Angola e o Mundo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
