import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { UserRole, Order, OrderStatus, Event, EventType } from "../types";
import AdminCMS from "../components/AdminCMS";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  ShieldCheck, 
  Users, 
  FileCheck, 
  Activity, 
  Settings, 
  Percent, 
  AlertOctagon, 
  Ban, 
  Unlock, 
  CreditCard, 
  ArrowUpRight, 
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  LineChart,
  Sparkles,
  Award,
  CheckCircle,
  Layout,
  Image as ImageIcon,
  Tag,
  Globe,
  BookOpen,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Edit
} from "lucide-react";

export default function AdminPanel() {
  const { 
    currentUser,
    users, 
    events, 
    orders, 
    approveEvent, 
    toggleFeatured, 
    formatCurrency,
    cmsConfig,
    updateCMSConfig,
    saveCMSConfig,
    blogs,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    faqs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    updateManualPaymentStatus,
    deleteUser,
    deleteEvent,
    deleteOrder,
    resetSystemToZero,
    supportMessages,
    replyToSupportMessage,
    updateSupportMessageStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>("approvals");

  // Support Admin State
  const pendingTicketsCount = useMemo(() => {
    return supportMessages.filter(m => m.status === "Pendente").length;
  }, [supportMessages]);

  const [supportFilter, setSupportFilter] = useState<"Todos" | "Pendente" | "Respondido" | "Fechado">("Todos");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [adminInternalNotes, setAdminInternalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSendingAdminReply, setIsSendingAdminReply] = useState(false);

  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return supportMessages.find(m => m.id === selectedTicketId) || null;
  }, [supportMessages, selectedTicketId]);

  const filteredTickets = useMemo(() => {
    if (supportFilter === "Todos") return supportMessages;
    return supportMessages.filter(m => m.status === supportFilter);
  }, [supportMessages, supportFilter]);

  useEffect(() => {
    if (selectedTicket) {
      setAdminInternalNotes(selectedTicket.adminNotes || "");
    } else {
      setAdminInternalNotes("");
    }
  }, [selectedTicketId, selectedTicket?.adminNotes]);

  const handleAdminReplySubmit = async () => {
    if (!selectedTicket || !adminReplyText.trim()) return;
    setIsSendingAdminReply(true);
    try {
      await replyToSupportMessage(selectedTicket.id, adminReplyText, currentUser?.name || "Administrador", "Admin");
      setAdminReplyText("");
    } catch (e) {
      alert("Erro ao responder ao ticket.");
    } finally {
      setIsSendingAdminReply(false);
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedTicket) return;
    setIsSavingNotes(true);
    try {
      await updateSupportMessageStatus(selectedTicket.id, selectedTicket.status, adminInternalNotes);
      alert("Notas internas salvas com sucesso!");
    } catch (e) {
      alert("Erro ao salvar notas internas.");
    } finally {
      setIsSavingNotes(false);
    }
  };
  const [globalCommissionRate, setGlobalCommissionRate] = useState(5); // Default 5% commission rate
  const [payoutLogs, setPayoutLogs] = useState([
    { id: "pay-1", org: "Clé Entertainment", val: 820000, date: "2026-07-15", status: "Pago" },
    { id: "pay-2", org: "Comedy Club Angola", val: 120000, date: "2026-07-10", status: "Pago" }
  ]);

  // LOCAL STATES FOR MANUAL PAYMENT METHODS EDITING
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentName, setPaymentName] = useState("");
  const [paymentBankName, setPaymentBankName] = useState("");
  const [paymentAccountHolder, setPaymentAccountHolder] = useState("");
  const [paymentAccountNumber, setPaymentAccountNumber] = useState("");
  const [paymentIban, setPaymentIban] = useState("");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [paymentOrder, setPaymentOrder] = useState(0);
  const [paymentActive, setPaymentActive] = useState(true);

  // LOCAL STATES FOR SLIDES EDITING
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideTitle, setSlideTitle] = useState("");
  const [slideSubtitle, setSlideSubtitle] = useState("");
  const [slideDesc, setSlideDesc] = useState("");
  const [slideImage, setSlideImage] = useState("");
  const [slideBtnText, setSlideBtnText] = useState("");
  const [slideBtnLink, setSlideBtnLink] = useState("");
  const [slideOrder, setSlideOrder] = useState(0);
  const [slideActive, setSlideActive] = useState(true);

  // LOCAL STATES FOR CATEGORIES EDITING
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [categoryOrder, setCategoryOrder] = useState(0);
  const [categoryActive, setCategoryActive] = useState(true);

  // LOCAL STATES FOR FAQS EDITING
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("Geral");

  // LOCAL STATES FOR BLOG POSTS EDITING
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCover, setBlogCover] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCategory, setBlogCategory] = useState("Novidades");
  const [blogAuthor, setBlogAuthor] = useState("Admin");

  // LOCAL STATES FOR HEADER NAVIGATION LINKS
  const [editingHeaderLinkIndex, setEditingHeaderLinkIndex] = useState<number | null>(null);
  const [headerLinkLabel, setHeaderLinkLabel] = useState("");
  const [headerLinkUrl, setHeaderLinkUrl] = useState("");
  const [headerLinkActive, setHeaderLinkActive] = useState(true);

  // Observations for manual payment approval modal
  const [paymentObservation, setPaymentObservation] = useState("");

  // General platform-wide calculations
  const platformStats = useMemo(() => {
    const totalUsers = users.length;
    const clients = users.filter(u => u.role === UserRole.CLIENTE).length;
    const organizers = users.filter(u => u.role === UserRole.ORGANIZADOR).length;
    const activeEvts = events.filter(e => e.approved).length;
    const pendingEvts = events.filter(e => !e.approved).length;
    const onlineEvts = events.filter(e => e.type === EventType.ONLINE).length;
    const physicalEvts = events.filter(e => e.type === EventType.PRESENCIAL).length;

    let ticketsSold = 0;
    let grossTicketRevenue = 0;
    let refunds = 0;

    orders.forEach(o => {
      if (o.status === OrderStatus.COMPLETADO) {
        ticketsSold += o.quantity;
        grossTicketRevenue += o.totalPrice;
      } else if (o.status === OrderStatus.REEMBOLSADO) {
        refunds += o.totalPrice;
      }
    });

    const commissionsEarned = grossTicketRevenue * (globalCommissionRate / 100);

    return {
      totalUsers,
      clients,
      organizers,
      activeEvts,
      pendingEvts,
      onlineEvts,
      physicalEvts,
      ticketsSold,
      grossTicketRevenue,
      commissionsEarned,
      refunds
    };
  }, [users, events, orders, globalCommissionRate]);

  // Pending approval events queue
  const pendingEventsQueue = useMemo(() => {
    return events.filter(e => !e.approved && !e.rejected);
  }, [events]);

  // Rejected events list
  const rejectedEventsList = useMemo(() => {
    return events.filter(e => e.rejected);
  }, [events]);

  // Pending manual bank payment orders
  const pendingOrders = useMemo(() => {
    return orders.filter(o => o.status === OrderStatus.PENDENTE);
  }, [orders]);

  // Approved events listing
  const approvedEventsList = useMemo(() => {
    return events.filter(e => e.approved);
  }, [events]);

  // Chart structured data representing financial health
  const financialMonthlyData = [
    { name: "Jan", receita: 1200000, comissoes: 60000 },
    { name: "Fev", receita: 1800000, comissoes: 90000 },
    { name: "Mar", receita: 2400000, comissoes: 120000 },
    { name: "Abr", receita: 1500000, comissoes: 75000 },
    { name: "Mai", receita: 3100000, comissoes: 155000 },
    { name: "Jun", receita: 4500000, comissoes: 225000 },
    { name: "Jul", receita: 5800000, comissoes: 290000 }
  ];

  const distributionChartData = [
    { name: "Presencial", value: platformStats.physicalEvts },
    { name: "Online", value: platformStats.onlineEvts }
  ];

  const COLORS = ["#f59e0b", "#10b981"];

  const handleApprove = (id: string) => {
    approveEvent(id, true);
    alert("O evento foi devidamente homologado e está ativo para venda no Website Público.");
  };

  const handleReject = (id: string) => {
    approveEvent(id, false);
    alert("O evento foi colocado no estado pendente/recusado para retificação do organizador.");
  };

  return (
    <div className="bg-gray-50 flex-grow" id="admin-panel-portal">
      
      {/* Admin header */}
      <section className="bg-white border-b border-gray-150 py-8 text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100 shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-600 font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-indigo-100">Geral</span>
                <span className="text-[10px] text-gray-400 font-bold">• Angola</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-gray-900">Painel de Administração SaaS</h2>
              <p className="text-gray-500 text-xs font-medium">Controlo centralizado de transações, comissões, homologações de espetáculos e personalização do portal (CMS).</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-sm">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <Percent className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Taxa de Serviço</span>
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    value={globalCommissionRate} 
                    onChange={(e) => setGlobalCommissionRate(Number(e.target.value))}
                    className="bg-transparent border-none text-gray-950 font-extrabold text-sm focus:outline-none w-10 font-mono" 
                  />
                  <span className="text-gray-600 font-bold text-xs">%</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (window.confirm("⚠️ ATENÇÃO MÁXIMA: Tem certeza absoluta que deseja ZERAR O SISTEMA? Isso irá excluir permanentemente todos os eventos, faturas, vendas, blogs, FAQs e utilizadores do banco de dados para poder começar do absoluto zero.")) {
                  await resetSystemToZero();
                  alert("O sistema foi restaurado com sucesso! Tudo foi redefinido para o absoluto zero.");
                }
              }}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-5 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all border border-red-100 active:scale-95"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Zerar Sistema para o Início</span>
            </button>
          </div>
        </div>
      </section>

      {/* Corporate platform summary indicators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between text-left transition-all hover:shadow-md hover:border-indigo-100">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Volume Transacionado</span>
              <p className="text-lg font-black font-mono text-gray-950">{formatCurrency(platformStats.grossTicketRevenue)}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between text-left transition-all hover:shadow-md hover:border-red-100">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Taxas SaaS Cobradas</span>
              <p className="text-lg font-black font-mono text-red-600">{formatCurrency(platformStats.commissionsEarned)}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-red-500 animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between text-left transition-all hover:shadow-md hover:border-emerald-100">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Ingressos Vendidos</span>
              <p className="text-lg font-black text-gray-950 font-mono">{platformStats.ticketsSold} <span className="text-xs text-gray-500 font-normal">un.</span></p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between text-left transition-all hover:shadow-md hover:border-amber-100">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Devoluções e Reembolsos</span>
              <p className="text-lg font-black font-mono text-amber-600">{formatCurrency(platformStats.refunds)}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
              <Ban className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between text-left transition-all hover:shadow-md hover:border-teal-100">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Base de Clientes</span>
              <p className="text-lg font-black text-gray-950 font-mono">{platformStats.totalUsers} <span className="text-xs text-gray-500 font-normal">registos</span></p>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className="w-full lg:w-72 bg-white rounded-2xl border border-gray-150 p-4 shrink-0 h-fit space-y-5 flex lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-none snap-x text-left">
            {[
              {
                title: "Validações e Fila",
                items: [
                  { id: "approvals", label: "Homologação de Shows", badge: pendingEventsQueue.length, icon: FileCheck, badgeColor: "bg-amber-100 text-amber-800" },
                  { id: "pending_payments", label: "Aprovações de Depósito", badge: pendingOrders.length, icon: CreditCard, badgeColor: "bg-red-150 text-red-700" },
                ]
              },
              {
                title: "Configurações CMS",
                items: [
                  { id: "cms_header_footer", label: "Cabeçalho & Rodapé", icon: Layout },
                  { id: "cms_slider", label: "Slider Principal", icon: ImageIcon },
                  { id: "cms_categories", label: "Categorias de Eventos", icon: Tag },
                  { id: "cms_pages_help", label: "Sobre, Termos & FAQs", icon: HelpCircle },
                  { id: "cms_blog", label: "Sistema de Blog", icon: BookOpen },
                  { id: "cms_payments", label: "Configs de Pagamento", icon: Settings },
                ]
              },
              {
                title: "Controlo e Métricas",
                items: [
                  { id: "financials", label: "Gestão Financeira & SaaS", icon: LineChart },
                  { id: "users", label: "Utilizadores & Moderação", icon: Users },
                  { id: "support_tickets", label: "Apoio e Suporte", badge: pendingTicketsCount, icon: HelpCircle, badgeColor: "bg-amber-100 text-amber-800" },
                  { id: "metrics", label: "Relatórios & Estatísticas", icon: Activity },
                ]
              }
            ].map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1.5 shrink-0 flex flex-row lg:flex-col items-center lg:items-stretch gap-1.5 lg:gap-0 w-auto lg:w-full">
                {/* Section Header */}
                <span className="hidden lg:block text-[9px] font-extrabold uppercase tracking-widest text-gray-400 px-3 pt-2 first:pt-0">
                  {group.title}
                </span>

                <div className="flex flex-row lg:flex-col gap-1 lg:gap-1 w-full">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`snap-start shrink-0 whitespace-nowrap lg:w-full lg:text-left flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                          isActive 
                            ? "bg-red-650 text-white shadow-md shadow-red-650/15" 
                            : "text-gray-650 hover:bg-gray-50 hover:text-gray-950"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold ${isActive ? "bg-white text-red-650" : item.badgeColor || "bg-gray-100 text-gray-600"}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>

          {/* Tab contents */}
          <section className="flex-grow min-w-0">
            
            {/* TAB 1: PENDING EVENT APPROVAL QUEUE */}
            {activeTab === "approvals" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-sans font-extrabold text-lg text-gray-950">Aprovações de Eventos Culturais</h3>
                  <p className="text-gray-500 text-xs">Examine os regulamentos, alinhamentos de preços e aprove ou recuse a publicação de novos shows criados pelos organizadores.</p>
                </div>

                {pendingEventsQueue.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-150 p-10 text-center space-y-2">
                    <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-sans font-bold text-gray-900 text-sm">Fila limpa e homologada</h4>
                    <p className="text-xs text-gray-400">Todos os eventos criados por produtores estão devidamente aprovados e visíveis ao público.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingEventsQueue.map((evt) => (
                      <div 
                        key={evt.id}
                        className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4 text-left"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-4">
                            <img src={evt.image} className="w-16 h-16 rounded-xl object-cover shrink-0 border" alt="" />
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="bg-indigo-50 text-indigo-650 font-bold text-[9px] uppercase px-2 py-0.5 rounded">{evt.category}</span>
                                {evt.rejected && (
                                  <span className="bg-red-50 text-red-600 font-bold text-[9px] uppercase px-2 py-0.5 rounded">Já Rejeitado</span>
                                )}
                              </div>
                              <h4 className="font-sans font-bold text-base text-gray-950 mt-1">{evt.title}</h4>
                              <p className="text-[11px] text-gray-500">{evt.city} - {evt.location} | Por: <span className="font-semibold">{evt.organizerName}</span></p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(evt.id)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Aprovar</span>
                            </button>
                            <button
                              onClick={() => handleReject(evt.id)}
                              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span>Rejeitar</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-gray-400 uppercase text-[9px]">Resumo do Evento</p>
                            <p className="text-gray-650">{evt.summary}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-gray-400 uppercase text-[9px]">Preços Propostos</p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {evt.ticketTypes.map((t, i) => (
                                <span key={i} className="bg-gray-50 border border-gray-200 px-2 py-1 rounded font-mono text-[10px] text-gray-700">
                                  {t.name}: {formatCurrency(t.price)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Listing of currently active Events for highlight management */}
                <div className="space-y-4 pt-6 border-t border-gray-150">
                  <h4 className="text-sm font-bold text-gray-950 text-left">Lista de Espetáculos Ativos & Destaques</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {approvedEventsList.map((evt) => (
                      <div key={evt.id} className="bg-white p-4 rounded-xl border border-gray-150 flex items-center justify-between text-xs text-left">
                        <div>
                          <p className="font-bold text-gray-900">{evt.title}</p>
                          <p className="text-[10px] text-gray-400">Cidade: {evt.city} | Produtor: {evt.organizerName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              toggleFeatured(evt.id);
                              alert(`O estado de destaque do evento '${evt.title}' foi atualizado.`);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                              evt.featured 
                                ? "bg-amber-50 text-amber-600 border-amber-100" 
                                : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>{evt.featured ? "Em Destaque" : "Destacar"}</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              if (window.confirm(`Deseja excluir permanentemente o evento '${evt.title}'?`)) {
                                deleteEvent(evt.id);
                                alert("Evento excluído com sucesso!");
                              }
                            }}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg transition-colors flex items-center justify-center"
                            title="Excluir Evento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Listing of currently rejected Events awaiting correction */}
                {rejectedEventsList.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-gray-150">
                    <h4 className="text-sm font-bold text-red-650 text-left">Lista de Espetáculos Recusados (Aguardando Correção)</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {rejectedEventsList.map((evt) => (
                        <div key={evt.id} className="bg-white p-4 rounded-xl border border-red-100 flex items-center justify-between text-xs text-left shadow-sm">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-gray-900">{evt.title}</p>
                              <span className="bg-red-50 text-red-650 font-bold text-[9px] uppercase px-1.5 py-0.5 rounded border border-red-100">Recusado</span>
                            </div>
                            <p className="text-[10px] text-gray-400">Cidade: {evt.city} | Produtor: {evt.organizerName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                handleApprove(evt.id);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Reavaliar & Aprovar</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja excluir permanentemente o evento '${evt.title}'?`)) {
                                  deleteEvent(evt.id);
                                  alert("Evento excluído com sucesso!");
                                }
                              }}
                              className="p-1.5 bg-red-50 text-red-650 hover:bg-red-100 border border-red-100 rounded-lg transition-colors flex items-center justify-center"
                              title="Excluir Evento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1.5: PENDING MANUAL PAYMENTS APPROVAL QUEUE */}
            {activeTab === "pending_payments" && (
              <div className="space-y-6 text-left" id="tab-pending-payments">
                <div>
                  <h3 className="font-sans font-extrabold text-lg text-gray-950">Aprovações de Pagamentos Manuais</h3>
                  <p className="text-gray-500 text-xs">Valide os comprovativos de transferências bancárias ou depósitos enviados pelos compradores para libertar os ingressos.</p>
                </div>

                {pendingOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-150 p-10 text-center space-y-2">
                    <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-sans font-bold text-gray-900 text-sm">Nenhum pagamento pendente</h4>
                    <p className="text-xs text-gray-400">Todos os pedidos foram liquidados ou cancelados.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
                          <div>
                            <span className="bg-amber-100 text-amber-800 font-bold text-[9px] uppercase px-2 py-0.5 rounded">Aguardando Validação</span>
                            <h4 className="font-sans font-bold text-base text-indigo-950 mt-1">{order.orderNumber}</h4>
                            <p className="text-xs text-gray-500">Comprador: <span className="font-semibold text-gray-800">{order.userName}</span> ({order.userEmail}) {order.buyerPhone && `| Tel: ${order.buyerPhone}`}</p>
                          </div>
                          <div className="flex flex-col items-end text-right">
                            <span className="font-extrabold font-mono text-indigo-650 text-base">{formatCurrency(order.totalPrice)}</span>
                            <span className="text-[10px] text-gray-450">{order.quantity}x {order.ticketTypeName}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Espetáculo</p>
                            <p className="font-bold text-gray-800">{order.eventTitle}</p>
                            <p className="text-gray-400 text-[10px]">{order.eventDate} | {order.eventLocation}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Método de Pagamento</p>
                            <p className="font-semibold text-gray-700">{order.paymentMethod}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Comprovativo Anexado</p>
                            {order.paymentReceiptUrl ? (
                              <div className="space-y-1.5">
                                <a href={order.paymentReceiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#2B7A5D] hover:underline font-bold text-[11px]">
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Ver Comprovativo</span>
                                </a>
                                <div className="h-14 w-24 rounded border overflow-hidden bg-gray-55 relative group cursor-pointer" onClick={() => window.open(order.paymentReceiptUrl, '_blank')}>
                                  <img src={order.paymentReceiptUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Receipt" />
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-450 italic">Nenhum ficheiro anexado</p>
                            )}
                          </div>
                        </div>

                        {/* Approval / Rejection Controls */}
                        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
                          <input 
                            type="text"
                            placeholder="Observação para o utilizador (opcional)..."
                            value={paymentObservation}
                            onChange={(e) => setPaymentObservation(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                updateManualPaymentStatus(order.id, OrderStatus.COMPLETADO, paymentObservation);
                                setPaymentObservation("");
                                alert(`Pedido ${order.orderNumber} aprovado! Ingressos gerados e disponíveis.`);
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Confirmar</span>
                            </button>
                            <button
                              onClick={() => {
                                updateManualPaymentStatus(order.id, OrderStatus.CANCELADO, paymentObservation);
                                setPaymentObservation("");
                                alert(`Pedido ${order.orderNumber} rejeitado e cancelado.`);
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span>Rejeitar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RENDER DYNAMIC CMS TABS */}
            {activeTab.startsWith("cms_") && (
              <AdminCMS subTab={activeTab} />
            )}

            {/* TAB 2: FINANCIAL PAYOUTS & COMMISSIONS */}
            {activeTab === "financials" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-sans font-extrabold text-lg text-gray-950">Gestão de Comissões e Levantamentos</h3>
                  <p className="text-gray-500 text-xs">Monitore os saldos dos organizadores, retenha comissões SaaS automáticas e autorize liquidações de saldo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="md:col-span-2 bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-900 uppercase">Levantamentos Efetuados</h4>
                    <div className="space-y-2.5">
                      {payoutLogs.map((p) => (
                        <div key={p.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-150 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-gray-950">{p.org}</p>
                            <p className="text-[10px] text-gray-400">Data Transferência: {p.date}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold font-mono text-gray-900">{formatCurrency(p.val)}</span>
                            <span className="block text-[8px] font-bold uppercase text-emerald-600 mt-0.5">{p.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-sm h-fit">
                    <h4 className="text-xs font-bold text-gray-900 uppercase">Ajuste de Comissões</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      A comissão configurada é debitada automaticamente sobre o valor global da compra de cada bilhete. 
                    </p>
                    <div className="space-y-3 pt-2 text-xs">
                      <div className="flex justify-between font-bold text-indigo-950">
                        <span>Taxa de Serviço:</span>
                        <span>{globalCommissionRate}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={globalCommissionRate} 
                        onChange={(e) => setGlobalCommissionRate(Number(e.target.value))}
                        className="w-full accent-red-600" 
                      />
                      <button
                        onClick={() => alert("Configuração de taxa de comissão SaaS atualizada globalmente.")}
                        className="w-full bg-gray-900 text-white font-bold text-xs py-2 rounded-lg"
                      >
                        Aplicar Taxa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: USER MANAGEMENT (ROLES & STATUS) */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-sans font-extrabold text-lg text-gray-950">Gestão de Utilizadores & Moderação</h3>
                  <p className="text-gray-500 text-xs">Controle as funções de acessos de Administradores, Organizadores de Eventos e Clientes cadastrados no ecossistema.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-450 uppercase tracking-widest text-[9px] font-bold border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-4">Utilizador</th>
                          <th className="px-5 py-4">Email</th>
                          <th className="px-5 py-4">Nível de Função (Role)</th>
                          <th className="px-5 py-4">Estado</th>
                          <th className="px-5 py-4 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                        {users.map((usr) => (
                          <tr key={usr.id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-4 flex items-center gap-3">
                              <img src={usr.avatar} className="w-8 h-8 rounded-lg object-cover border shrink-0" alt="" />
                              <span className="font-bold text-gray-900">{usr.name}</span>
                            </td>
                            <td className="px-5 py-4 text-gray-500 font-mono">{usr.email}</td>
                            <td className="px-5 py-4 font-bold text-indigo-600">{usr.role}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                usr.status === "Ativo" 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                  : "bg-red-50 text-red-600 border-red-100"
                              }`}>
                                {usr.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right space-x-2">
                              <button
                                onClick={() => alert(`Moderação: O estado do utilizador '${usr.name}' foi alterado.`)}
                                className="text-xs font-bold text-gray-600 hover:underline"
                              >
                                {usr.status === "Ativo" ? "Suspender" : "Ativar"}
                              </button>
                              {currentUser?.id !== usr.id && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Tem a certeza que deseja EXCLUIR permanentemente o utilizador '${usr.name}'?`)) {
                                      deleteUser(usr.id);
                                      alert("Utilizador excluído com sucesso!");
                                    }
                                  }}
                                  className="text-xs font-bold text-red-600 hover:underline"
                                >
                                  Excluir
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PLATFORM STATISTICS REPORTS (RECHARTS METRICS) */}
            {activeTab === "metrics" && (
              <div className="space-y-6 text-left">
                <div>
                  <h3 className="font-sans font-extrabold text-lg text-gray-950">Relatórios Estratégicos</h3>
                  <p className="text-gray-500 text-xs">Acompanhe a volumetria de vendas e distribuição de formatos de eventos de forma integrada.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Financial Bar chart */}
                  <div className="md:col-span-2 bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Histórico de Faturação SaaS Mensal (Kz)</h4>
                      <p className="text-xs text-gray-400">Total transações faturadas em comparação com as comissões líquidas geradas</p>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={financialMonthlyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                          <Tooltip formatter={(value: any) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="receita" fill="#f59e0b" name="Faturação Geral" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="comissoes" fill="#ef4444" name="Comissões Líquidas" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Distribution donut chart */}
                  <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 font-sans">Modelos de Negócio</h4>
                      <p className="text-xs text-gray-400">Proporção de eventos digitais contra presenciais</p>
                    </div>

                    <div className="h-44 w-full flex justify-center items-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distributionChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {distributionChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center gap-6 text-xs font-bold pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                        <span>Presencial ({platformStats.physicalEvts})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                        <span>Online ({platformStats.onlineEvts})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CUSTOMER SUPPORT AND TICKETS PORTAL */}
            {activeTab === "support_tickets" && (
              <div className="space-y-6 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-sans font-extrabold text-lg text-gray-950">Apoio ao Cliente & Tickets de Suporte</h3>
                    <p className="text-gray-500 text-xs">
                      Gerencie e responda às mensagens de suporte técnico e comercial de clientes, organizadores ou visitantes.
                    </p>
                  </div>
                  
                  {/* Filter controls */}
                  <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-150">
                    {(["Todos", "Pendente", "Respondido", "Fechado"] as const).map((filter) => {
                      const count = filter === "Todos" 
                        ? supportMessages.length 
                        : supportMessages.filter(m => m.status === filter).length;
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => {
                            setSupportFilter(filter);
                            // Deselect if not present in current list
                            if (selectedTicket && filter !== "Todos" && selectedTicket.status !== filter) {
                              setSelectedTicketId(null);
                            }
                          }}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                            supportFilter === filter
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          {filter} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left list panel: 5cols */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-150 p-4 space-y-4 shadow-sm flex flex-col max-h-[600px]">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
                      Fila de Atendimento
                    </h4>

                    {filteredTickets.length === 0 ? (
                      <div className="flex-grow flex flex-col items-center justify-center py-16 text-center">
                        <HelpCircle className="w-8 h-8 text-gray-300 mb-2 animate-pulse" />
                        <p className="text-xs text-gray-400 font-bold">Nenhum ticket encontrado</p>
                        <p className="text-[10px] text-gray-400">Todos os pedidos desta categoria foram atendidos.</p>
                      </div>
                    ) : (
                      <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                        {filteredTickets.map((ticket) => {
                          const isSelected = selectedTicketId === ticket.id;
                          return (
                            <button
                              key={ticket.id}
                              type="button"
                              onClick={() => {
                                setSelectedTicketId(ticket.id);
                                setAdminReplyText("");
                              }}
                              className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                                isSelected
                                  ? "bg-red-50/55 border-red-200 ring-1 ring-red-200"
                                  : "bg-gray-50 border-gray-150 hover:bg-gray-100/70"
                              }`}
                            >
                              <div className="flex justify-between items-start w-full gap-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  ticket.senderRole === "Admin" 
                                    ? "bg-indigo-100 text-indigo-800"
                                    : ticket.senderRole === "Organizador"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-emerald-100 text-emerald-800"
                                }`}>
                                  {ticket.senderRole}
                                </span>
                                
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                                  ticket.status === "Pendente"
                                    ? "bg-red-100 text-red-800"
                                    : ticket.status === "Respondido"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}>
                                  {ticket.status}
                                </span>
                              </div>

                              <div className="space-y-0.5">
                                <h5 className="text-xs font-black text-gray-900 truncate">{ticket.subject}</h5>
                                <p className="text-[10px] font-bold text-gray-550">{ticket.name} ({ticket.email})</p>
                              </div>

                              <p className="text-[10px] text-gray-400 line-clamp-2 leading-normal">{ticket.message}</p>
                              
                              <div className="flex justify-between items-center pt-1 border-t border-gray-100/60 mt-1 text-[9px] text-gray-400">
                                <span>ID: {ticket.id}</span>
                                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Chat & detail panel: 7cols */}
                  <div className="lg:col-span-7 space-y-4">
                    {selectedTicket ? (
                      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm flex flex-col h-[600px] space-y-4">
                        {/* Header */}
                        <div className="border-b border-gray-150 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-gray-900">{selectedTicket.subject}</h4>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                                selectedTicket.status === "Pendente"
                                  ? "bg-red-100 text-red-800"
                                  : selectedTicket.status === "Respondido"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}>
                                {selectedTicket.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium">
                              De: <span className="font-bold text-gray-800">{selectedTicket.name}</span> ({selectedTicket.email})
                            </p>
                            <p className="text-[9px] text-gray-400">Canal: {selectedTicket.senderRole} • Criado em {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                          </div>

                          {/* Quick Actions / Status selector */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <select
                              value={selectedTicket.status}
                              onChange={async (e) => {
                                try {
                                  await updateSupportMessageStatus(selectedTicket.id, e.target.value as any);
                                } catch (err) {
                                  alert("Erro ao alterar o estado do ticket.");
                                }
                              }}
                              className="bg-gray-50 border border-gray-200 text-gray-800 text-[10px] font-bold rounded-lg px-2 py-1.5 focus:outline-none"
                            >
                              <option value="Pendente">Pendente</option>
                              <option value="Respondido">Respondido</option>
                              <option value="Fechado">Fechado (Resolvido)</option>
                            </select>
                          </div>
                        </div>

                        {/* Mid Area: Live chat feed and administrative memo collapsible */}
                        <div className="flex-grow flex flex-col md:flex-row gap-4 overflow-hidden min-h-0">
                          {/* Live Chat messages: 3/5 width */}
                          <div className="flex-grow overflow-y-auto space-y-4 pr-1 text-xs flex flex-col">
                            {/* Original customer description */}
                            <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl max-w-[85%] self-start">
                              <p className="font-bold text-gray-800 text-[10px] mb-1">{selectedTicket.name} ({selectedTicket.senderRole})</p>
                              <p className="text-gray-650 whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
                            </div>

                            {/* Ticket Responses / Replies history */}
                            {selectedTicket.replies?.map((reply) => (
                              <div
                                key={reply.id}
                                className={`p-3.5 rounded-2xl max-w-[85%] flex flex-col ${
                                  reply.senderRole === "Admin"
                                    ? "bg-red-50 border border-red-100 ml-auto self-end"
                                    : "bg-gray-50 border border-gray-100 self-start"
                                }`}
                              >
                                <span className="font-bold text-[10px] text-gray-705 mb-1">
                                  {reply.senderRole === "Admin" ? "Você (Suporte Técnico) 👑" : `${selectedTicket.name}`}
                                </span>
                                <p className="text-gray-650 whitespace-pre-wrap leading-normal">{reply.message}</p>
                                <span className="text-[9px] text-gray-400 text-right mt-1.5">
                                  {new Date(reply.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Collapsible Administrative observations & notes: 2/5 width */}
                          <div className="w-full md:w-56 shrink-0 bg-gray-50 border border-gray-150 p-3 rounded-xl space-y-2.5 h-fit flex flex-col justify-between">
                            <div>
                              <h5 className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Notas Internas</h5>
                              <p className="text-[9px] text-gray-400">Anotações administrativas invisíveis para o cliente.</p>
                            </div>

                            <textarea
                              placeholder="Adicione observações de auditoria, reembolsos ou referências de contacto..."
                              value={adminInternalNotes}
                              onChange={(e) => setAdminInternalNotes(e.target.value)}
                              className="w-full bg-white border border-gray-250 rounded-lg p-2 text-[10px] focus:outline-none focus:border-red-500 text-gray-800 h-28"
                            />

                            <button
                              type="button"
                              onClick={handleSaveAdminNotes}
                              disabled={isSavingNotes}
                              className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg transition-colors w-full"
                            >
                              {isSavingNotes ? "A Guardar..." : "Salvar Notas"}
                            </button>
                          </div>
                        </div>

                        {/* Reply Area footer */}
                        {selectedTicket.status !== "Fechado" ? (
                          <div className="border-t border-gray-150 pt-4 space-y-2">
                            <textarea
                              placeholder={`Escreva uma resposta oficial para enviar a ${selectedTicket.name}...`}
                              value={adminReplyText}
                              onChange={(e) => setAdminReplyText(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-red-500 text-gray-800 h-16"
                            />
                            
                            <div className="flex justify-between items-center">
                              <p className="text-[10px] text-gray-400 font-mono">Ao responder, o ticket é marcado como respondido.</p>
                              
                              <button
                                type="button"
                                onClick={handleAdminReplySubmit}
                                disabled={!adminReplyText.trim() || isSendingAdminReply}
                                className="bg-red-650 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-red-650/10"
                              >
                                {isSendingAdminReply ? "A responder..." : "Submeter Resposta Oficial"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-100 text-gray-400 p-4 rounded-xl text-center text-xs font-bold uppercase tracking-wider">
                            Este ticket está Fechado • Reabra mudando o estado acima
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-gray-150 p-12 shadow-sm text-center flex flex-col items-center justify-center h-[600px] space-y-4">
                        <div className="p-4 bg-red-50 text-red-650 rounded-full">
                          <HelpCircle className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-gray-950 font-sans text-base">Nenhum Ticket Selecionado</h4>
                          <p className="text-gray-400 text-xs max-w-sm mt-1">
                            Selecione um pedido de suporte na fila de atendimento à esquerda para visualizar a conversa e submeter respostas.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </section>
        </div>
      </div>

    </div>
  );
}
