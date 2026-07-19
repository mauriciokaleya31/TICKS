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

const isImage = (val?: string) => {
  if (!val) return false;
  return val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:image/");
};

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
  const [paymentIcon, setPaymentIcon] = useState("");

  const toggleStandardMethod = async (methodName: string) => {
    const currentEnabled = cmsConfig.enabledStandardMethods || [
      "Multicaixa Express",
      "Referência Multicaixa",
      "Unitel Money",
      "Visa / Mastercard"
    ];
    
    let updatedList: string[];
    if (currentEnabled.includes(methodName)) {
      updatedList = currentEnabled.filter(m => m !== methodName);
    } else {
      updatedList = [...currentEnabled, methodName];
    }
    
    const updated = { ...cmsConfig, enabledStandardMethods: updatedList };
    updateCMSConfig(updated);
    await saveCMSConfig(updated);
  };

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
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-gray-650 block text-left">Imagem do Banner</label>
                    <div className="bg-white p-3 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-semibold text-gray-400 block">Subir Imagem Local</span>
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors">
                          <Upload className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-650 font-bold">Escolher Imagem</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === "string") {
                                    setSlideImage(reader.result);
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
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={slideImage}
                          onChange={e => setSlideImage(e.target.value)}
                          className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      {slideImage && (
                        <div className="sm:col-span-2 flex items-center gap-3 bg-gray-50 p-2 rounded-lg border">
                          <img src={slideImage} alt="Preview Banner" className="w-16 h-10 object-cover rounded border" />
                          <div className="text-[10px] text-gray-500 text-left truncate flex-1">
                            {slideImage.startsWith("data:") ? "Imagem carregada localmente (Salva no Firestore)" : slideImage}
                          </div>
                          <button type="button" onClick={() => setSlideImage("")} className="text-red-500 font-bold text-xs">Remover</button>
                        </div>
                      )}
                    </div>
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
                  
                  <div className="space-y-1 sm:col-span-2 text-left">
                    <label className="font-semibold text-gray-650 block text-left">Imagem da Categoria</label>
                    <div className="bg-white p-3 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-semibold text-gray-400 block">Subir Imagem Local</span>
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors">
                          <Upload className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-650 font-bold">Escolher Imagem</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === "string") {
                                    setCategoryImage(reader.result);
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
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={categoryImage}
                          onChange={e => setCategoryImage(e.target.value)}
                          className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      {categoryImage && (
                        <div className="sm:col-span-2 flex items-center gap-3 bg-gray-50 p-2 rounded-lg border">
                          <img src={categoryImage} alt="Preview Categoria" className="w-16 h-10 object-cover rounded border" />
                          <div className="text-[10px] text-gray-500 text-left truncate flex-1">
                            {categoryImage.startsWith("data:") ? "Imagem carregada localmente (Salva no Firestore)" : categoryImage}
                          </div>
                          <button type="button" onClick={() => setCategoryImage("")} className="text-red-500 font-bold text-xs">Remover</button>
                        </div>
                      )}
                    </div>
                  </div>

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
                        alert("FAQ guardada com sucesso!");
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
                        <button onClick={() => {
                          if (window.confirm("Deseja realmente deletar esta pergunta de FAQ?")) {
                            deleteFAQ(f.id);
                            alert("Pergunta de FAQ excluída com sucesso!");
                          }
                        }} className="text-red-500 hover:text-red-700">Deletar</button>
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
              <div className="p-4 bg-gray-55 border rounded-xl space-y-4 text-xs text-left">
                <input type="text" placeholder="Título" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} className="bg-white border rounded-xl px-3 py-2 w-full font-bold text-gray-900" />
                <input type="text" placeholder="Resumo curto" value={blogExcerpt} onChange={e => setBlogExcerpt(e.target.value)} className="bg-white border rounded-xl px-3 py-2 w-full text-gray-800" />
                
                <div className="space-y-1 text-left">
                  <label className="font-semibold text-gray-650 block text-left">Imagem de Capa do Artigo</label>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-semibold text-gray-400 block">Subir Imagem Local</span>
                      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-650 font-bold">Escolher Imagem</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === "string") {
                                  setBlogCover(reader.result);
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
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={blogCover}
                        onChange={e => setBlogCover(e.target.value)}
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    {blogCover && (
                      <div className="sm:col-span-2 flex items-center gap-3 bg-gray-50 p-2 rounded-lg border">
                        <img src={blogCover} alt="Preview Capa Blog" className="w-16 h-10 object-cover rounded border" />
                        <div className="text-[10px] text-gray-500 text-left truncate flex-1">
                          {blogCover.startsWith("data:") ? "Imagem carregada localmente (Salva no Firestore)" : blogCover}
                        </div>
                        <button type="button" onClick={() => setBlogCover("")} className="text-red-500 font-bold text-xs">Remover</button>
                      </div>
                    )}
                  </div>
                </div>

                <textarea placeholder="Conteúdo do artigo" value={blogContent} onChange={e => setBlogContent(e.target.value)} className="bg-white border rounded-xl p-3 w-full text-gray-800" rows={6} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingBlogId(null)} className="px-3 py-1 bg-gray-200 rounded text-[11px]">Cancelar</button>
                  <button 
                    onClick={() => {
                      if (!blogTitle.trim()) return;
                      const post = { title: blogTitle, excerpt: blogExcerpt, content: blogContent, image: blogCover, category: blogCategory, author: blogAuthor, date: new Date().toISOString().split("T")[0] };
                      if (editingBlogId === "new") createBlogPost(post); else updateBlogPost({ id: editingBlogId, ...post });
                      setEditingBlogId(null);
                      alert("Artigo de blog publicado/guardado com sucesso!");
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
                      <button onClick={() => {
                        if (window.confirm("Deseja realmente deletar este artigo do blog?")) {
                          deleteBlogPost(post.id);
                          alert("Artigo do blog excluído com sucesso!");
                        }
                      }} className="text-red-500 hover:text-red-700">Deletar</button>
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
            <p className="text-gray-500 text-xs">Configure os métodos de pagamento ativos da plataforma e contas bancárias para transferências.</p>
          </div>

          {/* Métodos de Pagamento Integrados */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div>
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest">Métodos de Pagamento Padrão</h4>
              <p className="text-gray-400 text-[11px] mt-0.5">Ative ou desative os métodos de pagamento automáticos e integrados que aparecem no checkout dos clientes.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "Multicaixa Express", label: "Multicaixa Express", desc: "Pagamento instantâneo via telemóvel associado à rede Multicaixa.", icon: "📱" },
                { id: "Referência Multicaixa", label: "Referência Multicaixa", desc: "Pagamento por entidade e referência gerada na hora para ATM/Homebanking.", icon: "🏦" },
                { id: "Unitel Money", label: "Unitel Money / Afrimoney", desc: "Pagamentos móveis integrados com as principais operadoras em Angola.", icon: "💸" },
                { id: "Visa / Mastercard", label: "Cartão de Crédito (Visa / Mastercard)", desc: "Pagamentos internacionais integrados via Gateway Stripe.", icon: "💳" }
              ].map((item) => {
                const isEnabled = (cmsConfig.enabledStandardMethods || [
                  "Multicaixa Express",
                  "Referência Multicaixa",
                  "Unitel Money",
                  "Visa / Mastercard"
                ]).includes(item.id);
                
                const customIcon = cmsConfig.standardMethodIcons?.[item.id] || item.icon;
                
                return (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                      isEnabled ? "bg-indigo-50/30 border-indigo-200" : "bg-gray-55 border-gray-150"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex gap-3 items-start">
                        {isImage(customIcon) ? (
                          <img src={customIcon} alt="" className="w-8 h-8 object-contain shrink-0 rounded border bg-white" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-xl shrink-0 mt-0.5">{customIcon}</span>
                        )}
                        <div className="text-left">
                          <p className="font-bold text-xs text-gray-900">{item.label}</p>
                          <p className="text-[10px] text-gray-500 leading-normal">{item.desc}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleStandardMethod(item.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? "bg-indigo-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="pt-3 border-t border-gray-150 space-y-2 text-left">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase block text-left">Ícone / Imagem Personalizada</span>
                        <span className="text-gray-400 font-medium text-[9px] block text-right">Tamanho recomendado: 48x48 px (quadrado)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                        {/* Option A: Upload local image */}
                        <div className="flex flex-col gap-1 text-left">
                          <span className="text-gray-400 font-semibold block text-left">Subir Imagem Local:</span>
                          <label className="flex items-center justify-center gap-1.5 border border-dashed border-gray-250 rounded-lg py-1.5 px-2.5 hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                            <Upload className="w-3 h-3 text-gray-400" />
                            <span className="font-bold text-gray-600 text-[10px]">Escolher Ficheiro</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === "string") {
                                      const currentIcons = cmsConfig.standardMethodIcons || {};
                                      const updatedIcons = { ...currentIcons, [item.id]: reader.result };
                                      const updated = { ...cmsConfig, standardMethodIcons: updatedIcons };
                                      updateCMSConfig(updated);
                                      saveCMSConfig(updated);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Option B: Direct URL / Link */}
                        <div className="flex flex-col gap-1 text-left">
                          <span className="text-gray-400 font-semibold block text-left">Ou colar URL/Link:</span>
                          <input
                            type="text"
                            placeholder="https://link-da-imagem.png"
                            value={(cmsConfig.standardMethodIcons?.[item.id] || "").startsWith("data:") ? "" : (cmsConfig.standardMethodIcons?.[item.id] || "")}
                            onChange={(e) => {
                              const val = e.target.value;
                              const currentIcons = cmsConfig.standardMethodIcons || {};
                              const updatedIcons = { ...currentIcons, [item.id]: val };
                              const updated = { ...cmsConfig, standardMethodIcons: updatedIcons };
                              updateCMSConfig(updated);
                              saveCMSConfig(updated);
                            }}
                            className="bg-white border rounded-lg px-2 py-1.5 font-mono text-[9px] focus:outline-none focus:border-indigo-500 w-full"
                          />
                        </div>
                      </div>

                      {/* Option C: Quick Emojis selection */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[9px] text-gray-400 font-semibold mr-1">Rápido (Emoji):</span>
                        {["📱", "🏦", "💸", "💳", "🏛️", "💵", "🪙", "🔥"].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              const currentIcons = cmsConfig.standardMethodIcons || {};
                              const updatedIcons = { ...currentIcons, [item.id]: emoji };
                              const updated = { ...cmsConfig, standardMethodIcons: updatedIcons };
                              updateCMSConfig(updated);
                              saveCMSConfig(updated);
                            }}
                            className={`w-5 h-5 rounded flex items-center justify-center hover:bg-gray-200 transition-colors ${
                              customIcon === emoji ? "bg-indigo-100 border border-indigo-400 scale-110" : ""
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                        {customIcon && (customIcon.startsWith("http") || customIcon.startsWith("data:")) && (
                          <button
                            onClick={() => {
                              const currentIcons = cmsConfig.standardMethodIcons || {};
                              const { [item.id]: _, ...rest } = currentIcons;
                              const updated = { ...cmsConfig, standardMethodIcons: rest };
                              updateCMSConfig(updated);
                              saveCMSConfig(updated);
                            }}
                            className="px-1.5 py-0.5 ml-auto text-[9px] text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded transition-colors"
                          >
                            Repor Padrão
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Método de Pagamento Manual e Contas Bancárias */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3">
              <div>
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest">Método de Pagamento Manual</h4>
                <p className="text-gray-400 text-[11px] mt-0.5">Permita pagamentos por depósito/transferência bancária com envio de comprovativo.</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">Activar Pagamentos Manuais:</span>
                  <button
                    onClick={() => {
                      const updated = { ...cmsConfig, enableManualPayments: cmsConfig.enableManualPayments !== false ? false : true };
                      updateCMSConfig(updated);
                      saveCMSConfig(updated);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      cmsConfig.enableManualPayments !== false ? "bg-emerald-600" : "bg-gray-250"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        cmsConfig.enableManualPayments !== false ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
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
                    setPaymentIcon("");
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-colors"
                >
                  Cadastrar Banco
                </button>
              </div>
            </div>

            {editingPaymentId && (
              <div className="p-4 bg-gray-55 border border-gray-200 rounded-xl space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nome Exibição (ex: Transferência BFA)" value={paymentName} onChange={e => setPaymentName(e.target.value)} className="bg-white border rounded-xl px-3 py-2 w-full font-bold" />
                  <input type="text" placeholder="Nome Banco (ex: BFA, BAI)" value={paymentBankName} onChange={e => setPaymentBankName(e.target.value)} className="bg-white border rounded-xl px-3 py-2" />
                  <input type="text" placeholder="Titular da Conta" value={paymentAccountHolder} onChange={e => setPaymentAccountHolder(e.target.value)} className="bg-white border rounded-xl px-3 py-2" />
                  <input type="text" placeholder="IBAN" value={paymentIban} onChange={e => setPaymentIban(e.target.value)} className="bg-white border rounded-xl px-3 py-2 font-mono" />
                  <input type="text" placeholder="Número de Conta" value={paymentAccountNumber} onChange={e => setPaymentAccountNumber(e.target.value)} className="bg-white border rounded-xl px-3 py-2 font-mono sm:col-span-2" />
                  <textarea placeholder="Instruções Adicionais" value={paymentInstructions} onChange={e => setPaymentInstructions(e.target.value)} className="bg-white border rounded-xl p-3 sm:col-span-2" rows={2} />
                  
                  {/* Custom Bank Logo Uploader - No suggestions, completely administered by admin */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Logotipo / Ícone do Banco (Gerido pelo Administrador)</label>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                      {paymentIcon ? (
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-150">
                          {isImage(paymentIcon) ? (
                            <img src={paymentIcon} alt="Logo do Banco" className="w-12 h-12 object-contain rounded-lg bg-white border p-1" />
                          ) : (
                            <span className="text-2xl bg-white border rounded-lg p-2.5 shadow-sm">{paymentIcon}</span>
                          )}
                          <div className="flex-1 text-left">
                            <p className="text-xs font-bold text-gray-700">Ícone definido</p>
                            <p className="text-[10px] text-gray-400">Este ícone será exibido aos clientes no checkout.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPaymentIcon("")}
                            className="text-xs text-red-500 hover:text-red-700 font-bold"
                          >
                            Remover
                          </button>
                        </div>
                      ) : (
                        <div className="text-left text-[11px] text-gray-400 py-1">
                          Nenhum logotipo adicionado. Faça o upload de um arquivo ou digite um link direto.
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* File Upload Option */}
                        <div className="space-y-1 text-left">
                          <span className="text-[10px] font-semibold text-gray-500 block">Carregar arquivo de imagem</span>
                          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors">
                            <Upload className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-650 font-bold">Subir Logotipo / Ícone</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === "string") {
                                      setPaymentIcon(reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Direct URL / Emoji Input Option */}
                        <div className="space-y-1 text-left">
                          <span className="text-[10px] font-semibold text-gray-500 block">Ou insira URL / Texto alternativo</span>
                          <input
                            type="text"
                            placeholder="Ex: https://link-da-imagem.png ou 🏦"
                            value={paymentIcon}
                            onChange={(e) => setPaymentIcon(e.target.value)}
                            className="w-full bg-white border rounded-xl px-3 py-2 text-xs text-gray-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setEditingPaymentId(null)} className="px-3 py-1 bg-gray-250 hover:bg-gray-200 transition-colors rounded text-[11px] font-bold">Cancelar</button>
                  <button 
                    onClick={() => {
                      if (!paymentName.trim() || !paymentBankName.trim()) return;
                      const list = [...cmsConfig.paymentMethods];
                      
                      const finalPM: any = {
                        id: editingPaymentId === "new" ? `pm-${Date.now()}` : editingPaymentId,
                        bankName: paymentBankName,
                        accountHolder: paymentAccountHolder,
                        accountNumber: paymentAccountNumber,
                        iban: paymentIban,
                        instructions: paymentInstructions,
                        active: paymentActive,
                        icon: paymentIcon || "",
                        name: paymentName
                      };

                      if (editingPaymentId === "new") list.push(finalPM); else {
                        const idx = list.findIndex(p => p.id === editingPaymentId);
                        if (idx !== -1) list[idx] = finalPM;
                      }
                      const updated = { ...cmsConfig, paymentMethods: list };
                      updateCMSConfig(updated);
                      saveCMSConfig(updated).then(() => { setEditingPaymentId(null); alert("Banco salvo com sucesso!"); });
                    }}
                    className="px-4 py-1 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors rounded text-[11px] font-bold shadow-sm"
                  >
                    Salvar Banco
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {cmsConfig.paymentMethods.map(pm => (
                <div key={pm.id} className="border border-gray-150 rounded-xl p-4 bg-white space-y-2 text-left shadow-sm">
                  <div className="flex justify-between pb-1.5 border-b font-extrabold text-indigo-950 items-center">
                    <span className="flex items-center gap-1.5">
                      {isImage(pm.icon) ? (
                        <img src={pm.icon} alt="" className="w-6 h-6 object-contain rounded-md border" />
                      ) : (
                        <span className="text-base">{pm.icon || "🏦"}</span>
                      )}
                      <span>{(pm as any).name || pm.bankName}</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{pm.bankName}</span>
                  </div>
                  <p className="text-[11px] text-gray-500"><strong>Titular:</strong> {pm.accountHolder}</p>
                  <p className="font-mono text-[10px] text-gray-500"><strong>IBAN:</strong> {pm.iban}</p>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button onClick={() => {
                      setEditingPaymentId(pm.id);
                      setPaymentName((pm as any).name || pm.bankName);
                      setPaymentBankName(pm.bankName);
                      setPaymentAccountHolder(pm.accountHolder);
                      setPaymentAccountNumber(pm.accountNumber || "");
                      setPaymentIban(pm.iban || "");
                      setPaymentInstructions(pm.instructions || "");
                      setPaymentOrder((pm as any).order || 0);
                      setPaymentActive(pm.active);
                      setPaymentIcon(pm.icon || "");
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
