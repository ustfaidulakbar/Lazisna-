import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

interface Prayer {
  id: string;
  name: string;
  prayer: string;
  program?: string;
  createdAt: string;
  aminCount: number;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  iconType: "qris" | "bank" | "manual";
  isActive: boolean;
}

interface DonationRecord {
  id: string;
  donorName: string;
  donorWa: string;
  amount: number;
  category: string;
  programId: string;
  programTitle: string;
  paymentMethod: string;
  date: string;
  prayer?: string;
  status: "Pending" | "Success" | "Rejected";
  invoiceId: string;
}

interface NewsReport {
  id: string;
  title: string;
  image: string;
  date: string;
  summary: string;
  category: string;
}

interface SystemNotification {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: "info" | "success" | "warning";
}

interface Program {
  id: string;
  title: string;
  category: string;
  image: string;
  targetAmount: number;
  collectedAmount: number;
  donorsCount: number;
  daysLeft: number;
  description: string;
  location: string;
}

interface Ustadz {
  id: number;
  name: string;
  address: string;
  wa: string;
  specialization: string;
  image: string;
  ig?: string;
  yt?: string;
}

// In-Memory state
let ustadzList: Ustadz[] = [
  {
    id: 1,
    name: "Ust. M Faidul Akbar S.s.,M.Ag",
    address: "Jl. Rurung Teros, No.1, Ds. Teko, Kec. Pringgabaya, Lombok Timur",
    wa: "081902366526",
    specialization: "Fiqih, Zakat & Wakaf",
    image: "https://ui-avatars.com/api/?name=Faidul+Akbar&background=10b981&color=fff&size=128",
    ig: "@ust.faidulakbar",
    yt: "Faidul Akbar Official"
  },
  {
    id: 2,
    name: "Syeikh Abdullah Helmy Al Azhari",
    address: "Kotaraja, Lombok Timur",
    wa: "081234567890",
    specialization: "Tafsir & Hadits",
    image: "https://ui-avatars.com/api/?name=Abdullah+Helmy&background=10b981&color=fff&size=128",
    ig: "@helmy.alazhari",
    yt: "Kajian Syeikh Helmy"
  }
];

const prayerWall: Prayer[] = [
  {
    id: "1",
    name: "Hamba Allah",
    prayer: "Semoga pembangunan Asrama PTQH NW Teko berjalan lancar dan menjadi amal jariyah untuk semua donatur. Aamiin.",
    program: "Asrama PTQH",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    aminCount: 14
  },
  {
    id: "2",
    name: "Siti Rahma",
    prayer: "Ya Allah, sembuhkanlah ibunda kami yang sedang sakit, dan berkahilah harta yang kami infaqkan hari ini.",
    program: "Infaq",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    aminCount: 29
  },
  {
    id: "3",
    name: "Ahmad Fauzi",
    prayer: "Semoga anak-anak yatim yang menerima bantuan beras selalu sehat, gembira, dan dimudahkan belajarnya.",
    program: "Beras Yatim",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    aminCount: 8
  }
];

const bankAccounts: BankAccount[] = [
  { id: "qris", bankName: "QRIS Instant (Muassasah Annahdliyah)", accountNumber: "BSI: 7343059897", accountHolder: "MUASSASAH ANNAHDLIYAH ALWATHONIYAH", iconType: "qris", isActive: true },
  { id: "bsi", bankName: "Bank Syariah Indonesia (BSI)", accountNumber: "7343059897", accountHolder: "MUASSASAH ANNAHDLIYAH ALWATHONIYAH", iconType: "bank", isActive: true },
  { id: "manual", bankName: "Konfirmasi WhatsApp Manual", accountNumber: "081902366526", accountHolder: "MUASSASAH ANNAHDLIYAH ALWATHONIYAH", iconType: "manual", isActive: true }
];

const programsState: Program[] = [
  {
    id: "asrama-ptqh",
    title: "Pembangunan Asrama PTQH NW Teko",
    category: "Wakaf",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
    targetAmount: 500000000,
    collectedAmount: 312450000,
    donorsCount: 1240,
    daysLeft: 45,
    description: "Program pembangunan asrama untuk santri penghafal Al-Qur'an di Pondok Tahfidzul Qur'an Hasanah (PTQH) NW Teko. Asrama ini dirancang untuk menampung lebih dari 100 santri yatim dan dhuafa yang menuntut ilmu secara gratis.",
    location: "Kec. Selong, Lombok Timur, NTB"
  },
  {
    id: "beras-yatim",
    title: "Penyaluran Beras bagi Anak Yatim & Dhuafa",
    category: "Sodaqoh",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600",
    targetAmount: 75000000,
    collectedAmount: 58900000,
    donorsCount: 840,
    daysLeft: 12,
    description: "Bantuan pangan berupa beras berkualitas untuk memenuhi kebutuhan konsumsi harian anak-anak yatim di panti asuhan serta keluarga dhuafa prasejahtera yang berada di bawah naungan Yayasan Yasnawa.",
    location: "Lombok Timur, NTB"
  },
  {
    id: "beasiswa-santri",
    title: "Beasiswa Pendidikan Santri Penghafal Qur'an",
    category: "Zakat",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600",
    targetAmount: 120000000,
    collectedAmount: 74200000,
    donorsCount: 310,
    daysLeft: 30,
    description: "Dukungan biaya pendidikan, kitab suci, seragam, dan uang saku bulanan untuk santri-santri berprestasi yang sedang berjuang menghafalkan Al-Qur'an namun memiliki keterbatasan ekonomi.",
    location: "Lombok Timur & Lombok Tengah"
  },
  {
    id: "sumur-bersih",
    title: "Wakaf Sumur Bor & Air Bersih Pelosok NTB",
    category: "Wakaf",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600",
    targetAmount: 90000000,
    collectedAmount: 82000000,
    donorsCount: 415,
    daysLeft: 5,
    description: "Pembuatan sumur bor dan sistem pipanisasi air bersih untuk dusun-dusun terpencil di pelosok NTB yang sering mengalami kekeringan ekstrem saat musim kemarau, guna menjamin wudhu masjid dan kebutuhan air bersih warga.",
    location: "Sambelia, Lombok Timur"
  },
  {
    id: "kesehatan-lansia",
    title: "Bantuan Pengobatan & Kesehatan Dhuafa Lansia",
    category: "Infaq",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600",
    targetAmount: 50000000,
    collectedAmount: 21300000,
    donorsCount: 180,
    daysLeft: 18,
    description: "Layanan pengobatan gratis, pengadaan alat bantu dengar/jalan, serta subsidi tebus obat bagi lansia dhuafa yang mengidap penyakit kronis namun tidak tercover oleh jaminan kesehatan standar.",
    location: "Nusa Tenggara Barat"
  }
];

const newsReports: NewsReport[] = [
  {
    id: "news-1",
    title: "Penyaluran Beras Yatim Tahap 1 Sukses Digelar",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400",
    date: "22 Juni 2026",
    summary: "Lazisna menyalurkan sebanyak 1,5 ton beras berkualitas untuk 150 santri yatim di asrama PTQH dan lingkungan sekitar Yasnawa. Senyum bahagia terpancar dari wajah mereka.",
    category: "Laporan"
  },
  {
    id: "news-2",
    title: "Update Pembangunan Fondasi Lantai 2 Asrama PTQH NW Teko",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400",
    date: "15 Juni 2026",
    summary: "Berkat wakaf Anda, kini pengecoran tiang penyangga lantai 2 telah selesai 100%. Pembangunan terus berjalan lancar berkat doa dan dukungan berkelanjutan.",
    category: "Pembangunan"
  },
  {
    id: "news-3",
    title: "Sumur Wakaf Ke-4 Mulai Mengalir di Sambelia",
    image: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=400",
    date: "05 Juni 2026",
    summary: "Warga Sambelia kini tidak perlu lagi berjalan kaki 3 kilometer untuk mendapatkan air bersih. Air jernih kini mengalir langsung di halaman masjid setempat.",
    category: "Wakaf"
  }
];

const systemNotifications: SystemNotification[] = [
  {
    id: "notif-1",
    title: "Audit Keuangan Syariah WTP!",
    content: "Alhamdulillah, Laporan Keuangan Lazisna Yasnawa kembali meraih opini Wajar Tanpa Pengecualian (WTP). Amanah Anda terjaga utuh.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: "success"
  },
  {
    id: "notif-2",
    title: "Penyaluran Beras Yatim",
    content: "Penyaluran beras berkah tahap kedua akan dilaksanakan hari Jumat besok di Selong.",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    type: "info"
  }
];

const donationsList: DonationRecord[] = [
  {
    id: "LZS-202606-4820",
    donorName: "M. Faisal",
    donorWa: "081273829100",
    amount: 150000,
    category: "Infaq",
    programId: "umum",
    programTitle: "Infaq & Sedekah Umum (Yayasan Yasnawa)",
    paymentMethod: "Bank Syariah Indonesia (BSI)",
    date: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    prayer: "Semoga berkah untuk keluarga kami.",
    status: "Success",
    invoiceId: "LZS-202606-4820"
  },
  {
    id: "LZS-202606-1928",
    donorName: "Hamba Allah",
    donorWa: "085392817293",
    amount: 500000,
    category: "Wakaf",
    programId: "asrama-ptqh",
    programTitle: "Pembangunan Asrama PTQH NW Teko",
    paymentMethod: "QRIS Instant (Gopay/OVO/ShopeePay)",
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    prayer: "Pahala jariyah untuk almarhum ayah.",
    status: "Success",
    invoiceId: "LZS-202606-1928"
  },
  {
    id: "LZS-202606-3392",
    donorName: "Rina Kartika",
    donorWa: "081928374852",
    amount: 250000,
    category: "Zakat",
    programId: "beasiswa-santri",
    programTitle: "Beasiswa Pendidikan Santri Penghafal Qur'an",
    paymentMethod: "Bank Syariah Indonesia (BSI)",
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
    prayer: "Semoga anak kami lancar kuliahnya.",
    status: "Pending",
    invoiceId: "LZS-202606-3392"
  },
  {
    id: "LZS-202606-9923",
    donorName: "Budi Santoso",
    donorWa: "081234567890",
    amount: 100000,
    category: "Sodaqoh",
    programId: "beras-yatim",
    programTitle: "Penyaluran Beras bagi Anak Yatim & Dhuafa",
    paymentMethod: "Bank Mandiri Syariah (VA)",
    date: new Date(Date.now() - 3600000 * 14).toISOString(),
    prayer: "Sehat selalu anak yatim.",
    status: "Success",
    invoiceId: "LZS-202606-9923"
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client
  let ai: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  } catch (err) {
    console.error("Failed to initialize Gemini AI:", err);
  }

  // --- API ROUTES ---

  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Lazisna Server is running" });
  });

  // 2. Gemini AI Consultation
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, history = [] } = req.body;
      if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
      }

      if (!ai) {
        res.status(503).json({
          error: "Gemini API is not configured or initialized. Please check your GEMINI_API_KEY secret."
        });
        return;
      }

      const systemInstruction = `Anda adalah 'Ustadz Lazisna AI', asisten AI dan konsultan syariah pintar untuk Lazisna (Lembaga Amil Zakat, Infaq, Wakaf, Sodaqoh Yasnawa).
Tugas Anda adalah:
1. Membantu donatur memahami ketentuan Zakat, Infaq, Wakaf, dan Sodaqoh (ZISWAF).
2. Menghitung kewajiban zakat secara syariah (misal Zakat Profesi, Zakat Maal, Zakat Perdagangan) dengan penjelasan yang sangat ramah, sabar, dan mudah dipahami.
3. Menjelaskan program-program Lazisna (seperti Pembangunan Asrama PTQH NW Teko, Penyaluran Beras Yatim, Beasiswa Santri, dll).
4. Menjawab pertanyaan keagamaan seputar amalan sedekah dan sosial dengan penuh adab, hikmah, serta menyisipkan doa keberkahan.

Aturan Penting:
- Jawab dalam Bahasa Indonesia yang santun, sejuk, dan penuh kehangatan (gunakan sapaan hangat seperti "Sahabat Kebaikan", "Bapak", "Ibu", atau "Saudaraku").
- Sertakan doa keberkahan di awal atau akhir jawaban Anda (misal: "Semoga Allah melimpahkan keberkahan atas harta yang Bapak miliki, Aamiin").
- Jika pengguna bertanya tentang cara donasi, jelaskan bahwa mereka bisa memilih program di aplikasi Lazisna, mengisi formulir singkat, dan menyelesaikan donasi dengan mudah (bisa lewat transfer, QRIS, atau konfirmasi WhatsApp langsung).
- Buat jawaban ringkas, terstruktur menggunakan poin-poin agar nyaman dibaca di layar HP.`;

      const contents = [];
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini route error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // 3. Prayer Wall API
  app.get("/api/prayers", (req, res) => {
    res.json(prayerWall);
  });

  app.post("/api/prayers", (req, res) => {
    const { name, prayer, program } = req.body;
    if (!name || !prayer) {
      res.status(400).json({ error: "Nama dan Doa wajib diisi" });
      return;
    }

    const newPrayer: Prayer = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.substring(0, 50),
      prayer: prayer.substring(0, 300),
      program: program ? program.substring(0, 40) : undefined,
      createdAt: new Date().toISOString(),
      aminCount: 0
    };

    prayerWall.unshift(newPrayer);
    if (prayerWall.length > 50) {
      prayerWall.pop();
    }

    res.status(201).json(newPrayer);
  });

  app.post("/api/prayers/:id/amin", (req, res) => {
    const { id } = req.params;
    const prayer = prayerWall.find(p => p.id === id);
    if (!prayer) {
      res.status(404).json({ error: "Doa tidak ditemukan" });
      return;
    }
    prayer.aminCount += 1;
    res.json(prayer);
  });

  // --- 4. REKENING TUJUAN (BANK ACCOUNTS) API ---
  app.get("/api/bank-accounts", (req, res) => {
    res.json(bankAccounts);
  });

  app.post("/api/bank-accounts", (req, res) => {
    const { bankName, accountNumber, accountHolder, iconType, isActive } = req.body;
    if (!bankName || !accountNumber || !accountHolder) {
      res.status(400).json({ error: "Bank name, account number, and holder name are required" });
      return;
    }

    const newAccount: BankAccount = {
      id: Math.random().toString(36).substring(2, 9),
      bankName,
      accountNumber,
      accountHolder,
      iconType: iconType || "bank",
      isActive: isActive !== undefined ? isActive : true
    };

    bankAccounts.push(newAccount);
    res.status(201).json(newAccount);
  });

  app.put("/api/bank-accounts/:id", (req, res) => {
    const { id } = req.params;
    const { bankName, accountNumber, accountHolder, iconType, isActive } = req.body;
    const accountIndex = bankAccounts.findIndex(b => b.id === id);
    if (accountIndex === -1) {
      res.status(404).json({ error: "Bank account not found" });
      return;
    }

    const current = bankAccounts[accountIndex];
    bankAccounts[accountIndex] = {
      ...current,
      bankName: bankName !== undefined ? bankName : current.bankName,
      accountNumber: accountNumber !== undefined ? accountNumber : current.accountNumber,
      accountHolder: accountHolder !== undefined ? accountHolder : current.accountHolder,
      iconType: iconType !== undefined ? iconType : current.iconType,
      isActive: isActive !== undefined ? isActive : current.isActive
    };

    res.json(bankAccounts[accountIndex]);
  });

  app.delete("/api/bank-accounts/:id", (req, res) => {
    const { id } = req.params;
    const accountIndex = bankAccounts.findIndex(b => b.id === id);
    if (accountIndex === -1) {
      res.status(444).json({ error: "Bank account not found" });
      return;
    }
    bankAccounts.splice(accountIndex, 1);
    res.json({ success: true, id });
  });


  // --- 5. DONATIONS & LAPORAN API ---
  app.get("/api/donations", (req, res) => {
    res.json(donationsList);
  });

  app.post("/api/donations", (req, res) => {
    const { donorName, donorWa, amount, category, programId, programTitle, paymentMethod, prayer, status } = req.body;
    
    const randNum = Math.floor(Math.random() * 9000) + 1000;
    const generatedInvoice = `LZS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${randNum}`;

    const newDonation: DonationRecord = {
      id: generatedInvoice,
      donorName: donorName || "Hamba Allah",
      donorWa: donorWa || "081234567890",
      amount: Number(amount) || 50000,
      category: category || "Infaq",
      programId: programId || "umum",
      programTitle: programTitle || "Infaq & Sedekah Umum (Yayasan Yasnawa)",
      paymentMethod: paymentMethod || "QRIS Instant",
      date: new Date().toISOString(),
      prayer: prayer || undefined,
      status: status || "Pending",
      invoiceId: generatedInvoice
    };

    donationsList.unshift(newDonation);

    // If instantly active/Success, update program totals
    if (newDonation.status === "Success") {
      const prog = programsState.find(p => p.id === newDonation.programId);
      if (prog) {
        prog.collectedAmount += newDonation.amount;
        prog.donorsCount += 1;
      }
    }

    res.status(201).json(newDonation);
  });

  app.put("/api/donations/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // "Pending" | "Success" | "Rejected"
    
    const donation = donationsList.find(d => d.id === id);
    if (!donation) {
      res.status(404).json({ error: "Donation record not found" });
      return;
    }

    const previousStatus = donation.status;
    donation.status = status;

    // Adjust programmatic stats on success / un-success
    if (previousStatus !== "Success" && status === "Success") {
      const prog = programsState.find(p => p.id === donation.programId);
      if (prog) {
        prog.collectedAmount += donation.amount;
        prog.donorsCount += 1;
      }
    } else if (previousStatus === "Success" && status !== "Success") {
      const prog = programsState.find(p => p.id === donation.programId);
      if (prog) {
        prog.collectedAmount = Math.max(0, prog.collectedAmount - donation.amount);
        prog.donorsCount = Math.max(0, prog.donorsCount - 1);
      }
    }

    res.json(donation);
  });

  app.delete("/api/donations/:id", (req, res) => {
    const { id } = req.params;
    const index = donationsList.findIndex(d => d.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }
    const deleted = donationsList[index];
    
    // Deduct stats if it was successful
    if (deleted.status === "Success") {
      const prog = programsState.find(p => p.id === deleted.programId);
      if (prog) {
        prog.collectedAmount = Math.max(0, prog.collectedAmount - deleted.amount);
        prog.donorsCount = Math.max(0, prog.donorsCount - 1);
      }
    }

    donationsList.splice(index, 1);
    res.json({ success: true, id });
  });


  // --- 6. NEWS / LAPORAN PENYALURAN API ---
  app.get("/api/news", (req, res) => {
    res.json(newsReports);
  });

  app.post("/api/news", (req, res) => {
    const { title, image, date, summary, category } = req.body;
    if (!title || !summary) {
      res.status(400).json({ error: "Title and Summary are required" });
      return;
    }

    const newReport: NewsReport = {
      id: "news-" + Math.random().toString(36).substring(2, 9),
      title,
      image: image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400",
      date: date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      summary,
      category: category || "Laporan"
    };

    newsReports.unshift(newReport);
    res.status(201).json(newReport);
  });

  app.put("/api/news/:id", (req, res) => {
    const { id } = req.params;
    const { title, image, date, summary, category } = req.body;
    const index = newsReports.findIndex(n => n.id === id);
    if (index === -1) {
      res.status(404).json({ error: "News article not found" });
      return;
    }

    const current = newsReports[index];
    newsReports[index] = {
      ...current,
      title: title !== undefined ? title : current.title,
      image: image !== undefined ? image : current.image,
      date: date !== undefined ? date : current.date,
      summary: summary !== undefined ? summary : current.summary,
      category: category !== undefined ? category : current.category
    };

    res.json(newsReports[index]);
  });

  app.delete("/api/news/:id", (req, res) => {
    const { id } = req.params;
    const index = newsReports.findIndex(n => n.id === id);
    if (index === -1) {
      res.status(444).json({ error: "News article not found" });
      return;
    }
    newsReports.splice(index, 1);
    res.json({ success: true, id });
  });


  // --- 7. NOTIFICATIONS API ---
  app.get("/api/notifications", (req, res) => {
    res.json(systemNotifications);
  });

  app.post("/api/notifications", (req, res) => {
    const { title, content, type } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required" });
      return;
    }

    const newNotification: SystemNotification = {
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      title,
      content,
      createdAt: new Date().toISOString(),
      type: type || "info"
    };

    systemNotifications.unshift(newNotification);
    res.status(201).json(newNotification);
  });

  app.delete("/api/notifications/:id", (req, res) => {
    const { id } = req.params;
    const index = systemNotifications.findIndex(n => n.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    systemNotifications.splice(index, 1);
    res.json({ success: true, id });
  });

  // --- 8. GET PROGRAMS API (To read reactive program totals) ---
  app.get("/api/programs", (req, res) => {
    res.json(programsState);
  });

  // --- 9. PUT PROGRAM API (To edit program details like collectedAmount and donorsCount) ---
  app.put("/api/programs/:id", (req, res) => {
    const { id } = req.params;
    const { collectedAmount, donorsCount } = req.body;

    const program = programsState.find(p => p.id === id);
    if (!program) {
      res.status(404).json({ error: "Program not found" });
      return;
    }

    if (typeof collectedAmount === "number") {
      program.collectedAmount = collectedAmount;
    }
    if (typeof donorsCount === "number") {
      program.donorsCount = donorsCount;
    }

    res.json({ success: true, program });
  });

  // --- 10. USTADZ API ---
  app.get("/api/ustadz", (req, res) => {
    res.json(ustadzList);
  });

  app.post("/api/ustadz", (req, res) => {
    const { name, address, wa, specialization, image, ig, yt } = req.body;
    if (!name || !wa) {
      res.status(400).json({ error: "Name and wa are required" });
      return;
    }

    const newUstadz: Ustadz = {
      id: Date.now(),
      name,
      address: address || "",
      wa,
      specialization: specialization || "",
      image: image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&size=128`,
      ig: ig || "",
      yt: yt || ""
    };

    ustadzList.unshift(newUstadz);
    res.json(newUstadz);
  });

  app.put("/api/ustadz/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = ustadzList.findIndex(u => u.id === id);
    
    if (index === -1) {
      res.status(404).json({ error: "Ustadz not found" });
      return;
    }
    
    const { name, address, wa, specialization, image, ig, yt } = req.body;
    ustadzList[index] = {
      ...ustadzList[index],
      name: name || ustadzList[index].name,
      address: address ?? ustadzList[index].address,
      wa: wa || ustadzList[index].wa,
      specialization: specialization ?? ustadzList[index].specialization,
      image: image || ustadzList[index].image,
      ig: ig ?? ustadzList[index].ig,
      yt: yt ?? ustadzList[index].yt
    };
    
    res.json(ustadzList[index]);
  });

  app.delete("/api/ustadz/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = ustadzList.findIndex(u => u.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Ustadz not found" });
      return;
    }
    ustadzList.splice(index, 1);
    res.json({ success: true, id });
  });

  // --- VITE DEV OR PRODUCTION CONFIGURATION ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lazisna full-stack app running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
