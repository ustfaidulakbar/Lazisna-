import { useState } from "react";
import { ArrowLeft, Send, CheckCircle2, Award, Heart, ShieldCheck, Users, UsersRound, Star } from "lucide-react";

export default function AgentRegistration({ onRegister, onBack }: { onRegister: () => void, onBack: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", reason: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    // Persist agent status locally so it stays active
    localStorage.setItem("lazisna_is_agent", "true");
    setTimeout(() => {
      onRegister();
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen pb-16 relative text-left">
      {/* Sticky Header */}
      <div className="bg-white sticky top-0 px-4 py-4 border-b border-slate-100 flex items-center gap-3 z-10 shadow-3xs">
        <button 
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-all text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-extrabold text-slate-800 text-sm">
            Rijal Lazisna
          </h2>
          <p className="text-[10px] text-emerald-600 font-bold">
            Pejuang Kebaikan Syari'ah
          </p>
        </div>
      </div>

      {!showForm ? (
        /* PROMOTION / MOTIVATION SCREEN */
        <div className="space-y-6 animate-fade-in">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-6 rounded-b-[2rem] relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12" />
            <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/20 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
              Program Mulia Rijal Lazisna
            </span>
            <h1 className="text-xl font-black mt-3 leading-tight font-sans tracking-tight">
              Menjadi Bagian dari Syiar Kebaikan & Dakwah Ekonomi Syari'ah
            </h1>
            <p className="text-xs text-emerald-100/90 mt-2 font-light leading-relaxed">
              "Dan hendaklah di antara kamu ada segolongan orang yang menyeru kepada kebajikan, menyuruh (berbuat) yang makruf..." (QS. Ali 'Imran: 104)
            </p>
          </div>

          <div className="px-5 space-y-6">
            {/* Core Verse Citation */}
            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl text-center space-y-1">
              <p className="text-xs text-amber-800 font-medium italic">
                "Siapa yang menunjukkan kepada kebaikan, maka ia memperoleh pahala yang sama seperti orang yang melakukannya."
              </p>
              <p className="text-[10px] text-amber-600 font-bold font-mono">
                — HR. Muslim
              </p>
            </div>

            {/* Why Join Accordion/Grid */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-800 text-sm">
                Kenapa Harus Bergabung Menjadi Rijal Lazisna?
              </h3>
              
              <div className="grid gap-3">
                {/* Benefit 1 */}
                <div className="bg-white border border-slate-150 p-3.5 rounded-2xl flex gap-3.5 shadow-2xs">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 h-fit">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Aliran Pahala Jariyah</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Setiap rupiah donasi, zakat, atau infaq yang disalurkan melalui syiar Anda, akan terus mengalirkan pahala jariyah tanpa batas untuk Anda.
                    </p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="bg-white border border-slate-150 p-3.5 rounded-2xl flex gap-3.5 shadow-2xs">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0 h-fit">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Bisyarah & Dukungan Dakwah</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Dapatkan komisi syar'i (bisyarah) bulanan yang halal untuk mendukung operasional dakwah dan kesejahteraan keluarga Anda secara profesional.
                    </p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="bg-white border border-slate-150 p-3.5 rounded-2xl flex gap-3.5 shadow-2xs">
                  <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl shrink-0 h-fit">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Pembekalan Ilmu & Sertifikasi</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Dapatkan bimbingan fiqih zakat dan digital marketing eksklusif dari asatidz Lazisna untuk meningkatkan kompetensi dakwah Anda.
                    </p>
                  </div>
                </div>

                {/* Benefit 4 */}
                <div className="bg-white border border-slate-150 p-3.5 rounded-2xl flex gap-3.5 shadow-2xs">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0 h-fit">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Dampak Sosial Nyata</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Menjadi ujung tombak penyelamat umat dhuafa, yatim piatu, dan pembangunan pesantren di pelosok Lombok secara nyata dan amanah.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial / Quote Banner */}
            <div className="bg-white border border-slate-150 p-4 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <img src="https://ui-avatars.com/api/?name=Ust+Faidul&background=059669&color=fff&size=64" alt="Ustadz Faidul" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-[10px] font-bold text-slate-800">Ust. M Faidul Akbar, M.Ag</p>
                  <p className="text-[8px] text-slate-400">Dewan Pengawas Syariah Lazisna</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed font-light">
                "Rijal Lazisna bukan sekadar profesi biasa, melainkan ikatan ukhuwah pejuang dakwah sosial yang sangat mulia. Kita menyatukan harta orang kaya untuk menyeka air mata kaum dhuafa."
              </p>
            </div>

            {/* Call To Action Buttons */}
            <div className="space-y-3 pt-3">
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
              >
                Mulai Syiar & Daftar Sekarang
                <Send className="w-4 h-4" />
              </button>
              
              <button
                onClick={onBack}
                className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl text-xs transition-all"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* REGISTRATION FORM SCREEN */
        <div className="p-5 space-y-6 animate-fade-in">
          {step === 1 ? (
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                  <UsersRound className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-base text-slate-800">Formulir Pendaftaran Agen</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                  Lengkapi data diri Anda di bawah ini. Tim Lazisna akan memvalidasi data Anda dalam waktu maksimal 1x24 jam.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap Anda</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white text-slate-800" 
                    placeholder="Masukkan nama sesuai KTP..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nomor WhatsApp Aktif</label>
                  <input 
                    required 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white text-slate-800" 
                    placeholder="Contoh: 081234567890" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Domisili Sekarang</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white text-slate-800" 
                    placeholder="Masukkan alamat lengkap & kec/kab..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Motivasi & Pengalaman Singkat</label>
                  <textarea 
                    required 
                    value={formData.reason} 
                    onChange={e => setFormData({...formData, reason: e.target.value})} 
                    className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white text-slate-800" 
                    rows={3} 
                    placeholder="Kenapa Anda ingin menjadi Rijal Lazisna?" 
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all"
                  >
                    Kembali
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 transition-all"
                  >
                    Kirim Formulir <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-12 space-y-4 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
              </div>
              <h3 className="font-extrabold text-base text-slate-800">Pendaftaran Berhasil Terkirim!</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                Alhamdulillah, pendaftaran Anda sebagai <strong>Rijal Lazisna</strong> telah masuk ke dalam antrean review dewan pengawas. Dashboard Agen Anda sedang disiapkan...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
