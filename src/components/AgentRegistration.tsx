import React, { useState } from "react";
import { Briefcase, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function AgentRegistration({ onRegister, onBack }: { onRegister: () => void, onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", reason: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    setTimeout(() => {
      onRegister();
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-10">
      <div className="bg-slate-50 sticky top-0 px-4 py-4 border-b border-slate-100 flex items-center gap-3 z-10">
        <button 
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-all text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-bold text-slate-800 text-sm">
            Pendaftaran Rijal Lazisna
          </h2>
          <p className="text-[10px] text-slate-400">
            Jadi Agen Kebaikan
          </p>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {step === 1 ? (
          <>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <Briefcase className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Bergabung Menjadi Agen</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Jadilah perpanjangan tangan kebaikan. Ajak orang lain berdonasi, tebarkan manfaat, dan dapatkan pahala jariyah serta komisi untuk mendukung syiar Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:border-emerald-500 focus:outline-none" placeholder="Masukkan nama Anda..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor WhatsApp</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:border-emerald-500 focus:outline-none" placeholder="08123456789" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alamat / Domisili</label>
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:border-emerald-500 focus:outline-none" placeholder="Kota Anda..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Motivasi Bergabung</label>
                <textarea required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:border-emerald-500 focus:outline-none" rows={3} placeholder="Ceritakan singkat motivasi Anda..." />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 transition-all mt-4">
                Kirim Pendaftaran <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Pendaftaran Berhasil!</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[250px] mx-auto">
              Alhamdulillah, pendaftaran Anda telah kami terima. Kami sedang menyiapkan Dashboard Agen Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
