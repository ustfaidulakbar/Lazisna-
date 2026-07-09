import React from 'react';
import { Video, Calendar, Clock, User, ExternalLink } from 'lucide-react';

export default function KajianOnline() {
  const KAJIAN_LIST = [
    {
      id: 1,
      title: "Kajian Fiqih Kontemporer: Zakat & Wakaf Produktif",
      ustadz: "Ust. M Faidul Akbar S.s.,M.Ag",
      date: "Jumat, 10 Juli 2026",
      time: "20:00 - 21:30 WITA",
      zoomLink: "https://zoom.us/j/123456789",
      topic: "Fiqih Muamalah",
      status: "upcoming"
    },
    {
      id: 2,
      title: "Tafsir Al-Qur'an Tematik: Membangun Generasi Rabbani",
      ustadz: "Syeikh Abdullah Helmy Al Azhari",
      date: "Ahad, 12 Juli 2026",
      time: "06:00 - 07:30 WITA",
      zoomLink: "https://zoom.us/j/987654321",
      topic: "Tafsir",
      status: "upcoming"
    },
    {
      id: 3,
      title: "Kajian Muslimah: Peran Ibu dalam Pendidikan Anak",
      ustadz: "Ust. M Faidul Akbar S.s.,M.Ag",
      date: "Selasa, 14 Juli 2026",
      time: "16:00 - 17:30 WITA",
      zoomLink: "https://zoom.us/j/567890123",
      topic: "Keluarga Islami",
      status: "upcoming"
    }
  ];

  return (
    <div className="p-5 space-y-5 pb-24">
      <div className="text-left space-y-1">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Video className="w-6 h-6 text-blue-600" />
          Kajian Online Zoom
        </h2>
        <p className="text-xs text-slate-500 leading-snug">Jadwal kajian rutin interaktif bersama asatidz Lazisna untuk menambah wawasan keislaman.</p>
      </div>

      <div className="space-y-4">
        {KAJIAN_LIST.map((kajian) => (
          <div key={kajian.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block mb-1.5 uppercase tracking-wider">{kajian.topic}</span>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">{kajian.title}</h3>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{kajian.ustadz}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{kajian.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{kajian.time}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-2">
                <button 
                  onClick={() => window.open(kajian.zoomLink, '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Ikut Kajian via Zoom <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
