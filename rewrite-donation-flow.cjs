const fs = require('fs');

let content = fs.readFileSync('src/components/DonationFlow.tsx', 'utf8');

// 1. Add `registeredMember` to props
content = content.replace(
  `  onDonationSuccess: (record: DonationRecord) => void;
}`,
  `  onDonationSuccess: (record: DonationRecord) => void;
  registeredMember?: { name: string; wa: string; photo?: string } | null;
}`
);

content = content.replace(
  `  onDonationSuccess
}: DonationFlowProps) {`,
  `  onDonationSuccess,
  registeredMember
}: DonationFlowProps) {`
);

// 2. Change step state to support 4 steps
content = content.replace(
  `const [step, setStep] = useState<1 | 2 | 3>(1);`,
  `const [step, setStep] = useState<1 | 2 | 3 | 4>(1);`
);

// 3. Update donor info to use `registeredMember` if available, and add an option "donate as someone else"
content = content.replace(
  `  const [donorName, setDonorName] = useState<string>("");
  const [donorWa, setDonorWa] = useState<string>("");`,
  `  const [donorName, setDonorName] = useState<string>(registeredMember?.name || "");
  const [donorWa, setDonorWa] = useState<string>(registeredMember?.wa || "");
  const [isDonateAsOther, setIsDonateAsOther] = useState<boolean>(false);`
);

// 4. Update the steps top bar
const oldTopBar = `        <div>
          <h2 className="font-bold text-slate-800 text-sm">
            {step === 1 ? "Isi Formulir Donasi" : step === 2 ? "Instruksi Pembayaran" : "Donasi Berhasil!"}
          </h2>
          <p className="text-[10px] text-slate-400">
            {step === 1 ? "Langkah 1 dari 2" : step === 2 ? "Langkah 2 dari 2" : "Alhamdulillah, Terima Kasih"}
          </p>
        </div>`;

const newTopBar = `        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="font-bold text-slate-800 text-sm">
              {step === 1 ? "Nominal Donasi" : step === 2 ? "Informasi & Metode" : step === 3 ? "Konfirmasi" : "Selesai"}
            </h2>
            {step < 4 && <span className="text-[10px] font-bold text-emerald-600">Langkah {step} dari 3</span>}
          </div>
          {step < 4 && (
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: \`\${(step / 3) * 100}%\` }}></div>
            </div>
          )}
        </div>`;
content = content.replace(oldTopBar, newTopBar);

// 5. Change `handleNextToPayment` to `handleNextStep1`
content = content.replace(
  `  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStep(2);

    // Auto copy to clipboard for bank transfer
    const method = paymentMethods.find((p) => p.id === paymentMethodId) || paymentMethods[0];
    if (method && method.type === "bank" && method.number) {
      handleCopyAccount(method.number);
    }
  };`,
  `  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (donationType === "Uang") {
      if (amount < 10000) errors.amount = "Minimal donasi adalah Rp 10.000";
    } else {
      if (!itemType) errors.itemType = "Pilih jenis barang";
      if (!itemDescription.trim()) errors.itemDescription = "Detail barang wajib diisi";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    const finalName = isDonateAsOther ? donorName : (registeredMember?.name || donorName);
    const finalWa = isDonateAsOther ? donorWa : (registeredMember?.wa || donorWa);
    if (!finalName.trim()) errors.donorName = "Nama lengkap wajib diisi";
    if (!finalWa.trim()) {
      errors.donorWa = "Nomor WhatsApp wajib diisi";
    } else if (!/^\\+?[0-9]{9,15}$/.test(finalWa.trim().replace(/[-\\s]/g, ""))) {
      errors.donorWa = "Nomor WhatsApp tidak valid (misal: 08123456789)";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setStep(3);

    const method = paymentMethods.find((p) => p.id === paymentMethodId) || paymentMethods[0];
    if (method && method.type === "bank" && method.number) {
      handleCopyAccount(method.number);
    }
  };`
);

// We should remove the old validateForm completely, since we rewrote it to validateStep1 and 2
content = content.replace(/  const validateForm = \(\) => {[\s\S]*?return Object.keys\(errors\).length === 0;\n  };\n/, '');

// Change the button back handler
content = content.replace(
  `onClick={step === 2 ? () => setStep(1) : onBackToHome}`,
  `onClick={step > 1 && step < 4 ? () => setStep(step - 1 as 1|2|3) : onBackToHome}`
);

// 6. Split step 1 into Step 1 and Step 2 in JSX
// Find the `<!-- Donor Info Header -->` and split it there
const step1Start = `      {step === 1 && (
        <form onSubmit={handleNextToPayment} className="p-5 space-y-5">`;
content = content.replace(step1Start, `      {step === 1 && (
        <form onSubmit={handleNextStep1} className="p-5 space-y-5">`);

const donorInfoHeader = `{/* Donor Info Header */}`;
const parts = content.split(donorInfoHeader);

if (parts.length > 1) {
  const step1Part = parts[0];
  const restPart = parts[1];
  
  // Close step 1 form
  const endStep1 = `
          {/* Action Button Step 1 */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/10 transition-all mt-6"
          >
            Lanjut Pilih Metode <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleNextStep2} className="p-5 space-y-5">
          {/* Donor Info Header */}`;
          
  // Replace the old button with end of step 1 and start of step 2
  // We need to find the old action button. It's before step === 2 &&
  let newContent = step1Part + endStep1 + restPart;
  
  // Need to remove the old action button in step 2 (which used to be step 1)
  const oldActionButton = `{/* Action Button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/10 transition-all"
          >
            {donationType === "Uang" ? "Lanjut Pembayaran" : "Lanjut Konfirmasi"} <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === 2 && (`;
      
  const newActionButton = `{/* Action Button Step 2 */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/10 transition-all"
          >
            {donationType === "Uang" ? "Lanjut Pembayaran" : "Lanjut Konfirmasi"} <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === 3 && (`;

  newContent = newContent.replace(oldActionButton, newActionButton);
  
  // replace {step === 3 && ( with {step === 4 && (
  newContent = newContent.replace(`{step === 3 && (`, `{step === 4 && (`);
  
  content = newContent;
}

// Implement the "donate as someone else" toggle in donor info
content = content.replace(
  `<h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <User2 className="w-4 h-4 text-emerald-600" /> Informasi Donatur
            </h4>`,
  `<div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User2 className="w-4 h-4 text-emerald-600" /> Informasi Donatur
              </h4>
              {registeredMember && (
                <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
                  <input type="checkbox" checked={isDonateAsOther} onChange={e => setIsDonateAsOther(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                  Donasi untuk orang lain
                </label>
              )}
            </div>`
);

content = content.replace(
  `value={donorName}`,
  `value={isDonateAsOther ? donorName : (registeredMember?.name || donorName)}
                  disabled={!isDonateAsOther && !!registeredMember}`
);

content = content.replace(
  `value={donorWa}`,
  `value={isDonateAsOther ? donorWa : (registeredMember?.wa || donorWa)}
                  disabled={!isDonateAsOther && !!registeredMember}`
);

content = content.replace(
  `donorName || "Hamba Allah"`,
  `(isDonateAsOther ? donorName : (registeredMember?.name || donorName)) || "Hamba Allah"`
);

// We might have multiple donorName references in payload, invoice, whatsapp message, success page.
// Let's replace `donorName` globally in the handleConfirmPayment
content = content.replace(
  `const donation: DonationRecord = {
      id: invoiceId,
      donorName: donorName || "Hamba Allah",
      donorWa: donorWa,`,
  `const finalName = (isDonateAsOther ? donorName : (registeredMember?.name || donorName)) || "Hamba Allah";
    const finalWa = isDonateAsOther ? donorWa : (registeredMember?.wa || donorWa);
    const donation: DonationRecord = {
      id: invoiceId,
      donorName: finalName,
      donorWa: finalWa,`
);
content = content.replace(
  `name: donorName || "Hamba Allah",`,
  `name: finalName,`
);

// Replace donorName and donorWa in WhatsApp Message
content = content.replace(
  `*Nama Donatur:* \${donorName || "Hamba Allah"}
*No. WhatsApp:* \${donorWa}`,
  `*Nama Donatur:* \${isDonateAsOther ? donorName || "Hamba Allah" : registeredMember?.name || donorName || "Hamba Allah"}
*No. WhatsApp:* \${isDonateAsOther ? donorWa : registeredMember?.wa || donorWa}`
);

content = content.replace(
  `*Nama Donatur:* \${donorName || "Hamba Allah"}
*No. WhatsApp:* \${donorWa}`,
  `*Nama Donatur:* \${isDonateAsOther ? donorName || "Hamba Allah" : registeredMember?.name || donorName || "Hamba Allah"}
*No. WhatsApp:* \${isDonateAsOther ? donorWa : registeredMember?.wa || donorWa}`
);

// Replace in Invoice
content = content.replace(
  `<span className="font-bold text-slate-800">{donorName || "Hamba Allah"}</span>`,
  `<span className="font-bold text-slate-800">{(isDonateAsOther ? donorName : (registeredMember?.name || donorName)) || "Hamba Allah"}</span>`
);
content = content.replace(
  `<span className="font-medium text-slate-800">{donorWa}</span>`,
  `<span className="font-medium text-slate-800">{isDonateAsOther ? donorWa : (registeredMember?.wa || donorWa)}</span>`
);

// Replace in success screen
content = content.replace(
  `Terima Kasih, {donorName || "Hamba Allah"}!`,
  `Terima Kasih, {(isDonateAsOther ? donorName : (registeredMember?.name || donorName)) || "Hamba Allah"}!`
);
content = content.replace(
  `donorName={donorName}`,
  `donorName={(isDonateAsOther ? donorName : (registeredMember?.name || donorName))}`
);
content = content.replace(
  `setStep(3);`,
  `setStep(4);`
);

fs.writeFileSync('src/components/DonationFlow.tsx', content, 'utf8');
