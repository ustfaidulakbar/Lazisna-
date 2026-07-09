export type DonationCategory = "Zakat" | "Infaq" | "Wakaf" | "Sodaqoh" | "Hibah" | "Fidyah";

export interface Program {
  id: string;
  title: string;
  category: DonationCategory;
  image: string;
  targetAmount: number;
  collectedAmount: number;
  donorsCount: number;
  daysLeft: number;
  description: string;
  location: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorWa: string;
  amount: number;
  category: DonationCategory;
  programId: string;
  programTitle: string;
  paymentMethod: string;
  date: string;
  prayer?: string;
  status: "Pending" | "Success" | "Rejected";
  invoiceId: string;
  donationType?: "Uang" | "Barang";
  itemType?: string;
  itemDescription?: string;
}

export interface NewsReport {
  id: string;
  title: string;
  image: string;
  date: string;
  summary: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface Ustadz {
  id: number;
  name: string;
  address: string;
  wa: string;
  specialization: string;
  image: string;
  ig?: string;
  yt?: string;
}

export interface Prayer {
  id: string;
  name: string;
  prayer: string;
  program?: string;
  createdAt: string;
  aminCount: number;
  hasAmiined?: boolean; // Client-side check
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  iconType: "qris" | "bank" | "manual";
  isActive: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: "info" | "success" | "warning";
  isRead?: boolean;
}
