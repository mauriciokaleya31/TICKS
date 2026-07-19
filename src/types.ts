export enum EventCategory {
  CONCERTOS = "Concertos",
  FESTIVAIS = "Festivais",
  TEATRO_CULTURA = "Teatro & Cultura",
  CONFERENCIAS = "Conferências",
  DESPORTO = "Desporto",
  ONLINE_WORKSHOPS = "Workshops & Online"
}

export enum EventType {
  PRESENCIAL = "Presencial",
  ONLINE = "Online"
}

export enum TicketTypeClass {
  NORMAL = "Normal",
  VIP = "VIP",
  PREMIUM = "Premium",
  BACKSTAGE = "Backstage",
  EARLY_BIRD = "Early Bird",
  ESTUDANTE = "Estudante",
  CAMAROTE = "Camarote",
  MESA = "Mesa"
}

export enum OrderStatus {
  COMPLETADO = "Completado",
  PENDENTE = "Pendente",
  REEMBOLSADO = "Reembolsado",
  CANCELADO = "Cancelado"
}

export enum UserRole {
  CLIENTE = "Cliente",
  ORGANIZADOR = "Organizador",
  ADMIN = "Administrador"
}

export enum PaymentMethod {
  MC_EXPRESS = "Multicaixa Express",
  REF_MC = "Referência Multicaixa",
  UNITEL_MONEY = "Unitel Money",
  AFRIMONEY = "Afrimoney",
  TRANSF_BANCARIA = "Transferência Bancária",
  VISA_MASTERCARD = "Visa / Mastercard",
  STRIPE = "Stripe",
  PAYPAL = "PayPal"
}

export interface TicketType {
  id: string;
  name: TicketTypeClass | string;
  price: number;
  totalQuantity: number;
  soldQuantity: number;
  description?: string;
  limitPerUser?: number;
}

export interface Organizer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  description?: string;
  verified: boolean;
  phone?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  summary: string;
  category: EventCategory;
  type: EventType;
  date: string;
  time: string;
  location: string; // "Online" or physical city/address
  city: string;
  image: string;
  gallery: string[];
  videoUrl?: string;
  organizerId: string;
  organizerName: string;
  ticketTypes: TicketType[];
  sponsors?: string[];
  rules?: string;
  agenda?: { time: string; title: string; desc?: string }[];
  featured: boolean;
  popular: boolean;
  approved: boolean; // Managed by Admin
  rejected?: boolean; // If explicitly rejected by Admin
  commissionRate?: number; // Override general platform commission
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  registeredAt: string;
  status: "Ativo" | "Suspenso";
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  buyerPhone?: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  paymentReceiptUrl?: string;
  adminObservations?: string;
  tickets: {
    id: string;
    ticketCode: string;
    participantName: string;
    checkedIn: boolean;
    checkedInAt?: string;
  }[];
}

export interface HeaderMenuItem {
  id: string;
  label: string;
  view: string;
  params?: any;
  order: number;
  active: boolean;
  submenus?: { id: string; label: string; view: string; params?: any; active: boolean }[];
}

export interface HeaderConfig {
  logoUrl?: string;
  platformName: string;
  menuItems: HeaderMenuItem[];
}

export interface SlideItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  active: boolean;
}

export interface CustomCategoryItem {
  id: string;
  name: string;
  image: string;
  icon: string;
  description: string;
  order: number;
  active: boolean;
}

export interface FooterConfig {
  institutionalText: string;
  copyright: string;
  address: string;
  phones: string[];
  email: string;
  socials: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
  workingHours: string;
  quickLinks: { label: string; view: string }[];
  logoUrl?: string;
}

export interface PageContent {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  bannerImage?: string;
  active: boolean;
}

export interface ManualPaymentMethod {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  iban: string;
  cardNumber?: string;
  expressPhone?: string;
  referenceCode?: string;
  qrCodeUrl?: string;
  bankLogoUrl?: string;
  instructions: string;
  active: boolean;
  icon?: string;
}

export interface CMSConfig {
  header: HeaderConfig;
  slides: SlideItem[];
  categories: CustomCategoryItem[];
  footer: FooterConfig;
  pages: PageContent[];
  paymentMethods: ManualPaymentMethod[];
  enabledStandardMethods?: string[];
  enableManualPayments?: boolean;
  standardMethodIcons?: { [key: string]: string };
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  eventId?: string; // Applicable to specific event or global
  expiryDate: string;
  active: boolean;
}

export interface Review {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "Geral" | "Pagamentos" | "Organizadores" | "Reembolsos";
}

export interface SupportReply {
  id: string;
  senderName: string;
  senderRole: string; // "Admin" | "User"
  message: string;
  createdAt: string;
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  senderRole: string; // "Cliente" | "Organizador" | "Visitante"
  subject: string;
  message: string;
  status: "Pendente" | "Respondido" | "Fechado";
  createdAt: string;
  adminNotes?: string;
  replies?: SupportReply[];
}

