import React, { useState } from 'react';
import { Plane, Star, Gift, CheckCircle, Ticket, Lock, ArrowRight, User } from 'lucide-react';

interface UmrohSweepstakesProps {
  memberLevel: string;
  totalDonation: number;
  userName: string;
}

export default function UmrohSweepstakes({ memberLevel, totalDonation, userName }: UmrohSweepstakesProps) {
  const [isRegistered, setIsRegistered] = useState(
    localStorage.getItem('lazisna_umroh_registered') === 'true'
  );

  const GOLD_THRESHOLD = 50000000;
  const isGold = totalDonation >= GOLD_THRESHOLD;
  const progressPercent = Math.min((totalDonation / GOLD_THRESHOLD) * 100, 100);

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleRegister = () => {
    if (isGold) {
      localStorage.setItem('lazisna_umroh_registered', 'true');
      setIsRegistered(true);
      alert('Alhamdulillah, Anda berhasil terdaftar dalam undian Umroh Lazisna!');
    } else {
      alert('Maaf, fitur ini khusus untuk Member Gold.');
    }
  };

  return (
    <div className="p-5 space-y-5 pb-24">
      <div className="text-left space-y-1">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Plane className="w-6 h-6 text-emerald-600" />
          Undian Umroh Lazisna
        </h2>
        <p className="text-xs text-slate-500 leading-snug">Program apresiasi khusus Member Gold Lazisna berupa hadiah ibadah Umroh gratis setiap tahunnya.</p>
      </div>

      {!isGold ? (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Lock className="w-24 h-24 text-amber-500 transform rotate-12" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="font-bold text-slate-800">Menuju Member Gold</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[85%]">
              Tingkatkan terus sedekah dan infaq Anda hingga mencapai Rp 50 Juta untuk membuka akses pendaftaran Undian Umroh gratis.
            </p>
            
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">Total Donasi Anda</span>
                <span className="text-amber-600">{formatRp(totalDonation)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-1000 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
              <div className="text-right text-[9px] text-slate-400 font-medium">
                Target: Rp 50.000.000
              </div>
            </div>
          </div>
        </div>
      ) : !isRegistered ? (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-5 shadow-lg text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 opacity-20 transform translate-x-4 -translate-y-4">
            <Gift className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-4">
            <div>
              <span className="bg-amber-400 text-amber-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-2 inline-block">Khusus Member Gold</span>
              <h3 className="text-lg font-bold leading-tight">Anda Memenuhi Syarat!</h3>
              <p className="text-[11px] text-emerald-100 mt-1 max-w-[85%]">
                Masya Allah, total donasi Anda telah mencapai Rp 50 Juta. Silakan daftarkan diri Anda untuk mengikuti undian keberangkatan Umroh.
              </p>
            </div>
            
            <button 
              onClick={handleRegister}
              className="bg-white text-emerald-800 font-bold text-sm w-full py-3 rounded-xl shadow hover:bg-emerald-50 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Ticket className="w-4 h-4" />
              Daftar Undian Sekarang
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-bold text-emerald-800 text-lg">Terdaftar Aktif</h3>
            <p className="text-xs text-emerald-700/80 max-w-[200px] mx-auto">
              Anda telah terdaftar sebagai peserta Undian Umroh Lazisna periode ini.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 p-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiket Undian</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3 fill-amber-500" /> GOLD TICKET</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Peserta</p>
                  <p className="text-sm font-bold text-slate-800">{userName || 'Hamba Allah'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">ID Member</p>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-0.5">LZS-{new Date().getFullYear()}-G{(Math.random() * 1000).toFixed(0).padStart(3, '0')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Tgl Undian</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">25 Ramadhan 1446 H</p>
                </div>
                <div className="col-span-2 pt-2">
                   <p className="text-[10px] text-slate-400 font-bold uppercase">Estimasi Berangkat</p>
                   <p className="text-sm font-bold text-emerald-700 mt-0.5">Syawal 1446 H (Jika Terpilih)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800 mb-1">Syarat & Ketentuan Umum:</h4>
        <ul className="list-disc pl-4 space-y-1.5 opacity-80">
          <li>Undian hanya berlaku untuk Member Lazisna tingkat Gold Plus (akumulasi donasi ≥ Rp 50 Juta).</li>
          <li>Pengundian dilakukan secara transparan melalui Live Zoom dan Sosial Media resmi Lazisna.</li>
          <li>Pemenang akan dihubungi langsung oleh admin Lazisna untuk proses dokumen.</li>
          <li>Hadiah tidak dapat diuangkan, namun dapat dipindahtangankan kepada keluarga inti.</li>
        </ul>
      </div>
    </div>
  );
}
