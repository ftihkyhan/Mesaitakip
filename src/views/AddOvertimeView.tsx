import React, { useState, useMemo } from 'react';
import { OvertimeRecord, OvertimeType, UserSettings } from '../types/overtime';
import { formatTL } from '../utils/storage';
import { getHolidayForDate } from '../utils/holidays';

interface AddOvertimeViewProps {
  settings: UserSettings;
  onSaveRecord: (record: OvertimeRecord) => void;
  onCancel: () => void;
  initialValues?: Partial<OvertimeRecord>;
}

export const AddOvertimeView: React.FC<AddOvertimeViewProps> = ({
  settings,
  onSaveRecord,
  onCancel,
  initialValues,
}) => {
  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const defaultDateStr = initialValues?.date || getTodayStr();
  const [date, setDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState(initialValues?.startTime || '18:00');
  const [endTime, setEndTime] = useState(initialValues?.endTime || '21:00');
  const [breakMinutes, setBreakMinutes] = useState(initialValues?.breakMinutes ?? 30);
  const [mealBonus, setMealBonus] = useState(initialValues?.mealBonus ?? true);
  const [note, setNote] = useState(initialValues?.note || 'Sistem güncellemesi & sunucu bakımı');
  const [customTitle, setCustomTitle] = useState(initialValues?.title || '');
  const [shiftHourlyRate, setShiftHourlyRate] = useState<number>(settings.hourlyRate);
  const [formError, setFormError] = useState('');

  // Check if current date is a public holiday
  const holiday = useMemo(() => getHolidayForDate(date), [date]);

  // Calculate day of week from date
  const parsedDate = useMemo(() => {
    try {
      const parts = date.split('-');
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      }
    } catch {
      // fallback
    }
    return new Date();
  }, [date]);

  const dayOfWeek = parsedDate.getDay(); // 0: Sun, 6: Sat
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const isWeekendDay = isSunday || (settings.workSystemDays === 5 && isSaturday);

  // Selected multiplier type
  const [selectedType, setSelectedType] = useState<OvertimeType>(() => {
    if (initialValues?.type) return initialValues.type;
    if (getHolidayForDate(defaultDateStr)) return 'holiday';
    return isWeekendDay ? 'weekend' : 'weekday';
  });

  const multiplier = selectedType === 'weekday' ? 1.5 : 2.0;

  // Calculate gross hours, net hours, and earnings
  const { grossHours, netHours, earnings } = useMemo(() => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    let startTotalMins = sh * 60 + sm;
    let endTotalMins = eh * 60 + em;
    if (endTotalMins < startTotalMins) {
      endTotalMins += 24 * 60; // Next day overtime
    }

    const grossMins = Math.max(0, endTotalMins - startTotalMins);
    const netMins = Math.max(0, grossMins - breakMinutes);
    const grossHrs = Number((grossMins / 60).toFixed(1));
    const netHrs = Number((netMins / 60).toFixed(1));

    const mealVal = mealBonus ? settings.mealBonusDefault || 150 : 0;
    const computedEarnings = netHrs * shiftHourlyRate * multiplier + mealVal;

    return {
      grossHours: grossHrs,
      netHours: netHrs,
      earnings: computedEarnings,
    };
  }, [startTime, endTime, breakMinutes, mealBonus, shiftHourlyRate, settings.mealBonusDefault, multiplier]);

  // Formatted Turkish date label
  const dateFormattedLabel = useMemo(() => {
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
    ];
    const d = parsedDate.getDate();
    const m = monthNames[parsedDate.getMonth()];
    const y = parsedDate.getFullYear();
    const dayName = dayNames[dayOfWeek];
    return `${d} ${m} ${y}, ${dayName}`;
  }, [parsedDate, dayOfWeek]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError('');

    if (netHours <= 0) {
      setFormError('Net çalışma süresi 0 saat olamaz. Lütfen başlangıç/bitiş saatini ve mola süresini kontrol ediniz.');
      return;
    }

    if (shiftHourlyRate <= 0) {
      setFormError('Saatlik taban ücret 0 TL olamaz.');
      return;
    }

    let autoTitle = customTitle.trim();
    if (!autoTitle) {
      if (selectedType === 'weekend') {
        autoTitle = isSunday ? 'Pazar Mesaisi' : 'Cumartesi Mesaisi';
      } else if (selectedType === 'holiday') {
        autoTitle = 'Resmi Tatil Mesaisi';
      } else {
        autoTitle = 'Hafta İçi Akşam Mesaisi';
      }
    }

    const newRecord: OvertimeRecord = {
      id: 'ot-' + Date.now(),
      date,
      dateLabel: dateFormattedLabel,
      title: autoTitle,
      type: selectedType,
      multiplier,
      startTime,
      endTime,
      grossHours,
      breakMinutes,
      netHours,
      mealBonus,
      mealBonusAmount: mealBonus ? settings.mealBonusDefault : 0,
      note,
      totalEarnings: earnings,
      status: 'Onaylandı',
    };

    onSaveRecord(newRecord);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-2 pb-32">
      {/* Top Title Bar */}
      <div className="pt-1 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-[#006948] text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add_circle
          </span>
          <span className="text-[18px] font-bold text-[#191c1e]">Yeni Mesai Kaydı</span>
        </div>
        <span className="text-[11px] px-2.5 py-1 bg-[#e6e8ea] text-[#3d4a42] rounded-full font-semibold">
          Adım 1/1
        </span>
      </div>

      {/* Live Earnings Highlight Card */}
      <div className="mt-2">
        <div className="relative overflow-hidden rounded-2xl bg-[#2d3133] text-[#eff1f3] p-4 shadow-xl">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#006948]/20 blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-[#85f8c4] text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                payments
              </span>
              <span className="text-xs text-[#e0e3e5] font-medium">Tahmini Ek Kazanç</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-[#85f8c4] bg-[#002114]/60 px-2 py-0.5 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#85f8c4] animate-ping"></span>
              Canlı Hesaplama
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-[30px] sm:text-[32px] font-extrabold text-[#85f8c4] tracking-tight">
              +{formatTL(earnings)}
            </span>
            <span className="text-xs text-[#e0e3e5]/80">net brüt</span>
          </div>

          <div className="mt-2 pt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#2d3133]/90 text-[#f5fff7] text-xs font-semibold border border-white/10">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {netHours} Saat Net
            </span>
            <span className="text-[#e0e3e5] text-[10px]">•</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#00855d] text-[#f5fff7] text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              {multiplier}x{' '}
              {selectedType === 'weekday'
                ? 'Hafta İçi'
                : selectedType === 'weekend'
                ? 'Hafta Sonu'
                : 'Resmi Tatil'}{' '}
              Çarpanı
            </span>
          </div>
        </div>
      </div>

      {/* Weekend Auto-Detection Banner */}
      {isWeekendDay && (
        <div className="mt-3">
          <div className="flex items-start gap-2.5 p-3 bg-[#dae2fd]/60 rounded-xl text-[#131b2e] shadow-sm border border-[#bccac0]/30">
            <span
              className="material-symbols-outlined text-[#006948] text-[20px] shrink-0 mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              celebration
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#131b2e]">Hafta sonu algılandı!</p>
              <p className="text-xs text-[#5c647a] mt-0.5 leading-snug">
                {isSunday ? 'Pazar' : 'Cumartesi'} mesaileriniz otomatik olarak{' '}
                <strong className="font-bold text-[#006948]">2.0x katsayı</strong> üzerinden hesaplanır.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mt-3">
        {/* 1. Mesai Tarihi */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea]">
          <label className="block text-xs font-bold text-[#191c1e] mb-1.5">1. Mesai Tarihi</label>
          <div className="relative flex items-center justify-between p-3 bg-[#f2f4f6] rounded-xl hover:bg-[#eceef0] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#006948] shadow-xs">
                <span className="material-symbols-outlined text-[22px]">calendar_today</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#191c1e]">{dateFormattedLabel}</span>
                <span className="text-xs font-semibold text-[#006948]">
                  {holiday ? (
                    <span className="text-amber-800 font-bold flex items-center gap-1">
                      <span>🇹🇷</span> {holiday.name} (Resmi Tatil)
                    </span>
                  ) : isWeekendDay ? (
                    isSunday ? 'Hafta Tatili / Pazar Günü' : 'Cumartesi Tatili'
                  ) : (
                    'Hafta İçi Çalışma Günü'
                  )}
                </span>
              </div>
            </div>
            {/* Hidden native date input layered over container for native picker */}
            <input
              type="date"
              value={date}
              onChange={(e) => {
                const newDate = e.target.value;
                setDate(newDate);
                const h = getHolidayForDate(newDate);
                if (h) {
                  setSelectedType('holiday');
                  if (!customTitle) setCustomTitle(`${h.name} Mesaisi`);
                } else {
                  const d = new Date(newDate);
                  const dow = d.getDay();
                  if (dow === 0 || (settings.workSystemDays === 5 && dow === 6)) {
                    setSelectedType('weekend');
                  } else {
                    setSelectedType('weekday');
                  }
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <span className="material-symbols-outlined text-[#6d7a72] text-[20px] pointer-events-none">
              edit_calendar
            </span>
          </div>
        </div>

        {/* 2. Mesai Türü & Çarpanı */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#191c1e]">2. Mesai Türü & Çarpanı</label>
            <span className="text-[11px] text-[#6d7a72]">Katsayı Seçimi</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Pill 1: Normal Hafta İçi */}
            <button
              type="button"
              onClick={() => setSelectedType('weekday')}
              className={`text-left p-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                selectedType === 'weekday'
                  ? 'bg-[#00855d] text-white shadow-md'
                  : 'bg-[#f2f4f6] text-[#191c1e] hover:bg-[#eceef0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    selectedType === 'weekday' ? 'text-[#85f8c4]' : 'text-[#6d7a72]'
                  }`}
                >
                  work
                </span>
                <span className="text-xs font-bold">Normal Hafta İçi</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    selectedType === 'weekday'
                      ? 'bg-[#002114] text-[#85f8c4]'
                      : 'bg-[#e6e8ea] text-[#3d4a42]'
                  }`}
                >
                  1.5x
                </span>
                {selectedType === 'weekday' && (
                  <span className="material-symbols-outlined text-[16px] text-[#85f8c4]">
                    check_circle
                  </span>
                )}
              </div>
            </button>

            {/* Pill 2: Hafta Sonu / Pazar */}
            <button
              type="button"
              onClick={() => setSelectedType('weekend')}
              className={`text-left p-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                selectedType === 'weekend'
                  ? 'bg-[#00855d] text-white shadow-md'
                  : 'bg-[#f2f4f6] text-[#191c1e] hover:bg-[#eceef0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    selectedType === 'weekend' ? 'text-[#85f8c4]' : 'text-[#6d7a72]'
                  }`}
                  style={{ fontVariationSettings: selectedType === 'weekend' ? "'FILL' 1" : "'FILL' 0" }}
                >
                  weekend
                </span>
                <span className="text-xs font-bold">Hafta Sonu / Pazar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                    selectedType === 'weekend'
                      ? 'bg-[#002114] text-[#85f8c4]'
                      : 'bg-[#e6e8ea] text-[#3d4a42]'
                  }`}
                >
                  2.0x Aktif
                </span>
                {selectedType === 'weekend' && (
                  <span className="material-symbols-outlined text-[#85f8c4] text-[18px]">
                    check_circle
                  </span>
                )}
              </div>
            </button>

            {/* Pill 3: Resmi Tatil / Bayram */}
            <button
              type="button"
              onClick={() => setSelectedType('holiday')}
              className={`text-left p-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                selectedType === 'holiday'
                  ? 'bg-[#00855d] text-white shadow-md'
                  : 'bg-[#f2f4f6] text-[#191c1e] hover:bg-[#eceef0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    selectedType === 'holiday' ? 'text-[#85f8c4]' : 'text-[#6d7a72]'
                  }`}
                >
                  flag
                </span>
                <span className="text-xs font-bold">Resmi Tatil / Bayram</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    selectedType === 'holiday'
                      ? 'bg-[#002114] text-[#85f8c4]'
                      : 'bg-[#e6e8ea] text-[#3d4a42]'
                  }`}
                >
                  2.0x
                </span>
                {selectedType === 'holiday' && (
                  <span className="material-symbols-outlined text-[16px] text-[#85f8c4]">
                    check_circle
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* 3. Saatlik Taban Ücret (Elle Düzenlenebilir) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#191c1e]">3. Saatlik Taban Ücret</label>
            <span className="text-[11px] text-[#006948] font-bold">Elle düzenlenebilir</span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-[#f2f4f6] p-2 rounded-2xl">
            <button
              type="button"
              onClick={() => setShiftHourlyRate((prev) => Math.max(10, prev - 10))}
              className="w-10 h-10 rounded-xl bg-white text-[#191c1e] flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-lg">remove</span>
            </button>

            <div className="flex items-center justify-center flex-1 bg-white rounded-xl px-2 py-1 shadow-xs border border-gray-100">
              <span className="text-base text-[#006948] font-bold mr-1">₺</span>
              <input
                type="number"
                step="any"
                min="1"
                value={shiftHourlyRate === 0 ? '' : shiftHourlyRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setShiftHourlyRate(isNaN(val) ? 0 : val);
                }}
                className="w-24 text-[22px] text-center font-extrabold text-[#191c1e] focus:outline-none bg-transparent"
                placeholder="250"
              />
              <span className="text-xs text-[#565e74] ml-1">/ saat</span>
            </div>

            <button
              type="button"
              onClick={() => setShiftHourlyRate((prev) => prev + 10)}
              className="w-10 h-10 rounded-xl bg-white text-[#191c1e] flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>

          {/* Quick chips */}
          <div className="flex items-center justify-between gap-1.5 pt-1.5">
            {[-25, -10, 10, 50].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => setShiftHourlyRate((prev) => Math.max(10, prev + delta))}
                className="flex-1 py-1 rounded-lg bg-[#eceef0] text-[#3d4a42] text-[11px] font-bold text-center hover:bg-[#e6e8ea] active:scale-95"
              >
                {delta > 0 ? `+₺${delta}` : `-₺${Math.abs(delta)}`}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Zaman Aralığı & Mola */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#191c1e]">4. Zaman Aralığı</label>
            <span className="text-[11px] text-[#006948] font-bold bg-[#dae2fd] px-2 py-0.5 rounded-md">
              {grossHours} Saat Brüt
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#f2f4f6] rounded-xl">
              <span className="block text-[11px] text-[#565e74] mb-1">Başlangıç</span>
              <div className="flex items-center justify-between">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-transparent text-sm text-[#191c1e] font-bold focus:outline-none w-full"
                />
                <span className="material-symbols-outlined text-[#6d7a72] text-[18px]">schedule</span>
              </div>
            </div>

            <div className="p-3 bg-[#f2f4f6] rounded-xl">
              <span className="block text-[11px] text-[#565e74] mb-1">Bitiş</span>
              <div className="flex items-center justify-between">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-transparent text-sm text-[#191c1e] font-bold focus:outline-none w-full"
                />
                <span className="material-symbols-outlined text-[#6d7a72] text-[18px]">schedule</span>
              </div>
            </div>
          </div>

          {/* 4. Mola Süresi */}
          <div className="mt-4 pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#3d4a42]">4. Mola Süresi (Düşülecek)</label>
              <span className="text-[11px] text-[#565e74] font-semibold">
                {breakMinutes === 0 ? 'Mola yok' : `${breakMinutes} dk mola`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#eceef0] rounded-xl">
              {[0, 15, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setBreakMinutes(mins)}
                  className={`py-1.5 rounded-lg text-center text-xs font-semibold transition-all cursor-pointer ${
                    breakMinutes === mins
                      ? 'bg-white text-[#006948] font-bold shadow-xs'
                      : 'text-[#3d4a42] hover:text-[#191c1e]'
                  }`}
                >
                  {mins === 0 ? 'Yok' : `${mins} dk`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Yemek & Yol Desteği */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex items-center justify-between">
          <div className="flex items-center gap-3 pr-2">
            <div className="w-10 h-10 rounded-xl bg-[#f2f4f6] flex items-center justify-center text-[#006948] shrink-0">
              <span className="material-symbols-outlined text-[22px]">restaurant</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#191c1e]">Yemek & Yol Desteği</span>
              <span className="block text-xs text-[#006948] font-semibold">
                +{settings.mealBonusDefault || 150} ₺ Günlük Yemek Primi
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={mealBonus}
              onChange={(e) => setMealBonus(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
          </label>
        </div>

        {/* 6. Açıklama / Proje */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea]">
          <label className="block text-xs font-bold text-[#191c1e] mb-1.5" htmlFor="work-note">
            5. Açıklama / Proje <span className="text-[#6d7a72] font-normal text-[11px]">(İsteğe Bağlı)</span>
          </label>
          <div className="relative">
            <input
              id="work-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: Hafta sonu acil destek"
              className="w-full h-11 px-3 pr-10 rounded-xl bg-[#f2f4f6] text-[#191c1e] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]/20 transition-all placeholder:text-gray-400"
            />
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#6d7a72] text-[18px]">
              edit_note
            </span>
          </div>
        </div>
        {/* Error Alert */}
        {formError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-base text-red-600 shrink-0">error</span>
            <span>{formError}</span>
          </div>
        )}
      </form>

      {/* Fixed Bottom Save Button */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-[#f7f9fb]/90 backdrop-blur-xl border-t border-[#e6e8ea] z-40">
        <div className="max-w-md mx-auto flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-20 h-12 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="flex-1 h-12 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#006948]/25 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>Mesaiyi Kaydet ({formatTL(earnings).replace(',00', '')})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
