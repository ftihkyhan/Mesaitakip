export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  shortName: string;
  isHalfDay?: boolean;
  description: string;
  multiplier: number; // 2.0x according to 4857 İş Kanunu
}

/**
 * Returns Turkish official public holidays for a given year (2429 Sayılı Kanun).
 * Covers both fixed national holidays and calculated religious holidays.
 */
export function getHolidaysForYear(year: number): PublicHoliday[] {
  const pad = (n: number) => String(n).padStart(2, '0');

  // Fixed national public holidays
  const fixedHolidays: PublicHoliday[] = [
    {
      date: `${year}-01-01`,
      name: 'Yılbaşı',
      shortName: 'Yılbaşı',
      description: 'Yeni Yıl Tatili',
      multiplier: 2.0,
    },
    {
      date: `${year}-04-23`,
      name: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı',
      shortName: '23 Nisan',
      description: 'Milli Bayram',
      multiplier: 2.0,
    },
    {
      date: `${year}-05-01`,
      name: '1 Mayıs Emek ve Dayanışma Günü',
      shortName: '1 Mayıs',
      description: 'İşçi Bayramı',
      multiplier: 2.0,
    },
    {
      date: `${year}-05-19`,
      name: '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı',
      shortName: '19 Mayıs',
      description: 'Milli Bayram',
      multiplier: 2.0,
    },
    {
      date: `${year}-07-15`,
      name: '15 Temmuz Demokrasi ve Milli Birlik Günü',
      shortName: '15 Temmuz',
      description: 'Resmi Genel Tatil',
      multiplier: 2.0,
    },
    {
      date: `${year}-08-30`,
      name: '30 Ağustos Zafer Bayramı',
      shortName: '30 Ağustos',
      description: 'Büyük Zafer Kutlaması',
      multiplier: 2.0,
    },
    {
      date: `${year}-10-28`,
      name: 'Cumhuriyet Bayramı Arifesi',
      shortName: '28 Ekim Arife',
      isHalfDay: true,
      description: 'Saat 13:00\'ten itibaren resmi tatil',
      multiplier: 2.0,
    },
    {
      date: `${year}-10-29`,
      name: '29 Ekim Cumhuriyet Bayramı',
      shortName: '29 Ekim',
      description: 'Türkiye Cumhuriyeti\'nin Kuruluşu (Ulusal Bayram)',
      multiplier: 2.0,
    },
  ];

  // Hijri religious holidays mapped for supported years
  const religiousHolidaysByYear: Record<number, PublicHoliday[]> = {
    2024: [
      { date: '2024-04-09', name: 'Ramazan Bayramı Arifesi', shortName: 'Arife', isHalfDay: true, description: 'Yarım Gün', multiplier: 2.0 },
      { date: '2024-04-10', name: 'Ramazan Bayramı 1. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2024-04-11', name: 'Ramazan Bayramı 2. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2024-04-12', name: 'Ramazan Bayramı 3. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2024-06-15', name: 'Kurban Bayramı Arifesi', shortName: 'Arife', isHalfDay: true, description: 'Yarım Gün', multiplier: 2.0 },
      { date: '2024-06-16', name: 'Kurban Bayramı 1. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2024-06-17', name: 'Kurban Bayramı 2. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2024-06-18', name: 'Kurban Bayramı 3. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2024-06-19', name: 'Kurban Bayramı 4. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
    ],
    2025: [
      { date: '2025-03-29', name: 'Ramazan Bayramı Arifesi', shortName: 'Arife', isHalfDay: true, description: 'Yarım Gün', multiplier: 2.0 },
      { date: '2025-03-30', name: 'Ramazan Bayramı 1. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2025-03-31', name: 'Ramazan Bayramı 2. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2025-04-01', name: 'Ramazan Bayramı 3. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2025-06-05', name: 'Kurban Bayramı Arifesi', shortName: 'Arife', isHalfDay: true, description: 'Yarım Gün', multiplier: 2.0 },
      { date: '2025-06-06', name: 'Kurban Bayramı 1. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2025-06-07', name: 'Kurban Bayramı 2. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2025-06-08', name: 'Kurban Bayramı 3. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2025-06-09', name: 'Kurban Bayramı 4. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
    ],
    2026: [
      { date: '2026-03-19', name: 'Ramazan Bayramı Arifesi', shortName: 'Arife', isHalfDay: true, description: 'Yarım Gün', multiplier: 2.0 },
      { date: '2026-03-20', name: 'Ramazan Bayramı 1. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2026-03-21', name: 'Ramazan Bayramı 2. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2026-03-22', name: 'Ramazan Bayramı 3. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2026-05-26', name: 'Kurban Bayramı Arifesi', shortName: 'Arife', isHalfDay: true, description: 'Yarım Gün', multiplier: 2.0 },
      { date: '2026-05-27', name: 'Kurban Bayramı 1. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2026-05-28', name: 'Kurban Bayramı 2. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2026-05-29', name: 'Kurban Bayramı 3. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2026-05-30', name: 'Kurban Bayramı 4. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
    ],
    2027: [
      { date: '2027-03-09', name: 'Ramazan Bayramı 1. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2027-03-10', name: 'Ramazan Bayramı 2. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2027-03-11', name: 'Ramazan Bayramı 3. Gün', shortName: 'Ramazan Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2027-05-16', name: 'Kurban Bayramı 1. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2027-05-17', name: 'Kurban Bayramı 2. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2027-05-18', name: 'Kurban Bayramı 3. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
      { date: '2027-05-19', name: 'Kurban Bayramı 4. Gün', shortName: 'Kurban Bayr.', description: 'Dini Bayram', multiplier: 2.0 },
    ],
  };

  const religious = religiousHolidaysByYear[year] || [];
  return [...fixedHolidays, ...religious].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Check if a specific date (YYYY-MM-DD) is a public holiday
 */
export function getHolidayForDate(dateStr: string): PublicHoliday | undefined {
  if (!dateStr) return undefined;
  const year = parseInt(dateStr.split('-')[0], 10);
  if (isNaN(year)) return undefined;
  const holidays = getHolidaysForYear(year);
  return holidays.find((h) => h.date === dateStr);
}

/**
 * Check if a month has public holidays
 */
export function getHolidaysForMonth(year: number, monthIndex: number): PublicHoliday[] {
  const holidays = getHolidaysForYear(year);
  const targetPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  return holidays.filter((h) => h.date.startsWith(targetPrefix));
}
