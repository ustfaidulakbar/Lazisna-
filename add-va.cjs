const fs = require('fs');

let content = fs.readFileSync('src/components/DonationFlow.tsx', 'utf8');

// 1. Add VA UI in step 3
const bankUI = `            ) : selectedPayment.type === "bank" ? (`;
const vaUI = `            ) : selectedPayment.type === "va" ? (
              <div className="w-full space-y-3.5">
                <p className="text-xs font-bold text-slate-800">Transfer Virtual Account {selectedPayment.name}</p>
                <div className="bg-white rounded-xl p-3 border border-slate-150 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">No. Virtual Account</p>
                    <p className="text-sm font-black text-slate-800 tracking-wider">{selectedPayment.number}</p>
                  </div>
                  <button
                    onClick={() => handleCopyAccount(selectedPayment.number || "")}
                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Terkopi
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Salin VA
                      </>
                    )}
                  </button>
                </div>
                <div className="text-left text-xs space-y-1">
                  <p className="text-slate-500">Atas Nama: <span className="font-bold text-slate-700">{selectedPayment.holder}</span></p>
                  <p className="text-[10px] text-emerald-600 italic">Otomatis terkonfirmasi, tidak perlu konfirmasi manual.</p>
                </div>
              </div>
            ) : selectedPayment.type === "bank" ? (`;

content = content.replace(bankUI, vaUI);

// 2. Adjust status logic: for 'va' it can be "Success" instantly for dummy purposes, or "Pending". 
// But "qris" is already "Success". Let's also make "va" "Success" so they don't need manual confirmation.
content = content.replace(
  `status: (donationType === "Uang" && selectedPayment.type === "qris") ? "Success" : "Pending",`,
  `status: (donationType === "Uang" && (selectedPayment.type === "qris" || selectedPayment.type === "va")) ? "Success" : "Pending",`
);

fs.writeFileSync('src/components/DonationFlow.tsx', content, 'utf8');
