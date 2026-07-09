import { Program, NewsReport } from "./types";

export const PROGRAMS: Program[] = [
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

export const NEWS_REPORTS: NewsReport[] = [
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
