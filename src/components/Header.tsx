import React, { useState } from "react";
import { HandHeart, Bell, Moon, Globe, Users } from "lucide-react";

interface HeaderProps {
  onNotificationClick?: () => void;
  onThemeToggle?: () => void;
  onAgentClick?: () => void;
  isAgent?: boolean;
}

const LANGUAGES = [
  { code: "id", label: "ID", name: "Bahasa Indonesia" },
  { code: "en", label: "EN", name: "English" },
  { code: "ar", label: "AR", name: "العربية" },
  { code: "zh", label: "ZH", name: "中文" },
  { code: "tr", label: "TR", name: "Türkçe" }
];

const TRANSLATIONS: Record<string, { title: string, subtitle: string, motto: string }> = {
  id: { title: "Lembaga Amil Zakat & Wakaf", subtitle: "Lembaga Amil Zakat, Infaq, Wakaf, Sodaqoh Yasnawa", motto: "Melayani Ummat dengan Amanah & Transparansi" },
  en: { title: "Zakat & Endowment Agency", subtitle: "Yasnawa Agency for Zakat, Infaq, Endowment, Charity", motto: "Serving the Ummah with Trust & Transparency" },
  ar: { title: "وكالة الزكاة والوقف", subtitle: "وكالة يسناوة للزكاة والإنفاق والوقف والصدقة", motto: "خدمة الأمة بأمانة وشفافية" },
  zh: { title: "天课与捐赠机构", subtitle: "Yasnawa 天课、施舍、捐赠、慈善机构", motto: "以信任和透明度服务大众" },
  tr: { title: "Zekat ve Vakıf Kurumu", subtitle: "Yasnawa Zekat, İnfak, Vakıf, Sadaka Kurumu", motto: "Ümmete Güven ve Şeffaflıkla Hizmet Etmek" }
};

export default function Header({ onNotificationClick, onThemeToggle, isAgent, onAgentClick }: HeaderProps) {
  const [lang, setLang] = useState<string>("id");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const t = TRANSLATIONS[lang];

  return (
    <header className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-b-3xl pb-10 pt-6 px-6 shadow-md shadow-emerald-900/10 border-b border-emerald-500/20">
      <div className="absolute inset-0 overflow-hidden rounded-b-3xl pointer-events-none">
        {/* Subtle Islamic pattern grid overlay */}
        <div 
          className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
        
        {/* Decorative ambient glowing radial backdrops */}
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-30px] left-[-20px] w-36 h-36 bg-emerald-300/10 rounded-full blur-xl pointer-events-none" />
      </div>

      <div className="relative flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-yellow-400 text-emerald-800 p-2.5 rounded-xl shadow-lg shadow-yellow-500/10 hover:scale-105 transition-transform duration-200">
            <HandHeart className="w-6 h-6 stroke-[2.5]" id="header-logo-icon" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
              Lazisna
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-100 opacity-90">
              {t.title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1 p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/5 shadow-inner text-[10px] font-bold"
            aria-label="Language"
          >
            <Globe className="w-4 h-4" />
            <span>{LANGUAGES.find(l => l.code === lang)?.label}</span>
          </button>
          
          {showLangMenu && (
            <div className="absolute top-full right-12 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 text-slate-800">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${lang === l.code ? "bg-emerald-100 text-emerald-800" : ""}`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          )}

          {isAgent && (
            <button 
              onClick={onAgentClick}
              className="relative p-2.5 rounded-xl bg-emerald-800/40 hover:bg-emerald-800/60 active:scale-95 transition-all text-white border border-emerald-400/30 shadow-inner"
              aria-label="Rijal Lazisna"
            >
              <Users className="w-5 h-5 text-yellow-400" />
            </button>
          )}
          
          <button 
            id="notification-bell-btn"
            onClick={onNotificationClick}
            className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/5 shadow-inner"
            aria-label="Notification"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full border border-emerald-600 animate-pulse" />
          </button>
        </div>
      </div>

      <div className="relative mt-5">
        <p className="text-xs text-emerald-100 leading-relaxed font-light">
          {t.subtitle}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-400/25 text-[10px] font-medium text-emerald-100">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
          {t.motto}
        </div>
      </div>
    </header>
  );
}
