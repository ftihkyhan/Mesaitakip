import React, { useState, useMemo } from 'react';
import { ActiveTab, OvertimeRecord, UserSettings } from '../types/overtime';
import { formatTL, formatCompactTL } from '../utils/storage';
import { exportToCSV, printBordroPDF } from '../utils/export';
import {
  parseMonthString,
  formatMonthString,
  getCalendarGrid,
  doesRecordMatchMonth,
} from '../utils/calendar';
import { getHolidayForDate, getHolidaysForMonth, PublicHoliday } from '../utils/holidays';

interface CalendarViewProps {
  records: OvertimeRecord[];
  settings: UserSettings;
  setActiveTab: (tab: ActiveTab) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onSelectDateForAdd?: (dateStr: string) => void;
  onDeleteRecord?: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  records,
  settings,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  onSelectDateForAdd,
  onDeleteRecord,
}) => {
  const todayDate = new Date();
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(todayDate.getDate());
  const [inspectRecord, setInspectRecord] = useState<OvertimeRecord | null>(null);

  // Parse active month and year
  const { year, monthIndex } = useMemo(
    () => parseMonthString(selectedMonth),
    [selectedMonth]
  );

  // Dynamic grid for the selected month
  const calendarData = useMemo(
    () => getCalendarGrid(year, monthIndex),
    [year, monthIndex]
  );

  // Holidays in the current month
  const monthHolidays = useMemo(() => {
    return getHolidaysForMonth(year, monthIndex);
  }, [year, monthIndex]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    let nextMonth = monthIndex - 1;
    let nextYear = year;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }
    setSelectedMonth(formatMonthString(nextYear, nextMonth));
  };

  const handleNextMonth = () => {
    let nextMonth = monthIndex + 1;
    let nextYear = year;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setSelectedMonth(formatMonthString(nextYear, nextMonth));
  };

  // Records for this selected month (without artificial demo fallback)
  const monthRecords = useMemo(() => {
    return records.filter((r) => doesRecordMatchMonth(r.date, year, monthIndex));
  }, [records, year, monthIndex]);

  // Totals for this month
  const totalHours = monthRecords.reduce((acc, r) => acc + r.netHours, 0);
  const totalEarnings = monthRecords.reduce((acc, r) => acc + r.totalEarnings, 0);
  const normalHours = monthRecords
    .filter((r) => r.multiplier === 1.5)
    .reduce((acc, r) => acc + r.netHours, 0);
  const weekendHours = monthRecords
    .filter((r) => r.multiplier >= 2.0)
    .reduce((acc, r) => acc + r.netHours, 0);

  const normalEarnings = monthRecords
    .filter((r) => r.multiplier === 1.5)
    .reduce((acc, r) => acc + r.totalEarnings, 0);
  const weekendEarnings = monthRecords
    .filter((r) => r.multiplier >= 2.0)
    .reduce((acc, r) => acc + r.totalEarnings, 0);

  const avgDailyHours =
    monthRecords.length > 0 ? (totalHours / monthRecords.length).toFixed(1) : '0';

  // Check if a day has overtime in the selected month
  const getRecordForDay = (day: number) => {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const targetDate = `${year}-${monthStr}-${dayStr}`;
    return records.find((r) => r.date === targetDate);
  };

  const selectedDayRecord = getRecordForDay(selectedDayNumber);

  // Check if selected day is an official public holiday
  const selectedDayHoliday = useMemo(() => {
    const dayStr = String(selectedDayNumber).padStart(2, '0');
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    return getHolidayForDate(`${year}-${monthStr}-${dayStr}`);
  }, [selectedDayNumber, year, monthIndex]);

  // Group month records into weeks dynamically
  const groupedWeeks = useMemo(() => {
    const groups: { [key: string]: { title: string; records: OvertimeRecord[] } } = {
      w1: { title: `1. Hafta (01 - 07 ${calendarData.monthName})`, records: [] },
      w2: { title: `2. Hafta (08 - 14 ${calendarData.monthName})`, records: [] },
      w3: { title: `3. Hafta (15 - 21 ${calendarData.monthName})`, records: [] },
      w4: { title: `4. Hafta (22 - 28 ${calendarData.monthName})`, records: [] },
      w5: { title: `5. Hafta / Ay Sonu (29 - ${calendarData.totalDays} ${calendarData.monthName})`, records: [] },
    };

    monthRecords.forEach((r) => {
      const day = parseInt(r.date.split('-')[2] || '1', 10);
      if (day <= 7) groups.w1.records.push(r);
      else if (day <= 14) groups.w2.records.push(r);
      else if (day <= 21) groups.w3.records.push(r);
      else if (day <= 28) groups.w4.records.push(r);
      else groups.w5.records.push(r);
    });

    return [groups.w1, groups.w2, groups.w3, groups.w4, groups.w5].filter(
      (g) => g.records.length > 0
    );
  }, [monthRecords, calendarData]);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-2 pb-28 gap-4">
      {/* Ay Seçici & Özet Bileşeni */}
      <div className="flex flex-col bg-white p-4 rounded-2xl shadow-sm border border-[#e6e8ea] gap-2.5">
        <div className="flex items-center justify-between">
          <button
            aria-label="Önceki Ay"
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#565e74] hover:bg-[#e6e8ea] transition-colors active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          <div className="flex flex-col items-center">
            <span className="text-[18px] font-extrabold text-[#191c1e] tracking-tight">
              {calendarData.monthName} {year}
            </span>
            <span className="text-[11px] font-semibold text-[#006948] bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
              {monthRecords.length} Gün Mesai • {monthHolidays.length} Resmi Tatil
            </span>
          </div>

          <button
            aria-label="Sonraki Ay"
            onClick={handleNextMonth}
            className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#565e74] hover:bg-[#e6e8ea] transition-colors active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>

        {/* Haftanın Günleri Başlıkları */}
        <div className="grid grid-cols-7 text-center pt-2 border-t border-gray-100">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz'].map((w, idx) => (
            <span
              key={w}
              className={`text-xs font-bold py-1 ${
                idx >= 5 ? 'text-[#006948]' : 'text-[#6d7a72]'
              }`}
            >
              {w}
            </span>
          ))}
        </div>

        {/* İnteraktif Takvim Izgarası */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Önceki aydan taşan günler */}
          {calendarData.prevDays.map((d) => (
            <span
              key={`prev-${d}`}
              className="h-10 flex items-center justify-center text-xs text-[#bccac0] opacity-40 select-none"
            >
              {d}
            </span>
          ))}

          {/* Aktif Ayın Günleri */}
          {calendarData.currentDays.map((day) => {
            const hasOvertime = Boolean(getRecordForDay(day));
            const isSelected = selectedDayNumber === day;
            const currentWeekday = (calendarData.firstDayWeekday + day - 1) % 7;
            const isWeekend = currentWeekday === 5 || currentWeekday === 6;

            const dayStr = String(day).padStart(2, '0');
            const monthStr = String(monthIndex + 1).padStart(2, '0');
            const dateStr = `${year}-${monthStr}-${dayStr}`;
            const holiday = getHolidayForDate(dateStr);

            return (
              <button
                key={`day-${day}`}
                onClick={() => setSelectedDayNumber(day)}
                className={`h-11 flex flex-col items-center justify-center relative rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#006948] text-white shadow-md shadow-[#006948]/30 font-bold scale-105 z-10'
                    : hasOvertime
                    ? 'bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e6e8ea] font-bold ring-1 ring-[#006948]/30'
                    : holiday
                    ? 'bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-300 hover:bg-amber-100'
                    : isWeekend
                    ? 'bg-[#f2f4f6]/60 text-[#565e74] hover:bg-[#eceef0]'
                    : 'text-[#191c1e] hover:bg-gray-100'
                }`}
              >
                <span className="text-xs leading-none">{day}</span>

                {/* Holiday flag or overtime dot */}
                {holiday && !isSelected && (
                  <span className="text-[10px] leading-none absolute top-1 right-1" title={holiday.name}>
                    🇹🇷
                  </span>
                )}

                {hasOvertime && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-[#85f8c4]' : 'bg-[#006948]'
                    }`}
                  ></span>
                )}
              </button>
            );
          })}

          {/* Sonraki aydan taşan günler */}
          {calendarData.nextDays.map((d) => (
            <span
              key={`next-${d}`}
              className="h-10 flex items-center justify-center text-xs text-[#bccac0] opacity-40 select-none"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Seçili Gün Bilgi Kartı */}
        <div className="mt-2 bg-[#2d3133] text-[#eff1f3] p-3 rounded-xl flex flex-col gap-2 shadow-md">
          {/* Holiday notification if selected day is holiday */}
          {selectedDayHoliday && (
            <div className="bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <span>🇹🇷</span>
                <span>{selectedDayHoliday.name}</span>
              </div>
              <span className="bg-amber-400/30 text-amber-100 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                {selectedDayHoliday.multiplier}x Kanuni Çarpan
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            {selectedDayRecord ? (
              <>
                <div
                  className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                  onClick={() => setInspectRecord(selectedDayRecord)}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#6ffbbe] shrink-0">
                    event_available
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] text-[#d8dadc] truncate">
                      {selectedDayRecord.dateLabel || `${selectedDayNumber} ${calendarData.monthName} Seçildi`}
                    </span>
                    <span className="text-xs text-white font-bold truncate">
                      {selectedDayRecord.netHours} Saat ({selectedDayRecord.multiplier}x) Mesaisi
                    </span>
                  </div>
                </div>
                <div
                  className="bg-[#006948]/40 px-2.5 py-1 rounded-lg border border-[#006948]/30 cursor-pointer shrink-0 ml-2"
                  onClick={() => setInspectRecord(selectedDayRecord)}
                >
                  <span className="text-sm text-[#6ffbbe] font-extrabold">
                    {formatCompactTL(selectedDayRecord.totalEarnings)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-gray-400 shrink-0">
                    calendar_today
                  </span>
                  <span className="text-xs text-gray-300 font-medium truncate">
                    {selectedDayNumber} {calendarData.monthName} için mesai kaydı yok
                  </span>
                </div>
                <button
                  onClick={() => {
                    const dayStr = String(selectedDayNumber).padStart(2, '0');
                    const monthStr = String(monthIndex + 1).padStart(2, '0');
                    if (onSelectDateForAdd) {
                      onSelectDateForAdd(`${year}-${monthStr}-${dayStr}`);
                    }
                    setActiveTab('mesai-ekle');
                  }}
                  className="text-[11px] font-bold text-[#85f8c4] bg-[#006948] px-2.5 py-1.5 rounded-lg hover:bg-[#00855d] transition-all cursor-pointer shrink-0 ml-2"
                >
                  {selectedDayHoliday ? '+ Tatil Mesaisi Ekle (2x)' : '+ Mesai Ekle'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bu Ayki Resmi Tatiller Bölümü */}
      {monthHolidays.length > 0 && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#e6e8ea] flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-base">🇹🇷</span>
              <span className="text-xs font-bold text-[#191c1e]">
                {calendarData.monthName} Ayı Resmi Tatilleri
              </span>
            </div>
            <span className="text-[10px] font-extrabold bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
              4857 İş Kanunu 2.0x
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {monthHolidays.map((holiday) => {
              const dayNum = parseInt(holiday.date.split('-')[2], 10);
              const hasRecord = Boolean(getRecordForDay(dayNum));

              return (
                <div
                  key={holiday.date}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-950 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {dayNum}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-[#191c1e] truncate">{holiday.name}</span>
                      <span className="text-[11px] text-gray-500 truncate">{holiday.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {hasRecord ? (
                      <span className="text-[10px] font-bold text-[#006948] bg-emerald-100 px-2 py-1 rounded-md">
                        ✓ Kaydedildi
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (onSelectDateForAdd) {
                            onSelectDateForAdd(holiday.date);
                          }
                          setActiveTab('mesai-ekle');
                        }}
                        className="text-[11px] font-bold text-[#006948] hover:text-[#00855d] bg-white border border-[#006948]/30 px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        + Mesai Gir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Aylık Özet Metrik Kartları (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Normal Mesai */}
        <div className="bg-white p-3.5 rounded-2xl flex flex-col gap-1 shadow-sm border border-[#e6e8ea]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#6d7a72] font-semibold">Normal Mesai</span>
            <div className="w-6 h-6 rounded bg-[#f2f4f6] flex items-center justify-center text-[#006948]">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
            </div>
          </div>
          <div className="flex flex-col mt-1">
            <span className="text-[18px] text-[#191c1e] font-extrabold">{normalHours} Saat</span>
            <span className="text-xs text-[#006948] font-bold">
              {formatCompactTL(normalEarnings)}
            </span>
          </div>
          <div className="w-full bg-[#f2f4f6] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#006948] h-full rounded-full transition-all"
              style={{
                width: `${totalHours > 0 ? (normalHours / totalHours) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Hafta Sonu / Tatil Mesaisi */}
        <div className="bg-white p-3.5 rounded-2xl flex flex-col gap-1 shadow-sm border border-[#e6e8ea]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#6d7a72] font-semibold">2.0x Tatil/Pazar</span>
            <div className="w-6 h-6 rounded bg-[#f2f4f6] flex items-center justify-center text-[#565e74]">
              <span className="material-symbols-outlined text-[14px]">weekend</span>
            </div>
          </div>
          <div className="flex flex-col mt-1">
            <span className="text-[18px] text-[#191c1e] font-extrabold">{weekendHours} Saat</span>
            <span className="text-xs text-[#006948] font-bold">
              {formatCompactTL(weekendEarnings)}
            </span>
          </div>
          <div className="w-full bg-[#f2f4f6] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#565e74] h-full rounded-full transition-all"
              style={{
                width: `${totalHours > 0 ? (weekendHours / totalHours) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Ortalama Günlük Mesai */}
        <div className="bg-white p-3.5 rounded-2xl flex flex-col gap-1 shadow-sm border border-[#e6e8ea]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#6d7a72] font-semibold">Ort. Günlük</span>
            <div className="w-6 h-6 rounded bg-[#f2f4f6] flex items-center justify-center text-[#6d7a72]">
              <span className="material-symbols-outlined text-[14px]">speed</span>
            </div>
          </div>
          <div className="flex flex-col mt-1">
            <span className="text-[18px] text-[#191c1e] font-extrabold">{avgDailyHours} Saat</span>
            <span className="text-[11px] text-[#6d7a72]">Mesai günlerinde</span>
          </div>
        </div>

        {/* Tahmini Bordro Katkısı */}
        <div className="bg-white p-3.5 rounded-2xl flex flex-col gap-1 shadow-sm border border-[#e6e8ea]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#6d7a72] font-semibold">Bordro Katkısı</span>
            <div className="w-6 h-6 rounded bg-[#6ffbbe]/30 flex items-center justify-center text-[#006948]">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
            </div>
          </div>
          <div className="flex flex-col mt-1">
            <span className="text-[18px] text-[#006948] font-extrabold">
              +%
              {settings.hourlyRate > 0
                ? Math.round((totalEarnings / (settings.hourlyRate * 180)) * 100)
                : 0}
            </span>
            <span className="text-[11px] text-[#6d7a72]">Net maaşa ek</span>
          </div>
        </div>
      </div>

      {/* Dışa Aktarma Butonları */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => printBordroPDF(monthRecords, settings, selectedMonth)}
          className="flex items-center justify-center gap-1.5 py-3 px-2 bg-white text-[#191c1e] rounded-xl text-xs font-bold border border-[#e6e8ea] shadow-xs hover:bg-[#eceef0] active:scale-98 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#006948] text-[18px]">picture_as_pdf</span>
          <span>Bordro Dökümü Al</span>
        </button>

        <button
          onClick={() => exportToCSV(monthRecords, settings, selectedMonth)}
          className="flex items-center justify-center gap-1.5 py-3 px-2 bg-white text-[#191c1e] rounded-xl text-xs font-bold border border-[#e6e8ea] shadow-xs hover:bg-[#eceef0] active:scale-98 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#006948] text-[18px]">table_view</span>
          <span>Excel İndir (.csv)</span>
        </button>
      </div>

      {/* Günlük Mesai Akışı */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pt-1">
          <span className="text-[16px] text-[#191c1e] font-bold">Günlük Mesai Akışı</span>
          <span className="text-xs text-[#6d7a72] font-semibold">
            Toplam {monthRecords.length} Kayıt
          </span>
        </div>

        {groupedWeeks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-[#e6e8ea] text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-gray-300">event_busy</span>
            <span className="text-xs font-bold text-gray-700">Bu ay için mesai kaydı bulunamadı</span>
            <button
              onClick={() => setActiveTab('mesai-ekle')}
              className="text-xs font-bold text-[#006948] bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 cursor-pointer"
            >
              + Mesai Ekle
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {groupedWeeks.map((weekGroup, wIdx) => (
              <div key={`wg-${wIdx}`} className="flex flex-col gap-2">
                <span className="text-[11px] text-[#6d7a72] font-bold uppercase tracking-wider pl-1">
                  {weekGroup.title}
                </span>
                {weekGroup.records.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => setInspectRecord(rec)}
                    className="bg-white p-3.5 rounded-xl flex items-center justify-between shadow-xs border border-[#e6e8ea] relative overflow-hidden cursor-pointer hover:bg-gray-50/80 transition-colors"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        rec.type === 'holiday'
                          ? 'bg-[#ba1a1a]'
                          : rec.multiplier >= 2.0
                          ? 'bg-[#565e74]'
                          : 'bg-[#006948]'
                      }`}
                    ></div>

                    <div className="flex items-center gap-3 pl-1.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                          rec.type === 'holiday'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : 'bg-[#f2f4f6] text-[#191c1e]'
                        }`}
                      >
                        <span className="text-base font-extrabold leading-none">
                          {rec.date.split('-')[2] || '01'}
                        </span>
                        <span className="text-[10px] text-[#6d7a72]">
                          {rec.dateLabel.split(' ')[2] || 'Gün'}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#191c1e]">{rec.title}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              rec.type === 'holiday'
                                ? 'bg-[#ffdad6] text-[#93000a]'
                                : rec.multiplier >= 2.0
                                ? 'bg-[#dae2fd] text-[#131b2e]'
                                : 'bg-[#6ffbbe]/30 text-[#005236]'
                            }`}
                          >
                            {rec.multiplier}x
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6d7a72]">
                          {rec.startTime} - {rec.endTime} ({rec.netHours} Saat)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs font-extrabold text-[#006948]">
                        +{formatCompactTL(rec.totalEarnings)}
                      </span>
                      <span className="text-[10px] text-[#6d7a72]">{rec.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Inspect & Delete Modal */}
      {inspectRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-sm font-bold text-[#191c1e]">Mesai Detayı & İşlemler</span>
              <button
                onClick={() => setInspectRecord(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Tarih</span>
                <span className="font-semibold text-gray-800">
                  {inspectRecord.dateLabel || inspectRecord.date}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Mesai Türü</span>
                <span className="font-bold text-[#006948]">{inspectRecord.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Katsayı</span>
                <span className="font-bold text-[#006948]">{inspectRecord.multiplier}x</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Çalışma Aralığı</span>
                <span className="font-semibold text-gray-800">
                  {inspectRecord.startTime} - {inspectRecord.endTime} ({inspectRecord.netHours} sa)
                </span>
              </div>
              {inspectRecord.note && (
                <div className="flex flex-col gap-0.5 py-1 border-b border-gray-50">
                  <span className="text-gray-500">Açıklama</span>
                  <span className="italic text-gray-700">"{inspectRecord.note}"</span>
                </div>
              )}
              <div className="flex justify-between py-2 items-center bg-emerald-50 px-3 rounded-lg mt-1">
                <span className="font-bold text-[#006948]">Hak Edilen Tutar</span>
                <span className="text-base font-extrabold text-[#006948]">
                  +{formatTL(inspectRecord.totalEarnings)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {onDeleteRecord && (
                <button
                  onClick={() => {
                    onDeleteRecord(inspectRecord.id);
                    setInspectRecord(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-xs hover:bg-red-50 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Kaydı Sil
                </button>
              )}
              <button
                onClick={() => setInspectRecord(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#006948] text-white font-bold text-xs hover:bg-[#00855d] cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bilgilendirme Bannerı */}
      <div className="bg-[#f2f4f6] p-4 rounded-2xl flex items-center gap-3 border border-[#bccac0]/30 mb-2">
        <span className="material-symbols-outlined text-[22px] text-[#006948] shrink-0">
          verified_user
        </span>
        <span className="text-xs text-[#3d4a42] leading-relaxed">
          Mesaileriniz 4857 Sayılı İş Kanunu'na uygun olarak %50 ve %100 zamlı kat sayılarla otomatik
          hesaplanmaktadır.
        </span>
      </div>
    </div>
  );
};
