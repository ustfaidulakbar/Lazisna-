import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Heart, CheckCircle2 } from 'lucide-react';

interface ReceiptProps {
  donorName: string;
  amount: number;
  programTitle: string;
  category: string;
  donationType: string;
  itemType?: string;
  itemDescription?: string;
  date: string;
  receiptNumber: string;
}

export default function DonationReceipt({
  donorName,
  amount,
  programTitle,
  category,
  donationType,
  itemType,
  itemDescription,
  date,
  receiptNumber
}: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    
    try {
      setIsGenerating(true);
      const element = receiptRef.current;
      
      // We need to temporarily make it visible for html2canvas to render it properly if it was hidden, 
      // but we will render it visible inside an absolute off-screen container.
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Kwitansi_Donasi_Lazisna_${receiptNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDownloadPdf}
        disabled={isGenerating}
        className="w-full mt-4 bg-white border border-emerald-600 text-emerald-700 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all hover:bg-emerald-50 active:scale-[0.99] disabled:opacity-70"
      >
        <Download className="w-4 h-4" />
        {isGenerating ? "Membuat PDF..." : "Download Resi PDF"}
      </button>

      {/* Hidden Receipt Element for PDF Generation */}
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none" style={{ width: '600px' }}>
        <div 
          ref={receiptRef} 
          className="bg-white p-10 text-slate-800 font-sans border-t-8 border-t-emerald-600 w-full"
          style={{ width: '600px', minHeight: '800px' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-emerald-800 tracking-tight">LAZISNA</h1>
                <p className="text-xs text-slate-500 font-medium">Lembaga Amil Zakat Nasional</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-800">KWITANSI DONASI</h2>
              <p className="text-xs text-slate-500 font-mono mt-1">No: {receiptNumber}</p>
              <p className="text-xs text-slate-500 mt-1">{date}</p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-6">
            <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 flex items-start gap-4">
               <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
               </div>
               <div>
                 <p className="text-sm font-semibold text-emerald-800 mb-1">Terima Kasih atas Donasi Anda</p>
                 <p className="text-xs text-emerald-700/80 leading-relaxed">
                   Alhamdulillah, donasi Anda telah kami terima dan tercatat dalam sistem Lazisna. 
                   Semoga Allah SWT membalas kebaikan Anda dengan pahala yang berlipat ganda.
                 </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Diterima Dari</p>
                <p className="text-base font-bold text-slate-800">{donorName || "Hamba Allah"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Kategori Program</p>
                <p className="text-base font-bold text-slate-800">{category}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Program Penyaluran</p>
               <p className="text-lg font-bold text-emerald-700">{programTitle}</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Detail Donasi</p>
              
              {donationType === "Uang" ? (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600">Total Nilai Donasi Uang</span>
                  <span className="text-2xl font-black text-emerald-600">{formatRp(amount)}</span>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-sm font-semibold text-slate-600">Bentuk Donasi</span>
                    <span className="text-base font-bold text-slate-800">Barang</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-sm font-semibold text-slate-600">Jenis Barang</span>
                    <span className="text-base font-bold text-slate-800">{itemType}</span>
                  </div>
                  <div className="flex justify-between items-start pt-1">
                    <span className="text-sm font-semibold text-slate-600">Keterangan / Jumlah</span>
                    <span className="text-sm font-bold text-emerald-700 text-right max-w-[250px]">{itemDescription}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-slate-400 italic mb-1">Dokumen ini diterbitkan secara digital dan sah.</p>
              <p className="text-xs font-semibold text-slate-600">Lazisna Indonesia</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 mb-6">Petugas Verifikasi</p>
              <div className="border-b border-slate-300 w-32 mx-auto mb-1"></div>
              <p className="text-xs font-bold text-slate-700">Admin Lazisna</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
