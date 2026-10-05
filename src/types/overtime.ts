export type OvertimeType = 'weekday' | 'weekend' | 'holiday';

export interface OvertimeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dateLabel: string; // e.g. "20 Ekim Pazar"
  title: string;
  type: OvertimeType;
  multiplier: number; // 1.5 or 2.0
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  grossHours: number;
  breakMinutes: number;
  netHours: number;
  mealBonus: boolean;
  mealBonusAmount: number;
  note: string;
  totalEarnings: number;
  status: 'Onaylandı' | 'İncelemede' | 'Taslak';
  weekNumber?: number;
}

export interface UserSettings {
  name: string;
  email: string;
  avatarUrl: string;
  phone?: string;
  company?: string;
  title?: string;
  workSystemDays: 5 | 6; // 5 days (Sat-Sun 2x) or 6 days (Sun 2x)
  hourlyRate: number; // e.g. 250 TL
  monthlyTargetHours: number; // e.g. 35
  mealBonusDefault: number; // e.g. 150 TL
  isLoggedIn: boolean;
}

export type ActiveTab = 'ana-sayfa' | 'takvim' | 'mesai-ekle' | 'raporlar' | 'ayarlar' | 'giris' | 'kayit';
