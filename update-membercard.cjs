const fs = require('fs');

let content = fs.readFileSync('src/components/MemberCard.tsx', 'utf8');

// Replace the !registeredUser block
const oldLoginBlock = `      {!registeredUser ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-sans">Gabung Member Kebaikan</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Daftar gratis untuk mencatat seluruh laporan donasi bulanan Anda, mengklaim Kartu Kebaikan digital, serta memantau pertumbuhan pahala jariyah Anda secara real-time.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 text-slate-700 font-bold py-3.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Masuk dengan Google
            </button>
            <p className="text-[10px] text-center text-slate-400 leading-relaxed">
              Dengan masuk, Anda menyetujui Syarat dan Ketentuan serta Kebijakan Privasi Lazisna.
            </p>
          </div>
        </div>
      ) : (activeSection === "profil" ? (`;

const newLoginBlock = `      {!registeredUser ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-sans">Gabung Member Kebaikan</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Daftar atau masuk untuk mencatat seluruh laporan donasi, mengklaim Kartu Kebaikan digital, serta memantau pertumbuhan pahala jariyah Anda secara real-time.
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            // Handle mock email/wa login
            const userData = {
              name: "Hamba Allah",
              wa: wa || "08123456789",
              email: name.includes("@") ? name : undefined,
              uid: "mock-uid-" + Date.now()
            };
            setRegisteredUser(userData);
            onRegisterSuccess(userData.name, userData.wa, undefined);
          }} className="space-y-4 pt-2">
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email atau Nomor WA</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:border-emerald-500 focus:outline-none" placeholder="Masukkan Email atau WA..." />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Lanjutkan dengan Email / WA
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200/80"></div>
              <span className="flex-shrink-0 mx-3 text-[10px] text-slate-400 font-medium">ATAU</span>
              <div className="flex-grow border-t border-slate-200/80"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 text-slate-700 font-bold py-3.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Masuk dengan Google
            </button>
            <p className="text-[10px] text-center text-slate-400 leading-relaxed">
              Dengan masuk, Anda menyetujui Syarat dan Ketentuan serta Kebijakan Privasi Lazisna.
            </p>
          </form>
        </div>
      ) : (activeSection === "profil" ? (`;

if (content.includes(' Gabung Member Kebaikan</h3>')) {
  content = content.replace(oldLoginBlock, newLoginBlock);
  fs.writeFileSync('src/components/MemberCard.tsx', content, 'utf8');
  console.log("Updated MemberCard.tsx");
} else {
  console.error("Could not find oldLoginBlock in MemberCard.tsx");
}
