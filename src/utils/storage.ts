import { OvertimeRecord, UserSettings } from '../types/overtime';

export const APP_LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1VhHY4w3kxxQvMnPfBfAhHbxK9K7o-EH3eYYWMO8Id0LP6g8l0JQgYAFX4Wb4-DjP-Y38MJNVyGsT-pIxu-HoJp-N4GyfE4IDxCq1cbYzoDBLiM_mrhUHkX1nKkGLXFw3YLHSF6FDXmQXucUmff6J96dtLq1C6as1_C_m1tRvTX6i-W076ZMYT_sPUhsYTktbDwPl86thhbX6W-lFrTMQO1dNSH5fT_YIhH5BUyMS2wWCOj-N1BpDG8cA';
export const USER_AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGMlzRLVBZ4ES8Ul5ki0U5vFLmO9ZkuOibOf8SG2JwXmLmt_Uit98Pl0ljJyIhN0dtMrRtNwcMdmt_JINtBwuOytKNMq2ICbliA4Q5yVnp5jXrkbwuw9GYsjMoQAcwbv_RhK-VTin8QhyNEIBPzuY1z3Chzu9ZyFCfy6mZDAhfiPaZoltW3T0-lo3R48mVCeX1XvEfjjBFne2gW0aOc-Uo24nxp27J7IO7aCp5QiOjpU8BWYoeDI';

const currentYear = new Date().getFullYear(); // 2026

export const DEFAULT_USER_SETTINGS: UserSettings = {
  name: 'Ahmet Yılmaz',
  email: 'ahmet.yilmaz@sirket.com',
  avatarUrl: USER_AVATAR_URL,
  company: 'Teknoloji A.Ş.',
  title: 'Yazılım & Sistem Mühendisi',
  workSystemDays: 5,
  hourlyRate: 250,
  monthlyTargetHours: 35,
  mealBonusDefault: 150,
  isLoggedIn: true,
};

// Demo sample records for the default demo profile
export const INITIAL_OVERTIME_RECORDS: OvertimeRecord[] = [
  {
    id: 'ot-1',
    date: `${currentYear}-10-20`,
    dateLabel: `20 Ekim Pazar`,
    title: 'Pazar Vardiyası',
    type: 'weekend',
    multiplier: 2.0,
    startTime: '09:00',
    endTime: '16:00',
    grossHours: 7,
    breakMinutes: 0,
    netHours: 7,
    mealBonus: false,
    mealBonusAmount: 0,
    note: 'Sistem güncellemesi & sunucu bakımı',
    totalEarnings: 3500.0,
    status: 'Onaylandı',
    weekNumber: 3,
  },
  {
    id: 'ot-2',
    date: `${currentYear}-10-17`,
    dateLabel: `17 Ekim Perşembe`,
    title: 'Hafta İçi Akşam Mesaisi',
    type: 'weekday',
    multiplier: 1.5,
    startTime: '18:00',
    endTime: '21:30',
    grossHours: 3.5,
    breakMinutes: 0,
    netHours: 3.5,
    mealBonus: false,
    mealBonusAmount: 0,
    note: 'Müşteri canlıya geçiş desteği',
    totalEarnings: 1312.5,
    status: 'Onaylandı',
    weekNumber: 3,
  },
  {
    id: 'ot-3',
    date: `${currentYear}-10-14`,
    dateLabel: `14 Ekim Pazartesi`,
    title: 'Hafta İçi Ek Mesai',
    type: 'weekday',
    multiplier: 1.5,
    startTime: '18:00',
    endTime: '22:00',
    grossHours: 4,
    breakMinutes: 0,
    netHours: 4,
    mealBonus: false,
    mealBonusAmount: 0,
    note: 'Sprint kapanışı ve testler',
    totalEarnings: 1500.0,
    status: 'Onaylandı',
    weekNumber: 3,
  },
  {
    id: 'ot-4',
    date: `${currentYear}-10-12`,
    dateLabel: `12 Ekim Cumartesi`,
    title: 'Cumartesi Mesaisi',
    type: 'weekend',
    multiplier: 2.0,
    startTime: '09:00',
    endTime: '14:00',
    grossHours: 5,
    breakMinutes: 0,
    netHours: 5,
    mealBonus: false,
    mealBonusAmount: 0,
    note: 'Depo sayım ve barkodlama',
    totalEarnings: 2500.0,
    status: 'Onaylandı',
    weekNumber: 2,
  },
  {
    id: 'ot-5',
    date: `${currentYear}-10-08`,
    dateLabel: `08 Ekim Salı`,
    title: 'Proje Teslimi Uzatması',
    type: 'weekday',
    multiplier: 1.5,
    startTime: '18:30',
    endTime: '23:30',
    grossHours: 5,
    breakMinutes: 0,
    netHours: 5,
    mealBonus: false,
    mealBonusAmount: 0,
    note: 'Tasarım revizyonları teslimatı',
    totalEarnings: 1875.0,
    status: 'Onaylandı',
    weekNumber: 2,
  },
  {
    id: 'ot-6',
    date: `${currentYear}-10-02`,
    dateLabel: `02 Ekim Çarşamba`,
    title: 'Sistem Bakım Desteği',
    type: 'weekday',
    multiplier: 1.5,
    startTime: '19:00',
    endTime: '22:00',
    grossHours: 3,
    breakMinutes: 0,
    netHours: 3,
    mealBonus: false,
    mealBonusAmount: 0,
    note: 'Veritabanı optimizasyonu',
    totalEarnings: 1125.0,
    status: 'Onaylandı',
    weekNumber: 1,
  },
  {
    id: 'ot-7',
    date: `${currentYear}-10-29`,
    dateLabel: `29 Ekim Çarşamba`,
    title: '29 Ekim Cumhuriyet Bayramı Resmi Tatil',
    type: 'holiday',
    multiplier: 2.0,
    startTime: '10:00',
    endTime: '13:00',
    grossHours: 3,
    breakMinutes: 0,
    netHours: 3,
    mealBonus: false,
    mealBonusAmount: 0,
    note: 'Cumhuriyet Bayramı acil nöbet',
    totalEarnings: 750.0,
    status: 'İncelemede',
    weekNumber: 5,
  },
];

export interface RegisteredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  company?: string;
  title?: string;
  workSystemDays: 5 | 6;
  hourlyRate: number;
  monthlyTargetHours: number;
  mealBonusDefault: number;
  createdAt: string;
}

const STORAGE_KEYS = {
  SETTINGS: 'mesaitakip_settings_v2',
  RECORDS_PREFIX: 'mesaitakip_records_v2_',
  USERS: 'mesaitakip_users_v2',
};

// Default registered demo account
export const DEFAULT_DEMO_USER: RegisteredUser = {
  id: 'usr-demo-1',
  email: 'ahmet.yilmaz@sirket.com',
  passwordHash: 'GuvenliMesai2024!',
  name: 'Ahmet Yılmaz',
  phone: '05551234567',
  company: 'Teknoloji A.Ş.',
  title: 'Yazılım & Sistem Mühendisi',
  workSystemDays: 5,
  hourlyRate: 250,
  monthlyTargetHours: 35,
  mealBonusDefault: 150,
  createdAt: `${currentYear}-10-01T00:00:00.000Z`,
};

export function loadRegisteredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return [DEFAULT_DEMO_USER];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_DEMO_USER];
  } catch {
    return [DEFAULT_DEMO_USER];
  }
}

export function saveRegisteredUser(user: RegisteredUser): void {
  try {
    const users = loadRegisteredUsers();
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save registered user', e);
  }
}

export function findUserByEmail(email: string): RegisteredUser | undefined {
  const users = loadRegisteredUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_USER_SETTINGS;
    return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

/**
 * Loads records specifically for a user's email.
 * Newly registered users will have [] (0 records) as expected!
 * Demo user defaults to sample demo records.
 */
export function loadRecordsForUser(email: string): OvertimeRecord[] {
  try {
    const userKey = STORAGE_KEYS.RECORDS_PREFIX + (email ? email.trim().toLowerCase() : 'guest');
    const raw = localStorage.getItem(userKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }

    // Only provide sample demo records for the demo account
    if (email.toLowerCase() === DEFAULT_DEMO_USER.email.toLowerCase()) {
      return INITIAL_OVERTIME_RECORDS;
    }

    // Any other user starts clean with 0 records
    return [];
  } catch {
    return email.toLowerCase() === DEFAULT_DEMO_USER.email.toLowerCase() ? INITIAL_OVERTIME_RECORDS : [];
  }
}

export function saveRecordsForUser(email: string, records: OvertimeRecord[]): void {
  try {
    const userKey = STORAGE_KEYS.RECORDS_PREFIX + (email ? email.trim().toLowerCase() : 'guest');
    localStorage.setItem(userKey, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records for user', e);
  }
}

export function resetToDemoAccount(): { settings: UserSettings; records: OvertimeRecord[] } {
  saveSettings(DEFAULT_USER_SETTINGS);
  saveRecordsForUser(DEFAULT_DEMO_USER.email, INITIAL_OVERTIME_RECORDS);
  return { settings: DEFAULT_USER_SETTINGS, records: INITIAL_OVERTIME_RECORDS };
}

export function formatTL(amount: number): string {
  return '₺ ' + (amount || 0).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCompactTL(amount: number): string {
  return '₺' + (amount || 0).toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
