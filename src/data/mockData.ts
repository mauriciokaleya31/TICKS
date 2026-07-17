import { Event, EventCategory, EventType, TicketTypeClass, BlogPost, FAQItem, User, UserRole, Order, OrderStatus, PaymentMethod } from "../types";

export const initialUsers: User[] = [
  {
    id: "user-client-1",
    name: "Hélder Silva",
    email: "cliente@gmail.com",
    role: UserRole.CLIENTE,
    phone: "+244 923 456 789",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    registeredAt: "2026-01-15T10:00:00Z",
    status: "Ativo"
  },
  {
    id: "user-org-1",
    name: "Clé Entertainment",
    email: "organizador@gmail.com",
    role: UserRole.ORGANIZADOR,
    phone: "+244 912 345 678",
    avatar: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80",
    registeredAt: "2026-02-10T14:30:00Z",
    status: "Ativo"
  },
  {
    id: "user-admin",
    name: "Pedro Neto (Admin)",
    email: "admin@gmail.com",
    role: UserRole.ADMIN,
    phone: "+244 990 112 233",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    registeredAt: "2025-12-01T08:00:00Z",
    status: "Ativo"
  }
];

export const initialEvents: Event[] = [
  {
    id: "event-1",
    title: "Sons do Atlântico 2026",
    summary: "O maior festival de música de Luanda regressa à Baía com as melhores vozes nacionais e internacionais.",
    description: "Prepare-se para a 11ª edição do Sons do Atlântico! Um espetáculo que celebra a cultura angolana e ritmos africanos com um cartaz repleto de estrelas mundiais, atuações vibrantes, praça de alimentação com gastronomia local, áreas lounge e ativações de marcas exclusivas.",
    category: EventCategory.FESTIVAIS,
    type: EventType.PRESENCIAL,
    date: "2026-08-15",
    time: "16:00",
    location: "Baía de Luanda, Avenida 4 de Fevereiro",
    city: "Luanda",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Exemplo
    organizerId: "user-org-1",
    organizerName: "Clé Entertainment",
    featured: true,
    popular: true,
    approved: true,
    sponsors: ["Unitel", "BFA", "Cuca", "Pumangol"],
    rules: "Proibida a entrada de objetos cortantes, garrafas de vidro ou comida de fora. Abertura das portas às 14:00.",
    agenda: [
      { time: "14:00", title: "Abertura das Portas", desc: "Entrada e circulação no recinto" },
      { time: "16:00", title: "DJs Locais e Warm-up", desc: "Os melhores hits de Kizomba e Afro House" },
      { time: "18:30", title: "Artistas Revelação", desc: "Apresentação dos novos talentos angolanos" },
      { time: "21:00", title: "Show Principal - Cabeças de Cartaz", desc: "Grandes nomes do Semba e Afrobeats" },
      { time: "01:00", title: "Encerramento", desc: "Fim do primeiro dia" }
    ],
    ticketTypes: [
      { id: "evt-1-t-1", name: TicketTypeClass.NORMAL, price: 12000, totalQuantity: 3000, soldQuantity: 1240, limitPerUser: 4, description: "Acesso geral à pista e praça de alimentação." },
      { id: "evt-1-t-2", name: TicketTypeClass.VIP, price: 35000, totalQuantity: 800, soldQuantity: 420, limitPerUser: 2, description: "Área reservada com bar próprio, vista privilegiada e oferta de welcome drink." },
      { id: "evt-1-t-3", name: TicketTypeClass.CAMAROTE, price: 120000, totalQuantity: 50, soldQuantity: 18, limitPerUser: 1, description: "Acesso a lounge premium com buffet de salgados, bebidas premium incluídas e atendimento personalizado." }
    ]
  },
  {
    id: "event-2",
    title: "Angola Tech Summit 2026",
    summary: "A maior conferência de tecnologia e inovação digital de Angola.",
    description: "O Angola Tech Summit reúne líderes de tecnologia, fundadores de startups, investidores nacionais e internacionais para discutir o futuro do ecossistema digital em África. Painéis sobre Inteligência Artificial, FinTech, Web3 e transformação digital, além de uma ampla feira de exposições de startups.",
    category: EventCategory.CONFERENCIAS,
    type: EventType.PRESENCIAL,
    date: "2026-09-22",
    time: "09:00",
    location: "Centro de Convenções de Talatona (CCTA)",
    city: "Luanda",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80"
    ],
    organizerId: "user-org-1",
    organizerName: "Clé Entertainment",
    featured: true,
    popular: false,
    approved: true,
    sponsors: ["Unitel", "Standard Bank", "Google", "Angola Telecom"],
    rules: "Obrigatório o uso de credencial visível. Traje business casual recomendado.",
    agenda: [
      { time: "08:00", title: "Credenciamento e Café de Boas-vindas", desc: "Receção de participantes" },
      { time: "09:00", title: "Discurso de Abertura", desc: "Ministério das Telecomunicações e Inovação" },
      { time: "10:30", title: "Painel: O Impacto da IA na Banca em Angola", desc: "Discussão com CEOs de bancos locais" },
      { time: "12:30", title: "Almoço e Networking", desc: "Pavilhão de Exposições" },
      { time: "14:30", title: "Sessão de Startups Pitch", desc: "Apresentação para investidores" }
    ],
    ticketTypes: [
      { id: "evt-2-t-1", name: "Estudante", price: 5000, totalQuantity: 300, soldQuantity: 180, limitPerUser: 1, description: "Acesso a todas as palestras gerais. Obrigatório comprovativo estudantil." },
      { id: "evt-2-t-2", name: "Profissional", price: 25000, totalQuantity: 1000, soldQuantity: 340, limitPerUser: 5, description: "Acesso total, sessões de networking e certificado digital." },
      { id: "evt-2-t-3", name: "Premium (VIP Pass)", price: 80000, totalQuantity: 100, soldQuantity: 45, limitPerUser: 2, description: "Lounge VIP para palestrantes, almoço executivo exclusivo e convite para o jantar de gala." }
    ]
  },
  {
    id: "event-3",
    title: "Stand Up Comedy: 'O Regresso do Humor'",
    summary: "Uma noite de gargalhadas imparáveis com os maiores humoristas angolanos.",
    description: "Prepare o seu maxilar para o maior espetáculo de comédia do ano. Reunindo nomes consagrados do stand-up angolano, este evento promete duas horas de sátiras sobre o quotidiano, imitações e boa disposição para toda a família.",
    category: EventCategory.TEATRO_CULTURA,
    type: EventType.PRESENCIAL,
    date: "2026-07-28",
    time: "20:30",
    location: "Cine Atlântico, Rua Dr. Américo Boavida",
    city: "Luanda",
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eed262?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=600&auto=format&fit=crop&q=80"
    ],
    organizerId: "org-comedy",
    organizerName: "Comedy Club Angola",
    featured: false,
    popular: true,
    approved: true,
    rules: "Não recomendado a menores de 14 anos. É proibido gravar áudio ou vídeo do espetáculo.",
    ticketTypes: [
      { id: "evt-3-t-1", name: TicketTypeClass.NORMAL, price: 3000, totalQuantity: 1500, soldQuantity: 1200, limitPerUser: 6, description: "Plateia Geral" },
      { id: "evt-3-t-2", name: TicketTypeClass.VIP, price: 10000, totalQuantity: 200, soldQuantity: 195, limitPerUser: 4, description: "Primeiras filas + foto com os comediantes no final." }
    ]
  },
  {
    id: "event-4",
    title: "Workshop de Marketing Digital e Inteligência Artificial",
    summary: "Aprenda a revolucionar as suas vendas usando as ferramentas mais modernas de IA.",
    description: "Um workshop online intensivo focado em profissionais liberais, gestores de marketing e empresários que queiram dominar a criação de conteúdo, automação de anúncios e análises de mercado através do Gemini e outras ferramentas de IA generativa.",
    category: EventCategory.ONLINE_WORKSHOPS,
    type: EventType.ONLINE,
    date: "2026-08-05",
    time: "18:00",
    location: "Plataforma Zoom (Link enviado por email)",
    city: "Online",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80",
    gallery: [],
    organizerId: "user-org-1",
    organizerName: "Clé Entertainment",
    featured: false,
    popular: false,
    approved: true,
    rules: "Link de acesso individual e intransmissível. A gravação será disponibilizada por 30 dias.",
    ticketTypes: [
      { id: "evt-4-t-1", name: "Acesso Geral", price: 8500, totalQuantity: 500, soldQuantity: 320, limitPerUser: 2, description: "Acesso à sessão ao vivo, materiais de apoio e gravação completa." }
    ]
  },
  {
    id: "event-5",
    title: "Gala Beneficente - Um Sorriso para o Amanhã",
    summary: "Jantar de solidariedade para apoiar orfanatos na província da Huíla.",
    description: "Um evento requintado com leilões beneficentes, apresentações artísticas especiais e um menu gastronómico requintado assinado por chefes de prestígio. 100% da receita líquida reverte para a aquisição de materiais escolares e reabilitação de habitações para crianças desfavorecidas.",
    category: EventCategory.TEATRO_CULTURA,
    type: EventType.PRESENCIAL,
    date: "2026-10-10",
    time: "19:30",
    location: "Hotel Trópico, Luanda",
    city: "Luanda",
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&auto=format&fit=crop&q=80",
    gallery: [],
    organizerId: "user-org-1",
    organizerName: "Clé Entertainment",
    featured: false,
    popular: false,
    approved: true,
    ticketTypes: [
      { id: "evt-5-t-1", name: TicketTypeClass.MESA, price: 50000, totalQuantity: 100, soldQuantity: 40, limitPerUser: 2, description: "Lugar individual em mesa de 8 pessoas, inclui jantar completo com entrada, prato principal e sobremesa." },
      { id: "evt-5-t-2", name: TicketTypeClass.PREMIUM, price: 150000, totalQuantity: 20, soldQuantity: 10, limitPerUser: 1, description: "Lugar em mesa VIP na fila frontal, receção exclusiva e garrafa de espumante incluída." }
    ]
  },
  {
    id: "event-6",
    title: "Grande Prémio de Velocidade Benguela 2026",
    summary: "A adrenalina do automobilismo regressa ao circuito de Benguela.",
    description: "A mítica corrida de carros e motos que junta os pilotos mais rápidos do país na pista de Benguela. Venha vibrar com as ultrapassagens espetaculares, ronco dos motores e sentir a emoção em primeira mão. Contamos com zonas de bancada seguras e área infantil para que traga a família inteira.",
    category: EventCategory.DESPORTO,
    type: EventType.PRESENCIAL,
    date: "2026-11-08",
    time: "10:00",
    location: "Autódromo de Benguela",
    city: "Benguela",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80"
    ],
    organizerId: "benguela-motorsports",
    organizerName: "Benguela Motorsports",
    featured: false,
    popular: true,
    approved: true,
    rules: "Obrigatório o uso de protetores auriculares para crianças pequenas nas zonas de bancada.",
    ticketTypes: [
      { id: "evt-6-t-1", name: "Bancada Geral", price: 2000, totalQuantity: 5000, soldQuantity: 2310, limitPerUser: 10, description: "Acesso livre às bancadas não-reservadas ao longo do circuito." },
      { id: "evt-6-t-2", name: "Bancada Central VIP", price: 15000, totalQuantity: 300, soldQuantity: 112, limitPerUser: 4, description: "Bancada coberta mesmo por cima da linha de partida/meta e acesso à box." }
    ]
  },
  {
    id: "event-pending-1",
    title: "Show Acústico: Kizomba Love",
    summary: "Uma noite intimista com as lendas da Kizomba romântica sob as estrelas.",
    description: "O melhor show acústico focado nos clássicos românticos da Kizomba. Um ambiente preparado para casais e amantes do Semba/Kizomba, com pista de dança e luzes acolhedoras.",
    category: EventCategory.CONCERTOS,
    type: EventType.PRESENCIAL,
    date: "2026-12-05",
    time: "21:00",
    location: "Clube Naval de Luanda",
    city: "Luanda",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=80",
    gallery: [],
    organizerId: "user-org-1",
    organizerName: "Clé Entertainment",
    featured: false,
    popular: false,
    approved: false, // NOT Approved yet - to demonstrate Admin functionality
    ticketTypes: [
      { id: "evt-p-t-1", name: TicketTypeClass.NORMAL, price: 5000, totalQuantity: 500, soldQuantity: 0 },
      { id: "evt-p-t-2", name: TicketTypeClass.VIP, price: 15000, totalQuantity: 100, soldQuantity: 0 }
    ]
  }
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: "blog-1",
    title: "Como criar e promover um evento de sucesso em Luanda em 2026",
    excerpt: "Conheça as principais estratégias de marketing digital, parcerias locais e métodos de pagamento mais procurados pelos angolanos.",
    content: `Organizar um evento em Angola, especialmente na vibrante capital Luanda, requer um planeamento estratégico que leve em consideração a cultura local, os meios de comunicação mais eficazes e, crucialmente, os hábitos de pagamento do público.

### 1. Conhecer o seu Público e Definir o Local
Luanda oferece uma variedade incrível de locais, desde a clássica Baía de Luanda até salas sofisticadas em Talatona. Ao escolher o local, garanta que há estacionamento e fácil acesso rodoviário, tópicos vitais para o público luandense.

### 2. A Importância dos Meios de Pagamento Locais
Não limite as suas vendas. Oferecer pagamentos eletrónicos rápidos como o **Multicaixa Express** e o **Unitel Money** é a chave para converter visitas em bilhetes vendidos instantaneamente. Plataformas de bilheteira digital reduzem a atrito e evitam filas longas na bilheteira física.

### 3. Redes Sociais e Ativação Local
O Instagram, TikTok e as campanhas diretas pelo WhatsApp dominam a comunicação em Luanda. Parcerias com influenciadores locais e pequenos vídeos promocionais criam o ambiente perfeito de 'FOMO' (Fear of Missing Out).

Comece hoje mesmo a planear e publique o seu evento na nossa plataforma para alcançar milhares de compradores prontos para o próximo espetáculo!`,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    category: "Planeamento",
    author: "Marta de Sousa",
    date: "2026-07-10"
  },
  {
    id: "blog-2",
    title: "O crescimento dos pagamentos móveis Unitel Money e Afrimoney no entretenimento",
    excerpt: "Descubra como a inclusão financeira está a impulsionar as vendas de bilhetes de teatro e concertos no interior do país.",
    content: `A revolução dos pagamentos digitais em Angola está em pleno andamento, liderada pelas soluções de dinheiro móvel (Mobile Money) como o **Unitel Money** e o **Afrimoney**. 

Anteriormente, o acesso a bilhetes para grandes eventos estava concentrado nas pessoas com contas bancárias ativas e acesso direto a cartões Multicaixa. Hoje, qualquer cidadão munido de um telemóvel simples pode carregar a sua carteira digital nas redes de agentes autorizados e adquirir os seus bilhetes digitais em poucos cliques.

Isto não só descentralizou o entretenimento como abriu um mercado de milhões de potenciais espetadores para os organizadores em Benguela, Huíla, Cabinda e Huambo. Integrar essas soluções é indispensável para eventos modernos e inclusivos.`,
    image: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=800&auto=format&fit=crop&q=80",
    category: "Tecnologia",
    author: "Jorge Fernandes",
    date: "2026-07-02"
  },
  {
    id: "blog-3",
    title: "Check-in Inteligente: Dicas para eliminar as filas na entrada do evento",
    excerpt: "Descubra como os scanners de QR Code rápidos e o modo de operação offline garantem uma experiência perfeita desde o primeiro minuto.",
    content: `Nada arruina mais a expetativa para um concerto do que passar 45 minutos em pé numa fila desorganizada à entrada. Como organizador, a primeira impressão do público dita o tom da noite.

Para resolver este desafio, o nosso sistema disponibiliza um **Leitor de QR Code integrado pela câmara** que valida bilhetes em menos de um segundo por participante. Além disso, as melhores práticas sugerem:
1. Dividir as filas por tipo de bilhete (VIP, Normal, Estudantes)
2. Treinar o staff para manter o telemóvel à distância correta para leitura do QR Code
3. Utilizar o modo offline em recintos com pouca cobertura móvel para não interromper o processo.

Implemente estes passos de controlo e eleve a reputação do seu festival a outro nível!`,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
    category: "Gestão",
    author: "António Manuel",
    date: "2026-06-25"
  }
];

export const initialFAQs: FAQItem[] = [
  {
    id: "faq-1",
    question: "Como recebo o meu bilhete após a compra?",
    answer: "Assim que o seu pagamento for processado com sucesso, o bilhete será gerado automaticamente. Poderá descarregá-lo em formato PDF diretamente no nosso site, aceder na sua 'Área de Cliente' sob 'Meus Bilhetes', e receberá uma cópia com o QR Code oficial no seu email de registo.",
    category: "Geral"
  },
  {
    id: "faq-2",
    question: "Que métodos de pagamento são aceites na plataforma?",
    answer: "Aceitamos os principais métodos nacionais de Angola como Multicaixa Express, Referência Multicaixa, Unitel Money, Afrimoney e Transferência Bancária. Para pagamentos internacionais, suportamos cartões de crédito Visa e Mastercard via Stripe ou PayPal, além de pagamentos digitais rápidos como Apple Pay e Google Pay.",
    category: "Pagamentos"
  },
  {
    id: "faq-3",
    question: "Como posso validar os bilhetes na entrada do meu evento?",
    answer: "Como organizador, pode aceder à sua 'Área de Organizador' pelo telemóvel ou tablet, selecionar o evento desejado e abrir o leitor de QR Code integrado. O sistema usará a câmara do seu dispositivo para fazer a leitura instantânea dos bilhetes apresentados no ecrã do cliente ou impressos.",
    category: "Organizadores"
  },
  {
    id: "faq-4",
    question: "Posso solicitar o reembolso de um bilhete?",
    answer: "Sim, os reembolsos podem ser solicitados até 48 horas antes do início do evento, através da sua Área de Cliente em 'Meus Bilhetes' clicando em 'Solicitar Reembolso'. A aprovação e processamento dependem dos termos estabelecidos por cada organizador de eventos.",
    category: "Reembolsos"
  },
  {
    id: "faq-5",
    question: "Existem comissões para publicar eventos?",
    answer: "Criar e publicar eventos gratuitos é 100% gratuito. Para eventos pagos, a plataforma retém uma comissão padrão de 5% sobre cada bilhete vendido, valor este que cobre o processamento financeiro e fornecimento do sistema de bilheteira eletrónica. Taxas personalizadas podem ser negociadas para grandes organizadores.",
    category: "Organizadores"
  }
];

export const initialOrders: Order[] = [
  {
    id: "order-1",
    orderNumber: "TX-2026-90412",
    userId: "user-client-1",
    userEmail: "cliente@gmail.com",
    userName: "Hélder Silva",
    eventId: "event-1",
    eventTitle: "Sons do Atlântico 2026",
    eventDate: "2026-08-15",
    eventLocation: "Baía de Luanda, Avenida 4 de Fevereiro",
    ticketTypeId: "evt-1-t-2",
    ticketTypeName: "VIP",
    quantity: 2,
    unitPrice: 35000,
    discountAmount: 0,
    totalPrice: 70000,
    paymentMethod: PaymentMethod.MC_EXPRESS,
    status: OrderStatus.COMPLETADO,
    createdAt: "2026-07-10T15:20:00Z",
    tickets: [
      { id: "tck-1-1", ticketCode: "SDA26-VIP-9812A", participantName: "Hélder Silva", checkedIn: false },
      { id: "tck-1-2", ticketCode: "SDA26-VIP-9812B", participantName: "Rosa Silva", checkedIn: false }
    ]
  },
  {
    id: "order-2",
    orderNumber: "TX-2026-81045",
    userId: "user-client-1",
    userEmail: "cliente@gmail.com",
    userName: "Hélder Silva",
    eventId: "event-3",
    eventTitle: "Stand Up Comedy: 'O Regresso do Humor'",
    eventDate: "2026-07-28",
    eventLocation: "Cine Atlântico, Luanda",
    ticketTypeId: "evt-3-t-1",
    ticketTypeName: "Normal",
    quantity: 1,
    unitPrice: 3000,
    discountAmount: 0,
    totalPrice: 3000,
    paymentMethod: PaymentMethod.REF_MC,
    status: OrderStatus.COMPLETADO,
    createdAt: "2026-07-12T09:45:00Z",
    tickets: [
      { id: "tck-2-1", ticketCode: "RDH26-NOR-1102C", participantName: "Hélder Silva", checkedIn: true, checkedInAt: "2026-07-17T18:00:00Z" }
    ]
  },
  {
    id: "order-3",
    orderNumber: "TX-2026-30214",
    userId: "user-other",
    userEmail: "lucas@gmail.com",
    userName: "Lucas Neto",
    eventId: "event-2",
    eventTitle: "Angola Tech Summit 2026",
    eventDate: "2026-09-22",
    eventLocation: "Centro de Convenções de Talatona (CCTA)",
    ticketTypeId: "evt-2-t-3",
    ticketTypeName: "Premium (VIP Pass)",
    quantity: 1,
    unitPrice: 80000,
    discountAmount: 8000, // 10% coupon
    totalPrice: 72000,
    paymentMethod: PaymentMethod.VISA_MASTERCARD,
    status: OrderStatus.COMPLETADO,
    createdAt: "2026-07-15T11:30:00Z",
    tickets: [
      { id: "tck-3-1", ticketCode: "ATS26-PRE-5510Z", participantName: "Lucas Neto", checkedIn: false }
    ]
  }
];

export const initialCoupons = [
  {
    id: "coup-1",
    code: "BEMVINDO10",
    discountType: "percentage" as const,
    discountValue: 10,
    minOrderValue: 5000,
    usedCount: 22,
    expiryDate: "2026-12-31",
    active: true
  },
  {
    id: "coup-2",
    code: "TECHKWANZA",
    discountType: "fixed" as const,
    discountValue: 5000,
    minOrderValue: 20000,
    eventId: "event-2",
    usedCount: 8,
    expiryDate: "2026-09-20",
    active: true
  }
];
