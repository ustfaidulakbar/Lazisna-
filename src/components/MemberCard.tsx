import React, { useState, useEffect, useRef } from "react";
import { DonationRecord } from "../types";
import { 
  Award, QrCode, ClipboardList, Calendar, MapPin, 
  UserCheck, History, Heart, Share2, Check, ExternalLink,
  Settings, User, Camera, Bell, Smartphone, Clock, BadgeCheck, Plane, Star, Download, BarChart2, Fingerprint, Gift, Mail
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { auth, googleProvider, signInWithPopup, signOut as firebaseSignOut, db, doc, getDoc, setDoc, setCachedAccessToken, getCachedAccessToken, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "../lib/firebase";
import { GoogleAuthProvider } from "firebase/auth";
import { GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
interface MemberCardProps {
  pastDonations: DonationRecord[];
  onRegisterSuccess: (name: string, wa: string, photo?: string) => void;
  onAdminLogin: () => void;
  onNavigateToUmroh?: () => void;
  isAgent?: boolean;
}

export default function MemberCard({ pastDonations, onRegisterSuccess, onAdminLogin, onNavigateToUmroh, isAgent }: MemberCardProps) {
  const [name, setName] = useState<string>("");
  const [wa, setWa] = useState<string>("");
  const [registerPhoto, setRegisterPhoto] = useState<string>("");
  const [registeredUser, setRegisteredUser] = useState<{ name: string; wa: string; photo?: string; uid?: string; email?: string } | null>(null);
  const [password, setPassword] = useState<string>("");
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>("");
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendingSummary, setSendingSummary] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<"profil" | "pengaturan">("profil");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const registerPhotoInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [pushNotif, setPushNotif] = useState(true);
  const [waNotif, setWaNotif] = useState(true);
  const [locationPerm, setLocationPerm] = useState(false);
  const [scheduledInfaq, setScheduledInfaq] = useState(false);
  const [monthlyReminder, setMonthlyReminder] = useState(false);
  const [weeklyReminder, setWeeklyReminder] = useState(false);
  const [weeklyReminderDay, setWeeklyReminderDay] = useState(5); // 5 is Friday
  const [weeklyReminderTime, setWeeklyReminderTime] = useState("09:00");
  const [annualTarget, setAnnualTarget] = useState<number>(10000000);
  const [goalTitle, setGoalTitle] = useState<string>("Target Kebaikan");
  const [biometricEnabled, setBiometricEnabled] = useState(false); // Biometric toggle state
  const [redeemedPoints, setRedeemedPoints] = useState<number>(0);
  const [activeVouchers, setActiveVouchers] = useState<string[]>([]);
  const [infaqAmount, setInfaqAmount] = useState<number>(50000);
  const [infaqFrequency, setInfaqFrequency] = useState<string>("Setiap Hari Jumat (Jumat Berkah)");

  // Load registered user on mount
  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userData = {
          name: user.displayName || "Donatur",
          wa: user.phoneNumber || "-",
          photo: user.photoURL || undefined,
          uid: user.uid,
          email: user.email || undefined
        };
        setRegisteredUser(userData);
        localStorage.setItem("lazisna_member", JSON.stringify(userData));
        onRegisterSuccess(userData.name, userData.wa, userData.photo);
        
        // Load additional settings from Firestore if needed
        try {
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
             const data = docSnap.data();
             if (data.settings) {
               setBiometricEnabled(data.settings.biometricEnabled || false);
             }
          }
        } catch (e) {
          console.error("Failed to load user settings from Firestore:", e);
        }

      } else {
        const saved = localStorage.getItem("lazisna_member");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setRegisteredUser(parsed);
            onRegisterSuccess(parsed.name, parsed.wa, parsed.photo);
          } catch (e) {
            setRegisteredUser(null);
          }
        } else {
          setRegisteredUser(null);
        }
      }
    });
    
    // Load mock settings
    const savedSettings = localStorage.getItem("lazisna_settings");
    if (savedSettings) {
      try {
        const s = JSON.parse(savedSettings);
        setPushNotif(s.pushNotif ?? true);
        setWaNotif(s.waNotif ?? true);
        setLocationPerm(s.locationPerm ?? false);
        setScheduledInfaq(s.scheduledInfaq ?? false);
        setMonthlyReminder(s.monthlyReminder ?? false);
        setWeeklyReminder(s.weeklyReminder ?? false);
        setWeeklyReminderDay(s.weeklyReminderDay ?? 5);
        setWeeklyReminderTime(s.weeklyReminderTime ?? "09:00");
        setAnnualTarget(s.annualTarget ?? 10000000);
        setGoalTitle(s.goalTitle || "Target Kebaikan");
        setBiometricEnabled(s.biometricEnabled ?? false);
        setRedeemedPoints(s.redeemedPoints ?? 0);
        setActiveVouchers(s.activeVouchers ?? []);
      } catch (e) {}
    }

    return () => unsubscribe();
  }, []);

  const saveSettings = async (newSettings: any) => {
    const current = JSON.parse(localStorage.getItem("lazisna_settings") || "{}");
    const updatedSettings = { ...current, ...newSettings };
    localStorage.setItem("lazisna_settings", JSON.stringify(updatedSettings));
    
    if (registeredUser?.uid) {
      try {
        const userDocRef = doc(db, "users", registeredUser.uid);
        await setDoc(userDocRef, { settings: updatedSettings }, { merge: true });
      setRegisteredUser(userData);
      onRegisterSuccess(userData.name, userData.wa, userData.photo);
      } catch (e) {
        console.error("Failed to save settings to Firestore:", e);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCachedAccessToken(credential.accessToken);
      }
      const user = result.user;
      
      const userData = {
          name: user.displayName || "Donatur",
          wa: user.phoneNumber || "-",
          photo: user.photoURL || undefined,
          uid: user.uid,
          email: user.email || undefined
      };
      
      // Save user profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: userData.name,
        email: user.email,
        photoUrl: userData.photo,
        lastLogin: new Date()
      }, { merge: true });
      setRegisteredUser(userData);
      onRegisterSuccess(userData.name, userData.wa, userData.photo);
      
    } catch (error) {
      console.error("Google sign in failed:", error);
      alert("Gagal masuk dengan Google. Silakan coba lagi.");
    }
  };

  const handleSyncCalendar = async () => {
    const accessToken = getCachedAccessToken();
    if (!accessToken) {
      alert("Harap login dengan Google untuk menyinkronkan jadwal ke Google Calendar.");
      return;
    }

    const formatRpLocal = (amt: number) => "Rp " + amt.toLocaleString("id-ID");
    const confirmed = window.confirm(`Apakah Anda yakin ingin menambahkan pengingat infaq rutin sebesar ${formatRpLocal(infaqAmount)} (${infaqFrequency}) ke Google Calendar Anda?`);
    if (!confirmed) return;

    try {
      let rrule = "FREQ=WEEKLY;BYDAY=FR";
      if (infaqFrequency === "Setiap Tanggal 1 (Bulanan)") rrule = "FREQ=MONTHLY;BYMONTHDAY=1";
      else if (infaqFrequency === "Setiap Hari (Subuh)") rrule = "FREQ=DAILY";

      const startDate = new Date();
      startDate.setHours(5, 0, 0, 0); // 5 AM tomorrow/today
      if (startDate.getTime() < Date.now()) {
        startDate.setDate(startDate.getDate() + 1);
      }
      const endDate = new Date(startDate);
      endDate.setHours(6, 0, 0, 0);

      const event = {
        summary: "Pengingat Infaq Rutin Lazisna",
        description: `Waktunya menunaikan infaq rutin Anda sebesar ${formatRpLocal(infaqAmount)}. Salurkan melalui Lazisna Mart atau Aplikasi Lazisna.`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "Asia/Jakarta",
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: "Asia/Jakarta",
        },
        recurrence: [
          `RRULE:${rrule}`
        ]
      };

      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
      });

      if (!res.ok) {
        throw new Error("Gagal menyinkronkan ke kalender.");
      }
      
      alert("Jadwal infaq rutin berhasil disinkronkan ke Google Calendar Anda!");
      saveSettings({ scheduledInfaq: true });
    } catch (e: any) {
      console.error(e);
      alert("Terjadi kesalahan: " + e.message);
    }
  };

  const getValidAccessToken = async (): Promise<string | null> => {
    let token = getCachedAccessToken();
    if (!token) {
      const confirmLogin = window.confirm("Untuk mengirim email via Gmail, Anda perlu menghubungkan kembali akun Google Anda demi keamanan. Hubungkan sekarang?");
      if (!confirmLogin) return null;
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setCachedAccessToken(credential.accessToken);
          token = credential.accessToken;
          
          // Sync profile to state
          const user = result.user;
          const userData = {
            name: user.displayName || "Donatur",
            wa: user.phoneNumber || "-",
            photo: user.photoURL || undefined,
            uid: user.uid,
            email: user.email || undefined
          };
          setRegisteredUser(userData);
        } else {
          alert("Gagal mendapatkan token akses Google.");
          return null;
        }
      } catch (err: any) {
        console.error(err);
        alert("Gagal login dengan Google: " + err.message);
        return null;
      }
    }
    return token;
  };

  const sendEmailViaGmail = async (accessToken: string, toEmail: string, subject: string, htmlBody: string) => {
    // Construct RFC822 formatted email
    const emailParts = [
      `To: ${toEmail}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      ``,
      htmlBody
    ];
    const emailContent = emailParts.join("\n");
    
    const base64Safe = btoa(unescape(encodeURIComponent(emailContent)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        raw: base64Safe
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || "Gagal mengirim email.");
    }
    return true;
  };

  const handleSendReceiptToGmail = async (record: DonationRecord) => {
    const userEmail = auth.currentUser?.email || registeredUser?.email;
    if (!userEmail) {
      alert("Email Anda tidak terdeteksi. Silakan hubungkan ulang akun Google Anda.");
      return;
    }

    const confirmed = window.confirm(`Kirim kuitansi resmi donasi ini ke email Anda (${userEmail})?`);
    if (!confirmed) return;

    setSendingEmailId(record.id);
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setSendingEmailId(null);
        return;
      }

      const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bukti Donasi Resmi Lazisna</title>
</head>
<body style="font-family: sans-serif; background-color: #f8fafc; padding: 20px; color: #334155; margin: 0;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #059669; padding: 24px; text-align: center; color: #ffffff;">
      <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: -0.025em;">Bukti Donasi Resmi</h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1fae5; font-weight: 500;">Lembaga Amil Zakat Infak & Shadaqah (LAZISNA)</p>
    </div>
    <div style="padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 11px; background-color: #ecfdf5; color: #047857; font-weight: bold; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">Amanah Terverifikasi</span>
        <h3 style="font-size: 28px; font-weight: 800; color: #047857; margin: 12px 0 4px 0;">${formatRp(record.amount)}</h3>
        <p style="font-size: 11px; color: #64748b; margin: 0; font-family: monospace;">ID Invoice: ${record.invoiceId}</p>
      </div>
      <div style="border-top: 1px dotted #e2e8f0; padding-top: 16px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Donatur:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: bold; text-align: right;">${record.donorName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Program:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: bold; text-align: right;">${record.programTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Kategori:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: bold; text-align: right; text-transform: uppercase;">${record.category}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Metode Pembayaran:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: bold; text-align: right;">${record.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Tanggal:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: bold; text-align: right;">${new Date(record.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
          </tr>
        </table>
      </div>
      <div style="background-color: #f0fdf4; border: 1px solid #d1fae5; border-radius: 12px; padding: 14px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 11px; color: #065f46; font-style: italic; font-weight: 500;">"Semoga Allah SWT melimpahkan keberkahan, melipatgandakan rezeki Anda, dan menjadikan donasi ini sebagai amal jariyah yang terus mengalir pahalanya. Aamiin."</p>
      </div>
      <div style="text-align: center; font-size: 10px; color: #94a3b8; line-height: 1.5;">
        <p style="margin: 0;">Email ini dikirim secara otomatis sebagai layanan resmi anggota kebaikan Lazisna.</p>
        <p style="margin: 4px 0 0 0;">© 2026 LAZISNA. Semua Hak Dilindungi.</p>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      await sendEmailViaGmail(accessToken, userEmail, `[Lazisna] Bukti Donasi Resmi - ${record.invoiceId}`, htmlBody);
      alert(`Sukses! Kuitansi donasi resmi berhasil dikirim ke email Anda (${userEmail}).`);
    } catch (err: any) {
      console.error(err);
      alert("Gagal mengirim email: " + err.message);
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleSendSummaryToGmail = async () => {
    const userEmail = auth.currentUser?.email || registeredUser?.email;
    if (!userEmail) {
      alert("Email Anda tidak terdeteksi. Silakan hubungkan ulang akun Google Anda.");
      return;
    }

    if (pastDonations.length === 0) {
      alert("Belum ada riwayat donasi untuk dirangkum.");
      return;
    }

    const confirmed = window.confirm(`Kirim Laporan Ringkasan Kebaikan Bulanan ke email Anda (${userEmail})?`);
    if (!confirmed) return;

    setSendingSummary(true);
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setSendingSummary(false);
        return;
      }

      // Compile rows
      const tableRows = pastDonations.map((record) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #475569;">${new Date(record.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</td>
          <td style="padding: 10px 0; color: #1e293b; font-weight: 500;">
            <div>${record.programTitle}</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">ID: ${record.invoiceId} (${record.paymentMethod})</div>
          </td>
          <td style="padding: 10px 0; color: #059669; font-weight: bold; text-align: right;">${formatRp(record.amount)}</td>
        </tr>
      `).join("");

      const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Laporan Ringkasan Kebaikan Bulanan Lazisna</title>
</head>
<body style="font-family: sans-serif; background-color: #f8fafc; padding: 20px; color: #334155; margin: 0;">
  <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #059669; padding: 24px; text-align: center; color: #ffffff;">
      <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: -0.025em;">Ringkasan Kebaikan Bulanan</h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1fae5; font-weight: 500;">Lembaga Amil Zakat Infak & Shadaqah (LAZISNA)</p>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 0;">Yth. Bapak/Ibu <strong>${registeredUser?.name || "Donatur"}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6;">Alhamdulillah, berikut adalah rekapitulasi kontribusi kebaikan Anda yang tercatat di sistem Lazisna. Terima kasih telah konsisten menebarkan kemanfaatan bagi sesama.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
        <div style="display: inline-block; width: 45%; border-right: 1px solid #e2e8f0; vertical-align: middle;">
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0; font-weight: bold;">Total Donasi</p>
          <p style="font-size: 18px; font-weight: 800; color: #059669; margin: 4px 0 0 0;">${formatRp(totalLifetimeDonation)}</p>
        </div>
        <div style="display: inline-block; width: 45%; vertical-align: middle;">
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0; font-weight: bold;">Frekuensi</p>
          <p style="font-size: 18px; font-weight: 800; color: #1e293b; margin: 4px 0 0 0;">${pastDonations.length} Kali</p>
        </div>
      </div>

      <h4 style="font-size: 12px; color: #334155; text-transform: uppercase; margin: 20px 0 10px 0; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Detail Riwayat Transaksi</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 2px solid #f1f5f9; text-align: left;">
            <th style="padding: 8px 0; color: #64748b; width: 20%;">Tanggal</th>
            <th style="padding: 8px 0; color: #64748b; width: 55%;">Program</th>
            <th style="padding: 8px 0; color: #64748b; text-align: right; width: 25%;">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div style="background-color: #f0fdf4; border: 1px solid #d1fae5; border-radius: 12px; padding: 14px; text-align: center; margin: 24px 0 20px 0;">
        <p style="margin: 0; font-size: 11px; color: #065f46; font-style: italic; font-weight: 500;">"Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji. Allah melipatgandakan bagi siapa yang Dia kehendaki." (QS. Al-Baqarah: 261)</p>
      </div>

      <div style="text-align: center; font-size: 10px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        <p style="margin: 0;">Email ini dikirim secara otomatis sebagai layanan resmi anggota kebaikan Lazisna.</p>
        <p style="margin: 4px 0 0 0;">© 2026 LAZISNA. Semua Hak Dilindungi.</p>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      await sendEmailViaGmail(accessToken, userEmail, `[Lazisna] Laporan Ringkasan Kebaikan Bulanan`, htmlBody);
      alert(`Sukses! Laporan ringkasan kebaikan bulanan berhasil dikirim ke email Anda (${userEmail}).`);
    } catch (err: any) {
      console.error(err);
      alert("Gagal mengirim email: " + err.message);
    } finally {
      setSendingSummary(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari Akun Member? Riwayat donasi tetap aman di perangkat ini.")) {
      try {
        localStorage.removeItem("lazisna_member");
        await firebaseSignOut(auth);
        setRegisteredUser(null);
        onRegisterSuccess("", "");
        setActiveSection("profil");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  const handleBiometricToggle = async (checked: boolean) => {
    setBiometricEnabled(checked);
    saveSettings({ biometricEnabled: checked });
    
    if (checked) {
      // Simulate Web Authentication API Registration
      try {
        if (window.PublicKeyCredential) {
            alert("Membuka otentikasi biometrik perangkat (Simulasi WebAuthn)...");
            // In a real app we would call navigator.credentials.create()
        } else {
            alert("Perangkat ini tidak mendukung otentikasi biometrik (WebAuthn).");
            setBiometricEnabled(false);
            saveSettings({ biometricEnabled: false });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        const updatedUser = { ...registeredUser!, photo: photoData };
        setRegisteredUser(updatedUser);
        onRegisterSuccess(updatedUser.name, updatedUser.wa, photoData);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleDownloadCSV = () => {
    if (pastDonations.length === 0) return;
    
    const headers = ["Date", "Category", "Program Title", "Amount"];
    const csvContent = [
      headers.join(","),
      ...pastDonations.map(record => {
        const date = new Date(record.date).toLocaleDateString("id-ID");
        const category = `"${record.category}"`;
        const programTitle = `"${record.programTitle.replace(/"/g, '""')}"`;
        const amount = record.amount;
        return `${date},${category},${programTitle},${amount}`;
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `riwayat_donasi_${registeredUser?.name.replace(/\s+/g, '_') || 'member'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate total lifetime contributions from actual past donations
  const totalLifetimeDonation = pastDonations.reduce((acc, curr) => acc + curr.amount, 0);

  const totalEarnedPoints = Math.floor(totalLifetimeDonation / 10000);
  const currentPoints = Math.max(0, totalEarnedPoints - redeemedPoints);

  const handleRedeemVoucher = (pointsCost: number, voucherName: string) => {
    if (currentPoints >= pointsCost) {
      if (window.confirm(`Tukar ${pointsCost} Poin dengan ${voucherName}?`)) {
        const newRedeemed = redeemedPoints + pointsCost;
        const newVouchers = [voucherName, ...activeVouchers];
        setRedeemedPoints(newRedeemed);
        setActiveVouchers(newVouchers);
        saveSettings({ redeemedPoints: newRedeemed, activeVouchers: newVouchers });
        alert(`Berhasil menukarkan voucher! Voucher Anda sekarang dapat digunakan di kasir Lazisna Mart.`);
      }
    }
  };

  // Group donations by month for Recharts
  const chartDataMap = [...pastDonations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).reduce((acc, curr) => {
    const date = new Date(curr.date);
    const monthYear = date.toLocaleString('id-ID', { month: 'short', year: '2-digit' });
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    acc[monthYear] += curr.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const chartData = Object.keys(chartDataMap).map(key => ({
    name: key,
    total: chartDataMap[key]
  }));

  // Determine Level of Kindness based on contribution
  const getKindnessTier = (total: number) => {
    if (total >= 50000000) return { title: "Gold Plus", badge: "GOLD", color: "from-amber-400 to-yellow-600", desc: "Kontribusi luar biasa untuk umat" };
    if (total >= 20000000) return { title: "Silver Plus", badge: "SILVER", color: "from-slate-300 to-slate-500", desc: "Pilar kebaikan berkelanjutan" };
    if (total >= 10000000) return { title: "Bronze Plus", badge: "BRONZE", color: "from-orange-400 to-orange-700", desc: "Penggerak manfaat masyarakat" };
    if (total > 0) return { title: "Member Tersertifikasi", badge: "BLUE_TICK", color: "from-emerald-500 to-teal-600", desc: "Terverifikasi sebagai penyalur kebaikan" };
    return { title: "Penebar Senyum", badge: "NEW", color: "from-slate-400 to-slate-500", desc: "Mulai perjalanan kebaikan Anda hari ini" };
  };

  const tier = getKindnessTier(totalLifetimeDonation);

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCopyReceipt = (record: DonationRecord) => {
    const text = `*BUKTI DONASI RESMI LAZISNA*

No. Invoice: ${record.invoiceId}
Program: ${record.programTitle}
Donatur: ${record.donorName}
Jumlah: ${formatRp(record.amount)}
Metode: ${record.paymentMethod}
Tanggal: ${new Date(record.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
Status: BERHASIL (AMANAH)

Semoga dilipatgandakan rezekinya oleh Allah SWT. Aamiin.`;

    navigator.clipboard.writeText(text);
    setCopiedReceiptId(record.id);
    setTimeout(() => setCopiedReceiptId(null), 2500);
  };

  return (
    <div className="max-w-md mx-auto p-5 space-y-6 text-left">
      {registeredUser && (
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSection("profil")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSection === "profil" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="w-4 h-4" /> Profil
          </button>
          <button
            onClick={() => setActiveSection("pengaturan")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSection === "pengaturan" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Settings className="w-4 h-4" /> Pengaturan
          </button>
        </div>
      )}

      {!registeredUser ? (
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

          <form onSubmit={async (e) => {
            e.preventDefault();
            setAuthError("");
            try {
              if (!name.includes("@")) {
                setAuthError("Harap gunakan alamat email yang valid");
                return;
              }
              if (isLoginMode) {
                // Login
                const userCredential = await signInWithEmailAndPassword(auth, name, password);
                const user = userCredential.user;
                const userData = {
                  name: user.displayName || name.split('@')[0],
                  wa: user.phoneNumber || "-",
                  email: user.email || undefined,
                  uid: user.uid
                };
                setRegisteredUser(userData);
                onRegisterSuccess(userData.name, userData.wa, undefined);
              } else {
                // Register
                const userCredential = await createUserWithEmailAndPassword(auth, name, password);
                const user = userCredential.user;
                const userData = {
                  name: user.displayName || name.split('@')[0],
                  wa: user.phoneNumber || "-",
                  email: user.email || undefined,
                  uid: user.uid
                };
                // Save user profile to Firestore
                await setDoc(doc(db, "users", user.uid), {
                  name: userData.name,
                  email: userData.email,
                  lastLogin: new Date()
                }, { merge: true });
                setRegisteredUser(userData);
                onRegisterSuccess(userData.name, userData.wa, undefined);
              }
            } catch (error: any) {
              console.error("Auth error:", error);
              if (error.code === 'auth/email-already-in-use') {
                setAuthError("Email sudah terdaftar. Silakan login.");
                setIsLoginMode(true);
              } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                setAuthError("Email atau password salah.");
              } else {
                setAuthError("Terjadi kesalahan. Coba lagi.");
              }
            }
          }} className="space-y-4 pt-2">
            {authError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-100 flex items-center gap-2">
                <Settings className="w-4 h-4 shrink-0" />
                {authError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input required type="email" value={name} onChange={e => setName(e.target.value)} className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:border-emerald-500 focus:outline-none" placeholder="email@domain.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:border-emerald-500 focus:outline-none" placeholder="Masukkan password" />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isLoginMode ? "Masuk" : "Daftar"}
            </button>
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(""); }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                {isLoginMode ? "Belum punya akun? Daftar di sini" : "Sudah punya akun? Masuk di sini"}
              </button>
            </div>
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
      ) : (activeSection === "profil" ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Elegant Digital Loyalty Card */}
          <div className={`relative overflow-hidden bg-gradient-to-br ${tier.color} text-white rounded-2xl p-5 shadow-lg shadow-emerald-900/10 border border-white/10 flex flex-col justify-between h-48`}>
            {/* Subtle overlay grid */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

            <div className="relative flex justify-between items-start">
              <div className="flex items-center gap-3">
                {registeredUser.photo ? (
                  <img src={registeredUser.photo} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-black text-emerald-100 opacity-90">KARTU MEMBER KEBAIKAN</p>
                  <h4 className="text-base font-bold tracking-tight mt-0.5">{registeredUser.name}</h4>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {isAgent && (
                  <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-full border border-yellow-500/50 text-[9px] font-black uppercase shadow-sm">
                    <Award className="w-3 h-3" />
                    Agen Rijal Lazisna
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase">
                  {tier.badge === "GOLD" ? <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" /> : 
                   tier.badge === "SILVER" ? <Star className="w-3 h-3 text-slate-200 fill-slate-200" /> : 
                   tier.badge === "BRONZE" ? <Star className="w-3 h-3 text-orange-300 fill-orange-300" /> : 
                   tier.badge === "BLUE_TICK" ? <BadgeCheck className="w-3 h-3 text-blue-400" /> :
                   <Award className="w-3 h-3 text-white" />}
                  {tier.title}
                </span>
              </div>
            </div>

            <div className="relative flex justify-between items-end">
              <div className="space-y-0.5">
                <p className="text-[8px] text-emerald-100 opacity-85 uppercase tracking-wider font-semibold">Total Amal Jariyah</p>
                <p className="text-base font-black tracking-tight">{formatRp(totalLifetimeDonation)}</p>
              </div>
              
              {/* Mock Barcode or QR Area */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-[8px] text-emerald-100 opacity-80 uppercase tracking-wider font-bold">MEMBER ID</p>
                  <p className="text-[10px] font-mono font-bold">LAZ-{registeredUser.wa.slice(-4) || "0000"}</p>
                </div>
                <div className="bg-white p-1 rounded-lg">
                  <QrCode className="w-6 h-6 text-emerald-800" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Profile Actions / Info Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-150 shadow-2xs flex justify-between items-center">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Terdaftar dengan No. WA:</p>
              <p className="text-xs font-bold text-slate-700">{registeredUser.wa}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[10px] font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all"
            >
              Keluar Akun
            </button>
          </div>

          {/* Umroh Sweepstakes Banner Feature */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Plane className="w-16 h-16 transform rotate-45" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Fitur Unggulan</span>
              </div>
              <div>
                <h4 className="font-bold text-lg leading-tight">Undian Berhadiah Umroh</h4>
                <p className="text-[10px] text-emerald-100 leading-snug mt-1 max-w-[85%]">Setiap donasi Anda mencetak tiket kebaikan. Dapatkan kesempatan berangkat umroh bersama Lazisna!</p>
              </div>
              <button 
                onClick={() => {
                  if (onNavigateToUmroh) {
                    onNavigateToUmroh();
                  } else {
                    alert("Fitur Undian Umroh akan segera hadir.");
                  }
                }}
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Cek Status Undian
              </button>
            </div>
          </div>

          {/* Lazisna Points & Rewards */}
          <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Gift className="w-4 h-4 text-emerald-600" /> Lazisna Points
              </h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">{currentPoints.toLocaleString('id-ID')} Poin</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">Kumpulkan poin dari setiap donasi (1 Poin / Rp 10.000) dan tukarkan dengan voucher belanja di mitra Lazisna Mart.</p>
            
            <div className="grid grid-cols-2 gap-3">
               <button 
                  onClick={() => handleRedeemVoucher(5000, "Voucher 50K Lazisna Mart")}
                  disabled={currentPoints < 5000}
                  className={`p-3 rounded-xl border text-center transition-all ${currentPoints >= 5000 ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 active:scale-95 shadow-sm shadow-emerald-900/5" : "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"}`}
               >
                 <p className="text-xs font-bold mb-1">Voucher 50K</p>
                 <p className="text-[10px] font-black">5.000 Poin</p>
               </button>
               <button 
                  onClick={() => handleRedeemVoucher(10000, "Voucher 100K Lazisna Mart")}
                  disabled={currentPoints < 10000}
                  className={`p-3 rounded-xl border text-center transition-all ${currentPoints >= 10000 ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 active:scale-95 shadow-sm shadow-emerald-900/5" : "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"}`}
               >
                 <p className="text-xs font-bold mb-1">Voucher 100K</p>
                 <p className="text-[10px] font-black">10.000 Poin</p>
               </button>
            </div>
            {activeVouchers.length > 0 && (
              <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Voucher Aktif Anda:</p>
                <div className="space-y-2">
                  {activeVouchers.map((v, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-2 rounded-lg">
                      <span className="text-xs font-bold text-slate-700">{v}</span>
                      <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-100 px-2 py-0.5 rounded">Siap Digunakan</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Donation Statistics Chart & Target Progress */}
          <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <BarChart2 className="w-4 h-4 text-emerald-600" /> Statistik & Goal
              </h4>
              <button onClick={() => setActiveSection("pengaturan")} className="text-[10px] text-emerald-600 font-bold hover:underline">Edit Goal</button>
            </div>
            
            <div className="flex gap-4 items-center">
              {pastDonations.length > 0 ? (
                <div className="flex-1 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(value) => `Rp${value / 1000}k`} />
                      <Tooltip 
                        formatter={(value: number) => [formatRp(value), "Total"]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 h-32 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
                  <BarChart2 className="w-6 h-6 text-slate-300 mb-2" />
                  <p className="text-[10px] text-slate-400">Belum ada statistik</p>
                </div>
              )}
              
              {/* Circular Progress Ring for Annual Target */}
              <div className="shrink-0 flex flex-col items-center justify-center">
                <p className="text-[10px] font-bold text-slate-600 mb-2 max-w-[80px] text-center leading-tight truncate">{goalTitle}</p>
                <div className="relative w-16 h-16 mb-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-slate-100" strokeWidth="12" fill="none" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      className="stroke-amber-400 transition-all duration-1000 ease-out" 
                      strokeWidth="12" fill="none" 
                      strokeDasharray={251.2} 
                      strokeDashoffset={251.2 - (Math.min(totalLifetimeDonation / (annualTarget || 1), 1) * 251.2)} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-slate-800">{Math.round(Math.min((totalLifetimeDonation / (annualTarget || 1)) * 100, 100))}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Target</p>
                  <p className="text-[9px] font-black text-slate-700">{formatRp(annualTarget)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Past Donations list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <History className="w-4 h-4 text-emerald-600" /> Riwayat Kebaikan Anda ({pastDonations.length})
              </h4>
              {pastDonations.length > 0 && (
                <div className="flex gap-1.5">
                  <button
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1.5 rounded-lg transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </button>
                  <button
                    onClick={handleSendSummaryToGmail}
                    disabled={sendingSummary}
                    className={`flex items-center gap-1 text-[10px] font-bold transition-all px-2 py-1.5 rounded-lg ${
                      sendingSummary
                        ? "bg-amber-100 text-amber-700 animate-pulse"
                        : "bg-red-50 hover:bg-red-100 text-red-600"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {sendingSummary ? "Kirim..." : "Gmail Laporan"}
                  </button>
                </div>
              )}
            </div>

            {pastDonations.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-slate-150 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Belum Ada Donasi Tercatat</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Kebaikan kecil yang Anda tebarkan hari ini akan tercatat rapi di sini untuk selamanya. Mulai berdonasi pertama Anda!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {pastDonations.map((record) => (
                  <div 
                    key={record.id} 
                    className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-2xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="inline-flex bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                          {record.category}
                        </span>
                        <h5 className="text-xs font-bold text-slate-800 max-w-[220px] leading-tight">
                          {record.programTitle}
                        </h5>
                      </div>
                      <span className="text-xs font-black text-emerald-600">
                        {formatRp(record.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-50 pt-2.5">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(record.date).toLocaleDateString("id-ID")}</span>
                        <span className="text-slate-700 font-mono text-[9px]">ID: {record.invoiceId}</span>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleCopyReceipt(record)}
                          className={`inline-flex items-center gap-1 font-bold px-2 py-1.5 rounded-lg transition-all ${
                            copiedReceiptId === record.id
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                          }`}
                          title="Salin Kuitansi"
                        >
                          {copiedReceiptId === record.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Tersalin
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3" /> Bukti
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleSendReceiptToGmail(record)}
                          disabled={sendingEmailId === record.id}
                          className={`inline-flex items-center gap-1 font-bold px-2 py-1.5 rounded-lg transition-all ${
                            sendingEmailId === record.id
                              ? "bg-amber-100 text-amber-700 animate-pulse"
                              : "bg-red-50 hover:bg-red-100 text-red-600"
                          }`}
                          title="Kirim Kuitansi ke Gmail"
                        >
                          <Mail className="w-3 h-3" />
                          {sendingEmailId === record.id ? "Mengirim..." : "Gmail"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Settings Section */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-6">
            
            {/* Foto Profil */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider mb-3">
                <Camera className="w-4 h-4 text-emerald-600" /> Foto Profil
              </h4>
              <div className="flex items-center gap-4">
                {registeredUser.photo ? (
                  <img src={registeredUser.photo} alt="Profile" className="w-16 h-16 rounded-full border border-slate-200 object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Ubah Foto
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Izin Perangkat */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <Smartphone className="w-4 h-4 text-emerald-600" /> Izin Perangkat
              </h4>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-700">Akses Lokasi</p>
                  <p className="text-[10px] text-slate-400">Untuk deteksi Waktu Shalat & Kiblat</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={locationPerm} 
                    onChange={(e) => {
                      const val = e.target.checked;
                      setLocationPerm(val);
                      saveSettings({ pushNotif, waNotif, locationPerm: val, scheduledInfaq, monthlyReminder });
                      if(val) {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(() => {}, () => {
                            alert("Akses lokasi ditolak atau tidak tersedia. Silakan izinkan dari pengaturan browser Anda agar fitur Waktu Shalat dapat bekerja maksimal.");
                            setLocationPerm(false);
                            saveSettings({ pushNotif, waNotif, locationPerm: false, scheduledInfaq, monthlyReminder });
                          });
                        } else {
                          alert("Perangkat Anda tidak mendukung fitur Lokasi.");
                          setLocationPerm(false);
                          saveSettings({ pushNotif, waNotif, locationPerm: false, scheduledInfaq, monthlyReminder });
                        }
                      }
                    }} 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-sm font-bold text-slate-700">Login Biometrik</p>
                  <p className="text-[10px] text-slate-400">Gunakan sidik jari atau Face ID untuk masuk</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={biometricEnabled} 
                    onChange={(e) => handleBiometricToggle(e.target.checked)} 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-700">Akses Kamera</p>
                  <p className="text-[10px] text-slate-400">Untuk upload foto profil secara langsung</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    onChange={async (e) => {
                      const val = e.target.checked;
                      if(val) {
                        try {
                          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                          stream.getTracks().forEach(track => track.stop()); // close immediately after testing
                          alert("Akses kamera berhasil diberikan. Anda sekarang dapat menggunakan kamera untuk foto profil.");
                        } catch (err) {
                          e.target.checked = false;
                          alert("Akses kamera ditolak atau perangkat tidak memiliki kamera. Anda tetap bisa memilih foto dari galeri (File Manager).");
                        }
                      }
                    }} 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Notifikasi */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <Bell className="w-4 h-4 text-emerald-600" /> Pengaturan Notifikasi
              </h4>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-700">Push Notifications</p>
                  <p className="text-[10px] text-slate-400">Info terbaru & pengingat donasi</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={pushNotif} onChange={(e) => {
                    const val = e.target.checked;
                    setPushNotif(val);
                    saveSettings({ pushNotif: val, waNotif, locationPerm, scheduledInfaq, monthlyReminder });
                  }} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-700">Laporan via WhatsApp</p>
                  <p className="text-[10px] text-slate-400">Bukti penyaluran ke WhatsApp Anda</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={waNotif} onChange={(e) => {
                    const val = e.target.checked;
                    setWaNotif(val);
                    saveSettings({ pushNotif, waNotif: val, locationPerm, scheduledInfaq, monthlyReminder });
                  }} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-700">Pengingat Bulanan Zakat & Infaq</p>
                  <p className="text-[10px] text-slate-400">Notifikasi browser setiap awal bulan</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={monthlyReminder} onChange={(e) => {
                    const val = e.target.checked;
                    setMonthlyReminder(val);
                    saveSettings({ monthlyReminder: val });
                    if (val) {
                      if ("Notification" in window) {
                        Notification.requestPermission().then(permission => {
                          if (permission === "granted") {
                            new Notification("Pengingat Diaktifkan", {
                              body: "Anda akan menerima pengingat Zakat & Infaq setiap bulannya."
                            });
                          } else {
                            alert("Izin notifikasi ditolak oleh browser.");
                            setMonthlyReminder(false);
                            saveSettings({ monthlyReminder: false });
                          }
                        });
                      } else {
                        alert("Browser Anda tidak mendukung push notifikasi.");
                        setMonthlyReminder(false);
                        saveSettings({ monthlyReminder: false });
                      }
                    }
                  }} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <hr className="border-slate-50 my-2" />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-700">Pengingat Infaq Mingguan</p>
                  <p className="text-[10px] text-slate-400">Notifikasi push untuk infaq rutin</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={weeklyReminder} onChange={(e) => {
                    const val = e.target.checked;
                    setWeeklyReminder(val);
                    saveSettings({ weeklyReminder: val });
                    if (val) {
                      if ("Notification" in window) {
                        Notification.requestPermission().then(permission => {
                          if (permission === "granted") {
                            new Notification("Pengingat Mingguan Aktif", {
                              body: "Anda akan menerima pengingat infaq mingguan sesuai jadwal."
                            });
                          } else {
                            alert("Izin notifikasi ditolak oleh browser.");
                            setWeeklyReminder(false);
                            saveSettings({ weeklyReminder: false });
                          }
                        });
                      } else {
                        alert("Browser Anda tidak mendukung push notifikasi.");
                        setWeeklyReminder(false);
                        saveSettings({ weeklyReminder: false });
                      }
                    }
                  }} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {weeklyReminder && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2 animate-in fade-in duration-300 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Hari</label>
                    <select 
                      value={weeklyReminderDay}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setWeeklyReminderDay(val);
                        saveSettings({ weeklyReminderDay: val });
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-emerald-500"
                    >
                      <option value={1}>Senin</option>
                      <option value={2}>Selasa</option>
                      <option value={3}>Rabu</option>
                      <option value={4}>Kamis</option>
                      <option value={5}>Jumat (Jumat Berkah)</option>
                      <option value={6}>Sabtu</option>
                      <option value={0}>Minggu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Waktu (Jam:Menit)</label>
                    <input 
                      type="time" 
                      value={weeklyReminderTime}
                      onChange={(e) => {
                        setWeeklyReminderTime(e.target.value);
                        saveSettings({ weeklyReminderTime: e.target.value });
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-emerald-500" 
                    />
                  </div>
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Target Infaq Tahunan */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <Star className="w-4 h-4 text-emerald-600" /> Goal Kebaikan Pribadi
              </h4>
              
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-700">Nama Goal Donasi</p>
                  <p className="text-[10px] text-slate-400">Misal: Tabungan Qurban 2026</p>
                </div>
                <input 
                  type="text" 
                  value={goalTitle} 
                  onChange={(e) => {
                    setGoalTitle(e.target.value);
                    saveSettings({ goalTitle: e.target.value });
                  }} 
                  placeholder="Misal: Sedekah Subuh"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-700">Target Nominal (Rp)</p>
                  <p className="text-[10px] text-slate-400">Pencapaian target Anda</p>
                </div>
                <input 
                  type="number" 
                  value={annualTarget} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAnnualTarget(val);
                    saveSettings({ annualTarget: val });
                  }} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Infaq Berjadwal */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Infaq Berjadwal
              </h4>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-700">Aktifkan Infaq Rutin</p>
                  <p className="text-[10px] text-slate-400">Dipotong otomatis sesuai jadwal</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={scheduledInfaq} onChange={(e) => {
                    const val = e.target.checked;
                    setScheduledInfaq(val);
                    saveSettings({ pushNotif, waNotif, locationPerm, scheduledInfaq: val, monthlyReminder });
                  }} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {scheduledInfaq && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-3 animate-in fade-in duration-300">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Nominal Per Siklus</label>
                      <input type="number" value={infaqAmount} onChange={(e) => setInfaqAmount(Number(e.target.value))} className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Frekuensi</label>
                      <select value={infaqFrequency} onChange={(e) => setInfaqFrequency(e.target.value)} className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white">
                        <option>Setiap Hari Jumat (Jumat Berkah)</option>
                        <option>Setiap Tanggal 1 (Bulanan)</option>
                        <option>Setiap Hari (Subuh)</option>
                      </select>
                    </div>
                    <button onClick={handleSyncCalendar} className="w-full bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" /> Simpan & Sinkronkan ke Google Calendar
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      ))}


      {/* Admin / Amil Access portal */}
      <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200 mt-8 space-y-3">
        <h5 className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
          🛡️ Akses Pengelola (Amil Zakat)
        </h5>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Masuk ke Konsol Pengelola untuk mengonfigurasi Rekening Penerima, menyetujui Laporan ZISWAF, mengedit Berita, dan mengelola program kebaikan.
        </p>
        <form onSubmit={(e) => {
          e.preventDefault();
          const emailVal = (e.currentTarget.elements.namedItem("adminEmail") as HTMLInputElement).value;
          const passVal = (e.currentTarget.elements.namedItem("adminPassword") as HTMLInputElement).value;
          
          if (emailVal.trim() === "ustfaidulakbar@gmail.com" && passVal === "@kabarMS46") {
            onAdminLogin();
          } else {
            alert("Email atau Password salah!");
          }
        }} className="space-y-2">
          <input
            type="email"
            name="adminEmail"
            required
            placeholder="Email Pengelola"
            className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 focus:border-emerald-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="password"
              name="adminPassword"
              required
              placeholder="Password"
              className="flex-1 text-xs rounded-xl border border-slate-200 bg-white p-2.5 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 rounded-xl transition-all whitespace-nowrap shrink-0"
            >
              Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
