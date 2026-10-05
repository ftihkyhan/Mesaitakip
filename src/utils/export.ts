import { OvertimeRecord, UserSettings } from '../types/overtime';
import { getCurrentMonthString } from './calendar';

export function exportToCSV(
  records: OvertimeRecord[],
  settings: UserSettings,
  monthName = getCurrentMonthString()
): void {
  const headers = ['Tarih', 'Mesai Tanımı', 'Tür', 'Çarpan', 'Başlangıç', 'Bitiş', 'Mola (dk)', 'Net Saat', 'Yemek/Yol Primi', 'Toplam Kazanç (TL)', 'Durum'];
  
  const rows = records.map((r) => [
    `"${r.dateLabel || r.date}"`,
    `"${r.title}"`,
    `"${r.type === 'weekday' ? 'Hafta İçi' : r.type === 'weekend' ? 'Hafta Sonu' : 'Resmi Tatil'}"`,
    `"${r.multiplier}x"`,
    `"${r.startTime}"`,
    `"${r.endTime}"`,
    `"${r.breakMinutes}"`,
    `"${r.netHours}"`,
    `"${r.mealBonus ? r.mealBonusAmount : 0}"`,
    `"${r.totalEarnings.toFixed(2)}"`,
    `"${r.status}"`,
  ]);

  const totalHours = records.reduce((acc, r) => acc + r.netHours, 0);
  const totalEarnings = records.reduce((acc, r) => acc + r.totalEarnings, 0);

  const summary = [
    [],
    ['"Çalışan"', `"${settings.name}"`],
    ['"Dönem"', `"${monthName}"`],
    ['"Saatlik Taban Ücret"', `"${settings.hourlyRate} TL"`],
    ['"Toplam Mesai Saati"', `"${totalHours} Saat"`],
    ['"Toplam Ek Gelir"', `"${totalEarnings.toFixed(2)} TL"`],
    ['"Oluşturulma Tarihi"', `"${new Date().toLocaleString('tr-TR')}"`],
  ];

  const csvContent = '\uFEFF' + [
    headers.join(';'),
    ...rows.map((row) => row.join(';')),
    ...summary.map((row) => row.join(';')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Mesai_Raporu_${monthName.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printBordroPDF(
  records: OvertimeRecord[],
  settings: UserSettings,
  monthName = getCurrentMonthString()
): void {
  const totalHours = records.reduce((acc, r) => acc + r.netHours, 0);
  const totalEarnings = records.reduce((acc, r) => acc + r.totalEarnings, 0);
  const normalHours = records.filter(r => r.multiplier === 1.5).reduce((acc, r) => acc + r.netHours, 0);
  const weekendHours = records.filter(r => r.multiplier >= 2.0).reduce((acc, r) => acc + r.netHours, 0);

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <title>Mesai Bordro Özeti - ${monthName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; margin: 0; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #006948; padding-bottom: 16px; margin-bottom: 20px; }
        .title { font-size: 22px; font-weight: 800; color: #006948; }
        .meta { font-size: 12px; color: #64748b; line-height: 1.5; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
        .summary-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600; }
        .summary-val { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
        th { background: #006948; color: white; text-align: left; padding: 7px 8px; font-weight: 600; }
        td { border-bottom: 1px solid #e2e8f0; padding: 7px 8px; }
        tr:nth-child(even) td { background: #f8fafc; }
        .footer { font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; }
        .badge { display: inline-block; padding: 2px 5px; border-radius: 4px; font-size: 10px; font-weight: 700; }
        .badge-15 { background: #ecfdf5; color: #065f46; }
        .badge-20 { background: #eff6ff; color: #1e40af; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">MesaiTakip • Bordro Hakediş Özeti</div>
          <div class="meta" style="margin-top: 4px;">4857 Sayılı İş Kanunu Hükümlerine Uygun Resmi Döküm</div>
        </div>
        <div class="meta" style="text-align: right;">
          <strong>${settings.name}</strong><br>
          ${settings.email}<br>
          Dönem: <strong>${monthName}</strong>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Toplam Net Mesai</div>
          <div class="summary-val">${totalHours} Saat</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Normal (1.5x)</div>
          <div class="summary-val">${normalHours} Saat</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Tatil/Hafta Sonu (2.0x)</div>
          <div class="summary-val">${weekendHours} Saat</div>
        </div>
        <div class="summary-card" style="border-color: #006948; background: #f0fdf4;">
          <div class="summary-label" style="color: #006948;">Toplam Ek Hakediş</div>
          <div class="summary-val" style="color: #006948;">₺ ${totalEarnings.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Mesai Türü</th>
            <th>Çarpan</th>
            <th>Zaman Aralığı</th>
            <th>Net Süre</th>
            <th>Yemek/Yol</th>
            <th>Tutar</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(r => `
            <tr>
              <td><strong>${r.dateLabel || r.date}</strong></td>
              <td>${r.title}</td>
              <td><span class="badge ${r.multiplier === 1.5 ? 'badge-15' : 'badge-20'}">${r.multiplier}x</span></td>
              <td>${r.startTime} - ${r.endTime}</td>
              <td>${r.netHours} sa</td>
              <td>${r.mealBonus ? '+₺' + r.mealBonusAmount : '-'}</td>
              <td><strong>₺ ${r.totalEarnings.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong></td>
              <td>${r.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <div>Bu belge çalışan tarafından MesaiTakip sistemi üzerinden oluşturulmuştur.</div>
        <div>Tarih: ${new Date().toLocaleDateString('tr-TR')}</div>
      </div>
    </body>
    </html>
  `;

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1500);
      }, 300);
    }
  } catch (e) {
    console.error('Print iframe failed, opening fallback', e);
  }
}
