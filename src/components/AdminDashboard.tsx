import React, { useState, useEffect } from "react";
import { BankAccount, DonationRecord, NewsReport, SystemNotification, Program, Ustadz } from "../types";
import { 
  ShieldAlert, Settings, Receipt, Newspaper, Bell, Plus, Trash2, 
  Check, X, Eye, FileSpreadsheet, CheckCircle, RefreshCw, AlertTriangle, 
  TrendingUp, Calendar, Heart, Wallet, User, ShieldCheck, HelpCircle, Edit3
} from "lucide-react";

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export default function AdminDashboard({ onBackToHome }: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"rekening" | "donasi" | "berita" | "notif" | "program" | "konten" | "rutin">("rekening");

  // State lists
  const [bankList, setBankList] = useState<BankAccount[]>([]);
  const [donationList, setDonationList] = useState<DonationRecord[]>([]);
  const [newsList, setNewsList] = useState<NewsReport[]>([]);
  const [notifList, setNotifList] = useState<SystemNotification[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [ustadzList, setUstadzList] = useState<Ustadz[]>([]);

  // Loading States
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Forms states
  const [showAddBank, setShowAddBank] = useState<boolean>(false);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    iconType: "bank" as "qris" | "bank" | "manual",
    isActive: true
  });

  const [showAddNews, setShowAddNews] = useState<boolean>(false);
  const [newsForm, setNewsForm] = useState({
    title: "",
    summary: "",
    category: "Laporan",
    image: ""
  });

  const [showAddNotif, setShowAddNotif] = useState<boolean>(false);
  const [notifForm, setNotifForm] = useState({
    title: "",
    content: "",
    type: "info" as "info" | "success" | "warning"
  });

  const [showAddUstadz, setShowAddUstadz] = useState<boolean>(false);
  const [ustadzForm, setUstadzForm] = useState({
    name: "",
    address: "",
    wa: "",
    specialization: "",
    image: "",
    ig: "",
    yt: ""
  });

  const DEFAULT_ROUTINE_INFAQS = [
    { id: "rutin-1", name: "Listrik Ponpes", amount: 100000, category: "Infaq", icon: "Zap", color: "text-amber-500", bg: "bg-amber-100" },
    { id: "rutin-2", name: "Santunan Yatim", amount: 50000, category: "Infaq", icon: "Heart", color: "text-rose-500", bg: "bg-rose-100" },
    { id: "rutin-3", name: "Santunan Lansia", amount: 100000, category: "Infaq", icon: "Users", color: "text-blue-500", bg: "bg-blue-100" },
    { id: "rutin-4", name: "Wakaf Tanah (/M)", amount: 300000, category: "Wakaf", icon: "Map", color: "text-indigo-500", bg: "bg-indigo-100" },
    { id: "rutin-5", name: "Gaji Pengasuh", amount: 200000, category: "Infaq", icon: "UserCheck", color: "text-emerald-500", bg: "bg-emerald-100" },
    { id: "rutin-6", name: "Beras Santri", amount: 15000, category: "Infaq", icon: "Package", color: "text-orange-500", bg: "bg-orange-100" },
    { id: "rutin-7", name: "Pembangunan", amount: 65000, category: "Wakaf", icon: "Hammer", color: "text-slate-500", bg: "bg-slate-100" },
    { id: "rutin-8", name: "Fasilitas Asrama", amount: 30000, category: "Infaq", icon: "Bed", color: "text-cyan-500", bg: "bg-cyan-100" },
    { id: "rutin-9", name: "Hadiah Santri", amount: 20000, category: "Infaq", icon: "Gift", color: "text-pink-500", bg: "bg-pink-100" }
  ];

  const [routineInfaqs, setRoutineInfaqs] = useState(DEFAULT_ROUTINE_INFAQS);
  const [showAddRutin, setShowAddRutin] = useState<boolean>(false);
  const [rutinForm, setRutinForm] = useState({
    id: "",
    name: "",
    amount: 50000,
    category: "Infaq",
    icon: "Heart",
    color: "text-emerald-500",
    bg: "bg-emerald-100"
  });

  // Load Admin Data on Mount
  useEffect(() => {
    fetchAdminData();
    const saved = localStorage.getItem("lazisna_routine_infaqs");
    if (saved) {
      try {
        setRoutineInfaqs(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [banksRes, donationsRes, newsRes, notifsRes, progsRes, ustadzRes] = await Promise.all([
        fetch("/api/bank-accounts"),
        fetch("/api/donations"),
        fetch("/api/news"),
        fetch("/api/notifications"),
        fetch("/api/programs"),
        fetch("/api/ustadz")
      ]);

      if (banksRes.ok && banksRes.headers.get("content-type")?.includes("application/json")) setBankList(await banksRes.json());
      if (donationsRes.ok && donationsRes.headers.get("content-type")?.includes("application/json")) setDonationList(await donationsRes.json());
      if (newsRes.ok && newsRes.headers.get("content-type")?.includes("application/json")) setNewsList(await newsRes.json());
      if (notifsRes.ok && notifsRes.headers.get("content-type")?.includes("application/json")) setNotifList(await notifsRes.json());
      if (progsRes.ok && progsRes.headers.get("content-type")?.includes("application/json")) setPrograms(await progsRes.json());
      if (ustadzRes.ok && ustadzRes.headers.get("content-type")?.includes("application/json")) setUstadzList(await ustadzRes.json());
    } catch (err) {
      console.error("Failed to load admin dataset:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Bank Account Handlers ---
  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountHolder) return;

    try {
      const res = await fetch("/api/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankForm)
      });
      if (res.ok) {
        const added = await res.json();
        setBankList([...bankList, added]);
        setShowAddBank(false);
        setBankForm({ bankName: "", accountNumber: "", accountHolder: "", iconType: "bank", isActive: true });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBankActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/bank-accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setBankList(bankList.map(b => b.id === id ? updated : b));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!window.confirm("Hapus rekening tujuan ini dari opsi pembayaran donatur?")) return;
    try {
      const res = await fetch(`/api/bank-accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBankList(bankList.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Donation Laporan Handlers ---
  const handleUpdateDonationStatus = async (id: string, newStatus: "Success" | "Rejected" | "Pending") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/donations/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setDonationList(donationList.map(d => d.id === id ? updated : d));
        // Refresh programs state since program amounts change
        const progsRes = await fetch("/api/programs");
        if (progsRes.ok) setPrograms(await progsRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (!window.confirm("Hapus catatan donasi ini selamanya? Tindakan ini akan membatalkan dana terkumpul jika donasi sukses.")) return;
    try {
      const res = await fetch(`/api/donations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDonationList(donationList.filter(d => d.id !== id));
        // Refresh program totals
        const progsRes = await fetch("/api/programs");
        if (progsRes.ok) setPrograms(await progsRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- News Handlers ---
  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.summary) return;

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newsForm,
          image: newsForm.image || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400"
        })
      });
      if (res.ok) {
        const added = await res.json();
        setNewsList([added, ...newsList]);
        setShowAddNews(false);
        setNewsForm({ title: "", summary: "", category: "Laporan", image: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm("Hapus tulisan berita / laporan penyaluran ini?")) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNewsList(newsList.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Notification Handlers ---
  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.content) return;

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifForm)
      });
      if (res.ok) {
        const added = await res.json();
        setNotifList([added, ...notifList]);
        setShowAddNotif(false);
        setNotifForm({ title: "", content: "", type: "info" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotifList(notifList.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgram = async (id: string, collectedAmount: number, donorsCount: number) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectedAmount, donorsCount })
      });
      if (res.ok) {
        // Update local state
        setPrograms(programs.map(p => p.id === id ? { ...p, collectedAmount, donorsCount } : p));
        alert("Program berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui program.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddUstadz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ustadzForm.name || !ustadzForm.wa) return;

    try {
      const res = await fetch("/api/ustadz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ustadzForm)
      });
      if (res.ok) {
        const added = await res.json();
        setUstadzList([added, ...ustadzList]);
        setShowAddUstadz(false);
        setUstadzForm({ name: "", address: "", wa: "", specialization: "", image: "", ig: "", yt: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUstadz = async (id: number) => {
    if (!window.confirm("Hapus ustadz ini dari direktori?")) return;
    try {
      const res = await fetch(`/api/ustadz/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUstadzList(ustadzList.filter(u => u.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRutin = (e: React.FormEvent) => {
    e.preventDefault();
    const newItems = [...routineInfaqs];
    if (rutinForm.id) {
      // Edit
      const idx = newItems.findIndex(i => i.id === rutinForm.id);
      if (idx !== -1) newItems[idx] = { ...rutinForm };
    } else {
      // Add
      newItems.push({ ...rutinForm, id: `rutin-${Date.now()}` });
    }
    setRoutineInfaqs(newItems);
    localStorage.setItem("lazisna_routine_infaqs", JSON.stringify(newItems));
    window.dispatchEvent(new Event('lazisna_routine_updated'));
    setShowAddRutin(false);
    setRutinForm({ id: "", name: "", amount: 50000, category: "Infaq", icon: "Heart", color: "text-emerald-500", bg: "bg-emerald-100" });
  };

  const handleDeleteRutin = (id: string) => {
    if (!window.confirm("Hapus item Infaq Rutin ini?")) return;
    const newItems = routineInfaqs.filter(i => i.id !== id);
    setRoutineInfaqs(newItems);
    localStorage.setItem("lazisna_routine_infaqs", JSON.stringify(newItems));
    window.dispatchEvent(new Event('lazisna_routine_updated'));
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Stats summaries
  const totalVerifiedRevenue = donationList
    .filter(d => d.status === "Success")
    .reduce((sum, d) => sum + d.amount, 0);

  const pendingCount = donationList.filter(d => d.status === "Pending").length;
  const verifiedCount = donationList.filter(d => d.status === "Success").length;

  // Visual Bar Chart Data Calculation (Donation Category Share)
  const categorySummary = donationList
    .filter(d => d.status === "Success")
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const maxCategoryAmount = Math.max(...(Object.values(categorySummary) as number[]), 1);

  return (
    <div className="bg-slate-50 min-h-screen text-left">
      {/* Admin Panel Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-5 sticky top-0 z-10 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-700/60 text-emerald-400 rounded-xl border border-slate-600/50">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
              Konsol Pengelola Lazisna <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">ADMIN</span>
            </h1>
            <p className="text-[10px] text-slate-300">Konfigurasi Rekening, Sahkan Laporan, & Notifikasi</p>
          </div>
        </div>
        <button
          onClick={onBackToHome}
          className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-100 py-1.5 px-3 rounded-lg font-bold border border-slate-600 transition-all active:scale-95"
        >
          Keluar Konsol
        </button>
      </div>

      <div className="p-4 space-y-5 pb-24">
        
        {/* Core Quick Stats Ticker */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Dana Terverifikasi</span>
            <span className="text-sm font-black text-emerald-600 mt-1 block">{formatRp(totalVerifiedRevenue)}</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Verifikasi Pending</span>
            <span className="text-sm font-black text-amber-500 mt-1 block flex items-center gap-1">
              {pendingCount} <span className="text-[9px] bg-amber-50 text-amber-800 py-0.5 px-1.5 rounded-full font-bold">Aksi</span>
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Muzakki Sukses</span>
            <span className="text-sm font-black text-slate-700 mt-1 block">{verifiedCount} Donatur</span>
          </div>
        </div>

        {/* Sub-Tabs Control bar */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-7 text-center overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveSubTab("rekening")}
            className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 ${
              activeSubTab === "rekening" ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Rekening</span>
          </button>
          <button
            onClick={() => setActiveSubTab("donasi")}
            className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 relative ${
              activeSubTab === "donasi" ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Laporan ZIS</span>
            {pendingCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("berita")}
            className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 ${
              activeSubTab === "berita" ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Editor Berita</span>
          </button>
          <button
            onClick={() => setActiveSubTab("notif")}
            className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 ${
              activeSubTab === "notif" ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifikasi</span>
          </button>
          <button
            onClick={() => setActiveSubTab("program")}
            className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 ${
              activeSubTab === "program" ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Program</span>
          </button>
          <button
            onClick={() => setActiveSubTab("konten")}
            className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 ${
              activeSubTab === "konten" ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Konten</span>
          </button>
          <button
            onClick={() => setActiveSubTab("rutin")}
            className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 ${
              activeSubTab === "rutin" ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Rutin</span>
          </button>
        </div>

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Sinkronisasi dataset pengelola...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* TAB 1: REKENING TUJUAN (BANK ACCOUNTS EDITOR) */}
            {activeSubTab === "rekening" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Daftar Rekening Tujuan</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Atur rekening bank, VA, dan scan QRIS resmi Yayasan Yasnawa</p>
                  </div>
                  <button
                    onClick={() => setShowAddBank(!showAddBank)}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Rekening Baru
                  </button>
                </div>

                {/* Form Add Account */}
                {showAddBank && (
                  <form onSubmit={handleAddBankAccount} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Tambah Rekening Tujuan</p>
                    
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Nama Bank / Jenis</label>
                        <input
                          type="text"
                          placeholder="Misal: Bank Syariah Indonesia (BSI)"
                          required
                          value={bankForm.bankName}
                          onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Nomor Rekening / VA</label>
                          <input
                            type="text"
                            placeholder="Misal: 7123456789"
                            required
                            value={bankForm.accountNumber}
                            onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Atas Nama (Pemegang)</label>
                          <input
                            type="text"
                            placeholder="LAZISNA YASNAWA"
                            required
                            value={bankForm.accountHolder}
                            onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Tipe Tampilan Ikon</label>
                          <select
                            value={bankForm.iconType}
                            onChange={(e) => setBankForm({ ...bankForm, iconType: e.target.value as any })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none bg-white font-medium"
                          >
                            <option value="bank">Simbol Kartu Kredit/Bank</option>
                            <option value="qris">Simbol Kode QRIS</option>
                            <option value="manual">Simbol WhatsApp Manual</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5 pt-4">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={bankForm.isActive}
                            onChange={(e) => setBankForm({ ...bankForm, isActive: e.target.checked })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <label htmlFor="isActive" className="text-[11px] font-bold text-slate-600 cursor-pointer">Aktifkan Langsung</label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddBank(false)}
                        className="text-slate-400 hover:text-slate-600 text-[10px] font-bold py-2 px-3"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-2 px-4 rounded-lg"
                      >
                        Simpan Rekening
                      </button>
                    </div>
                  </form>
                )}

                {/* List Bank Accounts */}
                <div className="space-y-3">
                  {bankList.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">Belum ada rekening terdaftar.</p>
                  ) : (
                    bankList.map((bank) => (
                      <div key={bank.id} className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800">{bank.bankName}</span>
                            <span className={`text-[8px] font-black uppercase py-0.5 px-1.5 rounded-full ${
                              bank.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-400"
                            }`}>
                              {bank.isActive ? "Aktif" : "Non-aktif"}
                            </span>
                          </div>
                          <p className="text-xs font-mono font-bold text-slate-600">{bank.accountNumber}</p>
                          <p className="text-[10px] text-slate-400">Atas Nama: <span className="font-bold">{bank.accountHolder}</span></p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleBankActive(bank.id, bank.isActive)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                              bank.isActive 
                                ? "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100"
                                : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                            }`}
                            title={bank.isActive ? "Nonaktifkan" : "Aktifkan"}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBank(bank.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: LAPORAN DONASI (DONATION RECORD EDITOR & CHARTS) */}
            {activeSubTab === "donasi" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Penyaluran & Verifikasi Dana</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sahkan bukti transfer donatur untuk mengalirkan dana amaliah ke program</p>
                </div>

                {/* Aesthetic Inline SVG Bar Chart for Laporan Category share */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> Share Distribusi Dana Berkah (Sukses)
                  </span>
                  
                  {Object.keys(categorySummary).length === 0 ? (
                    <p className="text-center text-[10px] text-slate-400 py-3">Belum ada donasi terverifikasi untuk chart.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {Object.entries(categorySummary).map(([cat, rawAmt]) => {
                        const amt = rawAmt as number;
                        const pct = (amt / maxCategoryAmount) * 100;
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-600">{cat}</span>
                              <span className="text-emerald-700">{formatRp(amt)}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full" 
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Donation list with Verify and Reject buttons */}
                <div className="space-y-3.5">
                  {donationList.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-8">Belum ada pengajuan donasi dari donatur.</p>
                  ) : (
                    donationList.map((rec) => (
                      <div 
                        key={rec.id} 
                        className={`bg-white p-4 rounded-xl border shadow-2xs space-y-3 text-left transition-all ${
                          rec.status === "Pending" ? "border-amber-200 bg-amber-50/10" : rec.status === "Success" ? "border-slate-100" : "border-red-100 bg-red-50/5"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] bg-slate-100 text-slate-500 py-0.5 px-1.5 rounded font-black uppercase">{rec.category}</span>
                            <h4 className="font-bold text-xs text-slate-800 mt-1">{rec.donorName}</h4>
                            <p className="text-[9px] text-slate-400">WA: <span className="font-semibold text-slate-600">{rec.donorWa}</span> | ID: <span className="font-mono">{rec.invoiceId}</span></p>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-800 block">{formatRp(rec.amount)}</span>
                            <span className={`inline-block text-[8px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                              rec.status === "Pending" ? "bg-amber-100 text-amber-800" : rec.status === "Success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}>
                              {rec.status === "Pending" ? "Pending" : rec.status === "Success" ? "Sukses" : "Ditolak"}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] bg-slate-50 p-2 rounded border border-slate-100 italic text-slate-500">
                          {rec.prayer ? `"${rec.prayer}"` : "(Tanpa doa tertulis)"}
                        </p>
                        
                        <div className="text-[10px] text-slate-400">
                          Program: <span className="font-bold text-slate-600">{rec.programTitle}</span>
                        </div>

                        {/* Verification controls */}
                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                          <span className="text-[9px] text-slate-400">Metode: <span className="font-semibold text-slate-500">{rec.paymentMethod}</span></span>
                          
                          <div className="flex gap-1.5">
                            {rec.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => handleUpdateDonationStatus(rec.id, "Success")}
                                  disabled={actionLoading === rec.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2.5 py-1.5 rounded flex items-center gap-1 transition-all"
                                >
                                  <Check className="w-3 h-3" /> Sahkan
                                </button>
                                <button
                                  onClick={() => handleUpdateDonationStatus(rec.id, "Rejected")}
                                  disabled={actionLoading === rec.id}
                                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[9px] px-2.5 py-1.5 rounded flex items-center gap-1 transition-all"
                                >
                                  <X className="w-3 h-3" /> Tolak
                                </button>
                              </>
                            )}

                            {rec.status !== "Pending" && (
                              <button
                                onClick={() => handleUpdateDonationStatus(rec.id, "Pending")}
                                className="text-slate-400 hover:text-slate-600 font-bold text-[9px] px-2 py-1"
                              >
                                Atur Ulang
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteDonation(rec.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-all"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: BERITA & LAPORAN PENYALURAN (EDITOR) */}
            {activeSubTab === "berita" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Editor Berita & Transparansi</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tuliskan kemajuan pembangunan dan laporan serah terima bantuan</p>
                  </div>
                  <button
                    onClick={() => setShowAddNews(!showAddNews)}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tulis Laporan
                  </button>
                </div>

                {/* Form Add News */}
                {showAddNews && (
                  <form onSubmit={handleAddNews} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Tulis Artikel Baru</p>
                    
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Judul Artikel</label>
                        <input
                          type="text"
                          placeholder="Misal: Penyaluran Sembako Berkah Terlaksana"
                          required
                          value={newsForm.title}
                          onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Kategori Tag</label>
                          <select
                            value={newsForm.category}
                            onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none bg-white font-medium"
                          >
                            <option value="Laporan">Laporan Penyaluran</option>
                            <option value="Pembangunan">Pembangunan</option>
                            <option value="Wakaf">Wakaf Program</option>
                            <option value="Pemberitaan">Kabar Berita</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Link Gambar Unsplash (Opsional)</label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={newsForm.image}
                            onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Isi Berita / Ringkasan</label>
                        <textarea
                          placeholder="Tulis ringkasan kemajuan program di sini dengan transparan..."
                          rows={3}
                          required
                          value={newsForm.summary}
                          onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddNews(false)}
                        className="text-slate-400 hover:text-slate-600 text-[10px] font-bold py-2 px-3"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-2 px-4 rounded-lg"
                      >
                        Terbitkan Laporan
                      </button>
                    </div>
                  </form>
                )}

                {/* News list */}
                <div className="space-y-3">
                  {newsList.map((news) => (
                    <div key={news.id} className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs flex gap-3 items-center">
                      <img src={news.image} alt={news.title} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] bg-slate-100 text-slate-500 py-0.5 px-1.5 rounded font-black uppercase">{news.category}</span>
                        <h4 className="font-bold text-xs text-slate-800 truncate mt-1">{news.title}</h4>
                        <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{news.summary}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteNews(news.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg shrink-0 transition-all"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: SYSTEM BROADCAST NOTIFICATIONS */}
            {activeSubTab === "notif" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Pemberitahuan Sistem</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Kirimkan notifikasi broadcast langsung ke dashboard seluruh donatur</p>
                  </div>
                  <button
                    onClick={() => setShowAddNotif(!showAddNotif)}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Kirim Notif
                  </button>
                </div>

                {/* Form Add Notification */}
                {showAddNotif && (
                  <form onSubmit={handleAddNotification} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Buat Broadcast Baru</p>
                    
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Judul Notifikasi</label>
                        <input
                          type="text"
                          placeholder="Misal: Laporan Audit 2026 Terbit"
                          required
                          value={notifForm.title}
                          onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Warna/Tipe Level</label>
                        <select
                          value={notifForm.type}
                          onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value as any })}
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none bg-white font-medium"
                        >
                          <option value="info">Info Umum (Biru / Default)</option>
                          <option value="success">Keberhasilan / Amanah (Hijau)</option>
                          <option value="warning">Penting / Mendesak (Kuning)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Isi Pesan Pendek</label>
                        <textarea
                          placeholder="Tuliskan berita darurat atau pesan penting singkat di sini..."
                          rows={2}
                          required
                          value={notifForm.content}
                          onChange={(e) => setNotifForm({ ...notifForm, content: e.target.value })}
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddNotif(false)}
                        className="text-slate-400 hover:text-slate-600 text-[10px] font-bold py-2 px-3"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-2 px-4 rounded-lg"
                      >
                        Broadcast Sekarang
                      </button>
                    </div>
                  </form>
                )}

                {/* Notifications list */}
                <div className="space-y-3">
                  {notifList.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">Belum ada pemberitahuan tersiar.</p>
                  ) : (
                    notifList.map((notif) => (
                      <div key={notif.id} className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              notif.type === "success" ? "bg-emerald-500" : notif.type === "warning" ? "bg-amber-400" : "bg-blue-500"
                            }`} />
                            <h4 className="font-bold text-xs text-slate-800">{notif.title}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{notif.content}</p>
                          <span className="text-[9px] text-slate-400 font-mono block pt-1">Siar: {new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: MANAGE PROGRAMS */}
            {activeSubTab === "program" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Pencapaian Program</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ubah total tersalur / terkumpul dan jumlah muzakki / donatur secara manual</p>
                </div>

                <div className="space-y-4">
                  {programs.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">Belum ada program terdaftar.</p>
                  ) : (
                    programs.map((prog) => (
                      <ProgramEditCard
                        key={prog.id}
                        program={prog}
                        onUpdate={handleUpdateProgram}
                        isLoading={actionLoading === prog.id}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: KONTEN - Ustadz Directory */}
            {activeSubTab === "konten" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Direktori Ustadz</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Kelola profil ustadz untuk ditampilkan di halaman aplikasi</p>
                  </div>
                  <button
                    onClick={() => setShowAddUstadz(!showAddUstadz)}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Ustadz
                  </button>
                </div>

                {/* Form Add Ustadz */}
                {showAddUstadz && (
                  <form onSubmit={handleAddUstadz} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Tambah Profil Ustadz</p>
                    
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Nama Ustadz</label>
                        <input
                          type="text"
                          placeholder="Misal: Ust. Ahmad Fulan"
                          required
                          value={ustadzForm.name}
                          onChange={(e) => setUstadzForm({ ...ustadzForm, name: e.target.value })}
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Keahlian (Specialization)</label>
                          <input
                            type="text"
                            placeholder="Misal: Fiqih"
                            value={ustadzForm.specialization}
                            onChange={(e) => setUstadzForm({ ...ustadzForm, specialization: e.target.value })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Nomor WhatsApp</label>
                          <input
                            type="text"
                            placeholder="Misal: 08123456789"
                            required
                            value={ustadzForm.wa}
                            onChange={(e) => setUstadzForm({ ...ustadzForm, wa: e.target.value })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Instagram (@username)</label>
                          <input
                            type="text"
                            placeholder="Misal: @ust.ahmad"
                            value={ustadzForm.ig}
                            onChange={(e) => setUstadzForm({ ...ustadzForm, ig: e.target.value })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Channel YouTube</label>
                          <input
                            type="text"
                            placeholder="Misal: Ahmad Official"
                            value={ustadzForm.yt}
                            onChange={(e) => setUstadzForm({ ...ustadzForm, yt: e.target.value })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Alamat Domisili</label>
                        <input
                          type="text"
                          placeholder="Misal: Lombok Timur"
                          value={ustadzForm.address}
                          onChange={(e) => setUstadzForm({ ...ustadzForm, address: e.target.value })}
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Link Foto (Opsional)</label>
                        <input
                          type="text"
                          placeholder="URL Image"
                          value={ustadzForm.image}
                          onChange={(e) => setUstadzForm({ ...ustadzForm, image: e.target.value })}
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddUstadz(false)}
                        className="text-slate-400 hover:text-slate-600 text-[10px] font-bold py-2 px-3"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-2 px-4 rounded-lg"
                      >
                        Simpan Ustadz
                      </button>
                    </div>
                  </form>
                )}

                {/* Ustadz List */}
                <div className="space-y-3">
                  {ustadzList.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">Belum ada ustadz terdaftar.</p>
                  ) : (
                    ustadzList.map((ustadz) => (
                      <div key={ustadz.id} className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs flex gap-3 items-center">
                        <img src={ustadz.image} alt={ustadz.name} className="w-12 h-12 object-cover rounded-full shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[8px] bg-slate-100 text-slate-500 py-0.5 px-1.5 rounded font-black uppercase">{ustadz.specialization}</span>
                          <h4 className="font-bold text-xs text-slate-800 truncate mt-1">{ustadz.name}</h4>
                          <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">WA: {ustadz.wa}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => {
                              setUstadzForm({
                                name: ustadz.name,
                                address: ustadz.address,
                                wa: ustadz.wa,
                                specialization: ustadz.specialization,
                                image: ustadz.image,
                                ig: ustadz.ig || "",
                                yt: ustadz.yt || ""
                              });
                              setShowAddUstadz(true);
                              handleDeleteUstadz(ustadz.id); // Simple edit approach: populate form and remove old
                            }}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg shrink-0 transition-all"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUstadz(ustadz.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg shrink-0 transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: INFAQ RUTIN */}
            {activeSubTab === "rutin" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Kelola Infaq Rutin</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Atur item Infaq Rutin yang tampil di beranda</p>
                  </div>
                  <button
                    onClick={() => {
                      setRutinForm({ id: "", name: "", amount: 50000, category: "Infaq", icon: "Heart", color: "text-emerald-500", bg: "bg-emerald-100" });
                      setShowAddRutin(!showAddRutin);
                    }}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Item
                  </button>
                </div>

                {/* Form Add/Edit Rutin */}
                {showAddRutin && (
                  <form onSubmit={handleAddRutin} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{rutinForm.id ? "Edit" : "Tambah"} Item Infaq Rutin</p>
                    
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Nama Item</label>
                        <input
                          type="text"
                          required
                          value={rutinForm.name}
                          onChange={(e) => setRutinForm({ ...rutinForm, name: e.target.value })}
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Kategori</label>
                          <select
                            value={rutinForm.category}
                            onChange={(e) => setRutinForm({ ...rutinForm, category: e.target.value })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                          >
                            <option value="Infaq">Infaq</option>
                            <option value="Zakat">Zakat</option>
                            <option value="Wakaf">Wakaf</option>
                            <option value="Fidyah">Fidyah</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Nominal Bawaan (Rp)</label>
                          <input
                            type="number"
                            required
                            value={rutinForm.amount}
                            onChange={(e) => setRutinForm({ ...rutinForm, amount: Number(e.target.value) })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Icon (Lucide)</label>
                          <select
                            value={rutinForm.icon}
                            onChange={(e) => setRutinForm({ ...rutinForm, icon: e.target.value })}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                          >
                            <option value="Heart">Heart</option>
                            <option value="Zap">Zap</option>
                            <option value="Users">Users</option>
                            <option value="Map">Map</option>
                            <option value="UserCheck">UserCheck</option>
                            <option value="Package">Package</option>
                            <option value="Hammer">Hammer</option>
                            <option value="Bed">Bed</option>
                            <option value="Gift">Gift</option>
                            <option value="Star">Star</option>
                            <option value="BookOpen">BookOpen</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Warna (Tailwind)</label>
                          <select
                            value={rutinForm.color}
                            onChange={(e) => {
                              const colorStr = e.target.value;
                              const bgStr = colorStr.replace("text-", "bg-").replace("-500", "-100");
                              setRutinForm({ ...rutinForm, color: colorStr, bg: bgStr });
                            }}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
                          >
                            <option value="text-amber-500">Amber</option>
                            <option value="text-rose-500">Rose</option>
                            <option value="text-blue-500">Blue</option>
                            <option value="text-indigo-500">Indigo</option>
                            <option value="text-emerald-500">Emerald</option>
                            <option value="text-orange-500">Orange</option>
                            <option value="text-slate-500">Slate</option>
                            <option value="text-cyan-500">Cyan</option>
                            <option value="text-pink-500">Pink</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddRutin(false)}
                        className="text-slate-400 hover:text-slate-600 text-[10px] font-bold py-2 px-3"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-2 px-4 rounded-lg"
                      >
                        Simpan Item
                      </button>
                    </div>
                  </form>
                )}

                {/* Rutin List */}
                <div className="space-y-3">
                  {routineInfaqs.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">Belum ada item Infaq Rutin.</p>
                  ) : (
                    routineInfaqs.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                          <div className={`w-10 h-10 rounded-xl flex justify-center items-center ${item.bg} ${item.color}`}>
                            <span className="text-xs font-bold">{item.icon}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{item.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.category} • Rp {item.amount.toLocaleString("id-ID")}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setRutinForm(item);
                              setShowAddRutin(true);
                            }}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg shrink-0 transition-all"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRutin(item.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg shrink-0 transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Helper Subcomponent for Program Editing
function ProgramEditCard({ 
  program, 
  onUpdate, 
  isLoading 
}: { 
  program: Program; 
  onUpdate: (id: string, collectedAmount: number, donorsCount: number) => Promise<void>;
  isLoading: boolean;
  key?: any;
}) {
  const [colAmt, setColAmt] = useState<number>(program.collectedAmount);
  const [donCount, setDonCount] = useState<number>(program.donorsCount);

  // Sync if prop updates
  useEffect(() => {
    setColAmt(program.collectedAmount);
    setDonCount(program.donorsCount);
  }, [program.collectedAmount, program.donorsCount]);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3.5">
      <div className="flex gap-3 items-start">
        <img src={program.image} alt={program.title} className="w-12 h-12 object-cover rounded-lg shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <span className="text-[8px] bg-emerald-50 text-emerald-700 py-0.5 px-1.5 rounded font-black uppercase tracking-wider">{program.category}</span>
          <h4 className="font-bold text-xs text-slate-800 mt-0.5 truncate">{program.title}</h4>
          <p className="text-[9px] text-slate-400 mt-0.5">{program.location || "Yasnawa"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1">Total Tersalur (Rp)</label>
          <input
            type="number"
            value={colAmt}
            onChange={(e) => setColAmt(Number(e.target.value))}
            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1">Jumlah Muzakki / Donatur</label>
          <input
            type="number"
            value={donCount}
            onChange={(e) => setDonCount(Number(e.target.value))}
            className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-slate-800 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
        <div className="text-[9px] text-slate-400">
          Target: <span className="font-semibold text-slate-600">Rp {program.targetAmount?.toLocaleString("id-ID")}</span>
        </div>
        <button
          onClick={() => onUpdate(program.id, colAmt, donCount)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black py-1.5 px-3 rounded-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Edit3 className="w-3 h-3" />
          )}
          <span>Simpan Perubahan</span>
        </button>
      </div>
    </div>
  );
}
