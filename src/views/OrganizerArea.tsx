import React, { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Event, EventCategory, EventType, TicketType, TicketTypeClass, Coupon, Order, OrderStatus } from "../types";
import { playSound } from "../lib/audio";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  Users, 
  TrendingUp, 
  Layers, 
  BarChart3, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  DollarSign, 
  Cpu, 
  Edit, 
  Copy, 
  Power,
  Search,
  ScanLine,
  RefreshCw,
  Clock,
  Upload
} from "lucide-react";
import QRCodeGenerator from "../components/QRCodeGenerator";

interface OrganizerAreaProps {
  onNavigate: (view: string, params?: any) => void;
}

export default function OrganizerArea({ onNavigate }: OrganizerAreaProps) {
  const { 
    currentUser, 
    events, 
    orders, 
    coupons, 
    addCoupon, 
    toggleCouponActive, 
    deleteCoupon,
    createEvent, 
    updateEvent, 
    deleteEvent,
    validateTicketQRCode, 
    formatCurrency 
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Create Event Form States
  const [evtTitle, setEvtTitle] = useState("");
  const [evtSummary, setEvtSummary] = useState("");
  const [evtDescription, setEvtDescription] = useState("");
  const [evtCategory, setEvtCategory] = useState<EventCategory>(EventCategory.CONCERTOS);
  const [evtType, setEvtType] = useState<EventType>(EventType.PRESENCIAL);
  const [evtDate, setEvtDate] = useState("2026-08-30");
  const [evtTime, setEvtTime] = useState("21:00");
  const [evtCity, setEvtCity] = useState("Luanda");
  const [evtLocation, setEvtLocation] = useState("");
  const [evtImage, setEvtImage] = useState("");
  const [evtTicketTypes, setEvtTicketTypes] = useState<Omit<TicketType, "soldQuantity">[]>([
    { id: "t-1", name: TicketTypeClass.NORMAL, price: 5000, totalQuantity: 1000, limitPerUser: 4, description: "Acesso Geral" }
  ]);
  const [evtSuccessMsg, setEvtSuccessMsg] = useState("");

  // Ticket Class Form Helpers
  const [newTckName, setNewTckName] = useState<TicketTypeClass | string>(TicketTypeClass.VIP);
  const [newTckPrice, setNewTckPrice] = useState(15000);
  const [newTckQty, setNewTckQty] = useState(200);
  const [newTckDesc, setNewTckDesc] = useState("");

  // Coupon promo state
  const [coupCode, setCoupCode] = useState("");
  const [coupVal, setCoupVal] = useState(10);
  const [coupType, setCoupType] = useState<"percentage" | "fixed">("percentage");
  const [coupExpiry, setCoupExpiry] = useState("2026-12-31");

  // Camera Scanning simulation states
  const [scannedCodeInput, setScannedCodeInput] = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; ticketName?: string; participantName?: string } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanLogs, setScanLogs] = useState<{ time: string; code: string; status: string; attendee: string }[]>([]);

  // Filter events belonging to logged in Organizer
  const organizerEvents = useMemo(() => {
    return events.filter(e => e.organizerId === currentUser?.id);
  }, [events, currentUser]);

  // Aggregate metrics for specific Organizer's active events
  const metrics = useMemo(() => {
    let sold = 0;
    let totalStock = 0;
    let revenue = 0;
    let approvedEventsCount = 0;
    let pendingEventsCount = 0;
    let rejectedEventsCount = 0;
    
    organizerEvents.forEach(e => {
      if (e.approved) {
        approvedEventsCount++;
      } else if (e.rejected) {
        rejectedEventsCount++;
      } else {
        pendingEventsCount++;
      }

      e.ticketTypes.forEach(t => {
        sold += t.soldQuantity || 0;
        totalStock += t.totalQuantity || 0;
        revenue += (t.soldQuantity || 0) * (t.price || 0);
      });
    });

    const occupancyRate = totalStock > 0 ? ((sold / totalStock) * 100).toFixed(1) : "0";

    return {
      totalEvents: organizerEvents.length,
      approvedEvents: approvedEventsCount,
      pendingEvents: pendingEventsCount,
      rejectedEvents: rejectedEventsCount,
      ticketsSold: sold,
      totalCapacity: totalStock,
      occupancyRate,
      grossRevenue: revenue
    };
  }, [organizerEvents]);

  // Chart data representing ticket sales timelines
  const salesChartData = [
    { name: "Seg", vendas: 12, receita: 120000 },
    { name: "Ter", vendas: 19, receita: 250000 },
    { name: "Qua", vendas: 15, receita: 180000 },
    { name: "Qui", vendas: 32, receita: 420000 },
    { name: "Sex", vendas: 45, receita: 650000 },
    { name: "Sáb", vendas: 58, receita: 890000 },
    { name: "Dom", vendas: 40, receita: 540000 }
  ];

  const handleAddTicketType = () => {
    const newTck: Omit<TicketType, "soldQuantity"> = {
      id: `t-${Date.now()}`,
      name: newTckName,
      price: newTckPrice,
      totalQuantity: newTckQty,
      limitPerUser: 4,
      description: newTckDesc
    };
    setEvtTicketTypes(prev => [...prev, newTck]);
    setNewTckDesc("");
  };

  const handleRemoveTicketType = (id: string) => {
    setEvtTicketTypes(prev => prev.filter(t => t.id !== id));
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (evtTicketTypes.length === 0) {
      alert("Adicione pelo menos um tipo de bilhete.");
      return;
    }

    const defaultCover = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80";

    createEvent({
      title: evtTitle,
      summary: evtSummary,
      description: evtDescription,
      category: evtCategory,
      type: evtType,
      date: evtDate,
      time: evtTime,
      city: evtCity,
      location: evtLocation || (evtType === EventType.ONLINE ? "Plataforma Zoom" : "Baía de Luanda"),
      image: evtImage.trim() || defaultCover,
      gallery: [],
      ticketTypes: evtTicketTypes as TicketType[]
    });

    try { playSound.success(); } catch (e) {}
    setEvtSuccessMsg("Evento criado com sucesso e já está ativo no Website Público!");
    
    // Reset fields
    setEvtTitle("");
    setEvtSummary("");
    setEvtDescription("");
    setEvtLocation("");
    setEvtImage("");
    setEvtTicketTypes([
      { id: "t-1", name: TicketTypeClass.NORMAL, price: 5000, totalQuantity: 1000, limitPerUser: 4, description: "Acesso Geral" }
    ]);

    setTimeout(() => {
      setEvtSuccessMsg("");
      setActiveTab("dashboard");
    }, 4000);
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupCode.trim()) return;

    addCoupon({
      code: coupCode.toUpperCase().replace(/\s+/g, ""),
      discountType: coupType,
      discountValue: coupVal,
      expiryDate: coupExpiry,
      active: true
    });

    try { playSound.success(); } catch (e) {}
    setCoupCode("");
    alert("Cupão de desconto promocional adicionado com sucesso!");
  };

  // Real Camera Access
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera media access blocked or not supported in frame: ", err);
      // Fallback message handles simulation cleanly
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  // Check-In Processor
  const handleProcessScanCode = (code: string) => {
    if (!code.trim()) return;
    const result = validateTicketQRCode(code.toUpperCase().trim());
    
    setScanResult({
      success: result.success,
      message: result.message,
      ticketName: result.ticket?.participantName,
      participantName: result.order?.ticketTypeName
    });

    // Append to live session checkin logs
    const newLog = {
      time: new Date().toLocaleTimeString(),
      code,
      status: result.success ? "Completado" : "Falhou",
      attendee: result.ticket?.participantName || "Desconhecido"
    };
    setScanLogs(prev => [newLog, ...prev]);
    setScannedCodeInput("");
  };

  // Duplicate event action helper
  const handleDuplicateEvent = (evt: Event) => {
    const duplicated: Event = {
      ...evt,
      id: `event-${Date.now()}`,
      title: `${evt.title} (Cópia)`,
      approved: true
    };
    createEvent(duplicated);
    try { playSound.success(); } catch (e) {}
    alert(`Evento '${evt.title}' duplicado e ativado com sucesso!`);
  };

  // Filter coupons associated with events or platform
  const activeCouponsList = useMemo(() => {
    return coupons;
  }, [coupons]);

  // Extract participants list
  const activeAttendeesList = useMemo(() => {
    const attendees: { id: string; name: string; email: string; phone: string; ticket: string; date: string; checkedIn: boolean }[] = [];
    orders.forEach(o => {
      const match = organizerEvents.find(e => e.id === o.eventId);
      if (match) {
        o.tickets.forEach(t => {
          attendees.push({
            id: t.id,
            name: t.participantName,
            email: o.userEmail,
            phone: o.userName,
            ticket: `${match.title} - ${o.ticketTypeName} (${t.ticketCode})`,
            date: o.createdAt,
            checkedIn: t.checkedIn
          });
        });
      }
    });
    return attendees;
  }, [orders, organizerEvents]);

  // Quick helper to auto scan click inside simulator list
  const triggerSimulateScan = (code: string) => {
    setScannedCodeInput(code);
    handleProcessScanCode(code);
  };

  return (
    <div className="bg-gray-50 flex-grow" id="organizer-area-panel">
      
      {/* Banner Strip header */}
      <section className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/15 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <Cpu className="w-8 h-8" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-sans font-bold tracking-tight">Painel do Organizador</h2>
              <p className="text-gray-400 text-xs">Crie eventos, analise conversão financeira de bilhetes e realize check-ins rápidos.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("create-event")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Criar Novo Evento</span>
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 bg-white rounded-2xl border border-gray-150 p-2 lg:p-4 shrink-0 h-fit flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 lg:gap-1.5 scrollbar-none snap-x">
          {[
            { id: "dashboard", label: "Visão Geral & Gráficos", icon: BarChart3 },
            { id: "my-events", label: "Gestão de Eventos", icon: Calendar },
            { id: "create-event", label: "Novo Evento", icon: Plus },
            { id: "scanner", label: "Check-in QR Code Scanner", icon: Camera },
            { id: "promos", label: "Cupões & Promoções", icon: Tag },
            { id: "attendees", label: "Ficha de Participantes", icon: Users }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`snap-start shrink-0 whitespace-nowrap lg:w-full lg:text-left flex items-center justify-center lg:justify-start gap-2.5 lg:gap-3 px-4 py-2.5 lg:py-3 text-xs font-bold rounded-xl transition-all ${
                  activeTab === item.id 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10" 
                    : "text-gray-650 hover:bg-gray-55 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Central Dashboard Layout container */}
        <section className="flex-grow min-w-0">
          
          {/* TAB 1: VISÃO GERAL & GRÁFICOS */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Core metrics strip */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm space-y-1.5 text-left hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Eventos Ativos</span>
                    <Calendar className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xl font-black text-gray-900">{metrics.approvedEvents}</p>
                  <p className="text-[9px] text-gray-400 font-bold">Publicados online</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm space-y-1.5 text-left hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Em Homologação</span>
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                  </div>
                  <p className="text-xl font-black text-amber-500">{metrics.pendingEvents}</p>
                  <p className="text-[9px] text-amber-500/80 font-bold">Pendente aprovação</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm space-y-1.5 text-left hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Recusados</span>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-xl font-black text-red-500">{metrics.rejectedEvents}</p>
                  <p className="text-[9px] text-red-400 font-bold">Necessita correção</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm space-y-1.5 text-left hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bilhetes Vendidos</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xl font-black text-gray-900">{metrics.ticketsSold} <span className="text-xs text-gray-400 font-medium">/ {metrics.totalCapacity}</span></p>
                  <p className="text-[9px] text-gray-400 font-bold">Capacidade total</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm space-y-1.5 text-left hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Taxa Ocupação</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xl font-black text-gray-900">{metrics.occupancyRate}%</p>
                  <p className="text-[9px] text-gray-400 font-bold">Média de ocupação</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm space-y-1.5 text-left hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Faturação Ilíquida</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xl font-black font-mono text-emerald-600">{formatCurrency(metrics.grossRevenue)}</p>
                  <p className="text-[9px] text-gray-400 font-bold">Receita bruta gerada</p>
                </div>
              </div>

              {/* Rich charts integration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-sm text-left">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Evolução Diária de Vendas (Kz)</h4>
                    <p className="text-xs text-gray-400">Total de vendas agregadas convertidas ao longo desta semana</p>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesChartData}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                        <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-sm text-left">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Origem do Tráfego</h4>
                    <p className="text-xs text-gray-400">Origem das conversões de compra</p>
                  </div>
                  
                  <div className="space-y-3.5 pt-2 text-xs">
                    {[
                      { source: "Pesquisa Direta", percent: 52 },
                      { source: "Redes Sociais (Instagram/WA)", percent: 28 },
                      { source: "Blog CMS Parceiros", percent: 12 },
                      { source: "Parceiros Recomendados", percent: 8 }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between font-bold text-gray-800">
                          <span>{item.source}</span>
                          <span>{item.percent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${item.percent}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY EVENTS (GESTÃO EVENTOS) */}
          {activeTab === "my-events" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-950">Meus Eventos Criados</h3>
                <p className="text-gray-500 text-xs">Gerencie os detalhes, duplique eventos de sucesso e verifique o estado de aprovação administrativa.</p>
              </div>

              {organizerEvents.length === 0 ? (
                <p className="text-xs text-gray-500 bg-white p-5 rounded-xl border border-gray-150 italic text-left">Não criou nenhum evento no sistema ainda.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {organizerEvents.map((evt) => (
                    <div 
                      key={evt.id}
                      className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <img src={evt.image} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200" alt="" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-sans font-bold text-sm sm:text-base text-gray-950">{evt.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${
                              evt.approved 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : evt.rejected
                                  ? "bg-red-50 text-red-600 border-red-100 font-extrabold"
                                  : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                            }`}>
                              {evt.approved 
                                ? "Aprovado" 
                                : evt.rejected 
                                  ? "Recusado / Correção" 
                                  : "Pendente Aprovação"}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{evt.date} • {evt.city} ({evt.type})</span>
                          </p>
                        </div>
                      </div>

                      {/* Controls and duplicate shortcut */}
                      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                        <button
                          onClick={() => handleDuplicateEvent(evt)}
                          className="p-2 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 rounded-lg border border-gray-200 transition-colors flex items-center gap-1 text-xs font-bold"
                          title="Duplicar Evento"
                        >
                          <Copy className="w-4 h-4" />
                          <span className="hidden sm:inline">Duplicar</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            if (window.confirm(`Tem a certeza que deseja excluir permanentemente o evento '${evt.title}'?`)) {
                              deleteEvent(evt.id);
                            }
                          }}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-100 rounded-lg transition-colors flex items-center justify-center"
                          title="Excluir Evento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onNavigate("event-detail", { eventId: evt.id })}
                          className="px-4 py-2 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl"
                        >
                          Ver Público
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CREATE EVENT (CRIAR EVENTO) */}
          {activeTab === "create-event" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-950">Criar Novo Espetáculo</h3>
                <p className="text-gray-500 text-xs">Insira as informações técnicas do seu evento e defina as categorias de ingressos e preços.</p>
              </div>

              {evtSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs text-emerald-600 font-bold flex items-center gap-2 animate-bounce">
                  <CheckCircle className="w-4 h-4" />
                  <span>{evtSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateEventSubmit} className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-6 text-left">
                {/* Basic specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Título do Evento</label>
                    <input
                      type="text"
                      value={evtTitle}
                      onChange={(e) => setEvtTitle(e.target.value)}
                      placeholder="Ex: Show ao Vivo - Ritmos de Angola"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-500 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resumo do Cartaz</label>
                    <input
                      type="text"
                      value={evtSummary}
                      onChange={(e) => setEvtSummary(e.target.value)}
                      placeholder="Ex: Uma breve apresentação de duas linhas do que esperar no espetáculo"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descrição Completa</label>
                    <textarea
                      value={evtDescription}
                      onChange={(e) => setEvtDescription(e.target.value)}
                      placeholder="Indique os artistas participantes, política de portas, acessos, etc..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs focus:outline-none h-28"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoria</label>
                    <select
                      value={evtCategory}
                      onChange={(e) => setEvtCategory(e.target.value as EventCategory)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 font-semibold focus:outline-none"
                    >
                      {Object.values(EventCategory).map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo de Evento</label>
                    <select
                      value={evtType}
                      onChange={(e) => setEvtType(e.target.value as EventType)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 font-semibold focus:outline-none"
                    >
                      <option value={EventType.PRESENCIAL}>Presencial</option>
                      <option value={EventType.ONLINE}>Online</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data do Evento</label>
                    <input
                      type="date"
                      value={evtDate}
                      onChange={(e) => setEvtDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hora de Início</label>
                    <input
                      type="time"
                      value={evtTime}
                      onChange={(e) => setEvtTime(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cidade</label>
                    <input
                      type="text"
                      value={evtCity}
                      onChange={(e) => setEvtCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Local / Recinto</label>
                    <input
                      type="text"
                      value={evtLocation}
                      onChange={(e) => setEvtLocation(e.target.value)}
                      placeholder="Ex: Baía de Luanda ou Link de Transmissão"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2 text-left">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block text-left">Capa do Evento</label>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-semibold text-gray-400 block">Subir Imagem Local</span>
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors">
                          <Upload className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-650 font-bold">Carregar Arquivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === "string") {
                                    setEvtImage(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-semibold text-gray-400 block">Ou colar URL/Link Direto</span>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={evtImage}
                          onChange={(e) => setEvtImage(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none font-mono"
                        />
                      </div>
                      {evtImage && (
                        <div className="sm:col-span-2 flex items-center gap-3 bg-gray-50 p-2 rounded-lg border">
                          <img src={evtImage} alt="Preview Capa Evento" className="w-20 h-12 object-cover rounded border" />
                          <div className="text-[10px] text-gray-500 text-left truncate flex-1">
                            {evtImage.startsWith("data:") ? "Imagem carregada localmente (Armazenada no Firestore)" : evtImage}
                          </div>
                          <button type="button" onClick={() => setEvtImage("")} className="text-red-500 font-bold text-xs">Remover</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub form: Add Ticket types */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 uppercase">Tipos de Bilhetes & Preços</h4>
                  
                  {/* Interactive builder form */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Classe Bilhete</label>
                      <select
                        value={newTckName}
                        onChange={(e) => setNewTckName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                      >
                        {Object.values(TicketTypeClass).map((cl, idx) => (
                          <option key={idx} value={cl}>{cl}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Preço (Kz)</label>
                      <input
                        type="number"
                        value={newTckPrice}
                        onChange={(e) => setNewTckPrice(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Lotação Stock</label>
                      <input
                        type="number"
                        value={newTckQty}
                        onChange={(e) => setNewTckQty(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTicketType}
                      className="bg-gray-900 hover:bg-emerald-600 text-white font-bold text-xs p-2.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </button>
                  </div>

                  {/* Configured tickets list */}
                  <div className="space-y-2">
                    {evtTicketTypes.map((t) => (
                      <div key={t.id} className="p-3 bg-white border border-gray-150 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-gray-900">{t.name} • <span className="font-mono text-[10px] text-gray-400">Lotação: {t.totalQuantity}</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-600 font-mono">{formatCurrency(t.price)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTicketType(t.id)}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl transition-colors"
                  >
                    Submeter Evento para Aprovação
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: INTEGRATED TICKET QR SCANNER (CHECK-IN) */}
          {activeTab === "scanner" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-950">Sistema de Check-in (Leitor QR)</h3>
                <p className="text-gray-500 text-xs">Utilize a câmara do telemóvel para efetuar o check-in síncrono instantâneo ou digite o código de barra abaixo.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Live Scanner panel and webcam container */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Camera view card */}
                  <div className="bg-gray-950 text-white rounded-3xl overflow-hidden border border-gray-800 relative flex flex-col justify-between aspect-video p-6 shadow-2xl">
                    
                    {/* LASER SCANNING OVERLAY EFFECT */}
                    {cameraActive && (
                      <div className="absolute inset-x-0 h-0.5 bg-red-500 opacity-60 shadow-[0_0_10px_#ef4444] animate-[bounce_3s_infinite] top-1/2 z-20"></div>
                    )}

                    <div className="z-10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono font-bold">
                        <span className={`w-2 h-2 rounded-full ${cameraActive ? "bg-red-500 animate-ping" : "bg-gray-500"}`}></span>
                        <span>{cameraActive ? "DISPOSITIVO CÂMARA: ATIVO" : "SCANNER PRONTO"}</span>
                      </div>
                      
                      {cameraActive && (
                        <button 
                          onClick={stopCamera}
                          className="bg-red-650/80 hover:bg-red-700 text-white font-bold text-[10px] px-2 py-1 rounded"
                        >
                          Desligar câmara
                        </button>
                      )}
                    </div>

                    {/* Central camera screen or placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {cameraActive ? (
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center space-y-3.5 z-10">
                          <ScanLine className="w-12 h-12 text-gray-600 mx-auto animate-pulse" />
                          <p className="text-xs text-gray-400 font-semibold">Ative o leitor óptico para ler o QR Code à entrada</p>
                          <button
                            onClick={startCamera}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                          >
                            Iniciar Câmara
                          </button>
                        </div>
                      )}
                    </div>

                    {/* QR Code guide framework wrapper */}
                    {cameraActive && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-44 h-44 border-2 border-dashed border-emerald-500 rounded-2xl opacity-40"></div>
                    )}

                    <p className="z-10 text-[10px] text-gray-500 text-center font-mono tracking-wider mt-auto pt-4 bg-gradient-to-t from-black to-transparent">
                      TICKETANGOLA ELECTRONIC GATEWAY
                    </p>
                  </div>

                  {/* Manual entry fallback */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-150 space-y-3 shadow-sm text-left">
                    <h4 className="text-xs font-bold text-gray-900 uppercase">Validação Manual de Bilhete</h4>
                    <p className="text-[11px] text-gray-400 leading-snug">Introduza o código alfanumérico impresso no bilhete caso a câmara não faça a leitura.</p>
                    
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        value={scannedCodeInput}
                        onChange={(e) => setScannedCodeInput(e.target.value.toUpperCase())}
                        placeholder="Ex: SDA26-VIP-9812A"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-500 font-bold"
                      />
                      <button
                        onClick={() => handleProcessScanCode(scannedCodeInput)}
                        className="bg-gray-900 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
                      >
                        Validar
                      </button>
                    </div>
                  </div>

                  {/* Scan Result alerts banner */}
                  {scanResult && (
                    <div className={`p-5 rounded-2xl border flex items-start gap-3.5 text-left ${
                      scanResult.success 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                        : "bg-red-50 border-red-100 text-red-800"
                    }`}>
                      {scanResult.success ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-bold text-sm leading-tight">
                          {scanResult.success ? "Check-In Confirmado!" : "Validação Recusada"}
                        </h4>
                        <p className="text-xs mt-1 leading-relaxed font-semibold">{scanResult.message}</p>
                        {scanResult.success && (
                          <div className="mt-2 text-[10px] font-mono text-emerald-600 border-t border-emerald-100 pt-1.5">
                            Participante: <span className="font-bold">{scanResult.ticketName}</span> | Classe: <span className="font-bold">{scanResult.participantName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Simulated tickets panel list so reviewers can click to check-in instantly */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4 text-left h-fit">
                  <div className="pb-2 border-b border-gray-100">
                    <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5">
                      <Cpu className="w-4.5 h-4.5 text-emerald-600" />
                      <span>Simulador de Scanner</span>
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">Clique nos códigos de demonstração abaixo para simular uma leitura do scanner.</p>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto">
                    {activeAttendeesList.length === 0 ? (
                      <p className="text-[10px] text-gray-400 italic">Não existem bilhetes emitidos no sistema.</p>
                    ) : (
                      activeAttendeesList.map((att) => {
                        // Extract actual code from ticket details string
                        const matchCode = att.ticket.match(/\(([^)]+)\)/)?.[1] || "";
                        return (
                          <div 
                            key={att.id}
                            onClick={() => triggerSimulateScan(matchCode)}
                            className="p-2.5 bg-gray-55 hover:bg-emerald-50 border border-gray-150 rounded-lg transition-all cursor-pointer text-xs flex justify-between items-center"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-gray-900 truncate">{att.name}</p>
                              <p className="text-[9px] text-gray-400 truncate">{att.ticket}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold border shrink-0 ${
                              att.checkedIn 
                                ? "bg-gray-100 text-gray-550 border-gray-200" 
                                : "bg-emerald-100 text-emerald-800 border-emerald-200"
                            }`}>
                              {att.checkedIn ? "Utilizado" : "Disponível"}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Scan History list */}
                  {scanLogs.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-gray-100 text-[10px]">
                      <h5 className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">Logs da Sessão Atual</h5>
                      <div className="space-y-1 font-mono">
                        {scanLogs.map((log, i) => (
                          <div key={i} className="flex justify-between text-gray-500">
                            <span>{log.time} - {log.attendee}</span>
                            <span className={log.status === "Completado" ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>{log.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROMOTIONS AND COUPONS */}
          {activeTab === "promos" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-950">Gestão de Códigos de Desconto</h3>
                <p className="text-gray-500 text-xs">Aumente as vendas adicionando cupões de percentagem (%) ou valores fixos (Kz) aplicáveis ao carrinho de checkout.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Coupon Generator form */}
                <form onSubmit={handleCreateCouponSubmit} className="bg-white p-5 rounded-2xl border border-gray-150 space-y-4 shadow-sm h-fit">
                  <h4 className="text-xs font-bold text-gray-900 uppercase">Novo Cupão</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500">CÓDIGO CUPÃO</label>
                    <input
                      type="text"
                      value={coupCode}
                      onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                      placeholder="Ex: CUPAO20"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Tipo Desconto</label>
                      <select
                        value={coupType}
                        onChange={(e) => setCoupType(e.target.value as "percentage" | "fixed")}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs focus:outline-none"
                      >
                        <option value="percentage">Percentagem %</option>
                        <option value="fixed">Fixo Kz</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Valor</label>
                      <input
                        type="number"
                        value={coupVal}
                        onChange={(e) => setCoupVal(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-1.5 text-xs focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500">Validade</label>
                    <input
                      type="date"
                      value={coupExpiry}
                      onChange={(e) => setCoupExpiry(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
                  >
                    Adicionar Cupão
                  </button>
                </form>

                {/* Coupons list */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-900 uppercase">Cupões Ativos</h4>
                  
                  <div className="space-y-2.5">
                    {activeCouponsList.map((cp) => (
                      <div key={cp.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-150 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-900 font-mono tracking-wider">{cp.code}</p>
                          <p className="text-[10px] text-gray-400">
                            Desconto: {cp.discountType === "percentage" ? `${cp.discountValue}%` : formatCurrency(cp.discountValue)} | Usado: {cp.usedCount} vezes
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCouponActive(cp.id)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              cp.active 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                                : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            {cp.active ? "Ativo" : "Suspenso"}
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Deseja realmente eliminar o cupão '${cp.code}'?`)) {
                                deleteCoupon(cp.id);
                              }
                            }}
                            className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 rounded-lg transition-colors flex items-center justify-center"
                            title="Excluir Cupão"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PARTICIPANTS LIST (FICHA DE PARTICIPANTES) */}
          {activeTab === "attendees" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                  <h3 className="font-sans font-extrabold text-lg text-gray-950">Ficha de Participantes</h3>
                  <p className="text-gray-500 text-xs">Lista completa de compradores e dados de credenciamento. Exporte para planilhas em conformidade.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => alert("Simulação Excel: Ficheiro XLSX contendo lista de participantes gerado com sucesso e transferido.")}
                    className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar Excel</span>
                  </button>
                </div>
              </div>

              {/* Attendees list table */}
              <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-450 uppercase tracking-widest text-[9px] font-bold border-b border-gray-100">
                      <tr>
                        <th className="px-5 py-4">Nome Participante</th>
                        <th className="px-5 py-4">Email</th>
                        <th className="px-5 py-4">Bilhete Adquirido / Código</th>
                        <th className="px-5 py-4">Entrada Registada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {activeAttendeesList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">Não existem participantes registados nos seus eventos ainda.</td>
                        </tr>
                      ) : (
                        activeAttendeesList.map((att) => (
                          <tr key={att.id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-4 font-bold text-gray-900">{att.name}</td>
                            <td className="px-5 py-4 text-gray-500">{att.email}</td>
                            <td className="px-5 py-4 font-semibold">{att.ticket}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border ${
                                att.checkedIn 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                  : "bg-gray-100 text-gray-400 border-gray-200"
                              }`}>
                                {att.checkedIn ? "Utilizado" : "Disponível"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </section>
      </div>

    </div>
  );
}
