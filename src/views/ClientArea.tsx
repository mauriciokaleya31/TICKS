import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Order, OrderStatus, Event, UserRole } from "../types";
import { 
  Ticket, 
  Clock, 
  History, 
  Heart, 
  User as UserIcon, 
  HelpCircle, 
  Download, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  CreditCard,
  MessageSquare,
  Lock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  FileText
} from "lucide-react";
import QRCodeGenerator from "../components/QRCodeGenerator";
import TicketInvoiceModal from "../components/TicketInvoiceModal";

interface ClientAreaProps {
  onNavigate: (view: string, params?: any) => void;
  initialTab?: string;
}

export default function ClientArea({ onNavigate, initialTab = "tickets" }: ClientAreaProps) {
  const { 
    currentUser, 
    orders, 
    events, 
    requestRefund, 
    formatCurrency, 
    registerUser,
    reviews,
    supportMessages,
    sendSupportMessage,
    replyToSupportMessage
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Support states
  const [supportText, setSupportText] = useState("");
  const [supportSubject, setSupportSubject] = useState("");
  const [selectedTicketForChat, setSelectedTicketForChat] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [supportSuccessMsg, setSupportSuccessMsg] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Profile forms state
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || "");
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || "");
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Refund states
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundSuccess, setRefundSuccess] = useState(false);

  // Document modal states
  const [selectedDocumentOrder, setSelectedDocumentOrder] = useState<Order | null>(null);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [documentModalInitialTab, setDocumentModalInitialTab] = useState<"ticket" | "invoice">("ticket");

  // Active tickets versus utilized history
  const clientOrders = useMemo(() => {
    return orders.filter(o => o.userEmail === currentUser?.email);
  }, [orders, currentUser]);

  const clientTickets = useMemo(() => {
    return supportMessages.filter(msg => msg.email === currentUser?.email);
  }, [supportMessages, currentUser]);

  const activeChatTicket = useMemo(() => {
    if (!selectedTicketForChat) return null;
    return supportMessages.find(m => m.id === selectedTicketForChat.id) || selectedTicketForChat;
  }, [supportMessages, selectedTicketForChat]);

  const handleSubmitTicket = async () => {
    if (!supportSubject.trim() || !supportText.trim()) return;
    setIsSendingMessage(true);
    try {
      await sendSupportMessage(
        currentUser?.name || "Cliente Registado",
        currentUser?.email || "",
        supportSubject,
        supportText,
        currentUser?.role || "Cliente"
      );
      setSupportSubject("");
      setSupportText("");
      setSupportSuccessMsg("O seu ticket de suporte foi aberto com sucesso! A nossa equipa central irá responder em breve.");
      setTimeout(() => setSupportSuccessMsg(""), 5000);
    } catch (e) {
      alert("Erro ao enviar mensagem de suporte.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !activeChatTicket) return;
    setIsSendingMessage(true);
    try {
      await replyToSupportMessage(activeChatTicket.id, replyText, currentUser?.name || "Cliente", "User");
      setReplyText("");
    } catch (e) {
      alert("Erro ao enviar resposta.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const activeTickets = useMemo(() => {
    return clientOrders.filter(o => o.status === OrderStatus.COMPLETADO);
  }, [clientOrders]);

  const usedTicketsHistory = useMemo(() => {
    return clientOrders.filter(o => o.status === OrderStatus.REEMBOLSADO || o.status === OrderStatus.CANCELADO);
  }, [clientOrders]);

  // Favorite events (mock initial selection or filter based on reviews/category)
  const favoriteEvents = useMemo(() => {
    // Return first 2 events as favorited for demonstration
    return events.filter((e, i) => e.approved && i % 2 === 0);
  }, [events]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    registerUser(profileName, profileEmail, currentUser?.role || UserRole.CLIENTE, profilePhone);
    setProfileSuccessMsg("Os seus dados de perfil foram atualizados com sucesso!");
    setTimeout(() => setProfileSuccessMsg(""), 5000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordCurrent || !passwordNew) return;
    setProfileSuccessMsg("Senha alterada com sucesso no servidor de segurança.");
    setPasswordCurrent("");
    setPasswordNew("");
    setTimeout(() => setProfileSuccessMsg(""), 5000);
  };

  const handleTriggerRefundRequest = (order: Order) => {
    setSelectedRefundOrder(order);
    setRefundReason("");
    setRefundSuccess(false);
  };

  const handleConfirmRefundSubmit = () => {
    if (!selectedRefundOrder) return;
    requestRefund(selectedRefundOrder.id);
    setRefundSuccess(true);
    setTimeout(() => {
      setSelectedRefundOrder(null);
      setRefundSuccess(false);
    }, 3000);
  };

  return (
    <div className="bg-gray-50 flex-grow" id="client-area-panel">
      {/* Client Profile Header Badge */}
      <section className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={currentUser?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-sans font-bold tracking-tight">{currentUser?.name}</h2>
                <span className="bg-indigo-500/20 text-indigo-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-indigo-400/20">
                  Cliente Conta
                </span>
              </div>
              <p className="text-gray-400 text-xs font-mono">{currentUser?.email}</p>
              <p className="text-gray-400 text-xs">Membro desde {new Date(currentUser?.registeredAt || "").toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Bilhetes Ativos</p>
              <p className="text-lg font-black font-mono text-indigo-400">{activeTickets.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Favoritos</p>
              <p className="text-lg font-black font-mono text-indigo-400">{favoriteEvents.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Minhas Compras</p>
              <p className="text-lg font-black font-mono text-indigo-400">{clientOrders.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Panel layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Tab Menu Left sidebar */}
        <nav className="w-full lg:w-64 bg-white rounded-2xl border border-gray-150 p-2 lg:p-4 shrink-0 h-fit flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 lg:gap-1.5 scrollbar-none snap-x">
          {[
            { id: "tickets", label: "Bilhetes Ativos", icon: Ticket },
            { id: "history", label: "Histórico de Compras", icon: History },
            { id: "favorites", label: "Eventos Favoritos", icon: Heart },
            { id: "profile", label: "Perfil & Segurança", icon: UserIcon },
            { id: "support", label: "Apoio e Reembolsos", icon: HelpCircle }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`snap-start shrink-0 whitespace-nowrap lg:w-full lg:text-left flex items-center justify-center lg:justify-start gap-2.5 lg:gap-3 px-4 py-2.5 lg:py-3 text-xs font-bold rounded-xl transition-all ${
                  activeTab === item.id 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                    : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dynamic Panel view container */}
        <section className="flex-grow min-w-0">
          
          {/* TAB 1: ACTIVE TICKETS (MEUS BILHETES) */}
          {activeTab === "tickets" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-950">Meus Ingressos Ativos</h3>
                <p className="text-gray-500 text-xs">Estes são os seus bilhetes digitais válidos para entrada. Apresente o QR Code no seu telemóvel à entrada.</p>
              </div>

              {activeTickets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto text-xl">
                    🎟
                  </div>
                  <h4 className="font-sans font-bold text-sm text-gray-900">Não tem ingressos ativos</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">Não possui nenhum bilhete por utilizar no momento. Explore a nossa lista de eventos para encontrar a sua próxima atração.</p>
                  <button
                    onClick={() => onNavigate("events")}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Procurar Espetáculos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTickets.map((order) => (
                    <div 
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between"
                    >
                      {/* Ticket top brand cover */}
                      <div className="p-5 border-b border-gray-100 bg-indigo-950/5 text-left space-y-1">
                        <span className="text-[9px] font-mono font-bold text-indigo-650 uppercase tracking-widest">{order.orderNumber}</span>
                        <h4 className="font-sans font-extrabold text-sm text-gray-950 truncate">{order.eventTitle}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{order.eventDate}</span>
                        </div>
                      </div>

                      {/* Ticket body containing attendee list QR code */}
                      <div className="p-5 space-y-5">
                        {order.tickets.map((t) => (
                          <div key={t.id} className="bg-gray-50 rounded-xl border border-gray-150 p-4 flex flex-col sm:flex-row items-center gap-4">
                            <div className="shrink-0 bg-white p-1 rounded-lg border border-gray-200">
                              <QRCodeGenerator value={t.ticketCode} size={90} />
                            </div>
                            <div className="text-center sm:text-left space-y-1 min-w-0 flex-grow">
                              <p className="text-xs font-bold text-gray-900 truncate">{t.participantName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">{order.ticketTypeName}</p>
                              <div className="flex items-center justify-center sm:justify-start gap-1 text-[10px] text-indigo-650 font-bold pt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                                <span>Pronto para check-in</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Ticket footer action panel */}
                      <div className="p-4 bg-gray-55 border-t border-gray-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedDocumentOrder(order);
                            setDocumentModalInitialTab("ticket");
                            setDocumentModalOpen(true);
                          }}
                          className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Obter PDF / Bilhete</span>
                        </button>
                        <button
                          onClick={() => handleTriggerRefundRequest(order)}
                          className="text-xs font-bold text-gray-400 hover:text-red-500"
                        >
                          Solicitar Reembolso
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PURCHASED HISTORY (HISTORICO COMPRAS) */}
          {activeTab === "history" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-950">Histórico de Transações</h3>
                <p className="text-gray-500 text-xs">Aceda ao registo de todas as suas compras, bilhetes já utilizados e reembolsos efetuados.</p>
              </div>

              {clientOrders.length === 0 ? (
                <p className="text-xs text-gray-500 bg-white p-5 rounded-xl border border-gray-150 italic">Não existem compras associadas a este perfil.</p>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-450 uppercase tracking-widest text-[9px] font-bold border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-4">Transação</th>
                          <th className="px-5 py-4">Evento</th>
                          <th className="px-5 py-4">Quantidade</th>
                          <th className="px-5 py-4">Método</th>
                          <th className="px-5 py-4">Valor Total</th>
                          <th className="px-5 py-4">Estado</th>
                          <th className="px-5 py-4 text-center">Documentos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-y-gray-100 font-medium text-gray-700">
                        {clientOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-4 font-mono font-bold text-indigo-650">{order.orderNumber}</td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-gray-900">{order.eventTitle}</p>
                              <p className="text-[10px] text-gray-400">{order.eventDate}</p>
                            </td>
                            <td className="px-5 py-4">{order.quantity}x {order.ticketTypeName}</td>
                            <td className="px-5 py-4 text-gray-500">{order.paymentMethod}</td>
                            <td className="px-5 py-4 font-bold font-mono text-gray-900">{formatCurrency(order.totalPrice)}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border ${
                                order.status === OrderStatus.COMPLETADO 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                  : order.status === OrderStatus.REEMBOLSADO 
                                    ? "bg-amber-50 text-amber-600 border-amber-100" 
                                    : "bg-red-50 text-red-600 border-red-100"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              {order.status === OrderStatus.COMPLETADO ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedDocumentOrder(order);
                                      setDocumentModalInitialTab("ticket");
                                      setDocumentModalOpen(true);
                                    }}
                                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg border border-indigo-100 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                                    title="Ver/Descarregar Bilhete"
                                  >
                                    🎟️ Bilhete
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedDocumentOrder(order);
                                      setDocumentModalInitialTab("invoice");
                                      setDocumentModalOpen(true);
                                    }}
                                    className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                                    title="Ver/Imprimir Factura"
                                  >
                                    🧾 Factura
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-[10px] italic">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FAVORITES GRID (EVENTOS FAVORITOS) */}
          {activeTab === "favorites" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-950">Meus Eventos Guardados</h3>
                <p className="text-gray-500 text-xs">Os espetáculos que guardou para acompanhar e garantir o seu ingresso atempadamente.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favoriteEvents.map((evt) => (
                  <div key={evt.id} className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm flex flex-col justify-between group">
                    <div className="h-40 overflow-hidden relative">
                      <img src={evt.image} className="w-full h-full object-cover" alt={evt.title} />
                      <div className="absolute top-3 left-3 bg-indigo-600 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded">
                        {evt.category}
                      </div>
                    </div>
                    <div className="p-5 flex-grow space-y-2">
                      <h4 className="font-sans font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-indigo-650 transition-colors">{evt.title}</h4>
                      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{evt.summary}</p>
                      
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{evt.city} - {evt.location}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-55 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-indigo-650 font-black text-xs font-mono">Desde {formatCurrency(Math.min(...evt.ticketTypes.map(t => t.price)))}</span>
                      <button
                        onClick={() => onNavigate("event-detail", { eventId: evt.id })}
                        className="bg-gray-900 hover:bg-indigo-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE EDIT (PERFIL & SEGURANÇA) */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-950">Dados da Conta</h3>
                <p className="text-gray-500 text-xs">Atualize as suas informações de contacto, preferências de idioma e chaves de segurança de acesso.</p>
              </div>

              {profileSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs text-emerald-600 font-bold flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Form */}
                <form onSubmit={handleProfileUpdate} className="bg-white p-6 rounded-2xl border border-gray-150 space-y-4">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-indigo-500" />
                    <span>Dados de Identificação</span>
                  </h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Nome Completo</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Email de Contacto</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Telemóvel (Angola/Int)</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Guardar Alterações
                  </button>
                </form>

                {/* Password reset simulation */}
                <form onSubmit={handlePasswordUpdate} className="bg-white p-6 rounded-2xl border border-gray-150 space-y-4">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-indigo-500" />
                    <span>Segurança & Senha</span>
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Senha Atual</label>
                    <input
                      type="password"
                      value={passwordCurrent}
                      onChange={(e) => setPasswordCurrent(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Nova Senha</label>
                    <input
                      type="password"
                      value={passwordNew}
                      onChange={(e) => setPasswordNew(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                  >
                    Alterar Senha
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT AND REFUND INTERFACE (APOIO E REEMBOLSOS) */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-950">Suporte Técnico & Reembolsos</h3>
                <p className="text-gray-500 text-xs">Esclareça dúvidas técnicas diretamente com a nossa equipa central ou solicite estornos de bilhetes ativos.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 & 2: Main Area (Create Ticket or Chat view) */}
                <div className="lg:col-span-2 space-y-4">
                  {activeChatTicket ? (
                    // Chat view for the selected support ticket
                    <div className="bg-white p-6 rounded-2xl border border-gray-150 space-y-4 flex flex-col h-[500px]">
                      <div className="border-b border-gray-150 pb-3 flex items-center justify-between">
                        <div>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            activeChatTicket.status === "Pendente" 
                              ? "bg-amber-100 text-amber-800"
                              : activeChatTicket.status === "Respondido"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }`}>
                            {activeChatTicket.status}
                          </span>
                          <h4 className="text-sm font-black text-gray-950 mt-1">{activeChatTicket.subject}</h4>
                          <p className="text-[10px] text-gray-400">Iniciado em: {new Date(activeChatTicket.createdAt).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => setSelectedTicketForChat(null)}
                          className="text-xs text-indigo-600 hover:underline font-bold"
                        >
                          Novo Ticket
                        </button>
                      </div>

                      {/* Messages scroll area */}
                      <div className="flex-grow overflow-y-auto space-y-4 pr-1 text-xs flex flex-col">
                        {/* Initial Message */}
                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl max-w-[85%] self-start">
                          <p className="font-bold text-gray-800 text-[10px] mb-1">Você ({activeChatTicket.name})</p>
                          <p className="text-gray-600 whitespace-pre-wrap">{activeChatTicket.message}</p>
                        </div>

                        {/* Replies */}
                        {activeChatTicket.replies?.map((reply: any) => (
                          <div 
                            key={reply.id} 
                            className={`p-3 rounded-2xl max-w-[85%] ${
                              reply.senderRole === "Admin" 
                                ? "bg-indigo-50 border border-indigo-100 ml-auto self-end" 
                                : "bg-gray-50 border border-gray-100 self-start"
                            }`}
                          >
                            <p className="font-bold text-[10px] mb-1">
                              {reply.senderRole === "Admin" ? "Suporte Técnico 👑" : `Você (${reply.senderName})`}
                            </p>
                            <p className="text-gray-600 whitespace-pre-wrap">{reply.message}</p>
                            <span className="text-[9px] text-gray-400 block mt-1 text-right">
                              {new Date(reply.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Reply form */}
                      {activeChatTicket.status !== "Fechado" ? (
                        <div className="border-t border-gray-150 pt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Escreva a sua resposta..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && replyText.trim()) {
                                handleReply();
                              }
                            }}
                            className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 text-gray-800"
                          />
                          <button
                            onClick={handleReply}
                            disabled={!replyText.trim() || isSendingMessage}
                            className="bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0"
                          >
                            Enviar
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-50 text-gray-400 p-3 rounded-xl text-center text-[10px] font-bold uppercase">
                          Este ticket foi fechado pelo administrador
                        </div>
                      )}
                    </div>
                  ) : (
                    // Create Ticket View
                    <div className="bg-white p-6 rounded-2xl border border-gray-150 space-y-4">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
                        <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
                        <span>Novo Ticket de Suporte</span>
                      </h4>
                      <p className="text-xs text-gray-400">Tem alguma dúvida sobre pagamentos, reembolso ou erro com os seus bilhetes? Abra um ticket.</p>
                      
                      {supportSuccessMsg && (
                        <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-semibold">
                          {supportSuccessMsg}
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assunto</label>
                          <input
                            type="text"
                            placeholder="Ex: Erro ao baixar bilhete / Não consigo ver factura"
                            value={supportSubject}
                            onChange={(e) => setSupportSubject(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-gray-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mensagem Detalhada</label>
                          <textarea
                            placeholder="Descreva detalhadamente a sua dúvida para o Apoio Técnico da TicketAngola..."
                            value={supportText}
                            onChange={(e) => setSupportText(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-gray-800 h-28"
                          />
                        </div>

                        <button
                          onClick={handleSubmitTicket}
                          disabled={!supportSubject.trim() || !supportText.trim() || isSendingMessage}
                          className="bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors w-full"
                        >
                          {isSendingMessage ? "A Enviar..." : "Submeter Pedido de Suporte"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 3: Tickets history list & policies */}
                <div className="space-y-6">
                  {/* History List */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-150 space-y-4">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
                      Os Seus Pedidos
                    </h4>

                    {clientTickets.length === 0 ? (
                      <p className="text-[11px] text-gray-400 text-center py-4">Ainda não enviou nenhuma mensagem de suporte.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {clientTickets.map((ticket) => (
                          <button
                            key={ticket.id}
                            onClick={() => {
                              setSelectedTicketForChat(ticket);
                              setReplyText("");
                            }}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                              activeChatTicket?.id === ticket.id 
                                ? "bg-indigo-50/70 border-indigo-200 ring-1 ring-indigo-200" 
                                : "bg-gray-50 border-gray-150 hover:bg-gray-100/70"
                            }`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="text-[11px] font-black text-gray-950 truncate max-w-[110px]">{ticket.subject}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                                ticket.status === "Pendente" 
                                  ? "bg-amber-100 text-amber-800"
                                  : ticket.status === "Respondido"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 line-clamp-1">{ticket.message}</p>
                            <span className="text-[9px] text-gray-400 self-end">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Policies */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-150 space-y-4">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
                      <ShieldAlert className="w-4.5 h-4.5 text-indigo-500" />
                      <span>Políticas de Reembolso</span>
                    </h4>
                    <ul className="space-y-3 text-xs text-gray-500">
                      <li className="flex gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>Os estornos devem ser solicitados com um limite mínimo de **48 horas antes** do início das atividades.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>O processamento do valor depende do método original de compra (geralmente em 3-5 dias úteis).</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>
      </div>

      {/* REFUND MODAL BOX POPUP */}
      {selectedRefundOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 p-6 space-y-5 shadow-2xl">
            <h3 className="font-sans font-extrabold text-base text-gray-950 flex items-center gap-1.5">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Confirmar Pedido de Reembolso</span>
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-1 text-xs">
              <p className="font-bold text-gray-850">{selectedRefundOrder.eventTitle}</p>
              <p className="text-gray-400">Transação: {selectedRefundOrder.orderNumber}</p>
              <p className="text-gray-900 font-mono font-bold mt-1.5">Valor Estorno: {formatCurrency(selectedRefundOrder.totalPrice)}</p>
            </div>

            {refundSuccess ? (
              <div className="bg-emerald-50 text-emerald-600 font-bold p-3 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 animate-bounce" />
                <span>Pedido de Reembolso efetuado e verificado! O stock regressou ao evento.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">Motivo do Reembolso</label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Indique brevemente o motivo para análise do organizador..."
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-gray-800 h-16"
                    required
                  />
                </div>

                <div className="flex gap-2.5 justify-end">
                  <button
                    onClick={() => setSelectedRefundOrder(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-250 text-gray-700 font-bold text-xs rounded-xl"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleConfirmRefundSubmit}
                    className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
                  >
                    Confirmar Estorno
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ticket/Invoice digital document modal overlay */}
      <TicketInvoiceModal
        order={selectedDocumentOrder}
        isOpen={documentModalOpen}
        onClose={() => {
          setDocumentModalOpen(false);
          setSelectedDocumentOrder(null);
        }}
        initialTab={documentModalInitialTab}
      />

    </div>
  );
}
