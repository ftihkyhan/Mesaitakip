import React, { useState, useMemo } from 'react';
import { ActiveTab, OvertimeRecord, UserSettings } from '../types/overtime';
import { formatTL } from '../utils/storage';
import { LiveTrackerBanner } from '../components/LiveTrackerBanner';
import { parseMonthString, doesRecordMatchMonth } from '../utils/calendar';
import { getHolidaysForMonth } from '../utils/holidays';

interface HomeViewProps {
  records: OvertimeRecord[];
  settings: UserSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onLiveSave: (seconds: number, earnings: number) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onDeleteRecord?: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  records,
  settings,
  setActiveTab,
  onLiveSave,
  selectedMonth,
  setSelectedMonth,
  onDeleteRecord,
}) => {
  const [showMonthSelect, setShowMonthSelect] = useState(false);
  const [isLiveCounterActive, setIsLiveCounterActive] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<OvertimeRecord | null>(null);

  // Month-filtered records
  const { year, monthIndex } = useMemo(
    () => parseMonthString(selectedMonth),
    [selectedMonth]
  );

  const currentYear = new Date().getFullYear();
  const availableMonths = useMemo(() => {
    return [
      `Ağustos ${year || currentYear}`,
      `Eylül ${year || currentYear}`,
      `Ekim ${year || currentYear}`,
      `Kasım ${year || currentYear}`,
      `Aralık ${year || currentYear}`,
    ];
  }, [year, currentYear]);

  const monthRecords = useMemo(() => {
    return records.filter((r) => doesRecordMatchMonth(r.date, year, monthIndex));
  }, [records, year, monthIndex]);

  // Compute stats for current month records
  const totalHours = monthRecords.reduce((acc, r) => acc + r.netHours, 0);
  const totalEarnings = monthRecords.reduce((acc, r) => acc + r.totalEarnings, 0);
  const normalHours = monthRecords.filter((r) => r.multiplier === 1.5).reduce((acc, r) => acc + r.netHours, 0);
  const weekendHours = monthRecords.filter((r) => r.multiplier >= 2.0).reduce((acc, r) => acc + r.netHours, 0);

  const targetHours = settings.monthlyTargetHours || 35;
  const progressPercent = Math.min(100, Math.round((totalHours / targetHours) * 100));

  // Public holidays in this month
  const monthHolidays = useMemo(() => {
    return getHolidaysForMonth(year, monthIndex);
  }, [year, monthIndex]);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-2 pb-28 gap-5">
      {/* Top Welcome & Period Filter */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[22px] font-extrabold text-[#191c1e] tracking-tight">
              Merhaba {settings.name.split(' ')[0]}
            </span>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-xs text-[#3d4a42] font-medium">
            Hakedişlerin her an şeffaf ve kontrolünde
          </p>
        </div>

        {/* Month Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setShowMonthSelect(!showMonthSelect)}
            className="flex items-center gap-1 bg-[#e6e8ea] px-3 py-1.5 rounded-full shadow-sm hover:bg-[#e0e3e5] transition-all cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-[16px] text-[#006948]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              calendar_today
            </span>
            <span className="text-xs text-[#191c1e] font-bold">{selectedMonth}</span>
            <span className="material-symbols-outlined text-[16px] text-[#565e74]">expand_more</span>
          </button>

          {showMonthSelect && (
            <div className="absolute right-0 top-10 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 animate-in fade-in zoom-in-95">
              {availableMonths.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedMonth(m);
                    setShowMonthSelect(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 flex items-center justify-between ${
                    m === selectedMonth ? 'text-[#006948] bg-emerald-50/50' : 'text-gray-700'
                  }`}
                >
                  <span>{m}</span>
                  {m === selectedMonth && (
                    <span className="material-symbols-outlined text-xs text-[#006948]">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hero Earnings Overview Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#006948] via-[#00855d] to-[#191c1e] p-5 text-white shadow-xl shadow-[#006948]/15">
        {/* Ambient Blur & Watermark */}
        <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-[#6ffbbe]/15 blur-2xl pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[96px]">payments</span>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#85f8c4] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#85f8c4] animate-ping"></span>
              Bu Ay Kazanılan Ek Gelir
            </span>
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white">
              Hesaplandı
            </span>
          </div>

          {/* Main Currency Stat */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-[32px] sm:text-[34px] font-extrabold tracking-tight text-white">
              {formatTL(totalEarnings)}
            </span>
            <span className="text-xs text-[#68dba9] font-semibold">Net Kazanç</span>
          </div>

          {/* Overtime Target Progress */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between items-center text-white">
              <span className="text-xs opacity-90">
                Aylık {targetHours} saat hedefinin %{progressPercent}'i tamamlandı
              </span>
              <span className="text-xs font-bold text-[#6ffbbe]">
                {totalHours} / {targetHours} Sa
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6ffbbe] to-[#85f8c4] transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Dynamic Badges Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#6ffbbe] shrink-0"></span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] opacity-80 truncate">Normal (1.5x)</span>
                <span className="text-[15px] font-bold leading-tight truncate">
                  {normalHours} Saat
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#dae2fd] shrink-0"></span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] opacity-80 truncate">Hafta Sonu (2.0x)</span>
                <span className="text-[15px] font-bold leading-tight truncate">
                  {weekendHours} Saat
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid (2 Cards) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stat Card 1: Toplam Mesai */}
        <div className="flex flex-col p-4 rounded-xl bg-white shadow-sm border border-[#e6e8ea] gap-1">
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#006948]">
              <span className="material-symbols-outlined text-[20px]">timelapse</span>
            </span>
            <span className="text-[11px] font-bold text-[#006948] bg-[#006948]/10 px-2 py-0.5 rounded-full">
              {monthRecords.length > 0 ? `${monthRecords.length} Kayıt` : '0 Kayıt'}
            </span>
          </div>
          <div className="flex flex-col pt-1">
            <span className="text-xs text-[#3d4a42] font-medium">Toplam Mesai</span>
            <span className="text-[18px] font-bold text-[#191c1e]">{totalHours} Saat</span>
          </div>
          <span className="text-[11px] text-[#565e74] truncate">
            {totalHours > 0
              ? `${normalHours}s Normal, ${weekendHours}s Tatil`
              : 'Bu ay henüz mesai kaydı yok'}
          </span>
        </div>

        {/* Stat Card 2: Saatlik Taban */}
        <div className="flex flex-col p-4 rounded-xl bg-white shadow-sm border border-[#e6e8ea] gap-1">
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-lg bg-[#dae2fd] flex items-center justify-center text-[#565e74]">
              <span className="material-symbols-outlined text-[20px]">price_change</span>
            </span>
            <span className="text-[11px] font-bold text-[#565e74] bg-[#e6e8ea] px-2 py-0.5 rounded-full">
              {settings.workSystemDays} Günlük
            </span>
          </div>
          <div className="flex flex-col pt-1">
            <span className="text-xs text-[#3d4a42] font-medium">Saatlik Taban</span>
            <span className="text-[18px] font-bold text-[#191c1e]">{formatTL(settings.hourlyRate)}</span>
          </div>
          <span className="text-[11px] text-[#565e74] truncate">
            1.5x Mesai: {formatTL(settings.hourlyRate * 1.5)} / sa
          </span>
        </div>
      </div>

      {/* Fast Action Prompt Banner */}
      <div className="flex flex-col p-4 rounded-2xl bg-[#f2f4f6] border border-[#e6e8ea] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#006948]/15 text-[#006948] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">more_time</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-bold text-[#191c1e]">Bugün mesaiye kaldın mı?</span>
            <span className="text-xs text-[#3d4a42] truncate">Saniyeler içinde kaydet, hakkını koru</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setActiveTab('mesai-ekle')}
            className="flex-1 h-12 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#006948]/20 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>+ Hemen Mesai Gir</span>
          </button>

          <button
            onClick={() => setIsLiveCounterActive(!isLiveCounterActive)}
            className={`h-12 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              isLiveCounterActive
                ? 'bg-[#006948] text-white ring-2 ring-[#006948]'
                : 'bg-white text-[#191c1e] border border-[#e6e8ea] hover:bg-gray-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
            <span
              className={`material-symbols-outlined text-[18px] ${
                isLiveCounterActive ? 'text-white' : 'text-[#006948]'
              }`}
            >
              play_arrow
            </span>
            <span className="truncate">Canlı Sayaç</span>
          </button>
        </div>

        {/* Live Tracker Widget Reveal */}
        <LiveTrackerBanner
          isOpen={isLiveCounterActive}
          settings={settings}
          onToggle={() => setIsLiveCounterActive(!isLiveCounterActive)}
          onFinishAndSave={(secs, earnings) => {
            setIsLiveCounterActive(false);
            onLiveSave(secs, earnings);
          }}
        />
      </div>

      {/* Public Holidays Banner for current month */}
      {monthHolidays.length > 0 && (
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <span className="text-base">🇹🇷</span>
              <span>Bu Ayki Resmi Tatiller ({selectedMonth})</span>
            </div>
            <span className="text-[10px] font-extrabold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full">
              Kanunen 2.0x Mesai
            </span>
          </div>
          <div className="flex flex-col gap-1.5 mt-0.5">
            {monthHolidays.map((h) => (
              <div
                key={h.date}
                className="flex items-center justify-between text-xs bg-white/80 p-2 rounded-xl border border-amber-100"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-950">
                    {h.date.split('-')[2]} {selectedMonth.split(' ')[0]}
                  </span>
                  <span className="text-gray-700 font-medium">{h.name}</span>
                </div>
                <button
                  onClick={() => setActiveTab('takvim')}
                  className="text-[11px] font-bold text-[#006948] hover:underline"
                >
                  Takvimde Gör →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Logs Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold text-[#191c1e]">Son Mesai Kayıtları</span>
            <span className="text-xs bg-[#e6e8ea] text-[#3d4a42] px-2 py-0.5 rounded-full font-bold">
              {monthRecords.length} Kayıt
            </span>
          </div>
          <button
            onClick={() => setActiveTab('takvim')}
            className="text-xs text-[#006948] font-bold flex items-center gap-0.5 hover:underline"
          >
            Tümünü Gör
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Overtime List Items or Clean Empty State */}
        {monthRecords.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-dashed border-[#bccac0] flex flex-col items-center justify-center text-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#191c1e]">{selectedMonth} Döneminde Henüz Mesai Yok</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Yeni bir mesai kaydettiğinizde kazanç hesaplamanız burada anlık listelenir.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('mesai-ekle')}
              className="mt-1 px-4 py-2 bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>İlk Mesainizi Ekleyin</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {monthRecords.slice(0, 4).map((record) => {
              const isWeekend = record.multiplier >= 2.0;
              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecordForDetail(record)}
                  className="relative flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#e6e8ea] shadow-sm overflow-hidden active:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Accent strip on left */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      isWeekend ? 'bg-[#006948]' : 'bg-[#565e74]'
                    }`}
                  ></div>

                  <div className="flex flex-col gap-1 pl-2 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-[#191c1e] truncate">{record.title}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isWeekend
                            ? 'bg-[#006948]/10 text-[#006948]'
                            : 'bg-[#dae2fd] text-[#5c647a]'
                        }`}
                      >
                        {record.multiplier}x Çarpan
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#565e74] text-xs">
                      <span className="material-symbols-outlined text-[14px]">
                        {isWeekend ? 'event' : 'schedule'}
                      </span>
                      <span>{record.dateLabel || record.date}</span>
                      <span className="opacity-40">•</span>
                      <span>
                        {record.startTime} - {record.endTime} ({record.netHours} sa net)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`text-sm font-extrabold ${
                        isWeekend ? 'text-[#006948]' : 'text-[#191c1e]'
                      }`}
                    >
                      +{formatTL(record.totalEarnings)}
                    </span>
                    <span className="text-[11px] text-[#565e74]">{record.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Micro Tips & Motivational Sparkle Card */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#e6e8ea]/60 border border-[#bccac0]/30">
        <div className="w-10 h-10 rounded-full bg-[#6ffbbe] text-[#002113] flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[20px]">tips_and_updates</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#191c1e]">Mesai İpucu</span>
          <span className="text-xs text-[#3d4a42] leading-relaxed mt-0.5">
            Resmi tatil ve Pazar mesailerinde hak ettiğin %100 zamlı çarpan otomatik olarak brüt tabanına
            yansıtılır.
          </span>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-sm font-bold text-[#191c1e]">Mesai Kaydı Detayı</span>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Tarih</span>
                <span className="font-semibold text-gray-800">
                  {selectedRecordForDetail.dateLabel || selectedRecordForDetail.date}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Başlık</span>
                <span className="font-semibold text-gray-800">{selectedRecordForDetail.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Çarpan</span>
                <span className="font-bold text-[#006948]">
                  {selectedRecordForDetail.multiplier}x (
                  {selectedRecordForDetail.type === 'weekday'
                    ? 'Hafta İçi'
                    : selectedRecordForDetail.type === 'weekend'
                    ? 'Hafta Sonu'
                    : 'Resmi Tatil'}
                  )
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Çalışma Aralığı</span>
                <span className="font-semibold text-gray-800">
                  {selectedRecordForDetail.startTime} - {selectedRecordForDetail.endTime}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Mola Süresi</span>
                <span className="font-semibold text-gray-800">
                  {selectedRecordForDetail.breakMinutes > 0
                    ? `${selectedRecordForDetail.breakMinutes} dk`
                    : 'Mola yok'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Net Süre</span>
                <span className="font-bold text-gray-900">
                  {selectedRecordForDetail.netHours} Saat
                </span>
              </div>
              {selectedRecordForDetail.mealBonus && (
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Yemek / Yol Primi</span>
                  <span className="font-semibold text-[#006948]">
                    +₺{selectedRecordForDetail.mealBonusAmount}
                  </span>
                </div>
              )}
              {selectedRecordForDetail.note && (
                <div className="flex flex-col gap-0.5 py-1 border-b border-gray-50">
                  <span className="text-gray-500">Açıklama / Proje</span>
                  <span className="font-medium text-gray-700 italic">
                    "{selectedRecordForDetail.note}"
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 items-center bg-emerald-50 px-3 rounded-lg mt-1">
                <span className="font-bold text-[#006948]">Toplam Hakediş</span>
                <span className="text-base font-extrabold text-[#006948]">
                  +{formatTL(selectedRecordForDetail.totalEarnings)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {onDeleteRecord && (
                <button
                  onClick={() => {
                    onDeleteRecord(selectedRecordForDetail.id);
                    setSelectedRecordForDetail(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-xs hover:bg-red-50 flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Kaydı Sil
                </button>
              )}
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#006948] text-white font-bold text-xs hover:bg-[#00855d]"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
