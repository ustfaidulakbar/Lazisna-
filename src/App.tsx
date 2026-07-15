import UmrohSweepstakes from "./components/UmrohSweepstakes";
import KajianOnline from "./components/KajianOnline";
import UstadzDirectory from "./components/UstadzDirectory";
import React, { useState, useEffect } from "react";
import { DonationRecord, DonationCategory, Program, NewsReport, SystemNotification } from "./types";
import { PROGRAMS, NEWS_REPORTS } from "./data";

// Component imports
import Header from "./components/Header";
import ZakatCalculator from "./components/ZakatCalculator";
import DonationFlow from "./components/DonationFlow";
import PrayerWall from "./components/PrayerWall";
import AIConsultation from "./components/AIConsultation";
import DigitalLibrary from "./components/DigitalLibrary";
import TransparencyReport from "./components/TransparencyReport";
import PrayerTimes from "./components/PrayerTimes";
import QiblaCompass from "./components/QiblaCompass";
import MemberCard from "./components/MemberCard";
import AdminDashboard from "./components/AdminDashboard";
import AgentDashboard from "./components/AgentDashboard";
import AgentRegistration from "./components/AgentRegistration";

// Icons
import { 
  Home, Calculator, Sparkles, MessageSquare, User, Heart, 
  MapPin, Clock, ArrowRight, Share2, Info, ChevronRight, X, 
  CheckCircle, Globe, Shield, Coins, Gift, Building2, HandHeart,
  BookOpen, ShieldCheck, Compass, BadgeCheck, Star, Plane, Video, ShoppingBag, Users, Store, HelpCircle,
  Zap, Map, UserCheck, Package, Hammer, Bed, Plus
} from "lucide-react";
import { db, collection, onSnapshot, doc, setDoc, auth, onAuthStateChanged } from "./lib/firebase";

const IconMap: any = {
  Zap, Heart, Users, Map, UserCheck, Package, Hammer, Bed, Gift,
  Home, Calculator, Sparkles, MessageSquare, User, MapPin, Clock, ArrowRight, Share2, Info, ChevronRight, X,
  CheckCircle, Globe, Shield, Coins, Building2, HandHeart, BookOpen, ShieldCheck, Compass, BadgeCheck, Star, Plane, Video, ShoppingBag, Store, HelpCircle
};

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

export const getKindnessTier = (total: number) => {
  if (total >= 50000000) return { title: "Gold Plus", badge: "GOLD" };
  if (total >= 20000000) return { title: "Silver Plus", badge: "SILVER" };
  if (total >= 10000000) return { title: "Bronze Plus", badge: "BRONZE" };
  if (total > 0) return { title: "Member Tersertifikasi", badge: "BLUE_TICK" };
  return { title: "Penebar Senyum", badge: "NEW" };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"beranda" | "kalkulator" | "ustadz-ai" | "doa" | "akun" | "perpustakaan" | "transparansi" | "waktu-shalat" | "kiblat" | "undian" | "kajian" | "ustadz-list" | "agen">("beranda");
  const [aiInitialTab, setAiInitialTab] = useState<"chat" | "kalkulator">("chat");
  const [homeTab, setHomeTab] = useState<"umum" | "rutin">("umum");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<DonationCategory | "Semua">("Semua");
  const [pastDonations, setPastDonations] = useState<DonationRecord[]>([]);
  const [registeredMember, setRegisteredMember] = useState<{ name: string; wa: string; photo?: string } | null>(null);
  const [routineInfaqs, setRoutineInfaqs] = useState(DEFAULT_ROUTINE_INFAQS);
  
  // Agent state
  const [isAgent, setIsAgent] = useState(false);
  
  // States for initiating donation from elsewhere
  const [targetProgramId, setTargetProgramId] = useState<string | undefined>(undefined);
  const [targetCategory, setTargetCategory] = useState<DonationCategory | undefined>(undefined);
  const [targetAmount, setTargetAmount] = useState<number | undefined>(undefined);

  // Modal states
  const [selectedNews, setSelectedNews] = useState<NewsReport | null>(null);
  const [showNotificationAlert, setShowNotificationAlert] = useState<boolean>(false);
  const [isEditingRoutine, setIsEditingRoutine] = useState<boolean>(false);
  const [showAddRoutineModal, setShowAddRoutineModal] = useState<boolean>(false);
  const [newRoutineName, setNewRoutineName] = useState<string>("");
  const [newRoutineAmount, setNewRoutineAmount] = useState<number>(50000);

  // Dynamic state loaded from server
  const [isAdminActive, setIsAdminActive] = useState<boolean>(false);
  const [activePrograms, setActivePrograms] = useState<Program[]>(PROGRAMS);
  const [newsList, setNewsList] = useState<NewsReport[]>(NEWS_REPORTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [liveToast, setLiveToast] = useState<SystemNotification | null>(null);

  // Load state from LocalStorage on mount
  useEffect(() => {
    const loadRoutineInfaqs = () => {
      const saved = localStorage.getItem("lazisna_routine_infaqs");
      if (saved) {
        try {
          setRoutineInfaqs(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse routine infaqs", e);
        }
      }
    };
    loadRoutineInfaqs();

    window.addEventListener('lazisna_routine_updated', loadRoutineInfaqs);

    const savedDonations = localStorage.getItem("lazisna_donations");
    if (savedDonations) {
      try {
        setPastDonations(JSON.parse(savedDonations));
      } catch (e) {
        console.error("Failed to parse saved donations", e);
      }
    }

    const savedMember = localStorage.getItem("lazisna_member");
    if (savedMember) {
      try {
        setRegisteredMember(JSON.parse(savedMember));
      } catch (e) {
        console.error("Failed to parse saved member profile", e);
      }
    }

    const savedAgent = localStorage.getItem("lazisna_is_agent");
    if (savedAgent === "true") {
      setIsAgent(true);
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const memberData = {
          name: user.displayName || user.email || "Hamba Allah",
          wa: user.phoneNumber || "-",
          photo: user.photoURL || undefined
        };
        setRegisteredMember(memberData);
        localStorage.setItem("lazisna_member", JSON.stringify(memberData));
      }
    });

    // Monthly routine donation reminder check
    try {
      const settings = JSON.parse(localStorage.getItem("lazisna_settings") || "{}");
      if (settings.monthlyReminder && "Notification" in window && Notification.permission === "granted") {
        const today = new Date();
        const yearMonth = `${today.getFullYear()}-${today.getMonth()}`;
        const lastSent = localStorage.getItem("lazisna_last_monthly_reminder");
        
        // Notify if not sent this month and it's within the first 7 days
        if (lastSent !== yearMonth && today.getDate() <= 7) {
          new Notification("Waktunya Infaq Rutin 🌙", {
            body: "Mari sempurnakan awal bulan dengan menunaikan Infaq Rutin bulanan Anda. Tap untuk membuka aplikasi.",
            icon: "/icon.png" // Fallback to default if icon doesn't exist
          });
          localStorage.setItem("lazisna_last_monthly_reminder", yearMonth);
        }
      }
    } catch (e) {
      console.error("Failed to check monthly reminder", e);
    }

    // Weekly routine donation reminder check
    let weeklyReminderInterval: NodeJS.Timeout;
    try {
      const checkWeeklyReminder = () => {
        const settings = JSON.parse(localStorage.getItem("lazisna_settings") || "{}");
        if (settings.weeklyReminder && "Notification" in window && Notification.permission === "granted") {
          const today = new Date();
          const targetDay = settings.weeklyReminderDay ?? 5; // Default Friday
          const targetTime = settings.weeklyReminderTime ?? "09:00";
          
          if (today.getDay() === targetDay) {
            const currentHour = today.getHours().toString().padStart(2, '0');
            const currentMin = today.getMinutes().toString().padStart(2, '0');
            const currentTime = `${currentHour}:${currentMin}`;
            
            if (currentTime === targetTime) {
              const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
              const lastSentKey = `lazisna_weekly_rem_${dateStr}`;
              if (!localStorage.getItem(lastSentKey)) {
                new Notification("Saatnya Infaq Rutin 🕌", {
                  body: "Mari tunaikan infaq rutin mingguan Anda. Semoga Allah memberkahi rizki Anda.",
                  icon: "/icon.png"
                });
                localStorage.setItem(lastSentKey, "true");
              }
            }
          }
        }
      };
      
      // Check immediately
      checkWeeklyReminder();
      // Then check every minute
      weeklyReminderInterval = setInterval(checkWeeklyReminder, 60000);
    } catch (e) {
      console.error("Failed to setup weekly reminder", e);
    }

    return () => {
      window.removeEventListener('lazisna_routine_updated', loadRoutineInfaqs);
      if (weeklyReminderInterval) {
        clearInterval(weeklyReminderInterval);
      }
      unsubscribeAuth();
    };
  }, []);

  // Fetch reactive datasets from server (for real-time updates and notification broadcast)
  useEffect(() => {
    let previousNotifCount = 0;
    
    const unsubscribePrograms = onSnapshot(collection(db, "programs"), async (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Program[];
      if (list.length > 0) {
        setActivePrograms(list);
      } else {
        console.log("Seeding data since programs is empty...");
        try {
          const pPromises = PROGRAMS.map(p => setDoc(doc(db, "programs", p.id), p));
          const nPromises = NEWS_REPORTS.map(n => setDoc(doc(db, "news", n.id), n));
          await Promise.all([...pPromises, ...nPromises]);
          console.log("Seeded successfully");
        } catch (e) {
          console.error("Seeding error:", e);
        }
      }
    });

    const unsubscribeNews = onSnapshot(collection(db, "news"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NewsReport[];
      if (list.length > 0) setNewsList(list);
    });

    const unsubscribeNotifications = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SystemNotification[];
      setNotifications(list);
      
      if (previousNotifCount > 0 && list.length > previousNotifCount) {
        const newest = list[0]; // Assuming ordered by something, or just the first in array
        setLiveToast(newest);
        setTimeout(() => setLiveToast(null), 5000);
      }
      previousNotifCount = list.length;
    });

    return () => {
      unsubscribePrograms();
      unsubscribeNews();
      unsubscribeNotifications();
    };
  }, []);

  // Save donation to LocalStorage
  const handleDonationSuccess = (newRecord: DonationRecord) => {
    const updated = [newRecord, ...pastDonations];
    setPastDonations(updated);
    localStorage.setItem("lazisna_donations", JSON.stringify(updated));

    // Also update target values for programs if relevant
    const pId = newRecord.programId;
    const updatedPrograms = activePrograms.map(p => {
      if (p.id === pId) {
        return {
          ...p,
          collectedAmount: p.collectedAmount + newRecord.amount,
          donorsCount: p.donorsCount + 1
        };
      }
      return p;
    });
    setActivePrograms(updatedPrograms);

    const newTotal = updated
      .filter(d => d.status === "Success" || d.status === "Pending")
      .reduce((sum, d) => sum + d.amount, 0);
    const newTier = getKindnessTier(newTotal);

    setLiveToast({
      id: "toast-" + Date.now(),
      title: "Donasi Berhasil!",
      content: `Terima kasih atas donasi sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(newRecord.amount)}. Tingkat Kebaikan Anda kini: ${newTier.title}.`,
      createdAt: new Date().toISOString(),
      type: "success"
    });
    setTimeout(() => setLiveToast(null), 5000);
  };

  const handleRegisterSuccess = (name: string, wa: string, photo?: string) => {
    const memberData = { name, wa, photo };
    setRegisteredMember(memberData);
    localStorage.setItem("lazisna_member", JSON.stringify(memberData));
    
    // Automatically unlock the Umroh register and badge features by adding a dummy donation
    const currentTotal = pastDonations
      .filter(d => d.status === "Success" || d.status === "Pending")
      .reduce((sum, record) => sum + record.amount, 0);
      
    if (currentTotal < 50000000) {
      const dummyDonation: DonationRecord = {
        id: `DUMMY-${Date.now()}`,
        invoiceId: `INV-${Date.now()}`,
        date: new Date().toISOString(),
        donorName: name,
        donorWa: wa,
        amount: 50000000,
        programId: "p1",
        programTitle: "Bonus Pendaftaran Member Lazisna",
        category: "Infaq",
        paymentMethod: "Bonus",
        status: "Success"
      };
      const updated = [dummyDonation, ...pastDonations];
      setPastDonations(updated);
      localStorage.setItem("lazisna_donations", JSON.stringify(updated));
    }
  };

  // Launch donation checkout directly
  const handleLaunchDonation = (programId: string, cat?: DonationCategory, amt?: number) => {
    setTargetProgramId(programId);
    setTargetCategory(cat || "Infaq");
    setTargetAmount(amt || 50000);
    // Switch to a virtual tab called "donasi-flow"
    setActiveTab("beranda"); // Reset active main tab but trigger flow overlay
    setIsCheckoutOpen(true);
  };

  // Virtual checkout screen toggle
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const handleAddCustomRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName || newRoutineAmount < 10000) return;
    
    const newItem = {
      id: `custom-rutin-${Date.now()}`,
      name: newRoutineName,
      amount: newRoutineAmount,
      category: "Infaq",
      icon: "Heart",
      color: "text-emerald-500",
      bg: "bg-emerald-100"
    };

    const updated = [...routineInfaqs, newItem];
    setRoutineInfaqs(updated);
    localStorage.setItem("lazisna_routine_infaqs", JSON.stringify(updated));
    setShowAddRoutineModal(false);
    setNewRoutineName("");
    setNewRoutineAmount(50000);
  };

  const handleDeleteRoutine = (idxToDelete: number) => {
    const updated = routineInfaqs.filter((_, i) => i !== idxToDelete);
    setRoutineInfaqs(updated);
    localStorage.setItem("lazisna_routine_infaqs", JSON.stringify(updated));
  };

  // Determine Level of Kindness based on contribution
  const totalLifetimeDonation = pastDonations
    .filter(d => d.status === "Success" || d.status === "Pending")
    .reduce((sum, record) => sum + record.amount, 0);

  const userTier = getKindnessTier(totalLifetimeDonation);

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const urgentProgram = activePrograms[0] || PROGRAMS[0]; // Asrama PTQH NW Teko

  // Dynamic stats calculations based on actual donations
  const totalCollectedFromPrograms = pastDonations
    .filter(d => d.status === "Success")
    .reduce((sum, record) => sum + record.amount, 0);
  
  const totalDonorsFromPrograms = new Set(pastDonations.filter(d => d.status === "Success").map(d => d.donorName || "Hamba Allah")).size;

  const formatTersalur = (val: number) => {
    if (val >= 1000000000) {
      const num = val / 1000000000;
      return `${num.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Milyar`;
    }
    const num = val / 1000000;
    return `${num.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Juta`;
  };

  const formatDonaturCount = (val: number) => {
    return `${new Intl.NumberFormat("id-ID").format(val)} Aktif`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-stretch font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Surrounding Desktop Layout Details - visible only on larger displays */}
      <div className="hidden lg:flex flex-col justify-between w-80 p-8 shrink-0 self-center h-screen sticky top-0 text-slate-500">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-md">
              <HandHeart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Lazisna App</h2>
              <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Kebaikan Tanpa Batas</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed">
            Platform donasi modern, aman, dan transparan oleh Lembaga Amil Zakat, Infaq, Wakaf, & Sodaqoh Yasnawa. Mempermudah umat menyalurkan kepedulian langsung dari genggaman.
          </p>
        </div>

        <div className="space-y-3.5 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-2xs">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" /> Jaminan Syariah
          </h4>
          <div className="space-y-2 text-[11px]">
            <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> 100% Diaudit Dewan Syariah</p>
            <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Tersertifikasi Kementerian Agama</p>
            <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Sistem Konfirmasi WhatsApp Cepat</p>
          </div>
        </div>

        <div className="text-[10px] text-slate-400">
          <p>© 2026 LAZISNA Yasnawa.</p>
          <p className="mt-0.5">Seluruh hak cipta dilindungi undang-undang.</p>
        </div>
      </div>

      {/* Main Interactive App Container - max-width 480px, styled exactly like an elegant mobile device or focused widget */}
      <main className="w-full max-w-[480px] bg-slate-50 h-[100dvh] shadow-2xl relative flex flex-col justify-between overflow-hidden border-x border-slate-200/40">
        
        {/* Dynamic Real-Time Toast Notification Banner */}
        {liveToast && (
          <div className="absolute top-4 inset-x-4 bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl z-[100] flex items-start gap-3 border border-slate-800 transition-all duration-300">
            <div className={`p-1.5 rounded-lg shrink-0 ${
              liveToast.type === "warning" 
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                : liveToast.type === "success" 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            }`}>
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <span className="inline-block bg-slate-800 text-slate-300 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider mb-1">
                SIARAN PENGELOLA
              </span>
              <h5 className="text-xs font-bold leading-snug">{liveToast.title}</h5>
              <p className="text-[10px] text-slate-300 leading-normal mt-0.5">{liveToast.content}</p>
            </div>
            <button 
              onClick={() => setLiveToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Global Fixed Header */}
        {activeTab === "beranda" && !isAdminActive && !isCheckoutOpen && (
          <div className="absolute top-0 inset-x-0 z-50 shadow-sm">
            <Header 
              onNotificationClick={() => setShowNotificationAlert(true)} 
              isAgent={isAgent}
              onAgentClick={() => setActiveTab("agen")}
            />
          </div>
        )}

        {/* Content Area - scrolls independently */}
        <div className="flex-1 overflow-y-auto pb-24">
          
          {/* Virtual Admin overlay or checkout if active */}
          {isAdminActive ? (
            <AdminDashboard onBackToHome={() => setIsAdminActive(false)} />
          ) : isCheckoutOpen ? (
            <DonationFlow
              initialProgramId={targetProgramId}
              initialCategory={targetCategory}
              initialAmount={targetAmount}
              registeredMember={registeredMember}
              onBackToHome={() => {
                setIsCheckoutOpen(false);
                setTargetProgramId(undefined);
                setTargetCategory(undefined);
                setTargetAmount(undefined);
              }}
              onDonationSuccess={(record) => {
                handleDonationSuccess(record);
              }}
            />
          ) : (
            <>
              {/* DYNAMIC VIEWS SWITCHER */}
              
              {/* 1. HOME TAB */}
              {activeTab === "beranda" && (
                <>
                  <div className="space-y-5 px-5 pt-[220px] pb-12 relative z-10">
                  
                  {/* Kindness Member Dashboard Welcome banner */}
                  <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      {registeredMember ? (
                        <div className="flex items-center gap-3">
                          {registeredMember.photo ? (
                            <img src={registeredMember.photo} alt="Profile" className="w-12 h-12 rounded-full border-2 border-emerald-100 object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                              <User className="w-6 h-6 text-emerald-600" />
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selamat Datang,</p>
                            <h4 className="text-sm font-bold text-slate-800">{registeredMember.name}</h4>
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                              userTier.badge === "GOLD" ? "bg-amber-100 text-amber-700" :
                              userTier.badge === "SILVER" ? "bg-slate-200 text-slate-700" :
                              userTier.badge === "BRONZE" ? "bg-orange-100 text-orange-700" :
                              "bg-emerald-50 text-emerald-700"
                            }`}>
                              {userTier.badge === "GOLD" ? <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> : 
                               userTier.badge === "SILVER" ? <Star className="w-3 h-3 text-slate-500 fill-slate-500" /> : 
                               userTier.badge === "BRONZE" ? <Star className="w-3 h-3 text-orange-500 fill-orange-500" /> : 
                               userTier.badge === "BLUE_TICK" ? <BadgeCheck className="w-3 h-3 text-blue-500" /> :
                               <Star className="w-3 h-3" />}
                              {userTier.title}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Jadi Member Kebaikan</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Pantau donasi, doa, & kuitansi resmi Anda</p>
                        </div>
                      )}
                      
                      <button
                        onClick={() => setActiveTab("akun")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-sm ml-2 shrink-0"
                      >
                        {registeredMember ? "Profil" : "Daftar"}
                      </button>
                    </div>

                    {/* Progress to Gold for Umroh */}
                    {registeredMember && userTier.badge !== "GOLD" && (
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[9px] font-bold text-slate-500">Progress ke Member Gold (Undian Umroh)</span>
                          <span className="text-[9px] font-bold text-emerald-600">{Math.min(Math.round((totalLifetimeDonation / 50000000) * 100), 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-amber-400 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((totalLifetimeDonation / 50000000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Core Live Stats Ticker */}
                  <div className="grid grid-cols-3 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-xl p-3 shadow-sm text-center">
                    <div className="border-r border-white/10">
                      <p className="text-[9px] text-emerald-200">Total Tersalur</p>
                      <p className="text-xs font-black">{formatTersalur(totalCollectedFromPrograms)}</p>
                    </div>
                    <div className="border-r border-white/10">
                      <p className="text-[9px] text-emerald-200">Muzakki/Donatur</p>
                      <p className="text-xs font-black">{formatDonaturCount(totalDonorsFromPrograms)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-emerald-200">Audit Syariah</p>
                      <p className="text-xs font-black">100% WTP</p>
                    </div>
                  </div>

                  {/* Infaq Umum Card */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Kategori Infaq Umum</p>
                    <div className="grid grid-cols-4 gap-3">
                      <button 
                        onClick={() => handleLaunchDonation("zakat-umum", "Zakat")}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 hover:scale-105 active:scale-95 transition-all"
                      >
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold mb-1.5">
                          <Coins className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold">Zakat</span>
                      </button>

                      <button 
                        onClick={() => handleLaunchDonation("umum", "Infaq")}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 hover:scale-105 active:scale-95 transition-all"
                      >
                        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold mb-1.5">
                          <Coins className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold">Infaq</span>
                      </button>

                      <button 
                        onClick={() => handleLaunchDonation("asrama-ptqh", "Wakaf")}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 hover:scale-105 active:scale-95 transition-all"
                      >
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold mb-1.5">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold">Wakaf</span>
                      </button>

                      <button 
                        onClick={() => handleLaunchDonation("umum", "Sodaqoh")}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 hover:scale-105 active:scale-95 transition-all"
                      >
                        <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center font-bold mb-1.5">
                          <Gift className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold">Hibah</span>
                      </button>
                    </div>
                  </div>

                  {/* Infaq Rutin Card */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3 mt-3 relative">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Infaq Rutin Bulanan</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsEditingRoutine(!isEditingRoutine)}
                          className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md"
                        >
                          {isEditingRoutine ? "Selesai" : "Edit"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {routineInfaqs.map((item: any, idx: number) => {
                        const IconComp = IconMap[item.icon] || Gift;
                        return (
                          <div key={idx} className="relative">
                            <button
                              onClick={() => {
                                if (isEditingRoutine) {
                                  handleDeleteRoutine(idx);
                                } else {
                                  handleLaunchDonation(item.id, item.category as DonationCategory, item.amount);
                                }
                              }}
                              className={`w-full flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 hover:scale-105 active:scale-95 transition-all text-center ${isEditingRoutine ? "animate-pulse-subtle border-2 border-red-200" : ""}`}
                            >
                              <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-1.5`}>
                                <IconComp className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-bold leading-tight">{item.name}</span>
                              <span className="text-[9px] font-black text-emerald-600 mt-1">{formatRp(item.amount)}</span>
                            </button>
                            {isEditingRoutine && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md text-xs font-bold pointer-events-none">
                                ×
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {isEditingRoutine && (
                        <button
                          onClick={() => setShowAddRoutineModal(true)}
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 hover:bg-emerald-50 hover:border-emerald-300 text-slate-400 hover:text-emerald-600 transition-all text-center h-full min-h-[90px]"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mb-1">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold">Tambah</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add Routine Modal */}
                  {showAddRoutineModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Tambah Infaq Rutin</h3>
                        <form onSubmit={handleAddCustomRoutine} className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Kategori</label>
                            <input 
                              type="text" 
                              value={newRoutineName}
                              onChange={(e) => setNewRoutineName(e.target.value)}
                              placeholder="Misal: Infaq Jumat"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Nominal (Rp)</label>
                            <input 
                              type="number" 
                              value={newRoutineAmount}
                              onChange={(e) => setNewRoutineAmount(Number(e.target.value))}
                              min={10000}
                              step={1000}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                              required
                            />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button 
                              type="button" 
                              onClick={() => setShowAddRoutineModal(false)}
                              className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm"
                            >
                              Batal
                            </button>
                            <button 
                              type="submit" 
                              className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700"
                            >
                              Simpan
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Utility Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab("waktu-shalat")}
                      className="bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-2xl flex flex-col gap-2 shadow-2xs hover:scale-105 active:scale-95 transition-all text-left group overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl transform translate-x-4 -translate-y-4" />
                      <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold">Waktu Shalat</h4>
                        <p className="text-[9px] text-sky-100 mt-0.5">Sesuai Lokasi</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("kiblat")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl flex flex-col gap-2 shadow-2xs hover:scale-105 active:scale-95 transition-all text-left group overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl transform translate-x-4 -translate-y-4" />
                      <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                        <Compass className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold">Arah Kiblat</h4>
                        <p className="text-[9px] text-indigo-100 mt-0.5">Kompas Digital</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("perpustakaan")}
                      className="bg-slate-800 hover:bg-slate-900 text-white p-3 rounded-2xl flex flex-col gap-2 shadow-2xs hover:scale-105 active:scale-95 transition-all text-left group overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl transform translate-x-4 -translate-y-4" />
                      <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold">Perpustakaan</h4>
                        <p className="text-[9px] text-slate-300 mt-0.5">Buku & Modul Islami</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("transparansi")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl flex flex-col gap-2 shadow-2xs hover:scale-105 active:scale-95 transition-all text-left group overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl transform translate-x-4 -translate-y-4" />
                      <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold">Transparansi</h4>
                        <p className="text-[9px] text-emerald-100 mt-0.5">Laporan Penyaluran</p>
                      </div>
                    </button>
                  </div>

                  {/* Urgent Program Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-slate-800 text-sm">Program Mendesak</h3>
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full animate-pulse">Urgent</span>
                    </div>

                    <div className="bg-white rounded-2xl overflow-hidden border border-slate-150 shadow-sm text-left">
                      <div className="relative h-44 overflow-hidden">
                        <img 
                          src={urgentProgram.image} 
                          alt={urgentProgram.title} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                          {urgentProgram.category}
                        </div>
                        <div className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" /> {urgentProgram.location}
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs leading-snug">{urgentProgram.title}</h4>
                          <p className="text-[11px] text-slate-400 font-light mt-1 line-clamp-2">{urgentProgram.description}</p>
                        </div>

                        {/* Progress Bar and stats */}
                        <div className="space-y-1.5">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-full rounded-full" 
                              style={{ width: `${Math.min(100, (urgentProgram.collectedAmount / urgentProgram.targetAmount) * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <div>
                              <p className="text-slate-400">Terkumpul</p>
                              <p className="font-black text-emerald-600">{formatRp(urgentProgram.collectedAmount)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-400">Target</p>
                              <p className="font-bold text-slate-700">{formatRp(urgentProgram.targetAmount)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px]">
                          <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {urgentProgram.daysLeft} hari lagi</span>
                          <span className="text-slate-400 font-semibold">{urgentProgram.donorsCount} Donatur</span>
                        </div>

                        <button 
                          onClick={() => handleLaunchDonation(urgentProgram.id, urgentProgram.category)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl transition-all hover:translate-y-[-1px] active:translate-y-0"
                        >
                          Infaq Sekarang
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Zakat Calculator Quick Banner */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between text-left">
                    <div className="space-y-1">
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Kewajiban Syariah</span>
                      <h4 className="text-xs font-black text-slate-800">Sudah Waktunya Membayar Zakat?</h4>
                      <p className="text-[10px] text-slate-400 max-w-[200px] leading-tight">Gunakan kalkulator zakat otomatis untuk menghitung nisab tabungan & pendapatan bulanan Anda.</p>
                    </div>
                    <button
                      onClick={() => {
                        setAiInitialTab("kalkulator");
                        setActiveTab("ustadz-ai");
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md shadow-amber-600/10"
                      aria-label="Buka Kalkulator Zakat"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Other Active Programs Horizontal Carousel */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-slate-800 text-sm text-left">Program Kebaikan Lainnya</h3>
                    
                    {/* Category Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 hide-scrollbar">
                      {["Semua", "Zakat", "Infaq", "Wakaf", "Sodaqoh"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategoryFilter(cat as any)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${activeCategoryFilter === cat ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-3 -mx-5 px-5 hide-scrollbar">
                      {(activeCategoryFilter === "Semua" ? activePrograms.slice(1) : activePrograms.filter(p => p.category === activeCategoryFilter)).length === 0 ? (
                        <div className="w-full text-center py-6 text-slate-400 text-xs font-bold">
                          Tidak ada program di kategori ini.
                        </div>
                      ) : (
                        (activeCategoryFilter === "Semua" ? activePrograms.slice(1) : activePrograms.filter(p => p.category === activeCategoryFilter)).map((prog) => {
                          const pct = Math.round((prog.collectedAmount / prog.targetAmount) * 100);
                          return (
                          <div 
                            key={prog.id}
                            className="bg-white rounded-xl border border-slate-150 p-3 w-56 shrink-0 flex flex-col justify-between text-left shadow-2xs hover:border-slate-300 transition-all"
                          >
                            <div className="space-y-2">
                              <img src={prog.image} alt={prog.title} className="w-full h-24 object-cover rounded-lg" />
                              <span className="inline-block bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase">{prog.category}</span>
                              <h5 className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight h-8">{prog.title}</h5>
                            </div>

                            <div className="space-y-2 mt-3 pt-2 border-t border-slate-50">
                              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="text-slate-400">Terkumpul: <span className="font-bold text-slate-600">{pct}%</span></span>
                                <span className="text-emerald-600 font-bold">{formatRp(prog.collectedAmount)}</span>
                              </div>
                              <button
                                onClick={() => handleLaunchDonation(prog.id, prog.category)}
                                className="w-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[10px] font-bold py-1.5 rounded-lg transition-all"
                              >
                                Infaq
                              </button>
                            </div>
                          </div>
                        );
                      }))}
                    </div>
                  </div>

                  {/* Berkah Lazisna (Fitur Unggulan) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <h3 className="font-extrabold text-slate-800 text-sm text-left">Berkah Lazisna</h3>
                      </div>
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Fitur Unggulan</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveTab("undian")}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 p-3 rounded-2xl flex flex-col gap-2 shadow-2xs transition-all text-left group overflow-hidden relative border border-emerald-100/50"
                      >
                        <Plane className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-[11px] font-bold">Undian Umroh</h4>
                          <p className="text-[9px] text-emerald-600/70 mt-0.5 leading-tight">Berhadiah Umroh untuk Member</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab("kajian")}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-800 p-3 rounded-2xl flex flex-col gap-2 shadow-2xs transition-all text-left group overflow-hidden relative border border-blue-100/50"
                      >
                        <Video className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-[11px] font-bold">Kajian Online Zoom</h4>
                          <p className="text-[9px] text-blue-600/70 mt-0.5 leading-tight">Kajian rutin interaktif bersama asatidz</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setAiInitialTab("chat");
                          setActiveTab("ustadz-ai");
                        }}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 p-3 rounded-2xl flex flex-col gap-2 shadow-2xs transition-all text-left group overflow-hidden relative border border-amber-100/50"
                      >
                        <HelpCircle className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-[11px] font-bold">Konsultasi Syariah</h4>
                          <p className="text-[9px] text-amber-600/70 mt-0.5 leading-tight">Konsultasi seputar hukum Islam</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab("ustadz-list")}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 p-3 rounded-2xl flex flex-col gap-2 shadow-2xs transition-all text-left group overflow-hidden relative border border-indigo-100/50"
                      >
                        <Users className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-[11px] font-bold">Undang Ustaz</h4>
                          <p className="text-[9px] text-indigo-600/70 mt-0.5 leading-tight">List direktori asatidz Lazisna</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Amal Usaha / Online Store */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-rose-500" />
                      <h3 className="font-extrabold text-slate-800 text-sm text-left">Amal Usaha (Lazisna Mart)</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => alert("Membuka Lazisna Mart di Shopee...")} className="flex-1 bg-[#ee4d2d] text-white p-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 shadow hover:opacity-90 active:scale-95 transition-all">
                        <ShoppingBag className="w-3.5 h-3.5" /> Shopee
                      </button>
                      <button onClick={() => alert("Membuka Lazisna Mart di TikTok Shop...")} className="flex-1 bg-[#000000] text-white p-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 shadow hover:opacity-90 active:scale-95 transition-all">
                        <ShoppingBag className="w-3.5 h-3.5" /> TikTok
                      </button>
                      <button onClick={() => alert("Membuka Lazisna Mart di Tokopedia...")} className="flex-1 bg-[#42b549] text-white p-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 shadow hover:opacity-90 active:scale-95 transition-all">
                        <ShoppingBag className="w-3.5 h-3.5" /> Tokopedia
                      </button>
                    </div>
                  </div>

                  {/* News, Updates & Transparency Banner */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-slate-800 text-sm text-left">Berita & Laporan Penyaluran</h3>
                    <div className="flex gap-4 overflow-x-auto pb-3 -mx-5 px-5">
                      {newsList.map((news) => (
                        <button
                          key={news.id}
                          onClick={() => setSelectedNews(news)}
                          className="bg-white rounded-xl border border-slate-150 p-2.5 w-52 shrink-0 text-left shadow-2xs hover:border-slate-300 transition-all focus:outline-none"
                        >
                          <img src={news.image} alt={news.title} className="w-full h-24 object-cover rounded-lg" />
                          <div className="flex justify-between text-[8px] text-slate-400 font-semibold mt-2">
                            <span>{news.category}</span>
                            <span>{news.date}</span>
                          </div>
                          <h5 className="text-[10px] font-bold text-slate-800 line-clamp-2 mt-1 leading-snug">{news.title}</h5>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
                </>
              )}

              {/* 2. ZAKAT CALCULATOR TAB (LEGACY SUPPORT) */}
              {activeTab === "kalkulator" && (
                <div className="pt-2">
                  <AIConsultation 
                    initialTab="kalkulator"
                    onPayZakat={(amount, cat) => {
                      handleLaunchDonation(cat === "Zakat" ? "zakat-umum" : "umum", cat, amount);
                    }}
                  />
                </div>
              )}

              {/* 3. AI CONSULTANT TAB */}
              {activeTab === "ustadz-ai" && (
                <div className="pt-2">
                  <AIConsultation 
                    initialTab={aiInitialTab}
                    onPayZakat={(amount, cat) => {
                      handleLaunchDonation(cat === "Zakat" ? "zakat-umum" : "umum", cat, amount);
                    }}
                  />
                </div>
              )}

              {/* 4. DIGITAL LIBRARY TAB */}
              {activeTab === "perpustakaan" && (
                <div className="pt-2">
                  <DigitalLibrary />
                </div>
              )}

              {/* 5. TRANSPARENCY TAB */}
              {activeTab === "transparansi" && (
                <div className="pt-2">
                  <TransparencyReport pastDonations={pastDonations} />
                </div>
              )}

              {/* 6. PRAYER TIMES TAB */}
              {activeTab === "waktu-shalat" && (
                <div className="pt-0">
                  <PrayerTimes />
                </div>
              )}

              {/* 7. QIBLA COMPASS TAB */}
              {activeTab === "kiblat" && (
                <div className="pt-0">
                  <QiblaCompass />
                </div>
              )}

              {/* 8. PRAYER WALL TAB */}
              {activeTab === "doa" && (
                <div className="p-5 space-y-4">
                  <div className="text-left space-y-1 mb-2">
                    <h2 className="text-lg font-black text-slate-800">Dinding Do'a Kebaikan</h2>
                    <p className="text-xs text-slate-400 leading-snug">Berbagi harapan dan saling mengaminkan do'a di antara para donatur dan mustahik di bawah naungan Yasnawa.</p>
                  </div>
                  <PrayerWall />
                </div>
              )}

              {/* 9. MEMBER ACCOUNT TAB */}
              {activeTab === "akun" && (
                <div className="py-2">
                  <MemberCard 
                    pastDonations={pastDonations} 
                    onRegisterSuccess={handleRegisterSuccess} 
                    onAdminLogin={() => setIsAdminActive(true)}
                    onNavigateToUmroh={() => setActiveTab("undian")}
                    isAgent={isAgent}
                  />
                </div>
              )}
              {/* 10. UNDIAN UMROH TAB */}
              {activeTab === "undian" && (
                <div className="pt-2">
                  <UmrohSweepstakes 
                    memberLevel={userTier.title} 
                    totalDonation={totalLifetimeDonation} 
                    userName={registeredMember?.name || ""} 
                  />
                </div>
              )}

              {/* 11. KAJIAN ONLINE TAB */}
              {activeTab === "kajian" && (
                <div className="pt-2">
                  <KajianOnline />
                </div>
              )}

              {/* 12. USTADZ DIRECTORY TAB */}
              {activeTab === "ustadz-list" && (
                <div className="pt-2">
                  <UstadzDirectory />
                </div>
              )}

              {/* 13. RIJAL LAZISNA (AGENT) TAB */}
              {activeTab === "agen" && (
                <div className="pt-2">
                  {isAgent ? (
                    <AgentDashboard onBack={() => setActiveTab("beranda")} />
                  ) : (
                    <AgentRegistration onRegister={() => setIsAgent(true)} onBack={() => setActiveTab("beranda")} />
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* PERSISTENT FLOATING BOTTOM NAV BAR */}
        {!isCheckoutOpen && !isAdminActive && (
          <>
            {/* FLOATING WHATSAPP BUTTON (Tanya Lazisna) */}
            <a 
              href="https://wa.me/6281902366526?text=Assalamualaikum%20Tanya%20Lazisna,%20saya%20ingin%20berkonsultasi..."
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-20 right-4 z-[60] bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2 px-3.5 rounded-full shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 text-[11px] border border-emerald-400/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-100"></span>
              </span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Tanya Lazisna</span>
            </a>

            <nav className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 rounded-t-2xl px-3 py-2 flex justify-around items-center z-40 shadow-lg shadow-emerald-900/10">
              <button
                onClick={() => setActiveTab("beranda")}
                className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold transition-all ${
                  activeTab === "beranda" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Home className="w-5 h-5 stroke-[2]" />
                <span>Beranda</span>
              </button>

              <button
                onClick={() => setActiveTab("agen")}
                className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold transition-all ${
                  activeTab === "agen" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Users className="w-5 h-5 stroke-[2]" />
                <span>Rijal Lazisna</span>
              </button>

              <button
                onClick={() => setActiveTab("doa")}
                className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold transition-all ${
                  activeTab === "doa" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <MessageSquare className="w-5 h-5 stroke-[2]" />
                <span>Dinding Do'a</span>
              </button>

              <button
                onClick={() => setActiveTab("akun")}
                className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold transition-all ${
                  activeTab === "akun" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <User className="w-5 h-5 stroke-[2]" />
                <span>Akun</span>
              </button>
            </nav>
          </>
        )}

      </main>

      {/* MODAL WINDOWS FOR SUPERIOR POLISH */}
      
      {/* 1. News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl border border-slate-150 animate-pulse-subtle/0 flex flex-col max-h-[85vh] text-left">
            <div className="relative h-44 overflow-hidden shrink-0">
              <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-3 right-3 p-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-all"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>{selectedNews.category}</span>
                <span>{selectedNews.date}</span>
              </div>
              <h4 className="text-sm font-black text-slate-800 leading-snug">{selectedNews.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-light">{selectedNews.summary}</p>
              
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Laporan Resmi Lazisna
                </span>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[11px] px-4 py-2 rounded-xl transition-all"
                >
                  Tutup Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Notification System Overlay Modal */}
      {showNotificationAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xs p-5 shadow-2xl border border-slate-150 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Info className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Pemberitahuan Lazisna</h4>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 max-h-[250px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="pt-4 text-center text-xs text-slate-400">
                  Belum ada notifikasi baru saat ini.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="pt-2 text-xs">
                    <p className={`font-bold ${
                      notif.type === "warning" 
                        ? "text-amber-600" 
                        : notif.type === "success" 
                        ? "text-emerald-700" 
                        : "text-blue-700"
                    }`}>
                      {notif.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{notif.content}</p>
                    <p className="text-[8px] text-slate-450 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowNotificationAlert(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
