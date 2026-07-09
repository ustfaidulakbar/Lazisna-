import React, { useState, useEffect } from "react";
import { Calculator, HelpCircle, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface ZakatCalculatorProps {
  onPayZakat: (amount: number, category: "Zakat" | "Infaq") => void;
}

export default function ZakatCalculator({ onPayZakat }: ZakatCalculatorProps) {
  const [activeTab, setActiveTab] = useState<"penghasilan" | "maal" | "pertanian">("penghasilan");

  // State for Zakat Penghasilan (Income Zakat)
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [otherIncome, setOtherIncome] = useState<number>(0);

  // State for Zakat Maal (Savings/Wealth Zakat)
  const [cashSavings, setCashSavings] = useState<number>(0);
  const [goldValue, setGoldValue] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [tradeAssets, setTradeAssets] = useState<number>(0);

  // State for Zakat Pertanian (Agricultural Zakat)
  const [commodity, setCommodity] = useState<string>("beras");
  const [harvestWeight, setHarvestWeight] = useState<number>(0);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [irrigationRate, setIrrigationRate] = useState<0.05 | 0.1>(0.05);

  const COMMODITIES: Record<string, { name: string; defaultPrice: number; nisabKg?: number }> = {
    beras: { name: "Beras", defaultPrice: 15000, nisabKg: 653 },
    padi: { name: "Padi / Gabah", defaultPrice: 7000, nisabKg: 1323 },
    jagung: { name: "Jagung / Hasil Sereal", defaultPrice: 6000 },
    bawang: { name: "Bawang Merah/Putih", defaultPrice: 25000 },
    tomat: { name: "Tomat", defaultPrice: 12000 },
    cabai: { name: "Cabai", defaultPrice: 35000 },
    lainnya: { name: "Komoditas Lain", defaultPrice: 10000 }
  };

  // Constants
  const GOLD_PRICE_PER_GRAM = 1400000; // Est. 2026 gold price in Rp
  const NISAB_GOLD_GRAMS = 85;
  const ANNUAL_NISAB_MAAL = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM; // Rp 119,000,000
  const MONTHLY_NISAB_INCOME = 6867666; // Baznas standard Rp 6.86 Million/month

  // Calculated values
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [isIncomeNisabPassed, setIsIncomeNisabPassed] = useState<boolean>(false);
  const [calculatedIncomeZakat, setCalculatedIncomeZakat] = useState<number>(0);

  const [totalMaal, setTotalMaal] = useState<number>(0);
  const [isMaalNisabPassed, setIsMaalNisabPassed] = useState<boolean>(false);
  const [calculatedMaalZakat, setCalculatedMaalZakat] = useState<number>(0);

  const [totalPertanianValue, setTotalPertanianValue] = useState<number>(0);
  const [isPertanianNisabPassed, setIsPertanianNisabPassed] = useState<boolean>(false);
  const [calculatedPertanianZakat, setCalculatedPertanianZakat] = useState<number>(0);

  // Format currency
  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Run income calculations
  useEffect(() => {
    const total = monthlyIncome + otherIncome;
    setTotalIncome(total);
    const passed = total >= MONTHLY_NISAB_INCOME;
    setIsIncomeNisabPassed(passed);
    setCalculatedIncomeZakat(passed ? Math.round(total * 0.025) : 0);
  }, [monthlyIncome, otherIncome]);

  // Run wealth/maal calculations
  useEffect(() => {
    const total = cashSavings + goldValue + investments + tradeAssets;
    setTotalMaal(total);
    const passed = total >= ANNUAL_NISAB_MAAL;
    setIsMaalNisabPassed(passed);
    setCalculatedMaalZakat(passed ? Math.round(total * 0.025) : 0);
  }, [cashSavings, goldValue, investments, tradeAssets]);

  // Reset custom price on commodity change
  useEffect(() => {
    setCustomPrice(0);
  }, [commodity]);

  // Run pertanian calculations
  useEffect(() => {
    const config = COMMODITIES[commodity] || COMMODITIES.beras;
    const price = customPrice || config.defaultPrice;
    const totalVal = harvestWeight * price;
    setTotalPertanianValue(totalVal);

    let passed = false;
    const STANDARD_NISAB_VALUE = 653 * 15000; // setara 653kg beras

    if (commodity === "beras") {
      passed = harvestWeight >= 653;
    } else if (commodity === "padi") {
      passed = harvestWeight >= 1323;
    } else {
      passed = totalVal >= STANDARD_NISAB_VALUE;
    }

    setIsPertanianNisabPassed(passed);
    setCalculatedPertanianZakat(passed ? Math.round(totalVal * irrigationRate) : 0);
  }, [commodity, harvestWeight, customPrice, irrigationRate]);

  const handleQuickIncome = (amount: number) => {
    setMonthlyIncome(amount);
  };

  const handleQuickMaal = (amount: number) => {
    setCashSavings(amount);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Kalkulator Zakat</h3>
          <p className="text-[11px] text-slate-400">Hitung kewajiban zakat Anda secara akurat</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-5">
        <button
          onClick={() => setActiveTab("penghasilan")}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            activeTab === "penghasilan"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Penghasilan
        </button>
        <button
          onClick={() => setActiveTab("maal")}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            activeTab === "maal"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Maal (Harta)
        </button>
        <button
          onClick={() => setActiveTab("pertanian")}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            activeTab === "pertanian"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Pertanian
        </button>
      </div>

      {activeTab === "penghasilan" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Gaji / Pendapatan Bulanan (Rp)
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-slate-400 text-xs">Rp</span>
              </div>
              <input
                type="number"
                value={monthlyIncome || ""}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                placeholder="0"
                className="block w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {/* Quick choices */}
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {[5000000, 7500000, 10000000, 15000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickIncome(val)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border shrink-0 font-medium transition-all ${
                    monthlyIncome === val
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {val / 1000000} Jt
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Pendapatan Lain / Bonus Bulanan (Rp)
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-slate-400 text-xs">Rp</span>
              </div>
              <input
                type="number"
                value={otherIncome || ""}
                onChange={(e) => setOtherIncome(Number(e.target.value))}
                placeholder="0"
                className="block w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Reference Info Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-600">Ketentuan Nisab:</span> Nisab zakat profesi/penghasilan adalah setara 85g emas per tahun (senilai <span className="font-semibold text-slate-700">{formatRp(ANNUAL_NISAB_MAAL)}/tahun</span> atau sekitar <span className="font-semibold text-slate-700">{formatRp(MONTHLY_NISAB_INCOME)}/bulan</span>). Kadar zakatnya adalah <span className="font-semibold text-emerald-600">2.5%</span>.
            </div>
          </div>

          {/* Result Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            isIncomeNisabPassed 
              ? "bg-emerald-50/50 border-emerald-100 text-slate-700" 
              : "bg-slate-50 border-slate-150 text-slate-500"
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-500">Total Pendapatan:</span>
              <span className="text-sm font-bold text-slate-800">{formatRp(totalIncome)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50 mb-3 text-xs">
              <span className="font-medium text-slate-500">Status Kewajiban:</span>
              {isIncomeNisabPassed ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Wajib Zakat
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                  <AlertCircle className="w-3.5 h-3.5" /> Belum Wajib Zakat
                </span>
              )}
            </div>

            {isIncomeNisabPassed ? (
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-400">Rekomendasi Zakat Bulanan (2.5%):</p>
                    <p className="text-lg font-black text-emerald-600">{formatRp(calculatedIncomeZakat)}</p>
                  </div>
                  <button
                    onClick={() => onPayZakat(calculatedIncomeZakat, "Zakat")}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition-all hover:translate-x-0.5 active:scale-95"
                  >
                    Bayar Zakat <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Pendapatan bulanan Anda belum mencapai nisab wajib zakat. Namun, Anda dapat menyempurnakan kesyukuran dengan ber-Infaq sukarela.
                </p>
                <button
                  onClick={() => onPayZakat(25000, "Infaq")}
                  className="mt-3 inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-1.5 px-3.5 rounded-lg transition-all"
                >
                  Infaq Sukarela <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "maal" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">
                Tabungan, Cash & Deposito (Rp)
              </label>
              <input
                type="number"
                value={cashSavings || ""}
                onChange={(e) => setCashSavings(Number(e.target.value))}
                placeholder="0"
                className="block w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">
                Nilai Emas / Perak (Rp)
              </label>
              <input
                type="number"
                value={goldValue || ""}
                onChange={(e) => setGoldValue(Number(e.target.value))}
                placeholder="0"
                className="block w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">
                Saham & Investasi (Rp)
              </label>
              <input
                type="number"
                value={investments || ""}
                onChange={(e) => setInvestments(Number(e.target.value))}
                placeholder="0"
                className="block w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">
                Aset Bisnis / Perdagangan (Rp)
              </label>
              <input
                type="number"
                value={tradeAssets || ""}
                onChange={(e) => setTradeAssets(Number(e.target.value))}
                placeholder="0"
                className="block w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {[20000000, 50000000, 120000000, 200000000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickMaal(val)}
                className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full shrink-0 font-medium"
              >
                Simpanan {val >= 100000000 ? `${val / 1000000} Jt` : `${val / 1000000} Jt`}
              </button>
            ))}
          </div>

          {/* Reference Info Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-600">Ketentuan Nisab Maal:</span> Berdasarkan harga emas saat ini (Rp 1,4jt/g), nisab zakat maal adalah <span className="font-semibold text-slate-700">{formatRp(ANNUAL_NISAB_MAAL)}</span> (senilai 85 gram emas) dengan masa kepemilikan 1 tahun. Kadar zakatnya <span className="font-semibold text-emerald-600">2.5%</span>.
            </div>
          </div>

          {/* Result Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            isMaalNisabPassed 
              ? "bg-emerald-50/50 border-emerald-100 text-slate-700" 
              : "bg-slate-50 border-slate-150 text-slate-500"
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-500">Total Harta Terhitung:</span>
              <span className="text-sm font-bold text-slate-800">{formatRp(totalMaal)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50 mb-3 text-xs">
              <span className="font-medium text-slate-500">Status Kewajiban:</span>
              {isMaalNisabPassed ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Wajib Zakat Maal
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                  <AlertCircle className="w-3.5 h-3.5" /> Belum Wajib Zakat
                </span>
              )}
            </div>

            {isMaalNisabPassed ? (
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-400">Total Zakat Maal Anda (2.5%):</p>
                    <p className="text-lg font-black text-emerald-600">{formatRp(calculatedMaalZakat)}</p>
                  </div>
                  <button
                    onClick={() => onPayZakat(calculatedMaalZakat, "Zakat")}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition-all hover:translate-x-0.5 active:scale-95"
                  >
                    Bayar Zakat <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Akumulasi harta simpanan Anda belum mencapai nilai nisab tahunan emas. Diperbolehkan menyalurkan sedekah/infaq bebas kapan saja.
                </p>
                <button
                  onClick={() => onPayZakat(50000, "Infaq")}
                  className="mt-3 inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-1.5 px-3.5 rounded-lg transition-all"
                >
                  Infaq Sukarela <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "pertanian" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Pilih Komoditas Pertanian
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {Object.entries(COMMODITIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name} (Harga Acuan: {formatRp(value.defaultPrice)}/kg)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Berat Hasil Panen (kg)
              </label>
              <input
                type="number"
                value={harvestWeight || ""}
                onChange={(e) => setHarvestWeight(Number(e.target.value))}
                placeholder="0"
                className="block w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Harga Jual per kg (Rp)
              </label>
              <input
                type="number"
                value={customPrice || ""}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                placeholder={String((COMMODITIES[commodity] || COMMODITIES.beras).defaultPrice)}
                className="block w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Sistem Pengairan / Irigasi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIrrigationRate(0.1)}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium leading-tight transition-all ${
                  irrigationRate === 0.1
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Tadah Hujan / Aliran Sungai <span className="block text-[9px] text-slate-400 font-normal">Kadar Zakat 10% (Tanpa Biaya Irigasi)</span>
              </button>
              <button
                type="button"
                onClick={() => setIrrigationRate(0.05)}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium leading-tight transition-all ${
                  irrigationRate === 0.05
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Irigasi Berbayar / Pompa Air <span className="block text-[9px] text-slate-400 font-normal">Kadar Zakat 5% (Ada Biaya Operasional)</span>
              </button>
            </div>
          </div>

          {/* Reference Info Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-600">Ketentuan Nisab Pertanian:</span> Nisab hasil pertanian adalah <span className="font-semibold text-slate-700">5 wasaq</span>. Setara dengan <span className="font-semibold text-slate-700">653 kg beras</span> (atau <span className="font-semibold text-slate-700">1.323 kg padi/gabah</span>). Untuk komoditas lainnya, nisab disetarakan dengan nilai dari 653 kg beras (senilai <span className="font-semibold text-slate-700">{formatRp(653 * 15000)}</span>). Zakat dikeluarkan setiap kali panen (tanpa menunggu haul 1 tahun).
            </div>
          </div>

          {/* Result Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            isPertanianNisabPassed 
              ? "bg-emerald-50/50 border-emerald-100 text-slate-700" 
              : "bg-slate-50 border-slate-150 text-slate-500"
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-500">Estimasi Nilai Panen:</span>
              <span className="text-sm font-bold text-slate-800">{formatRp(totalPertanianValue)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50 mb-3 text-xs">
              <span className="font-medium text-slate-500">Status Kewajiban:</span>
              {isPertanianNisabPassed ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Wajib Zakat Pertanian ({irrigationRate * 100}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                  <AlertCircle className="w-3.5 h-3.5" /> Belum Mencapai Nisab
                </span>
              )}
            </div>

            {isPertanianNisabPassed ? (
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-400">Total Zakat Pertanian ({irrigationRate * 100}%):</p>
                    <p className="text-lg font-black text-emerald-600">{formatRp(calculatedPertanianZakat)}</p>
                  </div>
                  <button
                    onClick={() => onPayZakat(calculatedPertanianZakat, "Zakat")}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition-all hover:translate-x-0.5 active:scale-95"
                  >
                    Bayar Zakat <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Hasil panen Anda belum mencapai batas nisab ({commodity === "beras" ? "653 kg beras" : commodity === "padi" ? "1323 kg padi" : `setara Rp ${653 * 15000}`}). Sempurnakan berkah pertanian dengan menyalurkan Infaq/Sedekah terbaik Anda.
                </p>
                <button
                  onClick={() => onPayZakat(20000, "Infaq")}
                  className="mt-3 inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-1.5 px-3.5 rounded-lg transition-all"
                >
                  Infaq Sukarela <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
