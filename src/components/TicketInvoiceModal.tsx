import React, { useState } from "react";
import { Order } from "../types";
import { Download, Printer, X, FileText, Ticket as TicketIcon, Check, Copy } from "lucide-react";
import QRCodeGenerator from "./QRCodeGenerator";

interface TicketInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "ticket" | "invoice";
}

export default function TicketInvoiceModal({
  order,
  isOpen,
  onClose,
  initialTab = "ticket",
}: TicketInvoiceModalProps) {
  const [activeTab, setActiveTab] = useState<"ticket" | "invoice">(initialTab);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    // We trigger browser printing.
    // Our print CSS rules will hide the rest of the application and print only the active document.
    window.print();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
    }).format(value);
  };

  const subtotal = order.quantity * order.unitPrice;
  const discount = order.discountAmount || 0;
  const total = order.totalPrice;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="relative bg-zinc-900 border border-zinc-850 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="space-y-1">
            <h3 className="font-sans font-black text-lg text-white">Documentos Digitais</h3>
            <p className="text-xs text-gray-400">Ref. Transação: <span className="font-mono text-indigo-400">{order.orderNumber}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-450 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-3 bg-zinc-900/50 border-b border-zinc-800 flex gap-2">
          <button
            onClick={() => setActiveTab("ticket")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ticket"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <TicketIcon className="w-4 h-4" />
            <span>🎟️ Bilhetes de Entrada ({order.tickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("invoice")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "invoice"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>🧾 Factura Simplificada</span>
          </button>
        </div>

        {/* Printable Area Shell */}
        <div className="flex-grow overflow-y-auto p-6 bg-zinc-950/40">
          
          {/* Active Document Canvas (Printed Element) */}
          <div className="printable-document bg-white text-zinc-900 p-8 rounded-2xl border border-zinc-200 shadow-sm max-w-2xl mx-auto">
            
            {/* TICKET TAB VIEW */}
            {activeTab === "ticket" && (
              <div className="space-y-8">
                {order.tickets.map((t, index) => (
                  <div 
                    key={t.id} 
                    className={`pb-8 ${
                      index < order.tickets.length - 1 
                        ? "border-b border-dashed border-gray-300 relative" 
                        : ""
                    }`}
                  >
                    {/* Ticket Header card */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100">
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          INGRESSO OFICIAL • {order.ticketTypeName}
                        </span>
                        <h4 className="text-base font-extrabold text-gray-900 leading-tight">{order.eventTitle}</h4>
                        <p className="text-[11px] text-gray-500 font-semibold">{order.eventDate} • {order.eventLocation}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Código do Bilhete</p>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-indigo-700">
                          <span>{t.ticketCode}</span>
                          <button 
                            onClick={() => handleCopyCode(t.ticketCode)}
                            className="no-print p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-650"
                            title="Copiar Código"
                          >
                            {copiedCode === t.ticketCode ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Body Layout */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-5">
                      {/* Left: Participant & Event Details */}
                      <div className="space-y-3.5 text-left flex-grow">
                        <div>
                          <p className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Titular / Participante</p>
                          <p className="text-sm font-bold text-gray-900">{t.participantName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Comprador</p>
                          <p className="text-xs text-gray-650 font-semibold">{order.userName} ({order.userEmail})</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-1">
                          <div>
                            <p className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Transação Ref</p>
                            <p className="text-xs font-mono font-bold text-gray-800">{order.orderNumber}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-450 uppercase font-bold tracking-wider font-sans">Canal de Venda</p>
                            <p className="text-xs font-bold text-gray-800">Online</p>
                          </div>
                        </div>
                      </div>

                      {/* Right: QR Code for Scanner Validation */}
                      <div className="shrink-0 flex flex-col items-center p-3 bg-gray-50 rounded-xl border border-gray-150">
                        <QRCodeGenerator value={t.ticketCode} size={110} />
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-2">Check-in via QR Code</span>
                      </div>
                    </div>

                    {/* Scissor Cutting Line Indicator */}
                    {index < order.tickets.length - 1 && (
                      <div className="no-print absolute -bottom-3.5 left-0 right-0 flex items-center justify-center">
                        <span className="bg-white px-2 text-gray-400 text-[10px] font-bold flex items-center gap-1">
                          ✂️ Cortar aqui para separar bilhetes
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* INVOICE TAB VIEW */}
            {activeTab === "invoice" && (
              <div className="space-y-6 text-left">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-250">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-indigo-700 tracking-tight">INGRESSOS ANGOLA</h2>
                    <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                      Ingressos Angola, S.A.<br />
                      NIF: 540899201<br />
                      Avenida Lenine, Edifício Tour, Piso 3<br />
                      Luanda, Angola
                    </p>
                  </div>
                  <div className="text-right space-y-1 sm:max-w-xs">
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide border border-emerald-100">
                      FACTURA SIMPLIFICADA
                    </span>
                    <h4 className="text-xs font-black text-gray-900 pt-1.5">Nº FT {order.orderNumber.replace("ORD-", "2026/")}</h4>
                    <p className="text-[10px] text-gray-550">Data de Emissão: {new Date(order.createdAt).toLocaleDateString("pt-AO")} {new Date(order.createdAt).toLocaleTimeString("pt-AO", {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-[10px] text-gray-550">Regime Geral de IVA</p>
                  </div>
                </div>

                {/* Buyer Client Details */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-150 space-y-1.5 text-xs">
                  <h5 className="font-bold text-[10px] text-gray-450 uppercase tracking-wider pb-1 border-b border-gray-200">Adquirente (Cliente)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-750 font-medium">
                    <p><span className="font-bold text-gray-800">Nome:</span> {order.userName}</p>
                    <p><span className="font-bold text-gray-800">NIF:</span> Consumidor Final</p>
                    <p><span className="font-bold text-gray-800">Email:</span> {order.userEmail}</p>
                    {order.buyerPhone && <p><span className="font-bold text-gray-800">Telemóvel:</span> {order.buyerPhone}</p>}
                  </div>
                </div>

                {/* Items Invoice Table */}
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider text-[9px] font-bold border-b border-gray-250">
                    <tr>
                      <th className="py-2.5 px-3">Item / Descrição</th>
                      <th className="py-2.5 px-3 text-center">Quant.</th>
                      <th className="py-2.5 px-3 text-right">Preço Unit.</th>
                      <th className="py-2.5 px-3 text-right">Taxa IVA</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
                    <tr>
                      <td className="py-3 px-3">
                        <p className="font-bold text-gray-900">{order.eventTitle}</p>
                        <p className="text-[10px] text-gray-450">Ingresso: {order.ticketTypeName}</p>
                      </td>
                      <td className="py-3 px-3 text-center">{order.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">{formatCurrency(order.unitPrice)}</td>
                      <td className="py-3 px-3 text-right">14% (S/ Isenção)</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">{formatCurrency(subtotal)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Invoice Summary Totals */}
                <div className="border-t border-gray-200 pt-4 flex justify-end">
                  <div className="w-full sm:w-64 space-y-2 text-xs">
                    <div className="flex justify-between font-semibold text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-mono">{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between font-bold text-emerald-600">
                        <span>Desconto</span>
                        <span className="font-mono">-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-gray-600">
                      <span>IVA Incluído (14%)</span>
                      <span className="font-mono">{formatCurrency(Math.floor(total * 0.14))}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-600 pb-2 border-b border-gray-100">
                      <span>Imposto de Selo (0.5%)</span>
                      <span className="font-mono">{formatCurrency(Math.floor(total * 0.005))}</span>
                    </div>
                    <div className="flex justify-between font-black text-gray-900 text-sm">
                      <span>Total Pago</span>
                      <span className="font-mono text-indigo-700">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown details */}
                <div className="pt-4 border-t border-gray-150 text-[10px] text-gray-500 space-y-1">
                  <p><span className="font-bold">Método de Liquidação:</span> {order.paymentMethod} (Aprovado)</p>
                  <p><span className="font-bold">Data de Liquidação:</span> {new Date(order.createdAt).toLocaleDateString("pt-AO")}</p>
                  <p className="text-[9px] text-gray-450 italic pt-2 font-semibold">
                    * Os bilhetes são pessoais e transmissíveis sob responsabilidade do adquirente. Não são efetuados reembolsos após o check-in ou após o início do evento.<br />
                    * Processado por programa computadorizado validado sob nº 192/AGT. Ingressos Angola.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Actions Footer Panel */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 font-medium text-center sm:text-left">
            Clique em Imprimir para gerar o documento físico ou guardar como PDF no seu dispositivo.
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
