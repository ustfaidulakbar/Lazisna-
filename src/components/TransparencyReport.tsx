import { ShieldCheck, HeartHandshake, Eye, MapPin, Receipt, ArrowRight, TrendingUp, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DonationRecord } from "../types";

interface Report {
  id: string;
  title: string;
  image: string;
  date: string;
  summary: string;
  category: string;
}

interface TransparencyReportProps {
  pastDonations?: DonationRecord[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const formatRp = (num: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(num);
    };

    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg border border-slate-800 text-[10px] font-sans">
        <p className="font-semibold text-slate-300">{payload[0].payload.month}</p>
        <p className="text-emerald-400 font-extrabold mt-0.5 text-xs">{formatRp(payload[0].value)}</p>
        <p className="text-slate-400 text-[9px] mt-0.5">{payload[0].payload.count} kali donasi</p>
      </div>
    );
  }
  return null;
};

export default function TransparencyReport({ pastDonations: propPastDonations }: TransparencyReportProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localDonations, setLocalDonations] = useState<DonationRecord[]>([]);

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setIsLoading(false);
      });

    if (!propPastDonations) {
      const savedDonations = localStorage.getItem("lazisna_donations");
      if (savedDonations) {
        try {
          setLocalDonations(JSON.parse(savedDonations));
        } catch (e) {
          console.error("Failed to parse saved donations in TransparencyReport", e);
        }
      }
    }
  }, [propPastDonations]);

  const activeDonations = propPastDonations || localDonations;

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getTrendData = () => {
    const trendList = [];
    const now = new Date();
    
    // Create last 6 months in order from oldest to newest
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      const yearMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trendList.push({
        key: yearMonthKey,
        month: monthLabel,
        "Total Donasi": 0,
        amount: 0,
        count: 0
      });
    }

    activeDonations.forEach(record => {
      if (record.status === "Rejected") return;
      
      const recordDate = new Date(record.date);
      if (isNaN(recordDate.getTime())) return;
      
      const yearMonthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
      const matchingMonth = trendList.find(item => item.key === yearMonthKey);
      if (matchingMonth) {
        matchingMonth.amount += record.amount;
        matchingMonth["Total Donasi"] += record.amount;
        matchingMonth.count += 1;
      }
    });

    return trendList;
  };

  const trendData = getTrendData();
  const totalIn6Months = trendData.reduce((acc, curr) => acc + curr.amount, 0);
  const hasDonations = totalIn6Months > 0;

  return (
    <div className="pb-safe animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 px-5 pt-8 pb-16 rounded-b-[2.5rem] text-white shrink-0 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
        <h2 className="text-2xl font-bold font-sans tracking-tight flex items-center gap-2 relative z-10">
          <ShieldCheck className="w-6 h-6 text-emerald-400" /> Transparansi
        </h2>
        <p className="text-slate-400 text-xs mt-1.5 relative z-10 max-w-[280px] leading-relaxed">
          Bukti nyata penyaluran dana donatur. Lazisna berkomitmen menjaga amanah dengan pelaporan yang real-time dan transparan.
        </p>
      </div>

      <div className="px-5 -mt-8 relative z-20 pb-24">
        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center gap-1.5">
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-800">Diaudit WTP</p>
              <p className="text-[9px] text-slate-400">Tahun 2024 & 2025</p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center gap-1.5">
            <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-800">Izin Kemenag</p>
              <p className="text-[9px] text-slate-400">Resmi Terdaftar</p>
            </div>
          </div>
        </div>

        {/* Graphical Monthly Contribution Trend Chart Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" /> Tren Kebaikan Anda
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Grafik kontribusi pribadi Anda 6 bulan terakhir</p>
            </div>
            {hasDonations && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Total: {formatRp(totalIn6Months)}
              </span>
            )}
          </div>

          {hasDonations ? (
            <div className="h-44 w-full -ml-4 pr-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDonation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 500 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 500 }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                      return value;
                    }}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Total Donasi" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorDonation)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mb-1.5">
                <BarChart3 className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-600 mb-0.5">Belum Ada Riwayat Donasi</p>
              <p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed">
                Grafik tren kontribusi bulanan akan muncul secara otomatis setelah Anda menyalurkan donasi.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-emerald-600" /> Laporan Penyaluran
          </h3>
        </div>

        {/* Report Feed */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-xs text-slate-500 py-10">Memuat laporan...</div>
          ) : reports.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-10">Belum ada laporan penyaluran.</div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden group">
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <img src={report.image} alt={report.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                    {report.category}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-emerald-600 font-bold mb-1.5">{report.date}</p>
                  <h4 className="font-bold text-slate-800 text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
                    {report.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                    {report.summary}
                  </p>
                  <button className="flex items-center gap-1 text-[11px] font-bold text-slate-800 hover:text-emerald-600 transition-colors">
                    Baca Selengkapnya <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
