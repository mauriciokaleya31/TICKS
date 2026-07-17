import React, { useState, useMemo, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Event, EventCategory, EventType, TicketType, PaymentMethod, Order, BlogPost, OrderStatus, UserRole } from "../types";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Info, 
  AlertTriangle, 
  CreditCard, 
  CheckCircle, 
  Percent, 
  Phone, 
  FileText, 
  Download, 
  Filter, 
  Play, 
  Award, 
  ArrowRight,
  Shield,
  HelpCircle,
  Share2,
  Bookmark,
  Sparkles,
  ArrowLeft,
  X,
  Camera,
  Ticket,
  Music,
  Trophy,
  Laptop,
  Theater,
  Presentation,
  MessageSquare,
  Send,
  Check,
  Users,
  Smartphone,
  TrendingUp,
  Coins,
  Heart,
  BookOpen,
  ShieldCheck,
  Upload
} from "lucide-react";
import QRCodeGenerator from "../components/QRCodeGenerator";

interface WebsitePublicProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  viewParams?: any;
}

export default function WebsitePublic({ currentView, onNavigate, viewParams }: WebsitePublicProps) {
  const { 
    events, 
    blogs, 
    faqs, 
    coupons, 
    processCheckout, 
    formatCurrency, 
    currentUser, 
    registerUser,
    addReview,
    getEventReviews,
    cmsConfig
  } = useApp();

  // Search and Filter States for "Todos os Eventos"
  const [searchQuery, setSearchQuery] = useState(viewParams?.search || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(viewParams?.category || "Todas");
  const [selectedCity, setSelectedCity] = useState<string>("Todas");
  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [selectedPriceType, setSelectedPriceType] = useState<string>("Todos"); // Todos, Gratuito, Pago
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("Qualquer"); // Qualquer, Hoje, Amanhã, Esta Semana, Este Mês

  // Homepage dynamic banner slide index state
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Checkout Flow states
  const [checkoutEvent, setCheckoutEvent] = useState<Event | null>(null);
  const [checkoutTicketType, setCheckoutTicketType] = useState<TicketType | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Ticket select, 2: Attendee info, 3: Payment, 4: Success
  const [buyerName, setBuyerName] = useState(currentUser?.name || "");
  const [buyerEmail, setBuyerEmail] = useState(currentUser?.email || "");
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || "");
  const [attendeeNames, setAttendeeNames] = useState<string[]>([""]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponError, setAppliedCouponError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | string>(PaymentMethod.MC_EXPRESS);
  const [mobileNumber, setMobileNumber] = useState("");
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Blog states
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);

  // Event review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // FAQ and Help states
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategoryFilter, setFaqCategoryFilter] = useState("Todos");
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // Popular slider ref and scroll helper
  const popularSliderRef = useRef<HTMLDivElement>(null);

  const scrollPopular = (direction: "left" | "right") => {
    if (popularSliderRef.current) {
      const { scrollLeft, clientWidth } = popularSliderRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      popularSliderRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Filter approved and future-ready events
  const approvedEvents = useMemo(() => {
    return events.filter(e => e.approved);
  }, [events]);

  // Cities extracted from events list
  const cities = useMemo(() => {
    const list = new Set(approvedEvents.map(e => e.city).filter(Boolean));
    return ["Todas", ...Array.from(list)];
  }, [approvedEvents]);

  // Categories list
  const categories = ["Todas", ...Object.values(EventCategory)];

  // Date Filter Logic
  const filteredEvents = useMemo(() => {
    return approvedEvents.filter(e => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(query);
        const matchesDesc = e.description.toLowerCase().includes(query);
        const matchesLocation = e.location.toLowerCase().includes(query);
        const matchesOrg = e.organizerName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesLocation && !matchesOrg) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== "Todas" && e.category !== selectedCategory) return false;

      // 3. City Filter
      if (selectedCity !== "Todas" && e.city !== selectedCity) return false;

      // 4. Type Filter (Online / Presencial)
      if (selectedType !== "Todos") {
        if (selectedType === "Online" && e.type !== EventType.ONLINE) return false;
        if (selectedType === "Presencial" && e.type !== EventType.PRESENCIAL) return false;
      }

      // 5. Price Filter
      if (selectedPriceType !== "Todos") {
        const isFree = e.ticketTypes.every(t => t.price === 0);
        if (selectedPriceType === "Gratuito" && !isFree) return false;
        if (selectedPriceType === "Pago" && isFree) return false;
      }

      // 6. Date Filter
      if (selectedDateFilter !== "Qualquer") {
        const eventDate = new Date(e.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        if (selectedDateFilter === "Hoje" && eventDate.toDateString() !== today.toDateString()) return false;
        if (selectedDateFilter === "Amanhã" && eventDate.toDateString() !== tomorrow.toDateString()) return false;
        if (selectedDateFilter === "Esta Semana" && (eventDate < today || eventDate > nextWeek)) return false;
        if (selectedDateFilter === "Este Mês" && (eventDate < today || eventDate > endOfMonth)) return false;
      }

      return true;
    });
  }, [approvedEvents, searchQuery, selectedCategory, selectedCity, selectedType, selectedPriceType, selectedDateFilter]);

  // Featured and Popular lists
  const featuredEvents = useMemo(() => approvedEvents.filter(e => e.featured), [approvedEvents]);
  const popularEvents = useMemo(() => approvedEvents.filter(e => e.popular), [approvedEvents]);
  const onlineEvents = useMemo(() => approvedEvents.filter(e => e.type === EventType.ONLINE), [approvedEvents]);

  // FAQ Accordion status
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Navigate to Event Detail view helper
  const handleViewEventDetail = (event: Event) => {
    onNavigate("event-detail", { eventId: event.id });
  };

  // Trigger purchase checkout setup
  const handleStartCheckout = (event: Event) => {
    setCheckoutEvent(event);
    setCheckoutTicketType(event.ticketTypes[0] || null);
    setCheckoutQuantity(1);
    setAttendeeNames([currentUser?.name || ""]);
    setBuyerName(currentUser?.name || "");
    setBuyerEmail(currentUser?.email || "");
    setBuyerPhone(currentUser?.phone || "");
    setCouponCode("");
    setAppliedDiscount(0);
    setAppliedCouponError("");
    setCheckoutStep(1);
    onNavigate("checkout");
  };

  const handleApplyCoupon = () => {
    setAppliedCouponError("");
    if (!couponCode.trim()) return;

    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
    if (!coupon) {
      setAppliedCouponError("Cupão inválido ou expirado.");
      setAppliedDiscount(0);
      return;
    }

    const now = new Date();
    const expiry = new Date(coupon.expiryDate);
    if (expiry < now) {
      setAppliedCouponError("Este cupão já expirou.");
      setAppliedDiscount(0);
      return;
    }

    if (coupon.eventId && coupon.eventId !== checkoutEvent?.id) {
      setAppliedCouponError("Este cupão não é válido para este evento.");
      setAppliedDiscount(0);
      return;
    }

    const ticketPrice = checkoutTicketType ? checkoutTicketType.price : 0;
    const subtotal = ticketPrice * checkoutQuantity;

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      setAppliedCouponError(`Valor mínimo de compra para este cupão é ${formatCurrency(coupon.minOrderValue)}`);
      setAppliedDiscount(0);
      return;
    }

    let discountValue = 0;
    if (coupon.discountType === "percentage") {
      discountValue = Math.floor(subtotal * (coupon.discountValue / 100));
    } else {
      discountValue = coupon.discountValue;
    }

    setAppliedDiscount(discountValue);
  };

  const handleCheckoutSubmit = () => {
    if (!checkoutEvent || !checkoutTicketType) return;

    // Check if manual payment method is active and needs a receipt
    const selectedPMConfig = (cmsConfig?.paymentMethods || []).find(pm => pm.id === paymentMethod);
    const isManual = paymentMethod === PaymentMethod.TRANSF_BANCARIA || 
                     String(paymentMethod).startsWith("pm-") || 
                     (selectedPMConfig && selectedPMConfig.type === "manual");

    if (isManual && !paymentReceiptUrl) {
      alert("Por favor, carregue o comprovativo de transferência ou depósito bancário para que possamos validar o seu pagamento.");
      return;
    }

    // Register user if guest or not matches
    let activeUser = currentUser;
    if (!currentUser || currentUser.email !== buyerEmail) {
      activeUser = registerUser(buyerName, buyerEmail, currentUser?.role || UserRole.CLIENTE, buyerPhone);
    }

    // Process checkout context mutation with all receipt and phone details
    const result = processCheckout(
      checkoutEvent.id,
      checkoutTicketType.id,
      checkoutQuantity,
      paymentMethod,
      couponCode,
      attendeeNames,
      buyerPhone,
      paymentReceiptUrl
    );

    if (result.success && result.order) {
      setCompletedOrder(result.order);
      setCheckoutStep(4);
    } else {
      alert(result.error || "Erro ao processar compra. Verifique a disponibilidade.");
    }
  };

  const handleAddReviewSubmit = (e: React.FormEvent, eventId: string) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    addReview(eventId, reviewRating, reviewComment);
    setReviewComment("");
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 5000);
  };

  const getEventRatingAvg = (eventId: string) => {
    const evReviews = getEventReviews(eventId);
    if (evReviews.length === 0) return 4.8; // High standard base mock rating
    const sum = evReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / evReviews.length).toFixed(1);
  };

  // Helper mock generation for Multicaixa references
  const generatedReferenceData = useMemo(() => {
    return {
      entity: "11223",
      reference: `${Math.floor(100 + Math.random() * 899)} ${Math.floor(100 + Math.random() * 899)} ${Math.floor(100 + Math.random() * 899)}`,
      expiry: "Nas próximas 24 horas"
    };
  }, [checkoutStep]);

  // Reset filter helpers
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todas");
    setSelectedCity("Todas");
    setSelectedType("Todos");
    setSelectedPriceType("Todos");
    setSelectedDateFilter("Qualquer");
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col" id="website-public-container">
      
      {/* 1. PUBLIC LANDING PAGE (HOME) */}
      {currentView === "home" && (
        <main className="flex-grow">
          {/* Hero Premium Banner Slideshow with Search Bar */}
          <section className="relative text-white overflow-hidden" id="home-hero-slider">
            {(() => {
              const activeSlides = (cmsConfig?.slides || [])
                .filter(s => s.active)
                .sort((a, b) => a.order - b.order);

              if (activeSlides.length === 0) return null;
              const currentSlide = activeSlides[activeSlideIdx % activeSlides.length];

              return (
                <div className="relative bg-gradient-to-r from-indigo-950 via-[#0b0c10] to-slate-950 py-24 sm:py-32 min-h-[520px] flex items-center">
                  <div className="absolute inset-0 opacity-25">
                    <img 
                      src={currentSlide.image} 
                      className="w-full h-full object-cover transition-all duration-1000 transform scale-105" 
                      alt={currentSlide.title} 
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/80 to-transparent"></div>
                  
                  {/* Slider Chevrons */}
                  {activeSlides.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveSlideIdx(prev => (prev - 1 + activeSlides.length) % activeSlides.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white hover:text-amber-400 transition-all z-20 cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setActiveSlideIdx(prev => (prev + 1) % activeSlides.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white hover:text-amber-400 transition-all z-20 cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10 w-full">
                    {currentSlide.subtitle && (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full backdrop-blur-sm text-xs font-semibold tracking-wide text-amber-400">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>{currentSlide.subtitle}</span>
                      </div>
                    )}
                    <h1 className="text-4xl sm:text-6xl font-sans font-bold tracking-tight max-w-4xl mx-auto text-white leading-tight animate-fade-in">
                      {currentSlide.title}
                    </h1>
                    {currentSlide.description && (
                      <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
                        {currentSlide.description}
                      </p>
                    )}

                    <div className="flex justify-center gap-3 pt-2">
                      <button 
                        onClick={() => onNavigate(currentSlide.buttonLink || "events")}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-[#0f1115] font-bold rounded-xl shadow-lg shadow-amber-500/10 transition-colors flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <span>{currentSlide.buttonText || "Explorar"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Slides Indicators */}
                    {activeSlides.length > 1 && (
                      <div className="flex justify-center gap-2 pt-6">
                        {activeSlides.map((_, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => setActiveSlideIdx(sIdx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                              activeSlideIdx === sIdx ? "bg-amber-500 w-6" : "bg-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Dynamic Search bar widget overlaid at base */}
            <div className="relative max-w-3xl mx-auto px-4 -mt-16 z-20">
              <div className="bg-white p-2.5 sm:p-3.5 rounded-2xl shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-2">
                <div className="flex-grow flex items-center gap-2.5 px-3">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar espetáculos, shows, conferências..."
                    className="w-full bg-transparent border-none text-gray-800 placeholder-gray-400 focus:outline-none font-semibold text-sm sm:text-base"
                  />
                </div>
                <div className="h-px md:h-8 md:w-px bg-gray-200 my-1 md:my-0"></div>
                <div className="md:w-52 flex items-center gap-2 px-3">
                  <MapPin className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-transparent border-none text-gray-700 font-semibold text-sm focus:outline-none"
                  >
                    <option value="Todas">Toda Angola</option>
                    {cities.filter(c => c !== "Todas").map((city, idx) => (
                      <option key={idx} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => onNavigate("events", { search: searchQuery, category: selectedCategory })}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-sm px-7 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Procurar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Quick Categories Bar (Dynamic CMS Driven) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
            <div className="bg-[#0c0d0e] rounded-2xl shadow-xl border border-white/10 p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(cmsConfig?.categories || [])
                .filter(c => c.active)
                .sort((a, b) => a.order - b.order)
                .map((cat, idx) => {
                  const getIcon = () => {
                    switch (cat.icon) {
                      case "Music": return <Music className="w-5 h-5 text-amber-500" />;
                      case "Sparkles": return <Sparkles className="w-5 h-5 text-amber-500" />;
                      case "Theater": return <Theater className="w-5 h-5 text-amber-500" />;
                      case "Presentation": return <Presentation className="w-5 h-5 text-amber-500" />;
                      case "Trophy": return <Trophy className="w-5 h-5 text-amber-500" />;
                      case "Laptop": return <Laptop className="w-5 h-5 text-amber-500" />;
                      default: return <Tag className="w-5 h-5 text-amber-500" />;
                    }
                  };
                  return (
                    <button
                      key={cat.id || idx}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        onNavigate("events", { category: cat.name });
                      }}
                      className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-amber-500/5 border border-transparent hover:border-amber-500/20 transition-all text-left group cursor-pointer"
                    >
                      <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all flex items-center justify-center">
                        {getIcon()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-400 leading-tight truncate">{cat.name}</h4>
                      </div>
                    </button>
                  );
                })}
            </div>
          </section>

          {/* Featured Events (Slider/Grid representation) */}
          {featuredEvents.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-wider mb-1">
                    <Award className="w-4 h-4" />
                    <span>Destaques Premium</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-gray-900 tracking-tight">
                    Eventos em Grande Destaque
                  </h2>
                </div>
                <button
                  onClick={() => onNavigate("events")}
                  className="group flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <span>Ver todos</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredEvents.map((evt) => (
                  <div 
                    key={evt.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-150 overflow-hidden flex flex-col sm:flex-row group hover:shadow-xl transition-all duration-300"
                  >
                    <div className="sm:w-1/2 relative h-48 sm:h-auto overflow-hidden">
                      <img 
                        src={evt.image} 
                        alt={evt.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3 bg-indigo-600 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg">
                        {evt.category}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-gray-950/80 backdrop-blur-md text-white font-mono text-xs px-2 py-1 rounded">
                        {evt.type}
                      </div>
                    </div>
                    <div className="sm:w-1/2 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Organizado por {evt.organizerName}</span>
                        </span>
                        <h3 
                          onClick={() => handleViewEventDetail(evt)}
                          className="font-sans font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
                        >
                          {evt.title}
                        </h3>
                        <p className="text-gray-500 text-xs line-clamp-2">
                          {evt.summary}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{new Date(evt.date).toLocaleDateString("pt-AO", { weekday: "short", day: "numeric", month: "long" })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="truncate">{evt.city} - {evt.location}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-indigo-650 font-extrabold text-sm sm:text-base">
                            Desde {formatCurrency(Math.min(...evt.ticketTypes.map(t => t.price)))}
                          </span>
                          <button
                            onClick={() => handleViewEventDetail(evt)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>Comprar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Popular and Upcoming Events with Slider */}
          <section className="bg-gray-100/50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-gray-900 tracking-tight">
                    Eventos Populares
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Os espetáculos e conferências com maior volume de bilhetes vendidos nas últimas horas.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Slider controls if there are popular events */}
                  {popularEvents.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => scrollPopular("left")}
                        className="p-2.5 bg-white rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 transition-colors shadow-sm focus:outline-none cursor-pointer flex items-center justify-center"
                        aria-label="Anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => scrollPopular("right")}
                        className="p-2.5 bg-white rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 transition-colors shadow-sm focus:outline-none cursor-pointer flex items-center justify-center"
                        aria-label="Seguinte"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => onNavigate("events")}
                    className="group flex items-center gap-1.5 text-xs font-bold text-indigo-650 hover:text-indigo-750 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Ver Todos</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Slider container: Scroll with snap on different screens */}
              <div 
                ref={popularSliderRef}
                className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {popularEvents.map((evt) => (
                  <div 
                    key={evt.id}
                    className="w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] xl:w-[calc(25%-18px)] shrink-0 snap-start snap-always bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={evt.image} 
                        alt={evt.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-gray-100 uppercase">
                        {evt.category}
                      </div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-650">
                          <span>★ {getEventRatingAvg(evt.id)}</span>
                          <span>•</span>
                          <span>{evt.organizerName}</span>
                        </div>
                        <h3 
                          onClick={() => handleViewEventDetail(evt)}
                          className="font-sans font-bold text-base text-gray-900 hover:text-indigo-650 transition-colors cursor-pointer line-clamp-2 leading-snug"
                        >
                          {evt.title}
                        </h3>
                        <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                          {evt.summary}
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(evt.date).toLocaleDateString("pt-AO", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{evt.city} - {evt.location}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2.5">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase">Ingresso</span>
                            <span className="text-indigo-650 font-extrabold text-sm sm:text-base">
                              {formatCurrency(Math.min(...evt.ticketTypes.map(t => t.price)))}
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewEventDetail(evt)}
                            className="bg-gray-900 hover:bg-indigo-600 text-white hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                          >
                            Comprar Bilhete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Centralized 'Ver Mais' option as requested */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => onNavigate("events")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                >
                  <span>Ver Mais Eventos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Section: Como Funciona a Plataforma */}
          <section className="bg-white py-16 border-t border-gray-150">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-650 uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Guia de Utilização</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-sans font-black text-gray-900 tracking-tight">
                  Como Funciona a Plataforma?
                </h2>
                <p className="text-gray-500 text-sm max-w-xl mx-auto">
                  Tanto para quem quer viver experiências incríveis quanto para quem quer produzir grandes espetáculos, a TicketAngola torna tudo simples, seguro e rápido.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* For Buyers Card */}
                <div className="bg-gray-50/50 rounded-3xl border border-gray-150 p-8 space-y-8 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-650">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Quero Participar</span>
                      <h3 className="text-xl font-extrabold text-gray-900">Como Comprar Bilhetes</h3>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-600/20">
                        1
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-gray-900">Escolha o seu Evento</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Navegue pelo nosso catálogo oficial, explore as categorias de shows, teatro, futebol ou palestras, e selecione o evento ideal para si.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-600/20">
                        2
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-gray-900">Pague com Segurança</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Selecione o tipo de ingresso e faça o pagamento rápido via Referência Multicaixa ou MCX Express. Sem filas e 100% digital.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-600/20">
                        3
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-gray-900">Receba no seu Email & Portal</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Após a validação automática, o seu bilhete com QR Code é enviado por email e guardado de forma permanente na sua Área de Cliente.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      onClick={() => onNavigate("events")}
                      className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Explorar Eventos</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* For Organizers Card */}
                <div className="bg-gray-50/50 rounded-3xl border border-gray-150 p-8 space-y-8 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-650">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Quero Produzir</span>
                      <h3 className="text-xl font-extrabold text-gray-900">Como Vender Ingressos</h3>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-emerald-600/20">
                        1
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-gray-900">Registe o seu Perfil Oficial</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Crie a sua conta na TicketAngola e escolha o perfil de Organizador. É totalmente gratuito e ativo em apenas alguns segundos.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-emerald-600/20">
                        2
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-gray-900">Crie & Configure o seu Evento</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Adicione fotografias, detalhes de localização e crie múltiplas modalidades de bilhetes (Gerais, VIPs, Lotes Promocionais ou Gratuitos).
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-emerald-600/20">
                        3
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-gray-900">Controle e Valide Ingressos</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Acompanhe gráficos de vendas em tempo real no seu painel privado. No dia do evento, use a nossa ferramenta integrada de leitura de QR Code para validar as entradas.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        if (currentUser) {
                          onNavigate("organizer-dashboard");
                        } else {
                          onNavigate("login-auth");
                        }
                      }}
                      className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Publicar Evento</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive CMS News Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-gray-900 tracking-tight">
                Notícias & Blog da Bilheteira
              </h2>
              <p className="text-gray-500 text-sm">
                Acompanhe o blog para novidades sobre concertos, inclusão financeira e guia de organizadores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((article) => (
                <div 
                  key={article.id}
                  onClick={() => {
                    setActiveBlogPost(article);
                    onNavigate("blog");
                  }}
                  className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden group cursor-pointer hover:border-indigo-150 transition-all"
                >
                  <div className="h-44 overflow-hidden relative">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-gray-900/85 backdrop-blur-sm text-white font-semibold text-[9px] uppercase px-2 py-1 rounded">
                      {article.category}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] text-gray-400 font-mono font-medium">{article.date} • Por {article.author}</span>
                    <h3 className="font-sans font-bold text-sm sm:text-base text-gray-950 group-hover:text-indigo-650 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-indigo-650 font-bold group-hover:underline pt-2">
                      <span>Ler artigo completo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trust and Safety Badge Banner */}
          <section className="bg-indigo-950 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3.5 bg-white/10 rounded-2xl text-indigo-300">
                  <Shield className="w-7 h-7" />
                </div>
                <h4 className="font-sans font-bold text-base">Compra 100% Segura</h4>
                <p className="text-gray-400 text-xs max-w-xs">Tecnologia avançada de encriptação de pagamentos nacionais e internacionais.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3.5 bg-white/10 rounded-2xl text-indigo-300">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="font-sans font-bold text-base">Validação Digital</h4>
                <p className="text-gray-400 text-xs max-w-xs">QR Codes de alta definição gerados em tempo real contra falsificação de ingressos.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3.5 bg-white/10 rounded-2xl text-indigo-300">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <h4 className="font-sans font-bold text-base">Suporte Dedicado</h4>
                <p className="text-gray-400 text-xs max-w-xs">Equipa técnica pronta para ajudar clientes e organizadores angolanos a qualquer momento.</p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* 2. ALL EVENTS LISTING VIEW */}
      {currentView === "events" && (
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10" id="events-listing">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 font-medium">
            <span onClick={() => onNavigate("home")} className="hover:text-indigo-600 cursor-pointer">Início</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-semibold">Procurar Eventos</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left sidebar filters */}
            <aside className="w-full lg:w-72 bg-white rounded-2xl border border-gray-150 p-6 shrink-0 h-fit space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="font-sans font-bold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-4.5 h-4.5 text-indigo-650" />
                  <span>Filtros Pesquisa</span>
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Limpar tudo
                </button>
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoria</label>
                <div className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-1">
                  {categories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors w-full ${
                        selectedCategory === cat 
                          ? "bg-indigo-50 text-indigo-650 font-bold" 
                          : "text-gray-650 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cidade</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {cities.map((city, idx) => (
                    <option key={idx} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo de Evento</label>
                <div className="grid grid-cols-3 gap-1">
                  {["Todos", "Online", "Presencial"].map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedType(t)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg border text-center ${
                        selectedType === t 
                          ? "bg-indigo-600 text-white border-indigo-500" 
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preço</label>
                <div className="grid grid-cols-3 gap-1">
                  {["Todos", "Gratuito", "Pago"].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPriceType(p)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg border text-center ${
                        selectedPriceType === p 
                          ? "bg-indigo-600 text-white border-indigo-500" 
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Período Temporal</label>
                <select
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Qualquer">Qualquer data</option>
                  <option value="Hoje">Hoje</option>
                  <option value="Amanhã">Amanhã</option>
                  <option value="Esta Semana">Esta semana</option>
                  <option value="Este Mês">Este mês</option>
                </select>
              </div>
            </aside>

            {/* Central Listing results Grid */}
            <section className="flex-grow space-y-6">
              {/* Header result count and search input */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">Lista de Ingressos</h2>
                  <p className="text-xs text-gray-400">{filteredEvents.length} eventos encontrados com as regras de filtro</p>
                </div>
                <div className="w-full sm:w-72 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Refinar por nome do espetáculo..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 font-semibold text-gray-800 placeholder-gray-450"
                  />
                </div>
              </div>

              {/* No results placeholder */}
              {filteredEvents.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-gray-150 space-y-4">
                  <div className="w-16 h-16 bg-gray-55 text-gray-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                    🔍
                  </div>
                  <h3 className="font-sans font-bold text-base text-gray-900">Nenhum evento encontrado</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">Não encontramos nenhum concerto ou atividade que corresponda aos seus filtros ativos. Tente limpar os filtros para ver tudo.</p>
                  <button
                    onClick={handleResetFilters}
                    className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Limpar Filtros e Ver Tudo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEvents.map((evt) => (
                    <div 
                      key={evt.id}
                      className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
                    >
                      <div className="h-44 overflow-hidden relative">
                        <img 
                          src={evt.image} 
                          alt={evt.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 bg-indigo-650 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded">
                          {evt.category}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-gray-950/80 text-white font-semibold text-[9px] px-2 py-0.5 rounded">
                          {evt.type}
                        </div>
                      </div>
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                        <div>
                          <p className="text-[10px] text-gray-400 font-semibold">{evt.organizerName}</p>
                          <h3 
                            onClick={() => handleViewEventDetail(evt)}
                            className="font-sans font-bold text-sm sm:text-base text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1 leading-snug"
                          >
                            {evt.title}
                          </h3>
                          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                            {evt.summary}
                          </p>
                        </div>
                        <div className="space-y-2 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{new Date(evt.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{evt.city} - {evt.location}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-indigo-650 font-extrabold text-xs sm:text-sm">
                              Desde {formatCurrency(Math.min(...evt.ticketTypes.map(t => t.price)))}
                            </span>
                            <button
                              onClick={() => handleViewEventDetail(evt)}
                              className="bg-gray-900 hover:bg-indigo-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors"
                            >
                              Adquirir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {/* 3. EVENT DETAIL VIEW */}
      {currentView === "event-detail" && (
        (() => {
          const evt = approvedEvents.find(e => e.id === viewParams?.eventId) || approvedEvents[0];
          if (!evt) return <div className="p-12 text-center text-gray-500">Espetáculo não encontrado.</div>;
          
          const ratingAvg = getEventRatingAvg(evt.id);
          const eventReviews = getEventReviews(evt.id);

          return (
            <main className="flex-grow bg-white" id="event-details-sheet">
              {/* Event Hero Cover Banner */}
              <section className="relative h-96 bg-gray-950 overflow-hidden">
                <img 
                  src={evt.image} 
                  alt={evt.title} 
                  className="w-full h-full object-cover opacity-60 blur-xs scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                <div className="absolute bottom-0 inset-x-0 py-8 text-white">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
                    <div className="flex flex-wrap gap-2.5">
                      <span className="bg-indigo-600 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-md">
                        {evt.category}
                      </span>
                      <span className="bg-emerald-600 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-md flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Verificado</span>
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-sans font-bold tracking-tight">{evt.title}</h1>
                    <p className="text-gray-300 text-sm max-w-3xl leading-relaxed">{evt.summary}</p>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigate("events")}
                  className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/10 flex items-center gap-1 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
              </section>

              {/* Main Sheet Grid layout */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side detail specifications */}
                <div className="lg:col-span-2 space-y-10">
                  {/* General details Card list */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Data do Evento</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(evt.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Horário Abertura</p>
                        <p className="text-sm font-bold text-gray-900">{evt.time} Horas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cidade / Recinto</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{evt.city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Complete Description */}
                  <div className="space-y-3">
                    <h3 className="font-sans font-extrabold text-lg text-gray-900">Descrição do Espetáculo</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{evt.description}</p>
                  </div>

                  {/* Event Agenda timeline */}
                  {evt.agenda && evt.agenda.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-sans font-extrabold text-lg text-gray-900">Programa / Alinhamento</h3>
                      <div className="relative border-l border-gray-200 ml-3.5 space-y-6">
                        {evt.agenda.map((item, idx) => (
                          <div key={idx} className="relative pl-7">
                            <div className="absolute left-[-6px] top-1.5 w-3 h-3 bg-indigo-600 rounded-full border border-white"></div>
                            <span className="font-mono text-xs text-indigo-650 font-bold">{item.time}</span>
                            <h4 className="font-sans font-bold text-sm text-gray-900">{item.title}</h4>
                            {item.desc && <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Promo representation */}
                  {evt.videoUrl && (
                    <div className="space-y-3">
                      <h3 className="font-sans font-extrabold text-lg text-gray-900">Vídeo Promocional</h3>
                      <div className="aspect-video w-full rounded-2xl bg-gray-950 overflow-hidden relative border border-gray-100 flex items-center justify-center">
                        <img 
                          src={evt.image} 
                          alt="Video thumbnail placeholder" 
                          className="w-full h-full object-cover opacity-30"
                        />
                        <button className="absolute bg-white/95 text-indigo-650 p-4 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center">
                          <Play className="w-6 h-6 fill-indigo-650 ml-0.5" />
                        </button>
                        <span className="absolute bottom-3 right-3 text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded">
                          Trailer Oficial
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Image Gallery */}
                  {evt.gallery && evt.gallery.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-sans font-extrabold text-lg text-gray-900">Galeria de Fotos</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {evt.gallery.map((img, idx) => (
                          <div key={idx} className="h-28 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                            <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt={`Recinto ${idx}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regulations and Guidelines */}
                  <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2.5">
                    <h4 className="text-sm font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="w-4.5 h-4.5 text-indigo-650" />
                      <span>Regulamento & Requisitos</span>
                    </h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {evt.rules || "Apresente o seu bilhete em formato digital (no telemóvel) ou impresso à entrada para validação rápida por QR Code. Aconselha-se a chegada com pelo menos 1 hora de antecedência."}
                    </p>
                  </div>

                  {/* Google Maps Styled Representation */}
                  <div className="space-y-3">
                    <h3 className="font-sans font-extrabold text-lg text-gray-900">Localização do Evento</h3>
                    <div className="bg-gray-100 rounded-2xl border border-gray-150 p-4 space-y-3">
                      <div className="flex items-start gap-2 text-xs">
                        <MapPin className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-900">{evt.location}</p>
                          <p className="text-gray-500">{evt.city}, Angola</p>
                        </div>
                      </div>
                      
                      {/* Styled Vector Map Simulator */}
                      <div className="h-44 bg-slate-250 rounded-xl relative overflow-hidden border border-gray-200/50 flex flex-col justify-between p-4">
                        <div className="absolute inset-0 bg-slate-200 flex flex-col justify-center items-center opacity-40">
                          {/* Simulated streets vectors */}
                          <div className="w-full h-1 bg-white/95 absolute top-12 left-0 transform rotate-12"></div>
                          <div className="w-full h-1 bg-white/95 absolute top-24 left-0 transform -rotate-6"></div>
                          <div className="w-1 bg-white/95 absolute left-1/3 top-0 bottom-0"></div>
                        </div>
                        
                        <div className="z-10 bg-white/95 backdrop-blur-sm shadow border border-gray-150 rounded-lg p-2.5 w-60 text-[10px] space-y-1 mt-auto">
                          <p className="font-bold text-indigo-950 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                            <span>{evt.city} Recinto Oficial</span>
                          </p>
                          <p className="text-gray-500 truncate">{evt.location}</p>
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-650 text-white p-2.5 rounded-full shadow-lg border-2 border-white">
                          <MapPin className="w-4 h-4 fill-white animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div className="space-y-6 pt-4 border-t border-gray-100">
                    <h3 className="font-sans font-extrabold text-lg text-gray-900">Avaliações do Espetáculo</h3>
                    
                    {/* Add Review */}
                    <form onSubmit={(e) => handleAddReviewSubmit(e, evt.id)} className="bg-gray-50 p-5 rounded-2xl border border-gray-150 space-y-4">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Deixe a sua Opinião</h4>
                      {reviewSubmitted ? (
                        <div className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Avaliação registada com sucesso! Obrigado pelo seu contributo.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium">Nota:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className={`text-lg transition-transform hover:scale-110 ${star <= reviewRating ? "text-amber-450" : "text-gray-350"}`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Escreva um comentário honesto sobre o cartaz do espetáculo, os preços ou o local..."
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-gray-800 h-20"
                            required
                          />
                          <button
                            type="submit"
                            className="bg-gray-900 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                          >
                            Submeter Avaliação
                          </button>
                        </div>
                      )}
                    </form>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {eventReviews.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">Não há avaliações escritas ainda para este evento. Seja o primeiro a opinar!</p>
                      ) : (
                        eventReviews.map((rev) => (
                          <div key={rev.id} className="border-b border-gray-100 pb-4 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900">{rev.userName}</span>
                              <span className="text-gray-400 font-mono text-[10px]">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-amber-450 text-xs">
                              {Array.from({ length: rev.rating }).map((_, i) => "★")}
                            </div>
                            <p className="text-gray-650 leading-relaxed">{rev.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side booking card box */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm sticky top-24 space-y-6">
                    <div className="pb-4 border-b border-gray-100">
                      <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">Bilheteira Oficial</span>
                      <h3 className="font-sans font-extrabold text-lg text-gray-900 mt-0.5">Ingressos Disponíveis</h3>
                    </div>

                    {/* Ticket list selector */}
                    <div className="space-y-4">
                      {evt.ticketTypes.map((t) => {
                        const available = t.totalQuantity - t.soldQuantity;
                        const isSoldOut = available <= 0;

                        return (
                          <div 
                            key={t.id} 
                            className={`p-4 rounded-xl border transition-all ${
                              isSoldOut 
                                ? "bg-gray-50 border-gray-150 opacity-60" 
                                : "bg-white border-gray-150 hover:border-indigo-200"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-sans font-bold text-sm text-gray-900">{t.name}</span>
                                {t.description && <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{t.description}</p>}
                                <p className="text-[9px] text-gray-500 font-semibold mt-1">
                                  {isSoldOut ? (
                                    <span className="text-red-600 uppercase font-bold">Esgotado</span>
                                  ) : (
                                    <span>{available} bilhetes restantes</span>
                                  )}
                                </p>
                              </div>
                              <span className="text-sm font-extrabold text-indigo-650 font-mono">
                                {t.price === 0 ? "Grátis" : formatCurrency(t.price)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleStartCheckout(evt)}
                        className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4.5 h-4.5" />
                        <span>Adquirir Bilhetes</span>
                      </button>
                      <p className="text-[10px] text-center text-gray-500 font-medium">
                        Processado instantaneamente. Descarregue o PDF com QR Code na hora.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          );
        })()
      )}

      {/* 4. PURCHASE SYSTEM (CHECKOUT FLOW) */}
      {currentView === "checkout" && (
        <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10" id="checkout-process">
          <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm">
            {/* Checkout Header Progress timeline */}
            <div className="bg-indigo-950 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <Ticket className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Checkout Seguro</h2>
                  <p className="text-xs text-gray-300 truncate max-w-md">{checkoutEvent?.title}</p>
                </div>
              </div>
              
              {/* Stepper indicator */}
              <div className="flex items-center gap-2.5 text-xs font-semibold">
                {[
                  { step: 1, label: "Quantidade" },
                  { step: 2, label: "Participantes" },
                  { step: 3, label: "Pagamento" },
                  { step: 4, label: "Confirmação" }
                ].map((s) => (
                  <React.Fragment key={s.step}>
                    <div className={`flex items-center gap-1.5 ${checkoutStep === s.step ? "text-indigo-300" : checkoutStep > s.step ? "text-emerald-400" : "text-gray-500"}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                        checkoutStep === s.step 
                          ? "bg-indigo-300/10 border-indigo-300" 
                          : checkoutStep > s.step 
                            ? "bg-emerald-400 text-gray-950 border-emerald-400" 
                            : "border-gray-500"
                      }`}>
                        {s.step}
                      </span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </div>
                    {s.step < 4 && <div className="h-px w-4 bg-gray-700 hidden sm:block"></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step 1: Select ticket type and Quantity */}
            {checkoutStep === 1 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selecione o Tipo de Ingresso</label>
                  <div className="grid grid-cols-1 gap-3">
                    {checkoutEvent?.ticketTypes.map((type) => {
                      const available = type.totalQuantity - type.soldQuantity;
                      const isSoldOut = available <= 0;

                      return (
                        <div
                          key={type.id}
                          onClick={() => {
                            if (!isSoldOut) {
                              setCheckoutTicketType(type);
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSoldOut 
                              ? "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed" 
                              : checkoutTicketType?.id === type.id
                                ? "bg-indigo-50/50 border-indigo-650"
                                : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-sm text-gray-900">{type.name}</p>
                              {type.description && <p className="text-xs text-gray-400 mt-0.5">{type.description}</p>}
                              <p className="text-[10px] text-gray-500 mt-1">{available} lugares disponíveis</p>
                            </div>
                            <span className="text-base font-extrabold text-indigo-650 font-mono">
                              {type.price === 0 ? "Grátis" : formatCurrency(type.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quantidade de Bilhetes</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCheckoutQuantity(q => Math.max(1, q - 1))}
                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-lg w-8 text-center">{checkoutQuantity}</span>
                      <button
                        onClick={() => {
                          const limit = checkoutTicketType?.limitPerUser || 4;
                          setCheckoutQuantity(q => Math.min(limit, q + 1));
                        }}
                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-400 ml-2">Limite: {checkoutTicketType?.limitPerUser || 4} por utilizador</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 text-right space-y-1">
                    <p className="text-xs text-gray-400 font-semibold">Valor Subtotal</p>
                    <p className="text-xl font-black font-mono text-indigo-650">
                      {formatCurrency((checkoutTicketType?.price || 0) * checkoutQuantity)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handleViewEventDetail(checkoutEvent!)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700"
                  >
                    Cancelar Compra
                  </button>
                  <button
                    onClick={() => {
                      // Prepopulate attendee list size based on quantity
                      setAttendeeNames(Array.from({ length: checkoutQuantity }).map((_, i) => i === 0 ? buyerName : ""));
                      setCheckoutStep(2);
                    }}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Registar / Login info & fill Attendee names for ticket custom */}
            {checkoutStep === 2 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-sans font-bold text-sm text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
                    Dados do Comprador (Para Faturação)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500">Nome Completo</label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => {
                          setBuyerName(e.target.value);
                          // Sync first participant name by default
                          const updated = [...attendeeNames];
                          updated[0] = e.target.value;
                          setAttendeeNames(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500">Endereço de Email</label>
                      <input
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500">Contacto de Telefone</label>
                      <input
                        type="tel"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="+244"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-sans font-bold text-sm text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
                    Nome dos Participantes (Impressos nos Ingressos)
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: checkoutQuantity }).map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500">Participante {i + 1} {i === 0 && "(Comprador)"}</label>
                        <input
                          type="text"
                          value={attendeeNames[i] || ""}
                          onChange={(e) => {
                            const updated = [...attendeeNames];
                            updated[i] = e.target.value;
                            setAttendeeNames(updated);
                          }}
                          placeholder={`Nome Completo Participante ${i + 1}`}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 font-medium"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700"
                  >
                    Voltar atrás
                  </button>
                  <button
                    onClick={() => {
                      // Basic validation
                      if (!buyerName.trim() || !buyerEmail.trim() || attendeeNames.some(name => !name.trim())) {
                        alert("Preencha todos os campos obrigatórios.");
                        return;
                      }
                      setCheckoutStep(3);
                    }}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>Seguir para Pagamento</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment details, Coupon Discount applied, dynamic fields based on Angola/Int systems */}
            {checkoutStep === 3 && (
              (() => {
                const subtotal = (checkoutTicketType?.price || 0) * checkoutQuantity;
                const total = Math.max(0, subtotal - appliedDiscount);

                // Load all standard + CMS manual payment methods
                const standardMethods = [
                  { id: PaymentMethod.MC_EXPRESS, label: "Multicaixa Express", desc: "Pagamento seguro via aplicação móvel Express" },
                  { id: PaymentMethod.REF_MC, label: "Referência Multicaixa", desc: "Pagamento no ATM / Multicaixa ou Internet Banking" },
                  { id: PaymentMethod.UNITEL_MONEY, label: "Unitel Money / Afrimoney", desc: "Carteiras móveis de telemóvel instantâneas" },
                  { id: PaymentMethod.VISA_MASTERCARD, label: "Cartão Internacional (Visa/Mastercard)", desc: "Processamento via Stripe seguro internacional" }
                ];

                const cmsManualMethods = (cmsConfig?.paymentMethods || [])
                  .filter(pm => pm.active)
                  .map(pm => ({
                    id: pm.id,
                    label: pm.name,
                    desc: pm.instructions || `Pagamento manual no banco ${pm.bankName}`
                  }));

                const allMethods = [...standardMethods, ...cmsManualMethods];
                const selectedManualConfig = (cmsConfig?.paymentMethods || []).find(pm => pm.id === paymentMethod);
                const isSelectedManual = paymentMethod === PaymentMethod.TRANSF_BANCARIA || 
                                         String(paymentMethod).startsWith("pm-") || 
                                         (selectedManualConfig && selectedManualConfig.type === "manual");

                return (
                  <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Payment options selection */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Escolha o Método de Pagamento</label>
                        
                        {/* payment choices accordion */}
                        <div className="grid grid-cols-1 gap-2.5">
                          {allMethods.map((method) => (
                            <div
                              key={method.id}
                              onClick={() => {
                                setPaymentMethod(method.id);
                                // Reset receipt if we switch method
                                if (!String(method.id).startsWith("pm-") && method.id !== PaymentMethod.TRANSF_BANCARIA) {
                                  setPaymentReceiptUrl("");
                                }
                              }}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                                paymentMethod === method.id 
                                  ? "bg-indigo-50/50 border-indigo-650" 
                                  : "bg-white border-gray-150 hover:border-gray-250"
                              }`}
                            >
                              <div className="p-1 rounded-full border border-gray-300 bg-white shrink-0 mt-0.5 flex items-center justify-center">
                                <div className={`w-2.5 h-2.5 rounded-full ${paymentMethod === method.id ? "bg-indigo-600" : "bg-transparent"}`}></div>
                              </div>
                              <div>
                                <p className="font-bold text-xs text-gray-900">{method.label}</p>
                                <p className="text-[10px] text-gray-400 leading-snug">{method.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Context Specific Inputs */}
                      <div className="p-5 bg-gray-50 border border-gray-150 rounded-2xl">
                        {paymentMethod === PaymentMethod.MC_EXPRESS && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-indigo-650" />
                              <span>Multicaixa Express</span>
                            </h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              Introduza o número de telemóvel associado ao seu cartão Multicaixa. Irá receber uma notificação de pagamento pendente na sua aplicação Express para autorizar a compra.
                            </p>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-gray-650">Número de Telemóvel Express</label>
                              <input
                                type="tel"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                placeholder="923 456 789"
                                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 font-medium"
                                required
                              />
                            </div>
                          </div>
                        )}

                        {paymentMethod === PaymentMethod.REF_MC && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-indigo-650" />
                              <span>Referência Multicaixa gerada na hora</span>
                            </h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              Ao finalizar, o sistema gerará uma Entidade, Referência e Valor que poderá pagar em qualquer caixa ATM em Angola ou no seu aplicativo bancário doméstico (BAI Directo, SOL, etc.).
                            </p>
                            <div className="bg-white p-3 rounded-xl border border-gray-150 space-y-1 font-mono text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Entidade:</span>
                                <span className="font-bold text-gray-900">{generatedReferenceData.entity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Referência:</span>
                                <span className="font-bold text-indigo-650">{generatedReferenceData.reference}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Validade:</span>
                                <span className="font-bold text-gray-900">{generatedReferenceData.expiry}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod === PaymentMethod.UNITEL_MONEY && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-indigo-650" />
                              <span>Dinheiro Móvel (Unitel Money / Afrimoney)</span>
                            </h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              Pague diretamente com o saldo digital do seu número Unitel ou Africell. Enviaremos um pedido USSD interativo ao seu terminal para digitação do código de segurança PIN.
                            </p>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-gray-650">Telemóvel da Carteira Digital</label>
                              <input
                                type="tel"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                placeholder="912 345 678"
                                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 font-medium"
                                required
                              />
                            </div>
                          </div>
                        )}

                        {paymentMethod === PaymentMethod.VISA_MASTERCARD && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-indigo-650" />
                              <span>Cartão de Crédito Internacional</span>
                            </h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              Aceitamos Visa, Mastercard, American Express e Discover. A conversão de câmbio é calculada na taxa em vigor no dia pelo emissor do cartão.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-3 space-y-1.5">
                                <label className="text-[10px] font-semibold text-gray-500">Número do Cartão</label>
                                <input
                                  type="text"
                                  placeholder="4111 2222 3333 4444"
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-gray-500">Validade</label>
                                <input
                                  type="text"
                                  placeholder="MM / AA"
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-gray-500">CVC</label>
                                <input
                                  type="text"
                                  placeholder="123"
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CMS Manual Payment Bank details & receipt upload UI */}
                        {isSelectedManual && selectedManualConfig && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-[#2B7A5D] flex items-center gap-1.5 pb-2 border-b border-gray-250">
                              <FileText className="w-4 h-4" />
                              <span>Dados de Pagamento: {selectedManualConfig.name}</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-200 text-xs">
                              <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Banco</p>
                                <p className="font-extrabold text-gray-900">{selectedManualConfig.bankName}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Titular da Conta</p>
                                <p className="font-bold text-gray-900">{selectedManualConfig.accountHolder}</p>
                              </div>
                              {selectedManualConfig.accountNumber && (
                                <div className="space-y-1">
                                  <p className="text-[10px] text-gray-400 font-bold uppercase">Nº de Conta</p>
                                  <p className="font-mono text-gray-800 font-bold">{selectedManualConfig.accountNumber}</p>
                                </div>
                              )}
                              {selectedManualConfig.iban && (
                                <div className="space-y-1 sm:col-span-2">
                                  <p className="text-[10px] text-gray-400 font-bold uppercase">IBAN</p>
                                  <p className="font-mono text-[#2B7A5D] font-extrabold break-all">{selectedManualConfig.iban}</p>
                                </div>
                              )}
                            </div>

                            {selectedManualConfig.instructions && (
                              <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[11px] text-amber-800 leading-relaxed font-medium">
                                <strong>Instruções:</strong> {selectedManualConfig.instructions}
                              </div>
                            )}

                            {/* UPLOAD RECEIPT DRAG-AND-DROP WIDGET */}
                            <div className="space-y-2 pt-2 border-t border-gray-200">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Comprovativo de Transferência / Depósito bancário *</label>
                              <div className="relative border-2 border-dashed border-gray-200 hover:border-[#2B7A5D] bg-white rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer group">
                                <input 
                                  type="file"
                                  accept="image/*,application/pdf"
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setUploadingReceipt(true);
                                      // Simulated upload
                                      setTimeout(() => {
                                        setUploadingReceipt(false);
                                        setPaymentReceiptUrl("https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600");
                                      }, 1200);
                                    }
                                  }}
                                />
                                {uploadingReceipt ? (
                                  <div className="space-y-2 text-center">
                                    <div className="w-8 h-8 border-4 border-[#2B7A5D] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-xs font-semibold text-gray-500">A processar comprovativo...</p>
                                  </div>
                                ) : paymentReceiptUrl ? (
                                  <div className="space-y-3 text-center">
                                    <div className="inline-flex p-2 bg-emerald-50 rounded-full text-emerald-600 border border-emerald-100">
                                      <Check className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-bold text-emerald-600">Comprovativo anexado com sucesso!</p>
                                    <div className="h-20 w-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 mx-auto relative shadow-inner">
                                      <img src={paymentReceiptUrl} className="w-full h-full object-cover" alt="Comprovativo" />
                                    </div>
                                    <p className="text-[10px] text-gray-400 hover:text-red-500 font-bold underline" onClick={(e) => { e.stopPropagation(); setPaymentReceiptUrl(""); }}>Remover arquivo</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2 text-center">
                                    <div className="p-3 bg-gray-50 rounded-full border border-gray-100 text-gray-400 group-hover:text-[#2B7A5D] transition-colors mx-auto inline-flex">
                                      <Upload className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-700">Carregar imagem ou arquivo PDF do comprovativo</p>
                                    <p className="text-[10px] text-gray-400 font-semibold">Tamanho máximo: 5MB</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Bill details summary box, Coupon activation */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 space-y-5">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-200">
                          Resumo da Compra
                        </h4>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">{checkoutQuantity}x {checkoutTicketType?.name}</span>
                            <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
                          </div>
                          
                          {appliedDiscount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-bold">
                              <span>Desconto Cupão:</span>
                              <span>-{formatCurrency(appliedDiscount)}</span>
                            </div>
                          )}

                          <div className="h-px bg-gray-200 my-2"></div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-900">Total a Pagar:</span>
                            <span className="font-black font-mono text-indigo-650">{formatCurrency(total)}</span>
                          </div>
                        </div>

                        {/* Coupon Activation Section */}
                        <div className="space-y-2 pt-2 border-t border-gray-200">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Possui um Cupão?</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="CÓDIGO"
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-gray-800 font-bold"
                            />
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              className="bg-gray-900 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
                            >
                              Aplicar
                            </button>
                          </div>
                          {appliedCouponError && (
                            <p className="text-[10px] text-red-500 font-semibold">{appliedCouponError}</p>
                          )}
                          {appliedDiscount > 0 && (
                            <p className="text-[10px] text-emerald-600 font-bold">Desconto aplicado com sucesso!</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleCheckoutSubmit}
                        className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-sm py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4.5 h-4.5" />
                        <span>Confirmar e Finalizar</span>
                      </button>
                      
                      <button
                        onClick={() => setCheckoutStep(2)}
                        className="w-full text-center text-xs font-bold text-gray-500 hover:text-gray-700 mt-2"
                      >
                        Voltar aos Participantes
                      </button>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Step 4: Purchase Completed screen */}
            {checkoutStep === 4 && completedOrder && (
              <div className="p-6 sm:p-10 text-center space-y-8" id="purchase-completed">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-sans font-extrabold text-2xl text-gray-900">Compra Efetuada com Sucesso!</h3>
                  <p className="text-gray-500 text-sm max-w-lg mx-auto">
                    O seu pagamento foi processado eletronicamente. Geramos {completedOrder.quantity} bilhetes oficiais em nome dos respetivos participantes.
                  </p>
                  <p className="text-xs text-indigo-600 font-bold">Transação ID: {completedOrder.orderNumber}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl border border-gray-150 p-6 max-w-xl mx-auto space-y-6">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-200">
                    Seus Bilhetes Digitais
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedOrder.tickets.map((t) => (
                      <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center space-y-3 shadow-inner">
                        <QRCodeGenerator value={t.ticketCode} size={110} />
                        <div className="text-center text-xs">
                          <p className="font-bold text-gray-900">{t.participantName}</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{completedOrder.ticketTypeName}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center pt-3 border-t border-gray-200">
                    <button
                      onClick={() => alert("Simulação PDF: O descarregamento do ficheiro PDF com os bilhetes oficiais foi iniciado no seu browser.")}
                      className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descarregar PDF</span>
                    </button>
                    <button
                      onClick={() => alert(`Simulação Faturação: Fatura-recibo emitida no sistema de faturação angolano e enviada para o email ${completedOrder.userEmail}.`)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Ver Fatura Eletrónica</span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-center gap-4">
                  <button
                    onClick={() => onNavigate("client-dashboard")}
                    className="text-xs font-bold text-indigo-650 hover:underline"
                  >
                    Ir para Meus Bilhetes
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => onNavigate("home")}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700"
                  >
                    Voltar à Página Inicial
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* 5. INTERACTIVE BLOG LIST VIEW */}
      {currentView === "blog" && (
        <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10" id="blog-board">
          {activeBlogPost ? (
            // Blog Article Detail screen
            <article className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm p-6 sm:p-10 space-y-6">
              <button 
                onClick={() => setActiveBlogPost(null)}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-650 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar a todos os artigos</span>
              </button>

              <div className="h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-100">
                <img src={activeBlogPost.image} className="w-full h-full object-cover" alt={activeBlogPost.title} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                  <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded font-bold uppercase">{activeBlogPost.category}</span>
                  <span>•</span>
                  <span>{activeBlogPost.date}</span>
                  <span>•</span>
                  <span>Escrito por {activeBlogPost.author}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-sans font-bold text-gray-900 leading-tight">
                  {activeBlogPost.title}
                </h1>
              </div>

              <div className="prose prose-indigo max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-wrap pt-4 border-t border-gray-100">
                {activeBlogPost.content}
              </div>
            </article>
          ) : (
            // Blog Article List screen
            <div className="space-y-10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-gray-900 tracking-tight">Blog & Novidades da Plataforma</h1>
                <p className="text-gray-500 text-sm mt-1">Descubra artigos de especialistas sobre a indústria de espetáculos e guias práticos.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogs.map((article) => (
                  <div 
                    key={article.id}
                    onClick={() => setActiveBlogPost(article)}
                    className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden group cursor-pointer hover:border-indigo-150 transition-all"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                        <span className="text-indigo-600 font-bold uppercase">{article.category}</span>
                        <span>•</span>
                        <span>{article.date}</span>
                      </div>
                      <h3 className="font-sans font-bold text-base text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* 6. COMPREHENSIVE FAQ LIST VIEW */}
      {currentView === "faq" && (
        <main className="flex-grow w-full animate-fade-in" id="faq-accordions">
          {/* Hero Banner Section */}
          <div className="relative bg-gray-900 py-16 text-white overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop')` }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Central de Suporte</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white">Como Podemos Ajudar?</h1>
              <p className="text-gray-300 text-sm max-w-xl mx-auto">
                Pesquise as dúvidas mais frequentes ou selecione uma categoria para encontrar as respostas de que precisa.
              </p>

              {/* Dynamic Help Center Search Bar */}
              <div className="max-w-xl mx-auto pt-4 relative">
                <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-gray-150 overflow-hidden text-gray-900">
                  <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Pesquisar perguntas frequentes, termos..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="w-full px-4 py-4 text-sm font-sans focus:outline-none border-none text-gray-800 placeholder-gray-400"
                  />
                  {faqSearch && (
                    <button 
                      onClick={() => setFaqSearch("")}
                      className="p-2 mr-2 text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Core Support content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* FAQ Column (Col 7) */}
              <div className="lg:col-span-7 space-y-8">
                {/* Categories filtering tabs */}
                <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-gray-150">
                  {["Todos", "Geral", "Pagamentos", "Organizadores", "Reembolsos"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFaqCategoryFilter(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        faqCategoryFilter === cat 
                          ? "bg-indigo-650 text-white shadow-sm" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* FAQ List Accordions */}
                <div className="space-y-4">
                  {(() => {
                    const filteredFaqs = faqs.filter(item => {
                      const matchesSearch = item.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                                            item.answer.toLowerCase().includes(faqSearch.toLowerCase());
                      const matchesCategory = faqCategoryFilter === "Todos" || item.category === faqCategoryFilter;
                      return matchesSearch && matchesCategory;
                    });

                    if (filteredFaqs.length === 0) {
                      return (
                        <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          <Info className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-bounce" />
                          <p className="text-sm font-bold text-gray-700">Nenhum resultado encontrado</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Tente alterar os termos da sua pesquisa ou limpe os filtros ativos.</p>
                          <button
                            onClick={() => { setFaqSearch(""); setFaqCategoryFilter("Todos"); }}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
                          >
                            Limpar Filtros
                          </button>
                        </div>
                      );
                    }

                    return filteredFaqs.map((item) => {
                      const isOpen = openFaqId === item.id;
                      return (
                        <div 
                          key={item.id}
                          className="bg-white border border-gray-150 rounded-2xl overflow-hidden transition-all shadow-sm hover:border-gray-200"
                        >
                          <button
                            onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                            className="w-full text-left p-5 flex items-center justify-between font-sans font-bold text-sm text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <span className="pr-4">{item.question}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "transform rotate-180 text-indigo-600" : ""}`} />
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5 pt-1 border-t border-gray-100 bg-gray-50/30">
                              <p className="text-gray-650 text-xs leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                              <div className="mt-4 flex items-center gap-3 pt-3 border-t border-gray-100 text-[10px] text-gray-400">
                                <span>Esta resposta foi útil?</span>
                                <button className="hover:text-indigo-650 font-bold cursor-pointer">Sim</button>
                                <span>•</span>
                                <button className="hover:text-red-500 font-bold cursor-pointer">Não</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Contact / Help Desk Inquiry form Column (Col 5) */}
              <div className="lg:col-span-5 space-y-8">
                {/* Happy Support Team Image Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl overflow-hidden border border-indigo-800 shadow-xl relative group">
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=600&auto=format&fit=crop')` }} />
                  <div className="p-8 space-y-4 relative z-10 text-white">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Apoio Dedicado</span>
                    <h3 className="text-xl font-extrabold">Fale com os Nossos Especialistas</h3>
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      Se não encontrou a resposta para o seu problema, envie-nos uma mensagem direta. Estamos disponíveis 24 horas por dia para ajudar produtores e clientes.
                    </p>
                    <div className="space-y-2.5 pt-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>+244 923 000 000 (Linha Oficial)</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>suporte@ticketangola.co.ao</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>Talatona, Luanda, Angola</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">Enviar Pedido de Suporte</h3>
                    <p className="text-xs text-gray-400 mt-1">Preencha o formulário abaixo e responderemos em menos de 2 horas.</p>
                  </div>

                  {supportSubmitted ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-3">
                      <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                      <h4 className="font-bold text-sm text-emerald-900">Mensagem Recebida!</h4>
                      <p className="text-xs text-emerald-650 leading-relaxed">
                        Obrigado por nos contactar. Um técnico de suporte da TicketAngola foi notificado e responderá para o seu email muito em breve.
                      </p>
                      <button
                        onClick={() => setSupportSubmitted(false)}
                        className="mt-2 text-xs text-emerald-700 hover:underline font-bold cursor-pointer"
                      >
                        Enviar outra mensagem
                      </button>
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (supportName.trim() && supportEmail.trim() && supportMessage.trim()) {
                          setSupportSubmitted(true);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nome Completo *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: João Manuel"
                          value={supportName}
                          onChange={(e) => setSupportName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-indigo-650 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Seu Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="Ex: joao@gmail.com"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-indigo-650 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assunto</label>
                        <input
                          type="text"
                          placeholder="Ex: Dificuldade no pagamento Multicaixa"
                          value={supportSubject}
                          onChange={(e) => setSupportSubject(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-indigo-650 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mensagem *</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Escreva detalhadamente o seu problema ou dúvida..."
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-indigo-650 transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submeter Ticket de Suporte</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      )}

      {/* 7. DETAILED ABOUT US STATIC VIEW */}
      {currentView === "about" && (() => {
        const aboutPage = cmsConfig?.pages?.find(p => p.id === "about");
        return (
          <main className="flex-grow w-full space-y-16 animate-fade-in" id="about-brand">
            
            {/* Brand Hero Banner */}
            <div className="relative bg-gray-950 py-20 text-white overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-overlay" style={{ backgroundImage: `url('${aboutPage?.bannerImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop"}')` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
              
              {/* Visual element */}
              <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sobre a Plataforma</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight leading-tight text-white max-w-4xl mx-auto">
                  {aboutPage?.title || "Sobre Nós - TicketAngola"}
                </h1>
                <p className="text-gray-300 text-sm leading-relaxed max-w-2xl mx-auto font-sans font-medium">
                  {aboutPage?.subtitle || "A TicketAngola é um ecossistema tecnológico completo desenhado para unir os produtores de espetáculos aos seus públicos de forma transparente, rápida e 100% segura."}
                </p>
              </div>
            </div>

            {/* Dynamic Content Markdown Render if edited */}
            {aboutPage?.content && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white border border-gray-150 rounded-3xl p-8 sm:p-12 shadow-sm text-gray-700 text-sm leading-relaxed whitespace-pre-wrap prose prose-indigo">
                  {aboutPage.content}
                </div>
              </div>
            )}

          {/* Key Metrics Dashboard Segment */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-gray-150 p-8 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              <div className="text-center space-y-1 py-4 lg:py-0">
                <span className="text-3xl sm:text-4xl font-sans font-black text-indigo-650 tracking-tight block">+150.000</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bilhetes Emitidos</span>
              </div>
              <div className="text-center space-y-1 py-4 lg:py-0">
                <span className="text-3xl sm:text-4xl font-sans font-black text-[#2B7A5D] tracking-tight block">+420</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Produtores Ativos</span>
              </div>
              <div className="text-center space-y-1 py-4 lg:py-0">
                <span className="text-3xl sm:text-4xl font-sans font-black text-gray-900 tracking-tight block">18</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Províncias Cobertas</span>
              </div>
              <div className="text-center space-y-1 py-4 lg:py-0">
                <span className="text-3xl sm:text-4xl font-sans font-black text-indigo-650 tracking-tight block">99.4%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sucesso e Confiança</span>
              </div>
            </div>
          </div>

          {/* Mission, Vision, and Values Block */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-sans font-black text-gray-900 tracking-tight">Os Nossos Pilares Institucionais</h2>
              <p className="text-gray-500 text-xs">Os valores fundamentais que orientam as nossas decisões tecnológicas e operacionais todos os dias.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Mission Card */}
              <div className="bg-white rounded-3xl border border-gray-150 p-8 space-y-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-black text-lg text-gray-900">A Nossa Missão</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Oferecer soluções tecnológicas de ponta que viabilizem a inclusão financeira e o check-in rápido em eventos corporativos, de entretenimento, desportivos e culturais no território angolano.
                </p>
              </div>

              {/* Vision Card */}
              <div className="bg-white rounded-3xl border border-gray-150 p-8 space-y-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-650 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-black text-lg text-gray-900">A Nossa Visão</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Consolidar a TicketAngola como o canal unificado padrão para todos os tipos de eventos, aproximando a oferta cultural do interior do país às grandes capitais provinciais de forma democrática.
                </p>
              </div>

              {/* Values Card */}
              <div className="bg-white rounded-3xl border border-gray-150 p-8 space-y-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-black text-lg text-gray-900">Os Nossos Valores</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Pautamos as nossas relações pela segurança incondicional de dados, inovação contínua, proximidade com produtores e inclusão de pessoas através do acesso fácil à cultura nacional.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Feature Splitscreen Block */}
          <section className="bg-gray-50 py-16 border-y border-gray-150">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
                <h2 className="text-2xl sm:text-3xl font-sans font-black text-gray-900 tracking-tight">Vantagens Tecnológicas</h2>
                <p className="text-gray-500 text-xs">Uma arquitetura completa desenhada para atender a ambas as extremidades do ecossistema de eventos.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* For buyers */}
                <div className="bg-white rounded-3xl border border-gray-150 p-8 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-650">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-sans font-extrabold text-base text-gray-900">Para o Comprador</h3>
                  </div>

                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-900 block">Pagamentos Rápidos e Integrados</span>
                        <span className="text-[11px] text-gray-400 block">Compre com segurança através de Referência Multicaixa, MCX Express, Unitel Money ou Afrimoney.</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-900 block">QR Code Infalsificável no Telemóvel</span>
                        <span className="text-[11px] text-gray-400 block">Os seus ingressos ficam sempre disponíveis no seu painel pessoal e são enviados por email de forma encriptada.</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-900 block">Gestão de Reembolso Automática</span>
                        <span className="text-[11px] text-gray-400 block">Se um evento for adiado ou cancelado, solicite reembolso através de um clique na sua Área de Cliente.</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* For organizers */}
                <div className="bg-white rounded-3xl border border-gray-150 p-8 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-[#2B7A5D]">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="font-sans font-extrabold text-base text-gray-900">Para o Produtor / Organizador</h3>
                  </div>

                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-900 block">Publicação de Eventos Grátis</span>
                        <span className="text-[11px] text-gray-400 block">Crie eventos e disponibilize ingressos gerais, VIPs ou promoções sem custos de registo ou mensalidades.</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-900 block">Validação na Porta sem Custos Extra</span>
                        <span className="text-[11px] text-gray-400 block">Utilize o leitor de QR code integrado no telemóvel para gerir as entradas sem necessidade de aparelhos extra.</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-900 block">Gráficos de Vendas em Tempo Real</span>
                        <span className="text-[11px] text-gray-400 block">Monitore métricas de vendas, receitas acumuladas, demografias e bilhetes remanescentes num painel de última geração.</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center space-y-6">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white p-8 sm:p-12 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-2 relative z-10 max-w-xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-sans font-black">Pronto para Elevar o seu Próximo Evento?</h3>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                  Registe-se gratuitamente como organizador ou compre já ingressos para o espetáculo do seu artista favorito.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <button
                  onClick={() => onNavigate("events")}
                  className="w-full sm:w-auto px-6 py-3 bg-white text-indigo-650 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Ver Lista de Eventos
                </button>
                <button
                  onClick={() => {
                    if (currentUser) {
                      onNavigate("organizer-dashboard");
                    } else {
                      onNavigate("login-auth");
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-[#2B7A5D] hover:bg-[#349270] text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Publicar Meu Primeiro Evento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

        </main>
        );
      })()}

    </div>
  );
}
