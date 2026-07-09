import { BookOpen, FileText, Download, PlayCircle, Search } from "lucide-react";
import { useState } from "react";

interface LibraryItem {
  id: string;
  title: string;
  category: "E-Book" | "Modul Kajian" | "Video";
  author: string;
  cover: string;
}

const libraryData: LibraryItem[] = [
  { id: "1", title: "Panduan Zakat Praktis (Edisi Lengkap)", category: "E-Book", author: "Dewan Syariah Lazisna", cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop" },
  { id: "2", title: "Keutamaan Wakaf Sumur Air", category: "Modul Kajian", author: "Ust. H. Fauzan", cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop" },
  { id: "3", title: "Kumpulan Doa Harian Santri", category: "E-Book", author: "Tim Pendidikan Yasnawa", cover: "https://images.unsplash.com/photo-1606214174585-fd9668d277d7?w=300&h=400&fit=crop" },
  { id: "4", title: "Cara Menghitung Zakat Perdagangan", category: "Video", author: "Lazisna Media", cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=400&fit=crop" },
];

export default function DigitalLibrary() {
  const [activeFilter, setActiveFilter] = useState<string>("Semua");

  const filters = ["Semua", "E-Book", "Modul Kajian", "Video"];
  const filteredData = activeFilter === "Semua" ? libraryData : libraryData.filter(item => item.category === activeFilter);

  return (
    <div className="pb-safe animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800 px-5 pt-8 pb-16 rounded-b-[2.5rem] text-white shrink-0 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
        <h2 className="text-2xl font-bold font-sans tracking-tight flex items-center gap-2 relative z-10">
          <BookOpen className="w-6 h-6 text-emerald-400" /> Perpustakaan
        </h2>
        <p className="text-slate-300 text-xs mt-1.5 relative z-10 max-w-[250px]">Kumpulan e-book Islami, panduan ibadah, dan kajian dari Yayasan Yasnawa.</p>
        
        <div className="mt-6 relative z-10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari buku atau modul kajian..." 
              className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-400 rounded-2xl py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-emerald-400 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 relative z-20">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                activeFilter === filter 
                  ? "bg-emerald-500 text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Grid Items */}
        <div className="grid grid-cols-2 gap-4 mt-4 pb-20">
          {filteredData.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden group">
              <div className="aspect-[3/4] relative overflow-hidden bg-slate-100">
                <img src={item.cover} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1">
                  {item.category === "Video" ? <PlayCircle className="w-3 h-3 text-emerald-400" /> : <FileText className="w-3 h-3 text-sky-400" />}
                  {item.category}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-2">{item.title}</h3>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.author}</p>
                <button className="w-full mt-3 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[10px] font-bold py-2 rounded-xl transition-all border border-slate-200 hover:border-emerald-200">
                  <Download className="w-3 h-3" /> Unduh
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
