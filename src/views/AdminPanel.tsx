import React, { useState, useMemo } from "react";
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
    updateManualPaymentStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>("approvals");
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
    return events.filter(e => !e.approved);
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
      <section className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-500/15 rounded-2xl text-red-400 border border-red-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-0.5 text-left">
              <h2 className="text-xl sm:text-2xl font-sans font-bold tracking-tight">Painel Administrativo Central</h2>
              <p className="text-gray-400 text-xs">Supervisão de pagamentos, taxas de comissão SaaS e homologações de espetáculos pendentes.</p>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
            <Percent className="w-5 h-5 text-red-400" />
            <div className="text-left">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Comissão Geral SaaS</span>
              <input 
                type="number" 
                value={globalCommissionRate} 
                onChange={(e) => setGlobalCommissionRate(Number(e.target.value))}
                className="bg-transparent border-none text-white font-bold text-sm focus:outline-none w-14 font-mono" 
              />
              <span className="text-white font-bold text-xs">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate platform summary indicators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-2 text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Volume Transações</span>
            <p className="text-base sm:text-lg font-black font-mono text-gray-950">{formatCurrency(platformStats.grossTicketRevenue)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-2 text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Receita SaaS</span>
            <p className="text-base sm:text-lg font-black font-mono text-red-600">{formatCurrency(platformStats.commissionsEarned)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-2 text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Bilhetes Vendidos</span>
            <p className="text-base sm:text-lg font-black text-gray-950">{platformStats.ticketsSold} un</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-2 text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Reembolsos</span>
            <p className="text-base sm:text-lg font-black font-mono text-gray-400">{formatCurrency(platformStats.refunds)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-2 text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Utilizadores</span>
            <p className="text-base sm:text-lg font-black text-gray-950">{platformStats.totalUsers} contas</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className="w-full lg:w-64 bg-white rounded-2xl border border-gray-150 p-4 shrink-0 h-fit space-y-1">
            {[
              { id: "approvals", label: `Homologação Eventos (${pendingEventsQueue.length})`, icon: FileCheck },
              { id: "pending_payments", label: `Aprovações Pagamento (${pendingOrders.length})`, icon: CreditCard },
              { id: "cms_header_footer", label: "CMS: Cabeçalho & Rodapé", icon: Layout },
              { id: "cms_slider", label: "CMS: Slider Principal", icon: ImageIcon },
              { id: "cms_categories", label: "CMS: Categorias de Eventos", icon: Tag },
              { id: "cms_pages_help", label: "CMS: Sobre & Ajuda / FAQs", icon: HelpCircle },
              { id: "cms_blog", label: "CMS: Sistema de Blog", icon: BookOpen },
              { id: "cms_payments", label: "CMS: Configs Pagamento", icon: Settings },
              { id: "financials", label: "Gestão Financeira & SaaS", icon: CreditCard },
              { id: "users", label: "Utilizadores & Controlo", icon: Users },
              { id: "metrics", label: "Relatórios & Estatísticas", icon: Activity }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                    activeTab === item.id 
                      ? "bg-red-650 text-white shadow-md shadow-red-650/10" 
                      : "text-gray-650 hover:bg-gray-55 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
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
                              <span className="bg-indigo-50 text-indigo-650 font-bold text-[9px] uppercase px-2 py-0.5 rounded">{evt.category}</span>
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
                      </div>
                    ))}
                  </div>
                </div>
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
                          <th className="px-5 py-4">Ação</th>
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
                            <td className="px-5 py-4">
                              <button
                                onClick={() => alert(`Moderação: O estado do utilizador '${usr.name}' foi alterado.`)}
                                className="text-xs font-bold text-red-600 hover:underline"
                              >
                                {usr.status === "Ativo" ? "Suspender" : "Ativar"}
                              </button>
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

          </section>
        </div>
      </div>

    </div>
  );
}
