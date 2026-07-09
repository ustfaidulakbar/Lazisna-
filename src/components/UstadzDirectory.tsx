import React, { useState, useEffect } from 'react';
import { Users, MapPin, Phone, MessageCircle, Instagram, Youtube } from 'lucide-react';
import { Ustadz } from '../types';

export default function UstadzDirectory() {
  const [ustadzList, setUstadzList] = useState<Ustadz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ustadz')
      .then((res) => res.json())
      .then((data) => {
        setUstadzList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch ustadz directory:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-5 space-y-5 pb-24">
      <div className="text-left space-y-1">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Direktori Ustaz Lazisna
        </h2>
        <p className="text-xs text-slate-500 leading-snug">Daftar asatidz Lazisna yang dapat Anda undang untuk kajian, konsultasi syariah, atau majelis taklim.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          Lokasi Lembaga Lazisna
        </h3>
        <p className="text-xs text-slate-600 leading-snug">
          Jl. Rurung Teros, No.1, Ds. Teko, Kec. Pringgabaya, Lombok Timur, Nusa Tenggara Barat
        </p>
        <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.3370335882654!2d116.63470397576562!3d-8.563539891479868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dccf800366a5035%3A0x5a18a8b13c77d079!2sPringgabaya%2C%20Kabupaten%20Lombok%20Timur%2C%20Nusa%20Tenggara%20Bar.!5e0!3m2!1sid!2sid!4v1707998495000!5m2!1sid!2sid" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <button 
          onClick={() => window.open('https://maps.google.com/?q=-8.563539891479868,116.63470397576562', '_blank')}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <MapPin className="w-3.5 h-3.5" /> Buka di Google Maps
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {ustadzList.map((ustadz) => (
            <div key={ustadz.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col gap-4">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <Users className="w-20 h-20" />
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <img src={ustadz.image} alt={ustadz.name} className="w-16 h-16 rounded-full border-2 border-indigo-100 object-cover" />
                <div>
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mb-1 uppercase tracking-wider">{ustadz.specialization}</span>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight">{ustadz.name}</h3>
                  
                  <div className="flex items-center gap-3 mt-1.5">
                    {ustadz.ig && (
                      <span className="flex items-center gap-1 text-[9px] font-medium text-pink-600">
                        <Instagram className="w-3 h-3" /> {ustadz.ig}
                      </span>
                    )}
                    {ustadz.yt && (
                      <span className="flex items-center gap-1 text-[9px] font-medium text-red-600">
                        <Youtube className="w-3 h-3" /> {ustadz.yt}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 relative z-10 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600 leading-tight">{ustadz.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-600 font-medium">{ustadz.wa}</span>
                </div>
              </div>

              <div className="relative z-10">
                <button 
                  onClick={() => window.open(`https://wa.me/62${ustadz.wa.substring(1)}?text=Assalamu'alaikum%20${encodeURIComponent(ustadz.name)},%20saya%20ingin%20mengundang%20Ustadz%20untuk%20mengisi%20kajian...`, '_blank')}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" /> Hubungi via WhatsApp
                </button>
              </div>
            </div>
          ))}

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mt-6 text-center">
            <p className="text-xs text-indigo-800 font-medium leading-relaxed">
              Ingin menambahkan Ustadz ke dalam direktori? Silakan hubungi admin Lazisna.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
