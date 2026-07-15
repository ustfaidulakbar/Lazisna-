import React, { useState, useEffect } from "react";
import { Prayer } from "../types";
import { MessageSquare, Heart, ThumbsUp, Send, CheckCircle2, Moon, Calendar } from "lucide-react";
import { db, collection, onSnapshot, addDoc, doc, updateDoc, increment } from "../lib/firebase";

export default function PrayerWall() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [name, setName] = useState<string>("");
  const [prayerText, setPrayerText] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("Infaq");
  
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [postSuccess, setPostSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Track which prayers the current user has "Aamiined" in state (persisted per session)
  const [aminTrack, setAminTrack] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "prayers"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Prayer[];
      // sort descending by createdAt manually
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPrayers(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAmin = async (id: string) => {
    if (aminTrack[id]) return; // Allow only once per session

    try {
      await updateDoc(doc(db, "prayers", id), {
        aminCount: increment(1)
      });
      setAminTrack({ ...aminTrack, [id]: true });
    } catch (err) {
      console.error("Failed to send amin:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prayerText.trim()) {
      setErrorMsg("Nama dan pesan doa wajib diisi");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      await addDoc(collection(db, "prayers"), {
        name: name.substring(0, 50),
        prayer: prayerText.substring(0, 300),
        program: selectedProgram,
        createdAt: new Date().toISOString(),
        aminCount: 0
      });

      setName("");
      setPrayerText("");
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
    } catch (err) {
      setErrorMsg("Kesalahan jaringan. Gagal terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format timestamps gracefully in Indonesian
  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Dinding Do'a & Harapan</h3>
          <p className="text-[11px] text-slate-400">Saling mengaminkan doa kebaikan di antara donatur</p>
        </div>
      </div>

      {/* Post Prayer Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 border border-slate-200/60 space-y-3">
        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tulis Do'a Anda</p>
        
        {postSuccess && (
          <div className="bg-emerald-50 text-emerald-800 text-[11px] p-2 rounded-lg flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Do'a berhasil diterbitkan di dinding kebaikan!
          </div>
        )}
        
        {errorMsg && (
          <p className="text-[10px] text-red-500 font-semibold">{errorMsg}</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap / Hamba Allah"
              className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-emerald-500 focus:outline-none bg-white font-medium text-slate-600"
            >
              <option value="Zakat">Zakat</option>
              <option value="Infaq">Infaq</option>
              <option value="Wakaf">Wakaf</option>
              <option value="Sodaqoh">Sodaqoh</option>
              <option value="Hibah">Hibah</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={prayerText}
            onChange={(e) => setPrayerText(e.target.value)}
            placeholder="Tuliskan harapan, do'a, atau kesaksian Anda di sini..."
            rows={2}
            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-emerald-500 focus:outline-none pr-8 resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="absolute bottom-2.5 right-2 text-emerald-600 hover:text-emerald-700 hover:scale-105 active:scale-95 transition-all p-1 disabled:opacity-50"
            aria-label="Send Prayer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Prayers List */}
      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {loading && prayers.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Memuat berkah doa...</p>
          </div>
        ) : prayers.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">Belum ada doa tertulis. Jadilah yang pertama!</p>
        ) : (
          prayers.map((p) => (
            <div 
              key={p.id} 
              className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs hover:border-slate-200/80 transition-all space-y-2 text-left"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-800">{p.name}</span>
                  {p.program && (
                    <span className="ml-2 text-[9px] bg-slate-100 text-slate-500 py-0.5 px-1.5 rounded font-bold">
                      {p.program}
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 shrink-0">{formatTimeAgo(p.createdAt)}</span>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                "{p.prayer}"
              </p>

              <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span className="font-semibold text-slate-500">{p.aminCount}</span> orang mengaminkan
                </span>
                
                <button
                  onClick={() => handleAmin(p.id)}
                  disabled={aminTrack[p.id]}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold py-1 px-3 rounded-full transition-all active:scale-95 ${
                    aminTrack[p.id]
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  {aminTrack[p.id] ? "Sudah Diaminkan" : "Aamiinkan"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
