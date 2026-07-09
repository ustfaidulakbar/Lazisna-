import { useState, useEffect } from "react";
import { Compass, AlertCircle, Loader2 } from "lucide-react";

export default function QiblaCompass() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    // 1. Get location to calculate Qibla
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung oleh browser Anda");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Fetch Qibla direction from Aladhan API
          const response = await fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`);
          if (!response.ok) throw new Error("Gagal mengambil arah kiblat");
          
          const data = await response.json();
          setQiblaDirection(data.data.direction);
          setLoading(false);
        } catch (err) {
          console.error(err);
          setError("Gagal memuat arah kiblat. Pastikan Anda terhubung ke internet.");
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setError("Izin lokasi ditolak. Harap izinkan akses lokasi untuk menentukan arah kiblat.");
        setLoading(false);
      }
    );
  }, []);

  const requestOrientationPermission = async () => {
    // Specifically needed for iOS 13+ devices
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setHasPermission(true);
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setError("Izin sensor kompas ditolak oleh perangkat.");
        }
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat meminta izin kompas.");
      }
    } else {
      // Non iOS 13+ devices
      setHasPermission(true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      // Fallback for browsers that don't support absolute
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  const handleOrientation = (event: any) => {
    let alpha = event.webkitCompassHeading || Math.abs(event.alpha - 360);
    if (alpha) {
      setHeading(alpha);
    }
  };

  useEffect(() => {
    // Auto request on non-iOS if possible, or wait for user interaction
    if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      setHasPermission(true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Calculate rotation for the compass dial
  // We want the phone's top to point to heading, so dial rotates -heading
  const dialRotation = -heading;
  
  // Calculate where the Kaaba marker should be on the dial
  // It's fixed at the qiblaDirection relative to North
  const kaabaRotation = qiblaDirection || 0;

  // Check if phone is pointing close to Qibla (within 5 degrees)
  const isAligned = qiblaDirection !== null && Math.abs((heading - qiblaDirection + 360) % 360) < 5;

  return (
    <div className="pb-safe animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 min-h-screen">
      <div className="bg-slate-900 px-5 pt-8 pb-12 rounded-b-[2.5rem] text-white shrink-0 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
        <h2 className="text-2xl font-bold font-sans tracking-tight flex items-center gap-2 relative z-10">
          <Compass className="w-6 h-6 text-emerald-400" /> Kompas Kiblat
        </h2>
        <p className="text-slate-400 text-xs mt-1.5 relative z-10">
          Putar ponsel Anda hingga indikator sejajar dengan arah Ka'bah.
        </p>
      </div>

      <div className="px-5 -mt-6 relative z-20 pb-24">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center gap-3">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Menyesuaikan koordinat Ka'bah...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex flex-col items-center text-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-500 mb-1" />
            <p className="text-xs font-bold text-red-800">Sensor Tidak Aktif</p>
            <p className="text-[11px] text-red-600 mb-3">{error}</p>
            {!hasPermission && (
              <button 
                onClick={requestOrientationPermission}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"
              >
                Izinkan Akses Kompas
              </button>
            )}
          </div>
        ) : !hasPermission ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Aktivasi Kompas</p>
              <p className="text-[11px] text-slate-500 mt-1">Kami memerlukan akses sensor orientasi ponsel Anda untuk menunjukkan arah kiblat secara presisi.</p>
            </div>
            <button 
              onClick={requestOrientationPermission}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-3.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Aktifkan Sensor Kompas
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
            {/* Alignment glow */}
            <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${isAligned ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-emerald-500/10 blur-xl" />
            </div>

            <div className="text-center mb-8 relative z-10">
              <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${isAligned ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isAligned ? 'Arah Kiblat Tepat' : 'Putar Ponsel Anda'}
              </p>
              <h3 className="text-4xl font-mono font-black text-slate-800 mt-1 tracking-tighter">
                {Math.round(heading)}°
              </h3>
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Phone Indicator (Fixed, points up) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-1 h-8 bg-emerald-500 rounded-full z-20 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              
              {/* Compass Dial */}
              <div 
                className="w-full h-full rounded-full border-4 border-slate-100 bg-slate-50 relative transition-transform duration-100 ease-out shadow-inner"
                style={{ transform: `rotate(${dialRotation}deg)` }}
              >
                {/* Cardinal Directions */}
                <div className="absolute inset-0 flex flex-col justify-between items-center py-2 text-[10px] font-bold text-slate-400 font-mono">
                  <span className="text-red-500">N</span>
                  <span>S</span>
                </div>
                <div className="absolute inset-0 flex justify-between items-center px-2 text-[10px] font-bold text-slate-400 font-mono">
                  <span>W</span>
                  <span>E</span>
                </div>

                {/* Tick marks */}
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute inset-0"
                    style={{ transform: `rotate(${i * 30}deg)` }}
                  >
                    <div className={`mx-auto w-0.5 ${i % 3 === 0 ? 'h-3 bg-slate-300' : 'h-1.5 bg-slate-200'}`} />
                  </div>
                ))}

                {/* Kaaba Direction Marker */}
                {qiblaDirection !== null && (
                  <div 
                    className="absolute inset-0 transition-transform duration-500"
                    style={{ transform: `rotate(${kaabaRotation}deg)` }}
                  >
                    <div className="mx-auto w-10 h-10 -mt-1 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-emerald-500 shadow-lg relative">
                      <div className="w-4 h-4 bg-emerald-600 rotate-45 transform" />
                      <div className="absolute -top-6 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                        Kiblat {Math.round(qiblaDirection)}°
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
