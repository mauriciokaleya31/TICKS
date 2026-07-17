import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { BlogPost, CustomCategoryItem, SlideItem, ManualPaymentMethod } from "../types";
import { 
  Layout, 
  Image as ImageIcon, 
  Tag, 
  HelpCircle, 
  BookOpen, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Upload 
} from "lucide-react";

interface AdminCMSProps {
  subTab: string;
}

export default function AdminCMS({ subTab }: AdminCMSProps) {
  const { 
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
    deleteFAQ
  } = useApp();

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

  if (!cmsConfig) {
    return (
      <div className="bg-white p-8 rounded-2xl border text-center text-xs text-gray-500">
        Carregando configurações do CMS...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. HEADER & FOOTER GENERAL CMS */}
      {subTab === "cms_header_footer" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-extrabold text-lg text-gray-950">CMS: Cabeçalho & Rodapé</h3>
            <p className="text-gray-500 text-xs">Configure o logotipo, nome do ecossistema e menus de navegação do topo e rodapé.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest pb-1.5 border-b">Configurações Gerais</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Nome da Plataforma</label>
                  <input 
                    type="text" 
                    value={cmsConfig.header.platformName} 
                    onChange={e => updateCMSConfig({ ...cmsConfig, header: { ...cmsConfig.header, platformName: e.target.value } })}
                    className="w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 font-bold" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Logotipo URL</label>
                  <input 
                    type="text" 
                    value={cmsConfig.header.logoUrl || ""} 
                    onChange={e => updateCMSConfig({ ...cmsConfig, header: { ...cmsConfig.header, logoUrl: e.target.value } })}
                    className="w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 font-mono" 
                  />
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest">Menus de Navegação</h4>
                <button 
                  onClick={() => { setHeaderLinkLabel(""); setHeaderLinkUrl(""); setHeaderLinkActive(true); setEditingHeaderLinkIndex(-1); }}
                  className="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[10px] rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Menu
                </button>
              </div>

              {editingHeaderLinkIndex !== null && (
                <div className="p-4 bg-gray-50 border border-indigo-100 rounded-xl space-y-3 text-xs">
                  <h5 className="font-bold text-indigo-950">{editingHeaderLinkIndex === -1 ? "Novo Item" : "Editar Item"}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" placeholder="Nome do Menu" value={headerLinkLabel} onChange={e => setHeaderLinkLabel(e.target.value)} className="bg-white border rounded-xl px-3 py-2" />
                    <input type="text" placeholder="Link/View do Menu" value={headerLinkUrl} onChange={e => setHeaderLinkUrl(e.target.value)} className="bg-white border rounded-xl px-3 py-2 font-mono" />
                    <label className="flex items-center gap-2 font-bold text-gray-650 cursor-pointer">
                      <input type="checkbox" checked={headerLinkActive} onChange={e => setHeaderLinkActive(e.target.checked)} className="w-4 h-4 text-indigo-600" />
                      Ativo
                    </label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingHeaderLinkIndex(null)} className="px-3 py-1 bg-gray-200 rounded text-[11px]">Cancelar</button>
                    <button 
                      onClick={() => {
                        if (!headerLinkLabel.trim()) return;
                        const items = [...cmsConfig.header.menuItems];
                        const newItem = { id: `menu-${Date.now()}`, label: headerLinkLabel, view: headerLinkUrl, order: items.length, active: headerLinkActive };
                        if (editingHeaderLinkIndex === -1) {
                          items.push(newItem);
                        } else {
                          items[editingHeaderLinkIndex] = { ...items[editingHeaderLinkIndex], label: headerLinkLabel, view: headerLinkUrl, active: headerLinkActive };
                        }
                        updateCMSConfig({ ...cmsConfig, header: { ...cmsConfig.header, menuItems: items } });
                        setEditingHeaderLinkIndex(null);
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-[11px]"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}

              <div className="border rounded-xl overflow-hidden divide-y text-xs">
                {cmsConfig.header.menuItems.map((item, idx) => (
                  <div key={item.id} className="p-3 flex items-center justify-between hover:bg-gray-50/50">
                    <div>
                      <span className="font-bold text-gray-800">{item.label}</span>
                      <span className="font-mono text-gray-400 text-[10px] ml-2">({item.view})</span>
                      {!item.active && <span className="bg-red-50 text-red-600 text-[9px] px-1.5 py-0.5 rounded border ml-2">Inativo</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button disabled={idx === 0} onClick={() => {
                        const m = [...cmsConfig.header.menuItems];
                        const t = m[idx]; m[idx] = m[idx-1]; m[idx-1] = t;
                        updateCMSConfig({ ...cmsConfig, header: { ...cmsConfig.header, menuItems: m } });
                      }} className="text-gray-400 hover:text-gray-650 disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
                      <button disabled={idx === cmsConfig.header.menuItems.length - 1} onClick={() => {
                        const m = [...cmsConfig.header.menuItems];
                        const t = m[idx]; m[idx] = m[idx+1]; m[idx+1] = t;
                        updateCMSConfig({ ...cmsConfig, header: { ...cmsConfig.header, menuItems: m } });
                      }} className="text-gray-400 hover:text-gray-650 disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
                      <button onClick={() => { setHeaderLinkLabel(item.label); setHeaderLinkUrl(item.view); setHeaderLinkActive(item.active); setEditingHeaderLinkIndex(idx); }} className="text-indigo-600 hover:underline"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => updateCMSConfig({ ...cmsConfig, header: { ...cmsConfig.header, menuItems: cmsConfig.header.menuItems.filter(m => m.id !== item.id) } })} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer settings */}
            <div className="space-y-4 pt-4 border-t text-xs">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest pb-1.5 border-b">Configurações do Rodapé</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-gray-600">Descrição do Rodapé</label>
                  <textarea rows={2} value={cmsConfig.footer.institutionalText} onChange={e => updateCMSConfig({ ...cmsConfig, footer: { ...cmsConfig.footer, institutionalText: e.target.value } })} className="w-full bg-gray-50 border rounded-xl px-3 py-2" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Copyright</label>
                  <input type="text" value={cmsConfig.footer.copyright} onChange={e => updateCMSConfig({ ...cmsConfig, footer: { ...cmsConfig.footer, copyright: e.target.value } })} className="w-full bg-gray-50 border rounded-xl px-3 py-2" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">E-mail de Suporte</label>
                  <input type="text" value={cmsConfig.footer.email} onChange={e => updateCMSConfig({ ...cmsConfig, footer: { ...cmsConfig.footer, email: e.target.value } })} className="w-full bg-gray-50 border rounded-xl px-3 py-2" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => saveCMSConfig(cmsConfig).then(() => alert("Cabeçalho e Rodapé salvos com sucesso!"))} className="px-6 py-2 bg-[#2B7A5D] hover:bg-[#1f5944] text-white font-bold rounded-xl shadow">
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SLIDER / HERO BANNER */}
      {subTab === "cms_slider" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-extrabold text-lg text-gray-950">CMS: Slider Principal</h3>
            <p className="text-gray-500 text-xs">Adicione ou edite banners interativos no topo do portal público.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest">Slides Ativos</h4>
              <button 
                onClick={() => {
                  setEditingSlideId("new");
                  setSlideTitle("");
                  setSlideSubtitle("");
                  setSlideDesc("");
                  setSlideImage("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200");
                  setSlideBtnText("Ver Bilhetes");
                  setSlideBtnLink("home");
                  setSlideOrder(cmsConfig.slides.length);
                  setSlideActive(true);
                }}
                className="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[10px] rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Slide
              </button>
            </div>

            {editingSlideId && (
              <div className="p-5 bg-gray-55 border rounded-xl space-y-4 text-xs">
                <h5 className="font-bold text-indigo-950">{editingSlideId === "new" ? "Criar Slide" : "Editar Slide"}</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-650">Título Principal</label>
                    <input type="text" value={slideTitle} onChange={e => setSlideTitle(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-2" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-650">Subtítulo / Tema</label>
                    <input type="text" value={slideSubtitle} onChange={e => setSlideSubtitle(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-2" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-gray-650">Descrição do Slide</label>
                    <input type="text" value={slideDesc} onChange={e => setSlideDesc(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-2" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-650">URL da Imagem</label>
                    <input type="text" value={slideImage} onChange={e => setSlideImage(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-2 font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Texto Botão" value={slideBtnText} onChange={e => setSlideBtnText(e.target.value)} className="bg-white border rounded-xl px-3 py-2" />
                    <input type="text" placeholder="Link Botão" value={slideBtnLink} onChange={e => setSlideBtnLink(e.target.value)} className="bg-white border rounded-xl px-3 py-2 font-mono" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setEditingSlideId(null)} className="px-3 py-1 bg-gray-200 rounded text-[11px]">Cancelar</button>
                  <button 
                    onClick={() => {
                      const list = [...cmsConfig.slides];
                      const newSlide = { id: editingSlideId === "new" ? `slide-${Date.now()}` : editingSlideId, title: slideTitle, subtitle: slideSubtitle, description: slideDesc, image: slideImage, buttonText: slideBtnText, buttonLink: slideBtnLink, order: slideOrder, active: slideActive };
                      if (editingSlideId === "new") {
                        list.push(newSlide);
                      } else {
                        const i = list.findIndex(s => s.id === editingSlideId);
                        if (i !== -1) list[i] = newSlide;
                      }
                      const updated = { ...cmsConfig, slides: list };
                      updateCMSConfig(updated);
                      saveCMSConfig(updated).then(() => { setEditingSlideId(null); alert("Banners atualizados!"); });
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-[11px]"
                  >
                    Salvar Slide
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {cmsConfig.slides.map(slide => (
                <div key={slide.id} className="border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={slide.image} className="w-16 h-10 object-cover rounded border" />
                    <div className="text-left">
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1 rounded uppercase font-bold">{slide.subtitle}</span>
                      <h5 className="font-bold text-gray-900 mt-0.5">{slide.title}</h5>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => {
                      setEditingSlideId(slide.id);
                      setSlideTitle(slide.title);
                      setSlideSubtitle(slide.subtitle);
                      setSlideDesc(slide.description);
                      setSlideImage(slide.image);
                      setSlideBtnText(slide.buttonText);
                      setSlideBtnLink(slide.buttonLink);
                      setSlideOrder(slide.order);
                      setSlideActive(slide.active);
                    }} className="text-indigo-600 hover:underline"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => {
                      const updated = { ...cmsConfig, slides: cmsConfig.slides.filter(s => s.id !== slide.id) };
                      updateCMSConfig(updated);
                      saveCMSConfig(updated);
                    }} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. CATEGORIES CMS */}
      {subTab === "cms_categories" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-extrabold text-lg text-gray-950">CMS: Categorias de Eventos</h3>
            <p className="text-gray-500 text-xs">Crie e gerencie as categorias promocionais na página principal.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest">Categorias</h4>
              <button 
                onClick={() => {
                  setEditingCategoryId("new");
                  setCategoryName("");
                  setCategoryDesc("");
                  setCategoryIcon("Music");
                  setCategoryImage("https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400");
                  setCategoryOrder(cmsConfig.categories.length);
                  setCategoryActive(true);
                }}
                className="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[10px] rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Categoria
              </button>
            </div>

            {editingCategoryId && (
              <div className="p-4 bg-gray-55 border rounded-xl space-y-4 text-xs">
                <h5 className="font-bold text-indigo-950">{editingCategoryId === "new" ? "Nova Categoria" : "Editar Categoria"}</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nome" value={categoryName} onChange={e => setCategoryName(e.target.value)} className="bg-white border rounded-xl px-3 py-2" />
                  <input type="text" placeholder="Ícone Lucide (ex: Music, Trophy)" value={categoryIcon} onChange={e => setCategoryIcon(e.target.value)} className="bg-white border rounded-xl px-3 py-2 font-mono" />
                  <input type="text" placeholder="URL da Imagem" value={categoryImage} onChange={e => setCategoryImage(e.target.value)} className="bg-white border rounded-xl px-3 py-2 font-mono sm:col-span-2" />
                  <input type="text" placeholder="Descrição" value={categoryDesc} onChange={e => setCategoryDesc(e.target.value)} className="bg-white border rounded-xl px-3 py-2 sm:col-span-2" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingCategoryId(null)} className="px-3 py-1 bg-gray-200 rounded text-[11px]">Cancelar</button>
                  <button 
                    onClick={() => {
                      const list = [...cmsConfig.categories];
                      const newCat = { id: editingCategoryId === "new" ? `cat-${Date.now()}` : editingCategoryId, name: categoryName, icon: categoryIcon, image: categoryImage, description: categoryDesc, order: categoryOrder, active: categoryActive };
                      if (editingCategoryId === "new") {
                        list.push(newCat);
                      } else {
                        const idx = list.findIndex(c => c.id === editingCategoryId);
                        if (idx !== -1) list[idx] = newCat;
                      }
                      const updated = { ...cmsConfig, categories: list };
                      updateCMSConfig(updated);
                      saveCMSConfig(updated).then(() => { setEditingCategoryId(null); alert("Categorias atualizadas!"); });
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-[11px]"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {cmsConfig.categories.map(cat => (
                <div key={cat.id} className="border rounded-xl p-3 bg-white space-y-2 text-left text-xs shadow-sm">
                  <img src={cat.image} className="w-full h-16 object-cover rounded border" />
                  <h5 className="font-bold text-gray-900">{cat.name}</h5>
                  <div className="flex justify-end gap-2 pt-1 border-t">
                    <button onClick={() => {
                      setEditingCategoryId(cat.id);
                      setCategoryName(cat.name);
                      setCategoryIcon(cat.icon);
                      setCategoryImage(cat.image);
                      setCategoryDesc(cat.description);
                      setCategoryOrder(cat.order);
                      setCategoryActive(cat.active);
                    }} className="text-indigo-600 hover:underline"><Edit className="w-3 h-3" /></button>
                    <button onClick={() => {
                      const updated = { ...cmsConfig, categories: cmsConfig.categories.filter(c => c.id !== cat.id) };
                      updateCMSConfig(updated);
                      saveCMSConfig(updated);
                    }} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. CUSTOM PAGES / ABOUT & HELP */}
      {subTab === "cms_pages_help" && (
        (() => {
          const aboutPage = cmsConfig.pages.find(p => p.id === "about") || { id: "about", title: "Sobre Nós", content: "", active: true };
          return (
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-gray-950">CMS: Sobre Nós & FAQs</h3>
                <p className="text-gray-500 text-xs font-medium">Configure a página estática de apresentação e a central de perguntas frequentes.</p>
              </div>

              {/* About Us */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest pb-1 border-b">Apresentação "Sobre Nós"</h4>
                <div className="grid grid-cols-1 gap-4 text-xs">
                  <input 
                    type="text" 
                    value={aboutPage.title} 
                    onChange={e => {
                      const pages = [...cmsConfig.pages];
                      const idx = pages.findIndex(p => p.id === "about");
                      if (idx !== -1) pages[idx].title = e.target.value;
                      updateCMSConfig({ ...cmsConfig, pages });
                    }} 
                    placeholder="Título da página" 
                    className="w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 font-bold" 
                  />
                  <textarea 
                    rows={5} 
                    value={aboutPage.content} 
                    onChange={e => {
                      const pages = [...cmsConfig.pages];
                      const idx = pages.findIndex(p => p.id === "about");
                      if (idx !== -1) pages[idx].content = e.target.value;
                      updateCMSConfig({ ...cmsConfig, pages });
                    }} 
                    placeholder="Conteúdo descritivo..." 
                    className="w-full bg-gray-50 border rounded-xl p-3 text-xs leading-relaxed" 
                  />
                </div>
                <div className="flex justify-end">
                  <button onClick={() => saveCMSConfig(cmsConfig).then(() => alert("Página Sobre salva!"))} className="px-5 py-2 bg-[#2B7A5D] hover:bg-[#1a4a37] text-white font-bold rounded-xl shadow">
                    Salvar Página
                  </button>
                </div>
              </div>

              {/* FAQs Manager */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-1 border-b">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest">Central de FAQs</h4>
                  <button onClick={() => { setEditingFaqId("new"); setFaqQuestion(""); setFaqAnswer(""); setFaqCategory("Geral"); }} className="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[10px] rounded-lg">
                    Nova Pergunta
                  </button>
                </div>

                {editingFaqId && (
                  <div className="p-4 bg-gray-55 border rounded-xl space-y-3 text-xs">
                    <input type="text" placeholder="Pergunta" value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} className="bg-white border rounded-xl px-3 py-2 w-full" />
                    <input type="text" placeholder="Categoria" value={faqCategory} onChange={e => setFaqCategory(e.target.value)} className="bg-white border rounded-xl px-3 py-2 w-full font-semibold" />
                    <textarea placeholder="Resposta" value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)} className="bg-white border rounded-xl p-3 w-full" rows={3} />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingFaqId(null)} className="px-3 py-1 bg-gray-200 rounded text-[11px]">Cancelar</button>
                      <button onClick={() => {
                        if (!faqQuestion.trim() || !faqAnswer.trim()) return;
                        if (editingFaqId === "new") createFAQ({ question: faqQuestion, answer: faqAnswer, category: faqCategory, active: true });
                        else updateFAQ({ id: editingFaqId, question: faqQuestion, answer: faqAnswer, category: faqCategory, active: true });
                        setEditingFaqId(null);
                        alert("Salvo!");
                      }} className="px-3 py-1 bg-indigo-600 text-white rounded text-[11px]">Salvar FAQ</button>
                    </div>
                  </div>
                )}

                <div className="divide-y text-xs border rounded-xl overflow-hidden bg-white">
                  {faqs.map(f => (
                    <div key={f.id} className="p-3.5 flex justify-between gap-4 hover:bg-gray-50/50">
                      <div className="text-left">
                        <span className="bg-gray-150 text-gray-700 text-[9px] px-1 rounded uppercase font-bold">{f.category || "Geral"}</span>
                        <p className="font-bold text-gray-950 mt-1">{f.question}</p>
                        <p className="text-gray-500 mt-0.5">{f.answer}</p>
                      </div>
                      <div className="flex gap-2 shrink-0 self-center">
                        <button onClick={() => { setEditingFaqId(f.id); setFaqQuestion(f.question); setFaqAnswer(f.answer); setFaqCategory(f.category || "Geral"); }} className="text-indigo-650 hover:underline">Editar</button>
                        <button onClick={() => deleteFAQ(f.id)} className="text-red-500 hover:text-red-700">Deletar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* 5. BLOG ARTICLES CMS */}
      {subTab === "cms_blog" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-extrabold text-lg text-gray-950">CMS: Sistema de Blog de Novidades</h3>
            <p className="text-gray-500 text-xs">Publique artigos editoriais e avisos importantes aos utilizadores.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-1 border-b">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest">Artigos Publicados</h4>
              <button 
                onClick={() => {
                  setEditingBlogId("new");
                  setBlogTitle("");
                  setBlogExcerpt("");
                  setBlogContent("");
                  setBlogCover("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600");
                  setBlogCategory("Novidades");
                  setBlogAuthor("Admin");
                }}
                className="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[10px] rounded-lg"
              >
                Escrever Artigo
              </button>
            </div>

            {editingBlogId && (
              <div className="p-4 bg-gray-55 border rounded-xl space-y-4 text-xs">
                <input type="text" placeholder="Título" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} className="bg-white border rounded-xl px-3 py-2 w-full font-bold" />
                <input type="text" placeholder="Resumo curto" value={blogExcerpt} onChange={e => setBlogExcerpt(e.target.value)} className="bg-white border rounded-xl px-3 py-2 w-full" />
                <textarea placeholder="Conteúdo do artigo" value={blogContent} onChange={e => setBlogContent(e.target.value)} className="bg-white border rounded-xl p-3 w-full" rows={6} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingBlogId(null)} className="px-3 py-1 bg-gray-200 rounded text-[11px]">Cancelar</button>
                  <button 
                    onClick={() => {
                      if (!blogTitle.trim()) return;
                      const post = { title: blogTitle, excerpt: blogExcerpt, content: blogContent, image: blogCover, category: blogCategory, author: blogAuthor, date: new Date().toISOString().split("T")[0] };
                      if (editingBlogId === "new") createBlogPost(post); else updateBlogPost({ id: editingBlogId, ...post });
                      setEditingBlogId(null);
                      alert("Artigo salvo!");
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-[11px]"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogs.map(post => (
                <div key={post.id} className="border rounded-xl p-4 flex gap-4 text-left text-xs bg-white">
                  <img src={post.image} className="w-20 h-14 object-cover rounded border shrink-0" />
                  <div className="space-y-1">
                    <h5 className="font-bold text-gray-950 leading-tight">{post.title}</h5>
                    <p className="text-[10px] text-gray-400">Por: {post.author} | {post.date}</p>
                    <div className="flex gap-2 pt-1 font-bold">
                      <button onClick={() => {
                        setEditingBlogId(post.id);
                        setBlogTitle(post.title);
                        setBlogExcerpt(post.excerpt);
                        setBlogContent(post.content);
                        setBlogCover(post.image);
                        setBlogCategory(post.category);
                        setBlogAuthor(post.author);
                      }} className="text-indigo-600 hover:underline">Editar</button>
                      <button onClick={() => deleteBlogPost(post.id)} className="text-red-500 hover:text-red-700">Deletar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MANUAL PAYMENT METHODS CONFIG */}
      {subTab === "cms_payments" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-extrabold text-lg text-gray-950">CMS: Configurações de Pagamento</h3>
            <p className="text-gray-500 text-xs">Configure as contas bancárias (IBAN) ativas para transferências manuais.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-1 border-b">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest">Contas Bancárias Ativas</h4>
              <button 
                onClick={() => {
                  setEditingPaymentId("new");
                  setPaymentName("Depósito / Transferência Bancária");
                  setPaymentBankName("BFA");
                  setPaymentAccountHolder("TKTS ANGOLA LIMITADA");
                  setPaymentAccountNumber("100293029.10.001");
                  setPaymentIban("AO06.0044.0000.1002.9302.9100.1");
                  setPaymentInstructions("Transfira o valor exato da compra e anexe o comprovativo correspondente.");
                  setPaymentOrder(cmsConfig.paymentMethods.length);
                  setPaymentActive(true);
                }}
                className="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[10px] rounded-lg"
              >
                Cadastrar Banco
              </button>
            </div>

            {editingPaymentId && (
              <div className="p-4 bg-gray-55 border rounded-xl space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nome Exibição (ex: Transferência BFA)" value={paymentName} onChange={e => setPaymentName(e.target.value)} className="bg-white border rounded-xl px-3 py-2 w-full font-bold" />
                  <input type="text" placeholder="Nome Banco (ex: BFA, BAI)" value={paymentBankName} onChange={e => setPaymentBankName(e.target.value)} className="bg-white border rounded-xl px-3 py-2" />
                  <input type="text" placeholder="Titular da Conta" value={paymentAccountHolder} onChange={e => setPaymentAccountHolder(e.target.value)} className="bg-white border rounded-xl px-3 py-2" />
                  <input type="text" placeholder="IBAN" value={paymentIban} onChange={e => setPaymentIban(e.target.value)} className="bg-white border rounded-xl px-3 py-2 font-mono" />
                  <input type="text" placeholder="Número de Conta" value={paymentAccountNumber} onChange={e => setPaymentAccountNumber(e.target.value)} className="bg-white border rounded-xl px-3 py-2 font-mono sm:col-span-2" />
                  <textarea placeholder="Instruções Adicionais" value={paymentInstructions} onChange={e => setPaymentInstructions(e.target.value)} className="bg-white border rounded-xl p-3 sm:col-span-2" rows={2} />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setEditingPaymentId(null)} className="px-3 py-1 bg-gray-200 rounded text-[11px]">Cancelar</button>
                  <button 
                    onClick={() => {
                      if (!paymentName.trim() || !paymentBankName.trim()) return;
                      const list = [...cmsConfig.paymentMethods];
                      const newPM = { id: editingPaymentId === "new" ? `pm-${Date.now()}` : editingPaymentId, name: paymentName, type: "manual" as const, bankName: paymentBankName, accountHolder: paymentAccountHolder, accountNumber: paymentAccountNumber, iban: paymentIban, instructions: paymentInstructions, order: paymentOrder, active: paymentActive };
                      if (editingPaymentId === "new") list.push(newPM); else {
                        const idx = list.findIndex(p => p.id === editingPaymentId);
                        if (idx !== -1) list[idx] = newPM;
                      }
                      const updated = { ...cmsConfig, paymentMethods: list };
                      updateCMSConfig(updated);
                      saveCMSConfig(updated).then(() => { setEditingPaymentId(null); alert("Banco salvo com sucesso!"); });
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-[11px]"
                  >
                    Salvar Banco
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {cmsConfig.paymentMethods.map(pm => (
                <div key={pm.id} className="border rounded-xl p-4 bg-white space-y-2 text-left shadow-sm">
                  <div className="flex justify-between pb-1.5 border-b font-extrabold text-indigo-950">
                    <span>{pm.name}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">{pm.bankName}</span>
                  </div>
                  <p className="text-[11px] text-gray-500"><strong>Titular:</strong> {pm.accountHolder}</p>
                  <p className="font-mono text-[10px] text-gray-500"><strong>IBAN:</strong> {pm.iban}</p>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button onClick={() => {
                      setEditingPaymentId(pm.id);
                      setPaymentName(pm.name);
                      setPaymentBankName(pm.bankName);
                      setPaymentAccountHolder(pm.accountHolder);
                      setPaymentAccountNumber(pm.accountNumber || "");
                      setPaymentIban(pm.iban || "");
                      setPaymentInstructions(pm.instructions || "");
                      setPaymentOrder(pm.order);
                      setPaymentActive(pm.active);
                    }} className="text-indigo-600 hover:underline">Editar</button>
                    <button onClick={() => {
                      const updated = { ...cmsConfig, paymentMethods: cmsConfig.paymentMethods.filter(p => p.id !== pm.id) };
                      updateCMSConfig(updated);
                      saveCMSConfig(updated);
                    }} className="text-red-500 hover:text-red-700">Deletar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
