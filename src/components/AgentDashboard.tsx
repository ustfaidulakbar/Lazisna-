import React, { useState, useEffect } from "react";
import { Users, Copy, Wallet, Target, Award, ArrowRight, Share2, Ticket, CheckCircle2, Calculator, Trophy, QrCode, Bell, Briefcase, MessageSquare, Download, Image as ImageIcon } from "lucide-react";
import QRCode from "react-qr-code";

interface AgentDashboardProps {
  onBack: () => void;
}

export default function AgentDashboard({ onBack }: AgentDashboardProps) {
  const [simulationTarget, setSimulationTarget] = useState<number>(10000000);
  const [showQR, setShowQR] = useState(false);
  const [newDonorAlert, setNewDonorAlert] = useState<{name: string, amount: number} | null>(null);
  const [targetAlertVisible, setTargetAlertVisible] = useState(false);
  const [personalWeeklyTarget, setPersonalWeeklyTarget] = useState<number>(5);
  const currentWeeklyDonors = 3; // Mock value for current week's new donors

  // Mock data for the agent
  const agentData = {
    name: "Ust. Faidul Akbar",
    referralCode: "RIJAL-778XQ",
    referralLink: "https://lazisna.org/donasi?ref=RIJAL-778XQ",
    totalDonors: 48, // Progress towards 50
    totalDonations: 48500000, // Progress towards 50 Juta (48.5 Juta)
    commissionRate: 0.06, // 6%
  };

  useEffect(() => {
    // Check if close to target (e.g., >= 45 donors or >= 45.000.000 donations)
    if ((agentData.totalDonors >= 45 && agentData.totalDonors < 50) || 
        (agentData.totalDonations >= 45000000 && agentData.totalDonations < 50000000)) {
      
      const targetTimer = setTimeout(() => {
        setTargetAlertVisible(true);
        setTimeout(() => setTargetAlertVisible(false), 8000);
      }, 1500);

      return () => clearTimeout(targetTimer);
    }
  }, []);

  useEffect(() => {
    // Simulate real-time alert for new donor
    const timer = setTimeout(() => {
      setNewDonorAlert({ name: "Fathur Rahman", amount: 1500000 });
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        setNewDonorAlert(null);
      }, 5000);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const leaderboardData = [
    { rank: 1, name: "Budi Santoso", totalCommission: 12500000 },
    { rank: 2, name: "Ahmad Dahlan", totalCommission: 9800000 },
    { rank: 3, name: "Siti Aminah", totalCommission: 7600000 },
    { rank: 4, name: "Ust. Faidul Akbar", totalCommission: 2070000 }, // Agent's current approx commission
    { rank: 5, name: "Reza Rahadian", totalCommission: 1500000 }
  ];

  const referralHistory = [
    { id: "ref-1", name: "Hamba Allah", amount: 1000000, date: "09 Jul 2026", status: "Berhasil" },
    { id: "ref-2", name: "Budi Santoso", amount: 500000, date: "08 Jul 2026", status: "Berhasil" },
    { id: "ref-3", name: "Ibu Siti", amount: 250000, date: "05 Jul 2026", status: "Pending" },
    { id: "ref-4", name: "Keluarga Ahmad", amount: 2000000, date: "02 Jul 2026", status: "Berhasil" },
  ];

  const commissionEarned = agentData.totalDonations * agentData.commissionRate;
  
  const targetDonors = 50;
  const targetDonations = 50000000;
  
  const donorsProgress = Math.min((agentData.totalDonors / targetDonors) * 100, 100);
  const donationsProgress = Math.min((agentData.totalDonations / targetDonations) * 100, 100);
  
  // They win if either target is reached
  const hasWonUmrah = agentData.totalDonors >= targetDonors || agentData.totalDonations >= targetDonations;
  const bestProgress = Math.max(donorsProgress, donationsProgress);

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="p-5 space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <button 
          onClick={onBack}
          className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rijal Lazisna</h2>
          <p className="text-xs text-slate-500">Dashboard Agen Kebaikan</p>
        </div>
      </div>

      {/* Profile & Link Section */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-emerald-100 text-xs mb-1">Agen Terdaftar</p>
              <h3 className="text-lg font-bold">{agentData.name}</h3>
            </div>
            <div className="bg-yellow-400/20 text-yellow-300 p-2 rounded-xl backdrop-blur-sm border border-yellow-400/30">
              <Award className="w-6 h-6" />
            </div>
          </div>
          
          <div className="bg-black/20 rounded-xl p-3 border border-white/10">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">Tautan Referral Anda</p>
              <button 
                onClick={() => setShowQR(!showQR)}
                className="text-[10px] text-emerald-100 flex items-center gap-1 hover:text-white transition-colors"
              >
                <QrCode className="w-3 h-3" />
                {showQR ? "Sembunyikan QR" : "Tampilkan QR"}
              </button>
            </div>
            
            {showQR && (
              <div className="bg-white rounded-xl p-4 mb-3 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                  <QRCode value={agentData.referralLink} size={140} fgColor="#064e3b" />
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">
                  Minta donatur memindai kode ini untuk berdonasi melalui link Anda
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-xs font-mono truncate border border-white/5">
                {agentData.referralLink}
              </div>
              <button 
                onClick={() => alert("Link berhasil disalin!")}
                className="p-2 bg-white text-emerald-700 rounded-lg shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <Wallet className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-0.5">Komisi Tersedia (6%)</p>
          <h4 className="text-xl font-black text-slate-800">{formatRp(commissionEarned)}</h4>
        </div>
        <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
          Tarik
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 mb-1">Total Donatur</p>
          <p className="text-lg font-bold text-slate-800">{agentData.totalDonors} Orang</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
            <Target className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 mb-1">Total Himpunan</p>
          <p className="text-lg font-bold text-slate-800">{formatRp(agentData.totalDonations)}</p>
        </div>
      </div>

      {/* Personal Weekly Target Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Target Pribadi Mingguan</h3>
            <p className="text-[10px] text-slate-500">Jumlah donatur baru per minggu</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold text-slate-700">Set Target Anda</label>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPersonalWeeklyTarget(Math.max(1, personalWeeklyTarget - 1))}
                className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
              >-</button>
              <span className="text-sm font-bold w-4 text-center">{personalWeeklyTarget}</span>
              <button 
                onClick={() => setPersonalWeeklyTarget(personalWeeklyTarget + 1)}
                className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
              >+</button>
            </div>
          </div>

          <div className="space-y-1.5 mt-4">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-600">Progress Minggu Ini</span>
              <span className="font-bold text-indigo-600">{currentWeeklyDonors} / {personalWeeklyTarget}</span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${currentWeeklyDonors >= personalWeeklyTarget ? 'bg-indigo-500' : 'bg-indigo-400'}`}
                style={{ width: `${Math.min(100, (currentWeeklyDonors / personalWeeklyTarget) * 100)}%` }}
              />
            </div>
            {currentWeeklyDonors >= personalWeeklyTarget && (
              <p className="text-[10px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Target mingguan tercapai! Hebat!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Umrah Target Section */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 shadow-sm border border-yellow-200/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-yellow-900 flex items-center justify-center shadow-inner shadow-yellow-200">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Misi Umroh Gratis</h3>
            <p className="text-[10px] text-slate-600 leading-tight mt-0.5">Capai 50 Donatur ATAU himpunan Rp 50 Juta untuk memenangkan tiket Umroh.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Target 1: Donors */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">Target Donatur</span>
              <span className="font-bold text-emerald-600">{agentData.totalDonors} / 50</span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${agentData.totalDonors >= targetDonors ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                style={{ width: `${donorsProgress}%` }}
              />
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200/80"></div>
            <span className="flex-shrink-0 mx-3 text-[10px] text-slate-400 font-medium">ATAU</span>
            <div className="flex-grow border-t border-slate-200/80"></div>
          </div>

          {/* Target 2: Donations */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">Target Himpunan</span>
              <span className="font-bold text-emerald-600">{formatRp(agentData.totalDonations)} / 50 Jt</span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${agentData.totalDonations >= targetDonations ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                style={{ width: `${donationsProgress}%` }}
              />
            </div>
          </div>
        </div>

        {hasWonUmrah ? (
          <div className="mt-5 bg-yellow-400 text-yellow-950 p-3 rounded-xl flex items-center gap-3 border border-yellow-500 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-yellow-900 shrink-0" />
            <div>
              <p className="font-bold text-sm">Alhamdulillah! Target Tercapai</p>
              <p className="text-[10px] leading-tight mt-0.5">Anda berhak mendapatkan 1 Tiket Undian Umroh Gratis dari Lazisna.</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 text-center">
            <p className="text-[10px] text-slate-500 font-medium">
              Selesaikan salah satu target di atas. Terus semangat berdakwah!
            </p>
          </div>
        )}
      </div>

      {/* Simulator Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800">Simulasi Komisi</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Hitung estimasi pendapatan dari target donasi yang ingin Anda capai (Komisi 6%).
        </p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="font-medium text-slate-700">Target Himpunan Donasi</span>
              <span className="font-bold text-slate-800">{formatRp(simulationTarget)}</span>
            </div>
            <input 
              type="range" 
              min="1000000" 
              max="100000000" 
              step="1000000"
              value={simulationTarget}
              onChange={(e) => setSimulationTarget(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 Jt</span>
              <span>100 Jt</span>
            </div>
          </div>
          
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-emerald-700 mb-0.5">Estimasi Komisi Anda</p>
              <p className="text-lg font-black text-emerald-800">{formatRp(simulationTarget * agentData.commissionRate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Top Rijal Lazisna</h3>
            <p className="text-[10px] text-slate-500">Peringkat agen berdasarkan komisi</p>
          </div>
        </div>
        
        <div className="space-y-3 mt-4">
          {leaderboardData.map((agent) => (
            <div 
              key={agent.rank} 
              className={`flex items-center gap-3 p-3 rounded-xl border ${agent.name === agentData.name ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50/50'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                agent.rank === 1 ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 
                agent.rank === 2 ? 'bg-slate-300 text-slate-700 shadow-sm' : 
                agent.rank === 3 ? 'bg-amber-600/30 text-amber-900 shadow-sm' : 
                'bg-slate-100 text-slate-500'
              }`}>
                #{agent.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${agent.name === agentData.name ? 'text-emerald-800' : 'text-slate-800'}`}>
                  {agent.name} {agent.name === agentData.name && "(Anda)"}
                </p>
                <p className="text-[10px] text-slate-500">Komisi: <span className="font-semibold text-slate-700">{formatRp(agent.totalCommission)}</span></p>
              </div>
              {agent.rank <= 3 && (
                <Trophy className={`w-4 h-4 ${
                  agent.rank === 1 ? 'text-yellow-500' : 
                  agent.rank === 2 ? 'text-slate-400' : 
                  'text-amber-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toolkit Agen Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Toolkit Agen</h3>
            <p className="text-[10px] text-slate-500">Materi promosi untuk mempermudah syiar</p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {/* Promo Text */}
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 relative group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Template Pesan (WA)
              </span>
              <button 
                onClick={() => alert("Teks berhasil disalin!")}
                className="text-emerald-600 bg-emerald-100 p-1.5 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-3 group-hover:line-clamp-none transition-all">
              "Assalamualaikum wr. wb. Sahabat, mari raih pahala jariyah bersama Lazisna dalam program tebar kebaikan umat. Sisihkan rezeki Anda, berapa pun nilainya sangat berarti. Salurkan donasi terbaik Anda melalui tautan resmi ini: {agentData.referralLink} 
              Semoga menjadi pembersih harta dan penolak bala. Aamiin."
            </p>
          </div>

          {/* Digital Posters */}
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => alert("Mengunduh poster Sedekah Subuh...")}
              className="border border-slate-100 rounded-xl p-2 bg-slate-50 flex flex-col items-center group cursor-pointer hover:border-emerald-200 transition-colors"
            >
              <div className="w-full h-24 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden relative">
                <ImageIcon className="w-8 h-8 text-emerald-200" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-700 text-center">Poster Sedekah Subuh</p>
            </div>
            <div 
              onClick={() => alert("Mengunduh poster Wakaf Sumur...")}
              className="border border-slate-100 rounded-xl p-2 bg-slate-50 flex flex-col items-center group cursor-pointer hover:border-emerald-200 transition-colors"
            >
              <div className="w-full h-24 bg-gradient-to-br from-orange-100 to-amber-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden relative">
                <ImageIcon className="w-8 h-8 text-orange-200" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-700 text-center">Poster Wakaf Sumur</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral History Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800">Riwayat Referral</h3>
        <div className="space-y-3">
          {referralHistory.map(ref => (
            <div key={ref.id} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
              <div>
                <p className="text-sm font-bold text-slate-800">{ref.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500">{ref.date}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${ref.status === 'Berhasil' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {ref.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Donasi: {formatRp(ref.amount)}</p>
                <p className="text-sm font-bold text-emerald-600">
                  + {formatRp(ref.amount * 0.06)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Real-time Alert Toast */}
      {newDonorAlert && (
        <div className="fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 shadow-inner">
              <Bell className="w-5 h-5 text-white fill-white animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">Donatur Baru Bergabung!</p>
              <p className="text-sm font-medium leading-tight"><span className="font-bold">{newDonorAlert.name}</span> baru saja berdonasi <span className="text-emerald-300 font-bold">{formatRp(newDonorAlert.amount)}</span> melalui link Anda.</p>
            </div>
          </div>
        </div>
      )}

      {/* Target Progress Alert Toast */}
      {targetAlertVisible && (
        <div className="fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-top-10 fade-in duration-500">
          <div className="bg-yellow-400 text-yellow-950 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-yellow-500">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0 shadow-inner">
              <Target className="w-5 h-5 text-yellow-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-yellow-800 font-bold uppercase tracking-wider mb-0.5">Sedikit Lagi!</p>
              <p className="text-sm font-medium leading-tight">
                Anda sudah mencapai <span className="font-bold">{agentData.totalDonors} Donatur</span>! Ayo capai 50 untuk dapatkan tiket Umroh.
              </p>
            </div>
            <button onClick={() => setTargetAlertVisible(false)} className="text-yellow-700 hover:text-yellow-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
