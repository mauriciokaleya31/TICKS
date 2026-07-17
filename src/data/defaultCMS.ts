import { CMSConfig } from "../types";

export const defaultCMSConfig: CMSConfig = {
  header: {
    logoUrl: "",
    platformName: "TicketAngola",
    menuItems: [
      { id: "h-1", label: "Início", view: "home", order: 1, active: true },
      { id: "h-2", label: "Todos os Eventos", view: "events", params: { type: "all" }, order: 2, active: true },
      { id: "h-3", label: "Eventos Online", view: "events", params: { type: "online" }, order: 3, active: true },
      { id: "h-4", label: "Blog & Notícias", view: "blog", order: 4, active: true },
      { id: "h-5", label: "Sobre Nós", view: "about", order: 5, active: true },
      { id: "h-6", label: "Ajuda / FAQ", view: "faq", order: 6, active: true }
    ]
  },
  slides: [
    {
      id: "slide-1",
      image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1600&auto=format&fit=crop&q=80",
      title: "Viva a emoção dos melhores eventos em Angola",
      subtitle: "Bilhetes oficiais com validação instantânea via QR Code",
      description: "Sons do Atlântico, Angola Tech Summit, concertos de Semba, festivais em Luanda, Benguela e Huíla. O seu ingresso está à distância de um clique.",
      buttonText: "Procurar Ingressos",
      buttonLink: "events",
      order: 1,
      active: true
    },
    {
      id: "slide-2",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80",
      title: "Crie e Publique o seu Evento Gratuitamente",
      subtitle: "Tecnologia de ponta para produtores",
      description: "Venda bilhetes online, faça check-in por QR Code pela câmara do telemóvel e receba pagamentos via Express, Multicaixa ou Unitel Money de forma transparente.",
      buttonText: "Criar Evento",
      buttonLink: "organizer-dashboard",
      order: 2,
      active: true
    }
  ],
  categories: [
    { id: "cat-1", name: "Concertos", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800", icon: "Music", description: "Shows ao vivo e concertos musicais", order: 1, active: true },
    { id: "cat-2", name: "Festivais", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800", icon: "Sparkles", description: "Grandes festivais e festas de verão", order: 2, active: true },
    { id: "cat-3", name: "Teatro & Cultura", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800", icon: "Theater", description: "Peças de teatro, ópera e exposições", order: 3, active: true },
    { id: "cat-4", name: "Conferências", image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800", icon: "Presentation", description: "Palestras, summits e networking profissional", order: 4, active: true },
    { id: "cat-5", name: "Desporto", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800", icon: "Trophy", description: "Futebol, basquete e maratonas", order: 5, active: true },
    { id: "cat-6", name: "Workshops & Online", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800", icon: "Laptop", description: "Formações digitais e salas virtuais", order: 6, active: true }
  ],
  footer: {
    institutionalText: "A mais avançada plataforma SaaS para venda de bilhetes e gestão de eventos em Angola. Segurança total, facilidade de compra e controlo de entradas sem fricção.",
    copyright: "TicketAngola. Todos os direitos reservados.",
    address: "Avenida de Talatona, Edifício Premium, Piso 4, Luanda, Angola",
    phones: ["+244 923 456 789", "+244 912 345 678"],
    email: "suporte@ticketangola.com",
    socials: {
      facebook: "https://facebook.com/ticketangola",
      instagram: "https://instagram.com/ticketangola",
      twitter: "https://twitter.com/ticketangola"
    },
    workingHours: "Suporte Técnico 24/7",
    quickLinks: [
      { label: "Procurar Ingressos", view: "events" },
      { label: "Criar um Evento", view: "organizer-dashboard" },
      { label: "Nosso Blog / CMS", view: "blog" },
      { label: "Centro de Ajuda / FAQ", view: "faq" },
      { label: "Sobre a TicketAngola", view: "about" }
    ],
    logoUrl: ""
  },
  pages: [
    {
      id: "home",
      title: "Viva a emoção dos melhores eventos em Angola",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      active: true
    },
    {
      id: "about",
      title: "Sobre Nós - TicketAngola",
      subtitle: "A revolução na gestão de eventos e bilheteira em Angola",
      content: `### Quem Somos
A **TicketAngola** é a plataforma pioneira em Angola na emissão de bilhetes digitais e gestão automatizada de eventos. Nascida com a missão de erradicar as fraudes e simplificar o acesso a espetáculos, oferecemos aos organizadores de eventos uma infraestrutura de nível mundial e aos clientes finais uma experiência de compra ágil, segura e inclusiva.

### A Nossa Missão
Facilitar o encontro entre pessoas e experiências culturais incríveis. Desenvolvemos soluções financeiras e de check-in integradas para assegurar que cada concerto, festival, workshop ou conferência decorra com total transparência e comodidade, desde o primeiro clique até ao controlo de acessos por QR Code à porta.

### Por que nos escolher?
* **Segurança Absoluta**: Bilhetes únicos encriptados por QR Code inviolável.
* **Inclusão Financeira**: Total suporte aos métodos angolanos de pagamento como Multicaixa Express, referências bancárias, além de Unitel Money e Afrimoney.
* **Moderação Ativa**: Verificação rigorosa e homologação manual de produtores e espetáculos.`,
      bannerImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
      active: true
    },
    {
      id: "faq",
      title: "Centro de Ajuda e FAQ",
      subtitle: "Tudo o que precisa de saber para comprar e organizar espetáculos",
      content: "Explore as nossas respostas rápidas ou entre em contacto com a nossa equipa de suporte.",
      active: true
    },
    {
      id: "privacy",
      title: "Política de Privacidade",
      subtitle: "Compromisso com a proteção e transparência dos seus dados",
      content: `A sua privacidade é extremamente importante para nós. Na TicketAngola, temos princípios fundamentais em relação aos seus dados:

1. **Recolha de Informações**: Recolhemos o seu nome, email, telemóvel e dados estritamente necessários para emitir os bilhetes oficiais.
2. **Uso de Dados**: Usamos as suas informações para processar os pagamentos, gerar os bilhetes digitais e notificá-lo sobre alterações no evento. Os organizadores recebem apenas a lista de participantes para efeitos de check-in e validação de acessos.
3. **Segurança**: Aplicamos firewalls avançadas e encriptação SSL para proteger todas as transações financeiras e dados pessoais de acessos não autorizados.`,
      active: true
    },
    {
      id: "terms",
      title: "Termos e Condições de Uso",
      subtitle: "Regras de utilização da plataforma e políticas de compra",
      content: `Ao aceder e utilizar a TicketAngola, o utilizador aceita integralmente as seguintes regras:

1. **Responsabilidade dos Eventos**: A TicketAngola atua estritamente como intermediadora de serviços de bilheteira. Toda a organização, calendarização e realização do evento é da exclusiva responsabilidade do produtor homologado.
2. **Política de Reembolsos**: Os pedidos de reembolso de bilhetes comprados na plataforma podem ser efetuados até 48 horas antes do início planeado do evento, dependendo sempre dos termos definidos por cada organizador.
3. **Fraude de Bilhetes**: É estritamente proibido duplicar, revender ilegalmente ou falsificar bilhetes digitais. O sistema deteta leituras múltiplas de QR Code, invalidando imediatamente ingressos duplicados.`,
      active: true
    },
    {
      id: "contact",
      title: "Contacte-nos",
      subtitle: "Estamos aqui para ajudar. Envie-nos uma mensagem!",
      content: "Preencha o formulário abaixo ou utilize um dos nossos canais de atendimento telefónico ou presencial.",
      active: true
    }
  ],
  paymentMethods: [
    {
      id: "pm-1",
      bankName: "Banco de Fomento Angola (BFA)",
      accountHolder: "TKT ANGOLA SA",
      accountNumber: "982736152",
      iban: "AO06.0006.0000.9827.3615.2013.4",
      instructions: "Efetue a transferência bancária no valor exato e anexe o comprovativo correspondente para verificação rápida do administrador.",
      active: true
    },
    {
      id: "pm-2",
      bankName: "Banco Angolano de Investimentos (BAI)",
      accountHolder: "TKT ANGOLA SA",
      accountNumber: "112048591",
      iban: "AO06.0040.0000.1120.4859.1018.9",
      instructions: "Pague no canal BAI Directo ou Multicaixa e faça o upload do comprovativo em formato de imagem JPG/PNG ou documento PDF.",
      active: true
    }
  ]
};
