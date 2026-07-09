import { useState, useEffect } from "react";
import { Clock, MapPin, Compass, AlertCircle, Loader2 } from "lucide-react";

interface PrayerTime {
  name: string;
  time: string;
  id: string;
}

export default function PrayerTimes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("Mencari lokasi...");
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung oleh browser Anda");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Fetch prayer times from Aladhan API
          const date = new Date();
          const timestamp = Math.floor(date.getTime() / 1000);
          
          const response = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=11`); // 11 is Majelis Ulama Indonesia
          
          if (!response.ok) throw new Error("Gagal mengambil data waktu shalat");
          
          const data = await response.json();
          const timings = data.data.timings;
          
          setPrayerTimes([
            { id: "fajr", name: "Subuh", time: timings.Fajr },
            { id: "dhuhr", name: "Dzuhur", time: timings.Dhuhr },
            { id: "asr", name: "Ashar", time: timings.Asr },
            { id: "maghrib", name: "Maghrib", time: timings.Maghrib },
            { id: "isha", name: "Isya", time: timings.Isha }
          ]);
          
          // Attempt to get location name via reverse geocoding (OpenStreetMap Nominatim)
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
            const geoData = await geoRes.json();
            
            // Try to find the city or district name
            const city = geoData.address.city || geoData.address.town || geoData.address.county || geoData.address.state;
            setLocationName(city || "Lokasi Saat Ini");
          } catch (e) {
            setLocationName("Lokasi Anda");
          }
          
          setLoading(false);
        } catch (err) {
          console.error(err);
          setError("Gagal memuat waktu shalat. Pastikan Anda terhubung ke internet.");
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setError("Izin lokasi ditolak. Harap izinkan akses lokasi untuk melihat waktu shalat yang akurat.");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const getNextPrayer = () => {
    if (prayerTimes.length === 0) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMin;
    
    for (const prayer of prayerTimes) {
      const [h, m] = prayer.time.split(":").map(Number);
      const prayerTotalMin = h * 60 + m;
      
      if (prayerTotalMin > currentTotalMin) {
        return prayer;
      }
    }
    
    // If all prayers today have passed, next is Subuh tomorrow
    return prayerTimes[0];
  };

  const nextPrayer = getNextPrayer();

  return (
    <div className="pb-safe animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 min-h-screen">
      <div className="bg-emerald-600 px-5 pt-8 pb-12 rounded-b-[2.5rem] text-white shrink-0 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
        <h2 className="text-2xl font-bold font-sans tracking-tight flex items-center gap-2 relative z-10">
          <Clock className="w-6 h-6" /> Waktu Shalat
        </h2>
        <div className="flex items-center gap-1.5 mt-2 relative z-10">
          <MapPin className="w-3.5 h-3.5 text-emerald-200" />
          <p className="text-emerald-50 text-[11px] uppercase tracking-wider font-bold">
            {locationName}
          </p>
        </div>
        
        <div className="mt-8 text-center relative z-10">
          <p className="text-4xl font-mono font-black tracking-tighter">{formatCurrentTime(currentTime)}</p>
          <p className="text-emerald-100 text-xs mt-1 font-medium">{new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20 pb-24">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center gap-3">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Mendeteksi lokasi Anda...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex flex-col items-center text-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-500 mb-1" />
            <p className="text-xs font-bold text-red-800">Gagal Memuat Data</p>
            <p className="text-[11px] text-red-600">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-2xs">
            {prayerTimes.map((prayer, index) => {
              const isNext = nextPrayer?.id === prayer.id;
              
              return (
                <div 
                  key={prayer.id} 
                  className={`flex justify-between items-center p-4 rounded-xl transition-all ${
                    isNext ? "bg-emerald-50 border border-emerald-100" : "hover:bg-slate-50 border border-transparent"
                  } ${index !== prayerTimes.length - 1 && !isNext ? "border-b border-b-slate-100 rounded-none" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isNext ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isNext ? "text-emerald-800" : "text-slate-700"}`}>
                        {prayer.name}
                      </p>
                      {isNext && <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Waktu Berikutnya</p>}
                    </div>
                  </div>
                  <div className={`text-lg font-mono font-bold ${isNext ? "text-emerald-700" : "text-slate-600"}`}>
                    {prayer.time}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
