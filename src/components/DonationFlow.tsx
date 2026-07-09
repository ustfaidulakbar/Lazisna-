import React, { useState, useEffect } from "react";
import { Program, DonationCategory, DonationRecord } from "../types";
import { PROGRAMS } from "../data";
import DonationReceipt from "./DonationReceipt";
import QRCode from "react-qr-code";
import { 
  Heart, ArrowLeft, CheckCircle, Copy, Check, MessageSquare, 
  ChevronRight, Calendar, QrCode, CreditCard, Clock, User2, Send 
} from "lucide-react";

interface DonationFlowProps {
  initialProgramId?: string;
  initialCategory?: DonationCategory;
  initialAmount?: number;
  onBackToHome: () => void;
  onDonationSuccess: (record: DonationRecord) => void;
  registeredMember?: { name: string; wa: string; photo?: string } | null;
}

const DEFAULT_PAYMENT_METHODS = [
  { id: "qris", name: "QRIS", type: "qris", number: "BSI: 7343059897", holder: "MUASSASAH ANNAHDLIYAH ALWATHONIYAH", icon: QrCode },
  { id: "va-bca", name: "BCA Virtual Account (Otomatis)", type: "va", number: "3901", holder: "LAZISNA", icon: CreditCard },
  { id: "va-bsi", name: "BSI Virtual Account (Otomatis)", type: "va", number: "900", holder: "LAZISNA", icon: CreditCard },
  { id: "transfer", name: "Transfer Bank", type: "bank", number: "BSI: 7343059897", holder: "MUASSASAH ANNAHDLIYAH ALWATHONIYAH", icon: CreditCard },
  { id: "alfamart", name: "ALFAMART", type: "retail", number: "-", holder: "LAZISNA", icon: CreditCard },
  { id: "indomart", name: "INDOMARET", type: "retail", number: "-", holder: "LAZISNA", icon: CreditCard },
  { id: "ewallet", name: "E-WALLET (Gopay, OVO, Dana, ShopeePay)", type: "ewallet", number: "-", holder: "LAZISNA", icon: QrCode },
  { id: "manual", name: "Konfirmasi WhatsApp Manual", type: "manual", number: "081902366526", holder: "MUASSASAH ANNAHDLIYAH ALWATHONIYAH", icon: MessageSquare }
];

export default function DonationFlow({
  initialProgramId,
  initialCategory,
  initialAmount,
  onBackToHome,
  onDonationSuccess,
  registeredMember
}: DonationFlowProps) {
  // Step tracker
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Form, 2: Payment Details, 3: Success

  // Dynamic payment methods list
  const [paymentMethods, setPaymentMethods] = useState<any[]>(DEFAULT_PAYMENT_METHODS);

  // Form Fields
  const [selectedProgramId, setSelectedProgramId] = useState<string>(initialProgramId || "umum");
  const [category, setCategory] = useState<DonationCategory>(initialCategory || "Infaq");
  
  const [donationType, setDonationType] = useState<"Uang" | "Barang">("Uang");
  const [itemType, setItemType] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(initialAmount || 50000);
  
  const [donorName, setDonorName] = useState<string>(registeredMember?.name || "");
  const [donorWa, setDonorWa] = useState<string>(registeredMember?.wa || "");
  const [isDonateAsOther, setIsDonateAsOther] = useState<boolean>(false);
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorPrayer, setDonorPrayer] = useState<string>("");
  const [isAutoDebit, setIsAutoDebit] = useState<boolean>(false);
  const [paymentMethodId, setPaymentMethodId] = useState<string>("transfer");

  // Calculated values
  const [uniqueCode, setUniqueCode] = useState<number>(0);
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch active bank accounts on mount
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch("/api/bank-accounts");
        if (res.ok) {
          const list = await res.json();
          const activeList = list.filter((b: any) => b.isActive);
          if (activeList.length > 0) {
            const mapped = activeList.map((b: any) => ({
              id: b.id,
              name: b.bankName,
              type: b.iconType,
              number: b.accountNumber,
              holder: b.accountHolder,
              icon: b.iconType === "qris" ? QrCode : b.iconType === "manual" ? MessageSquare : CreditCard
            }));
            setPaymentMethods(mapped);
            setPaymentMethodId(mapped[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load bank accounts:", err);
      }
    };
    fetchBanks();
  }, []);

  // Reset or adjust category based on selected program
  useEffect(() => {
    if (selectedProgramId !== "umum" && selectedProgramId !== "zakat-umum") {
      const prog = PROGRAMS.find((p) => p.id === selectedProgramId);
      if (prog) {
        setCategory(prog.category);
      }
    } else if (selectedProgramId === "zakat-umum") {
      setCategory("Zakat");
    }
  }, [selectedProgramId]);

  // Handle unique code and invoice id generation
  useEffect(() => {
    setUniqueCode(Math.floor(Math.random() * 899) + 100); // 100 - 999
    const randNum = Math.floor(Math.random() * 9000) + 1000;
    setInvoiceId(`LZS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${randNum}`);
  }, [step]);


  const validateStep1 = () => {
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
    } else if (!/^\+?[0-9]{9,15}$/.test(finalWa.trim().replace(/[-\s]/g, ""))) {
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
    setStep(4);

    const method = paymentMethods.find((p) => p.id === paymentMethodId) || paymentMethods[0];
    if (method && method.type === "bank" && method.number) {
      handleCopyAccount(method.number);
    }
  };

  const handleCopyAccount = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const selectedProgramObj = PROGRAMS.find((p) => p.id === selectedProgramId);
  const programTitle = selectedProgramObj ? selectedProgramObj.title : (selectedProgramId === "zakat-umum" ? "Zakat Maal & Penghasilan" : "Infaq & Sodaqoh Umum (Yasnawa)");
  const selectedPayment = paymentMethods.find((p) => p.id === paymentMethodId) || paymentMethods[0];
  const finalTotalAmount = amount + (selectedPayment.type === "bank" ? uniqueCode : 0);

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleConfirmPayment = async () => {
    const finalName = (isDonateAsOther ? donorName : (registeredMember?.name || donorName)) || "Hamba Allah";
    const finalWa = isDonateAsOther ? donorWa : (registeredMember?.wa || donorWa);
    
    // Generate active record
    const donation: DonationRecord = {
      id: invoiceId,
      donorName: finalName,
      donorWa: finalWa,
      amount: donationType === "Uang" ? finalTotalAmount : 0,
      category: category,
      programId: selectedProgramId,
      programTitle: programTitle + (isAutoDebit ? " (Auto-Debet Bulanan)" : ""),
      paymentMethod: donationType === "Uang" ? selectedPayment.name : "Konfirmasi Manual (Barang)",
      date: new Date().toISOString(),
      prayer: donorPrayer || undefined,
      status: (donationType === "Uang" && (selectedPayment.type === "qris" || selectedPayment.type === "va")) ? "Success" : "Pending",
      invoiceId: invoiceId,
      donationType: donationType,
      itemType: itemType,
      itemDescription: itemDescription
    };

    // Post to server donations list so administrator can verify
    try {
      await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donation)
      });
    } catch (err) {
      console.error("Failed to post donation to backend:", err);
    }

    // Post custom prayer to the backend if they wrote one
    if (donorPrayer.trim()) {
      try {
        await fetch("/api/prayers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: finalName,
            prayer: donorPrayer,
            program: programTitle
          })
        });
      } catch (err) {
        console.error("Failed to sync prayer to wall:", err);
      }
    }

    // Pass back up to save to LocalStorage
    onDonationSuccess(donation);
    setStep(3);
  };


  const getWhatsAppMessage = () => {
    let text = "";
    if (donationType === "Uang") {
      text = `Assalamualaikum Admin Lazisna,

Saya telah mengonfirmasi pembayaran donasi melalui aplikasi web. Berikut rinciannya:

*No. Invoice:* ${invoiceId}
*Program:* ${programTitle}
*Kategori:* ${category}
*Nama Donatur:* ${isDonateAsOther ? donorName || "Hamba Allah" : registeredMember?.name || donorName || "Hamba Allah"}
*No. WhatsApp:* ${isDonateAsOther ? donorWa : registeredMember?.wa || donorWa}
*Jumlah Transfer:* ${formatRp(finalTotalAmount)}
*Metode Pembayaran:* ${selectedPayment.name}
${donorPrayer ? `*Do'a:* _"${donorPrayer}"_` : ""}

Mohon diverifikasi pembayarannya. Terima kasih, semoga berkah!`;
    } else {
      text = `Assalamualaikum Admin Lazisna,

Saya ingin melakukan serah terima donasi berupa barang. Berikut rinciannya:

*No. Invoice:* ${invoiceId}
*Program:* ${programTitle}
*Kategori:* ${category}
*Bentuk Donasi:* Barang
*Jenis Barang:* ${itemType}
*Detail/Keterangan:* ${itemDescription}
*Nama Donatur:* ${isDonateAsOther ? donorName || "Hamba Allah" : registeredMember?.name || donorName || "Hamba Allah"}
*No. WhatsApp:* ${isDonateAsOther ? donorWa : registeredMember?.wa || donorWa}
${donorPrayer ? `*Do'a:* _"${donorPrayer}"_` : ""}

Mohon arahan selanjutnya untuk serah terima barang ini. Terima kasih!`;
    }

    const waNumber = (donationType === "Uang" && selectedPayment.type === "manual") ? selectedPayment.number : "081902366526";
    const cleanNumber = waNumber.replace(/\D/g, "");
    const finalNumber = cleanNumber.startsWith("62") ? cleanNumber : cleanNumber.startsWith("0") ? "62" + cleanNumber.slice(1) : cleanNumber;
    return `https://wa.me/${finalNumber || "6281902366526"}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-md mx-auto bg-white min-height-screen pb-10">
      {/* Top sticky-like bar */}
      <div className="bg-slate-50 sticky top-0 px-4 py-4 border-b border-slate-100 flex items-center gap-3 z-10">
        <button 
          onClick={step > 1 && step < 4 ? () => setStep(step - 1 as 1|2|3) : onBackToHome}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-all text-slate-600"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="font-bold text-slate-800 text-sm">
              {step === 1 ? "Nominal Donasi" : step === 2 ? "Informasi & Metode" : step === 3 ? "Konfirmasi" : "Selesai"}
            </h2>
            {step < 4 && <span className="text-[10px] font-bold text-emerald-600">Langkah {step} dari 3</span>}
          </div>
          {step < 4 && (
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
          )}
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleNextStep1} className="p-5 space-y-5">
          {/* Program Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Pilih Program Donasi
            </label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 font-medium text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="umum">Infaq & Sedekah Umum (Yayasan Yasnawa)</option>
              <option value="zakat-umum">Zakat Maal / Penghasilan Umum</option>
              {PROGRAMS.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  [{prog.category}] {prog.title}
                </option>
              ))}
            </select>
          </div>

          {/* Donation Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Bentuk Donasi
            </label>
            <div className="flex gap-2">
              <label className={`flex-1 flex items-center justify-center py-2.5 border rounded-xl cursor-pointer text-xs font-bold transition-all ${
                donationType === "Uang" 
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
                <input type="radio" name="donationType" value="Uang" className="sr-only" checked={donationType === "Uang"} onChange={() => setDonationType("Uang")} />
                Uang Tunai
              </label>
              <label className={`flex-1 flex items-center justify-center py-2.5 border rounded-xl cursor-pointer text-xs font-bold transition-all ${
                donationType === "Barang" 
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
                <input type="radio" name="donationType" value="Barang" className="sr-only" checked={donationType === "Barang"} onChange={() => setDonationType("Barang")} />
                Barang Fisik
              </label>
            </div>
          </div>

          {donationType === "Uang" ? (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Pilih Jumlah Donasi (Rp)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10000, 20000, 50000, 100000, 250000, 500000].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition-all duration-200 ${
                      amount === val
                        ? "bg-emerald-50 text-emerald-700 border-emerald-500 ring-1 ring-emerald-500"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {val >= 1000000 ? `${val / 1000000} Juta` : `${val / 1000}K`}
                  </button>
                ))}
              </div>

              {/* Custom amount field */}
              <div className="relative mt-3 rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-400 text-xs font-bold">Rp</span>
                </div>
                <input
                  type="number"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Jumlah donasi lainnya..."
                  className="block w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              {formErrors.amount && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">{formErrors.amount}</p>
              )}

              {selectedProgramId.startsWith("rutin-") && (
                <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold text-indigo-800 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Auto-Debet Bulanan</h4>
                    <p className="text-[9px] text-indigo-600 mt-0.5 max-w-[200px]">Jadwalkan donasi ini otomatis setiap bulan via Payment Gateway.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isAutoDebit}
                      onChange={() => setIsAutoDebit(!isAutoDebit)} 
                    />
                    <div className="w-9 h-5 bg-indigo-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Jenis Barang
                </label>
                <select
                  value={itemType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItemType(val);
                    if (val === "Beras") setItemDescription("1 Kg");
                    else if (val === "Sembako") setItemDescription("1 Paket");
                    else setItemDescription("");
                  }}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 font-medium text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Jenis Barang --</option>
                  {(category === "Wakaf" || category === "Hibah") ? (
                    <>
                      <option value="Tanah">Tanah</option>
                      <option value="Rumah">Rumah / Bangunan</option>
                      <option value="Sumur">Sumur / Sumber Air</option>
                      <option value="Bahan Bangunan">Bahan Bangunan (Semen, Bata, dll)</option>
                      <option value="Fasilitas Pendidikan">Fasilitas Pendidikan</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Beras">Beras</option>
                      <option value="Pakaian">Pakaian Layak Pakai</option>
                      <option value="Sembako">Sembako</option>
                      <option value="Fasilitas Pendidikan">Fasilitas Pendidikan</option>
                      <option value="Obat-obatan">Obat-obatan</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  )}
                </select>
                {formErrors.itemType && <p className="text-[10px] text-red-500 font-semibold mt-1">{formErrors.itemType}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {(category === "Wakaf" || category === "Hibah") && (itemType === "Tanah" || itemType === "Rumah") 
                    ? "Detail / Keterangan (Luas, Lokasi, dsb)"
                    : (itemType === "Beras" || itemType === "Sembako") 
                    ? "Kuantitas (Kg / Paket)"
                    : "Detail Barang / Kuantitas"}
                </label>
                
                {((category === "Wakaf" || category === "Hibah") && (itemType === "Tanah" || itemType === "Rumah")) ? (
                  <textarea
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Contoh: Luas tanah 200m2 di lokasi X..."
                    rows={3}
                    className="block w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (itemType === "Beras" || itemType === "Sembako") ? (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setItemDescription(String(Math.max(1, (parseInt(itemDescription) || 1) - 1)) + (itemType === 'Beras' ? ' Kg' : ' Paket'))} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold">-</button>
                    <input
                      type="text"
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      placeholder={itemType === "Beras" ? "Contoh: 10 Kg" : "Contoh: 5 Paket"}
                      className="block w-full text-center rounded-lg border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button type="button" onClick={() => setItemDescription(String((parseInt(itemDescription) || 0) + 1) + (itemType === 'Beras' ? ' Kg' : ' Paket'))} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold">+</button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Contoh: 10 Sak Semen, 50 Kg Beras, dst."
                    className="block w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                )}
                {formErrors.itemDescription && <p className="text-[10px] text-red-500 font-semibold mt-1">{formErrors.itemDescription}</p>}
              </div>
            </div>
          )}

          
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
          {/* Donor Info Header */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User2 className="w-4 h-4 text-emerald-600" /> Informasi Donatur
              </h4>
              {registeredMember && (
                <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
                  <input type="checkbox" checked={isDonateAsOther} onChange={e => setIsDonateAsOther(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                  Donasi untuk orang lain
                </label>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={isDonateAsOther ? donorName : (registeredMember?.name || donorName)}
                  disabled={!isDonateAsOther && !!registeredMember}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Hamba Allah / Nama Anda"
                  className="block w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {formErrors.donorName && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">{formErrors.donorName}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Nomor WhatsApp (Aktif)
                </label>
                <input
                  type="tel"
                  value={isDonateAsOther ? donorWa : (registeredMember?.wa || donorWa)}
                  disabled={!isDonateAsOther && !!registeredMember}
                  onChange={(e) => setDonorWa(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="block w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {formErrors.donorWa && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">{formErrors.donorWa}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Alamat Email (Opsional)
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="block w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Tuliskan Do'a / Harapan Anda (Akan Tampil di Dinding Do'a)
                </label>
                <textarea
                  value={donorPrayer}
                  onChange={(e) => setDonorPrayer(e.target.value)}
                  placeholder="Semoga Allah membalas kebaikan, melancarkan usaha kami..."
                  rows={3}
                  className="block w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector (Only for Uang) */}
          {donationType === "Uang" && (
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Pilih Metode Pembayaran
              </h4>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const IconComp = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethodId === method.id
                          ? "bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-400"
                          : "bg-white border-slate-150 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          paymentMethodId === method.id ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{method.name}</p>
                          {method.type === "bank" && (
                            <p className="text-[10px] text-slate-400">Salin No. Rekening di halaman selanjutnya</p>
                          )}
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethodId === method.id}
                        onChange={() => setPaymentMethodId(method.id)}
                        className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button Step 2 */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/10 transition-all"
          >
            {donationType === "Uang" ? "Lanjut Pembayaran" : "Lanjut Konfirmasi"} <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="p-5 space-y-5">
          {/* Alert countdown */}
          <div className="bg-yellow-50 border border-yellow-100 p-3.5 rounded-xl flex items-start gap-2 text-yellow-800">
            <Clock className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-xs font-bold">{donationType === "Uang" ? "Menunggu Pembayaran" : "Menunggu Serah Terima"}</p>
              <p className="text-[10px] leading-relaxed opacity-90">{donationType === "Uang" ? "Mohon lakukan pembayaran sebelum batas waktu berakhir. Detail tagihan juga telah dicatat." : "Detail donasi Anda telah kami catat. Silakan lanjutkan konfirmasi dengan tim kami."}</p>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3.5 shadow-sm">
            <div className="flex justify-between items-center text-[10px] text-slate-400 pb-3 border-b border-slate-100">
              <span className="font-semibold">NO. INVOICE: <span className="text-slate-700">{invoiceId}</span></span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString("id-ID")}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Program:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{programTitle}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Donatur:</span>
                <span className="font-bold text-slate-800">{(isDonateAsOther ? donorName : (registeredMember?.name || donorName)) || "Hamba Allah"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">WhatsApp:</span>
                <span className="font-medium text-slate-800">{isDonateAsOther ? donorWa : (registeredMember?.wa || donorWa)}</span>
              </div>
              <div className="flex justify-between text-xs pb-3 border-b border-slate-100">
                <span className="text-slate-400">Kategori:</span>
                <span className="inline-flex bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">{category}</span>
              </div>

              {donationType === "Uang" ? (
                <>
                  {selectedPayment.type === "bank" && (
                    <>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Jumlah Donasi:</span>
                        <span>{formatRp(amount)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-yellow-600 font-semibold">
                        <span>Kode Unik (*Wajib):</span>
                        <span>+{uniqueCode}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-xs font-bold text-slate-700">Total Pembayaran:</span>
                    <span className="text-base font-black text-emerald-600">{formatRp(finalTotalAmount)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Bentuk Donasi:</span>
                    <span className="font-semibold text-slate-800">Barang</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Jenis Barang:</span>
                    <span className="font-semibold text-slate-800">{itemType}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1.5 border-t border-slate-100">
                    <span className="text-slate-400">Detail / Kuantitas:</span>
                    <span className="font-bold text-emerald-700 text-right max-w-[200px]">{itemDescription}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment execution box */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col items-center justify-center text-center">
            {donationType === "Barang" ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">Konfirmasi Serah Terima Barang</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Tim Amil kami siap memfasilitasi penjemputan barang atau mengatur jadwal serah terima langsung. Silakan klik tombol di bawah untuk terhubung ke WhatsApp resmi kami.
                </p>
              </div>
            ) : selectedPayment.type === "qris" ? (
              <div className="space-y-3 w-full">
                <p className="text-xs font-bold text-slate-800">Scan QRIS Lazisna</p>
                {/* QR Code Graphic */}
                <div className="relative bg-white p-3 rounded-xl border border-slate-200 inline-block mx-auto shadow-inner">
                  <QRCode 
                    value={`00020101021226590014ID.CO.QRIS.WWW011893600009151234567021404123456789012351420014ID.CO.QRIS.WWW0215ID10203040506070303UME520454115303360540${String(finalTotalAmount).length.toString().padStart(2, '0')}${finalTotalAmount}5802ID5918LAZISNA YASNAWA6008JAKARTA6105123456304CAFE`}
                    size={144} // 36 * 4
                    className="mx-auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-white/5 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-1 rounded font-bold">Q R I S</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                  Silakan screenshot QR Code di atas, lalu scan melalui aplikasi E-Wallet atau M-Banking Anda (Gopay/OVO/Dana/dll).
                </p>
              </div>
            ) : selectedPayment.type === "ewallet" ? (
              <div className="w-full space-y-3.5">
                <p className="text-xs font-bold text-slate-800">Buka Aplikasi E-Wallet</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={(e) => { e.preventDefault(); window.location.href = 'dana://pay'; }} className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 rounded-xl text-xs transition-all border border-blue-200">
                    DANA
                  </button>
                  <button type="button" onClick={(e) => { e.preventDefault(); window.location.href = 'gojek://pay'; }} className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold py-2.5 rounded-xl text-xs transition-all border border-green-200">
                    GoPay
                  </button>
                  <button type="button" onClick={(e) => { e.preventDefault(); window.location.href = 'ovo://'; }} className="flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-2.5 rounded-xl text-xs transition-all border border-purple-200">
                    OVO
                  </button>
                  <button type="button" onClick={(e) => { e.preventDefault(); window.location.href = 'shopeeid://'; }} className="flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-2.5 rounded-xl text-xs transition-all border border-orange-200">
                    ShopeePay
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed text-left mt-3 bg-white p-3 border border-slate-150 rounded-xl">
                  Klik salah satu tombol di atas untuk membuka aplikasi e-wallet Anda secara otomatis. Setelah pembayaran berhasil, klik tombol "Saya Sudah Transfer" di bawah.
                </p>
              </div>
            ) : selectedPayment.type === "retail" ? (
              <div className="w-full space-y-3.5">
                <p className="text-xs font-bold text-slate-800">Pembayaran via Gerai {selectedPayment.name}</p>
                <div className="bg-white rounded-xl p-3 border border-slate-150 flex flex-col items-center justify-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1">Kode Pembayaran</p>
                  <p className="text-xl font-black text-emerald-700 tracking-widest font-mono">LZS-{uniqueCode}{amount.toString().slice(0, 3)}</p>
                </div>
                <div className="text-left text-[10px] text-slate-500 space-y-1.5 leading-relaxed">
                  <p>1. Datangi kasir {selectedPayment.name} terdekat.</p>
                  <p>2. Sampaikan bahwa Anda ingin melakukan pembayaran "Donasi Lazisna".</p>
                  <p>3. Tunjukkan Kode Pembayaran di atas kepada kasir.</p>
                </div>
              </div>
            ) : selectedPayment.type === "va" ? (
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
            ) : selectedPayment.type === "bank" ? (
              <div className="w-full space-y-3.5">
                <p className="text-xs font-bold text-slate-800">Transfer Rekening {selectedPayment.name}</p>
                <div className="bg-white rounded-xl p-3 border border-slate-150 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">No. Rekening</p>
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
                        <Copy className="w-3.5 h-3.5" /> Salin No.
                      </>
                    )}
                  </button>
                </div>
                <div className="text-left text-xs space-y-1">
                  <p className="text-slate-500">Atas Nama: <span className="font-bold text-slate-700">{selectedPayment.holder}</span></p>
                  <p className="text-[10px] text-yellow-600 italic">Penting: Mohon sertakan nominal transfer pas hingga 3 digit terakhir (*Kode Unik) untuk mempermudah audit otomatis syariah.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">Konfirmasi via WhatsApp</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Silakan klik tombol konfirmasi di bawah untuk mengirim detail donasi Anda ke WhatsApp resmi kami dan mendapatkan nomor rekening secara manual.
                </p>
              </div>
            )}
          </div>

          {/* Action confirmation button */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleConfirmPayment}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/10 transition-all active:scale-[0.99]"
            >
              {donationType === "Uang" ? "Saya Sudah Transfer" : "Lanjut Serah Terima"} <CheckCircle className="w-4 h-4" />
            </button>
            <p className="text-center text-[10px] text-slate-400">
              Donasi Anda secara otomatis dicatat dalam histori kebaikan setelah menekan tombol di atas.
            </p>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center my-auto min-h-[70vh]">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce shadow-inner border border-emerald-100">
            <Heart className="w-10 h-10 text-emerald-600 fill-emerald-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 font-sans">
              Terima Kasih, {(isDonateAsOther ? donorName : (registeredMember?.name || donorName)) || "Hamba Allah"}!
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Alhamdulillah, {donationType === "Uang" 
                ? <>donasi Anda untuk <span className="font-semibold text-emerald-600">{programTitle}</span> senilai <span className="font-bold text-slate-800">{formatRp(finalTotalAmount)}</span></> 
                : <>donasi barang (<span className="font-semibold text-emerald-600">{itemType}</span>) Anda untuk <span className="font-semibold text-emerald-600">{programTitle}</span></>} telah sukses terdaftar di sistem Lazisna.
            </p>
            {donorPrayer && (
              <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50 italic text-[11px] text-slate-600 max-w-xs mx-auto mt-3">
                "{donorPrayer}"
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-2">
              Semoga Allah SWT melimpahkan berkah yang berlipat ganda atas amal jariyah Anda, dimudahkan rezeki, serta diberikan kesehatan dan kedamaian sekeluarga. Aamiin ya Rabbal Alamiin.
            </p>
          </div>

            {/* Donation Impact Card */}
            {donationType === "Uang" && (
              <div className="w-full bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm text-left relative overflow-hidden mt-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <h4 className="text-[11px] font-bold text-slate-700 mb-3 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" /> Dampak Kebaikan Anda</h4>
                
                {category === "Wakaf" || programTitle.toLowerCase().includes("bangunan") || programTitle.toLowerCase().includes("masjid") || programTitle.toLowerCase().includes("asrama") ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-medium text-slate-500">Setara dengan:</span>
                      <span className="font-bold text-emerald-700 text-sm">{Math.max(1, Math.floor(finalTotalAmount / 65000))} Sak Semen</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '100%', animation: 'progressAnim 1.5s ease-out forwards' }}></div>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed">Membantu mempercepat proses pembangunan fisik fasilitas ibadah dan asrama santri.</p>
                  </div>
                ) : category === "Zakat" || programTitle.toLowerCase().includes("yatim") || programTitle.toLowerCase().includes("lansia") ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-medium text-slate-500">Setara dengan:</span>
                      <span className="font-bold text-emerald-700 text-sm">{Math.max(1, Math.floor(finalTotalAmount / 50000))} Paket Pangan</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '100%', animation: 'progressAnim 1.5s ease-out forwards' }}></div>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed">Memenuhi kebutuhan nutrisi dan sembako dasar bagi penerima manfaat binaan.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-medium text-slate-500">Setara dengan:</span>
                      <span className="font-bold text-emerald-700 text-sm">{Math.max(1, Math.floor(finalTotalAmount / 15000))} Porsi Makan Santri</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '100%', animation: 'progressAnim 1.5s ease-out forwards' }}></div>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed">Memberikan energi gizi harian bagi para santri penghafal Qur'an untuk terus menuntut ilmu.</p>
                  </div>
                )}
                
                <style>{`
                  @keyframes progressAnim {
                    0% { width: 0%; opacity: 0.5; }
                    100% { width: 100%; opacity: 1; }
                  }
                `}</style>
              </div>
            )}

          {/* Action buttons */}
          <div className="w-full space-y-2 pt-4">
            <a
              href={getWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 transition-all active:scale-[0.99]"
            >
              Konfirmasi WhatsApp <Send className="w-4 h-4" />
            </a>
            
            <DonationReceipt 
              donorName={(isDonateAsOther ? donorName : (registeredMember?.name || donorName))}
              amount={finalTotalAmount}
              programTitle={programTitle}
              category={category}
              donationType={donationType}
              itemType={itemType}
              itemDescription={itemDescription}
              date={new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              receiptNumber={`LZS-${new Date().getTime().toString().slice(-6)}-${uniqueCode}`}
            />

            <button
              onClick={onBackToHome}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl text-xs transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
