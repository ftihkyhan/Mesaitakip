import React, { useState, useMemo } from 'react';
import { OvertimeRecord, UserSettings } from '../types/overtime';
import { formatTL, formatCompactTL } from '../utils/storage';
import { exportToCSV, printBordroPDF } from '../utils/export';
import { parseMonthString, doesRecordMatchMonth } from '../utils/calendar';

interface ReportsViewProps {
  records: OvertimeRecord[];
  settings: UserSettings;
  selectedMonth: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ records, settings, selectedMonth }) => {
  const [activeReportTab, setActiveReportTab] = useState<'ozet' | 'kanun'>('ozet');

  const { year, monthIndex } = useMemo(
    () => parseMonthString(selectedMonth),
    [selectedMonth]
  );

  const monthRecords = useMemo(() => {
    return records.filter((r) => doesRecordMatchMonth(r.date, year, monthIndex));
  }, [records, year, monthIndex]);

  const totalHours = monthRecords.reduce((acc, r) => acc + r.netHours, 0);
  const totalEarnings = monthRecords.reduce((acc, r) => acc + r.totalEarnings, 0);

  const weekdayRecords = monthRecords.filter((r) => r.type === 'weekday');
  const weekendRecords = monthRecords.filter((r) => r.type === 'weekend');
  const holidayRecords = monthRecords.filter((r) => r.type === 'holiday');

  const weekdayHours = weekdayRecords.reduce((acc, r) => acc + r.netHours, 0);
  const weekendHours = weekendRecords.reduce((acc, r) => acc + r.netHours, 0);
  const holidayHours = holidayRecords.reduce((acc, r) => acc + r.netHours, 0);

  const weekdayEarnings = weekdayRecords.reduce((acc, r) => acc + r.totalEarnings, 0);
  const weekendEarnings = weekendRecords.reduce((acc, r) => acc + r.totalEarnings, 0);
  const holidayEarnings = holidayRecords.reduce((acc, r) => acc + r.totalEarnings, 0);

  const mealTotal = monthRecords.reduce((acc, r) => acc + (r.mealBonus ? r.mealBonusAmount : 0), 0);

  const targetHours = settings.monthlyTargetHours || 35;
  const targetPct = Math.min(100, Math.round((totalHours / targetHours) * 100));

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-2 pb-28 gap-4">
      {/* Top Title & Period */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-[18px] font-bold text-[#191c1e]">Raporlar & Analiz</h2>
          <p className="text-xs text-[#565e74]">{selectedMonth} Hakediş Analizi</p>
        </div>
        <div className="flex gap-1 p-1 bg-[#eceef0] rounded-xl text-xs">
          <button
            onClick={() => setActiveReportTab('ozet')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeReportTab === 'ozet'
                ? 'bg-white text-[#006948] shadow-xs'
                : 'text-[#565e74] hover:text-[#191c1e]'
            }`}
          >
            Özet Grafikler
          </button>
          <button
            onClick={() => setActiveReportTab('kanun')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeReportTab === 'kanun'
                ? 'bg-white text-[#006948] shadow-xs'
                : 'text-[#565e74] hover:text-[#191c1e]'
            }`}
          >
            İş Kanunu 4857
          </button>
        </div>
      </div>

      {activeReportTab === 'ozet' ? (
        <>
          {/* Main Visual Stat Card */}
          <div className="bg-gradient-to-br from-[#191c1e] to-[#2d3133] text-white p-5 rounded-2xl shadow-xl flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#85f8c4] font-bold uppercase tracking-wider">
                Aylık Ekstra Gelir İlerlemesi
              </span>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white">
                Hedef: {targetHours} Saat
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-[30px] font-extrabold text-[#85f8c4]">{formatTL(totalEarnings)}</span>
              <span className="text-xs text-gray-300">({totalHours} Saat Mesai)</span>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Aylık hedef gerçekleşmesi</span>
                <span className="font-bold text-[#85f8c4]">%{targetPct}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00855d] to-[#85f8c4] transition-all duration-700"
                  style={{ width: `${targetPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Breakdown by Multiplier / Category */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex flex-col gap-3">
            <span className="text-xs font-bold text-[#191c1e]">Mesai Dağılım Grafiği</span>

            {/* Visual stacked bar */}
            <div className="h-4 rounded-full bg-gray-100 flex overflow-hidden">
              <div
                style={{ width: `${totalHours > 0 ? (weekdayHours / totalHours) * 100 : 0}%` }}
                className="bg-[#006948] transition-all"
                title={`Hafta İçi: ${weekdayHours} saat`}
              ></div>
              <div
                style={{ width: `${totalHours > 0 ? (weekendHours / totalHours) * 100 : 0}%` }}
                className="bg-[#565e74] transition-all"
                title={`Hafta Sonu: ${weekendHours} saat`}
              ></div>
              <div
                style={{ width: `${totalHours > 0 ? (holidayHours / totalHours) * 100 : 0}%` }}
                className="bg-[#ba1a1a] transition-all"
                title={`Resmi Tatil: ${holidayHours} saat`}
              ></div>
            </div>

            {/* Category breakdown details */}
            <div className="flex flex-col gap-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#f2f4f6]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#006948]"></span>
                  <span className="font-bold text-[#191c1e]">Normal Hafta İçi (1.5x)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-600">{weekdayHours} Saat</span>
                  <span className="font-extrabold text-[#006948]">{formatCompactTL(weekdayEarnings)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#f2f4f6]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#565e74]"></span>
                  <span className="font-bold text-[#191c1e]">Hafta Sonu / Pazar (2.0x)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-600">{weekendHours} Saat</span>
                  <span className="font-extrabold text-[#006948]">{formatCompactTL(weekendEarnings)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#f2f4f6]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ba1a1a]"></span>
                  <span className="font-bold text-[#191c1e]">Resmi Tatil / Bayram (2.0x)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-600">{holidayHours} Saat</span>
                  <span className="font-extrabold text-[#006948]">{formatCompactTL(holidayEarnings)}</span>
                </div>
              </div>

              {mealTotal > 0 && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-amber-600">restaurant</span>
                    <span className="font-bold text-amber-900">Yemek & Yol Primleri</span>
                  </div>
                  <span className="font-extrabold text-amber-800">+{formatCompactTL(mealTotal)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => printBordroPDF(monthRecords, settings, selectedMonth)}
              className="py-3 bg-[#006948] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Bordro PDF</span>
            </button>
            <button
              onClick={() => exportToCSV(monthRecords, settings, selectedMonth)}
              className="py-3 bg-white text-[#191c1e] border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-50 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">table_chart</span>
              <span>Excel (.xlsx)</span>
            </button>
          </div>
        </>
      ) : (
        /* Work Law 4857 Reference Guide */
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex flex-col gap-3 text-xs leading-relaxed text-[#3d4a42]">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-[#006948] font-bold text-sm">
            <span className="material-symbols-outlined text-xl">gavel</span>
            4857 Sayılı İş Kanunu Mesai Rehberi
          </div>

          <div className="flex flex-col gap-1 bg-[#f2f4f6] p-3 rounded-xl">
            <span className="font-bold text-[#191c1e]">Madde 41 • Fazla Çalışma Ücreti</span>
            <p>
              Haftalık 45 saati aşan çalışmalar fazla çalışma sayılır. Her bir saat fazla çalışma için
              verilecek ücret, normal çalışma ücretinin saat başına düşen miktarının <strong>%50 yükseltilmesiyle (1.5x)</strong> ödenir.
            </p>
          </div>

          <div className="flex flex-col gap-1 bg-[#f2f4f6] p-3 rounded-xl">
            <span className="font-bold text-[#191c1e]">Madde 44 & 47 • Tatil ve Hafta Tatili Mesaisi</span>
            <p>
              Hafta tatili (Pazar/Cumartesi) ve kanunlarda ulusal bayram ve genel tatil günü olarak kabul
              edilen günlerde çalışılması halinde, çalışılan her gün için <strong>bir günlük ilave tam yevmiye (%100 zam / 2.0x)</strong> ödenir.
            </p>
          </div>

          <div className="flex flex-col gap-1 bg-[#f2f4f6] p-3 rounded-xl">
            <span className="font-bold text-[#191c1e]">Madde 68 • Ara Dinlenmeleri (Mola)</span>
            <p>
              4 saat veya daha kısa süreli işlerde 15 dakika; 4 saatten fazla 7.5 saate kadar işlerde yarım saat (30 dk);
              7.5 saatten fazla süren işlerde 1 saat ara dinlenmesi verilir ve bu süreler mesai süresinden düşülür.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
