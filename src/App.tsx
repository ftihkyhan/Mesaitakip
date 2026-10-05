import React, { useState, useEffect } from 'react';
import { ActiveTab, OvertimeRecord, UserSettings } from './types/overtime';
import {
  loadSettings,
  saveSettings,
  loadRecordsForUser,
  saveRecordsForUser,
  resetToDemoAccount,
} from './utils/storage';
import { getCurrentMonthString } from './utils/calendar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { CalendarView } from './views/CalendarView';
import { AddOvertimeView } from './views/AddOvertimeView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { AuthSetupView } from './views/AuthSetupView';
import { RegisterView } from './views/RegisterView';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [records, setRecords] = useState<OvertimeRecord[]>(() => loadRecordsForUser(settings.email));
  const [activeTab, setActiveTab] = useState<ActiveTab>('ana-sayfa');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonthString());

  // Pre-fill values for adding overtime (e.g. from calendar or live stopwatch)
  const [addInitialValues, setAddInitialValues] = useState<Partial<OvertimeRecord> | undefined>(
    undefined
  );

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    subtitle: string;
  }>({
    show: false,
    title: '',
    subtitle: '',
  });

  const triggerToast = (title: string, subtitle: string) => {
    setToast({ show: true, title, subtitle });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2800);
  };

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Sync to localStorage
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    // Reload user-specific records if email changed
    if (newSettings.email !== settings.email) {
      const userRecords = loadRecordsForUser(newSettings.email);
      setRecords(userRecords);
    }
  };

  // Newly registered user starts with 0 overtime records (clean slate)
  const handleRegisterSuccess = (newUser: UserSettings) => {
    setSettings(newUser);
    saveSettings(newUser);
    // Fresh new user has NO previous overtime records
    setRecords([]);
    saveRecordsForUser(newUser.email, []);
    triggerToast(`Hoş Geldiniz, ${newUser.name.split(' ')[0]}!`, 'Yeni hesabınız sıfır kayıtla başarıyla oluşturuldu.');
    setActiveTab('ana-sayfa');
  };

  const handleLogout = () => {
    const updated: UserSettings = {
      ...settings,
      isLoggedIn: false,
    };
    setSettings(updated);
    saveSettings(updated);
    triggerToast('Oturum Kapatıldı', 'Güvenli bir şekilde çıkış yapıldı.');
    setActiveTab('giris');
  };

  const handleSaveRecord = (newRecord: OvertimeRecord) => {
    const updated = [newRecord, ...records];
    setRecords(updated);
    saveRecordsForUser(settings.email, updated);
    triggerToast('Mesai Başarıyla Eklendi!', 'Bordro onay havuzuna gönderildi.');
    setActiveTab('ana-sayfa');
    setAddInitialValues(undefined);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveRecordsForUser(settings.email, updated);
    triggerToast('Mesai Kaydı Silindi', 'Kayıt listeden kaldırıldı.');
  };

  const handleResetData = () => {
    const { settings: defSettings, records: defRecords } = resetToDemoAccount();
    setSettings(defSettings);
    setRecords(defRecords);
    setSelectedMonth(getCurrentMonthString());
    triggerToast('Örnek Demo Veriler Yüklendi', 'Demo hesaba ait örnek mesailer geri yüklendi.');
  };

  // Handle finish from Live Stopwatch
  const handleLiveSave = (elapsedSeconds: number, accruedEarnings: number) => {
    const hours = Math.max(0.5, Number((elapsedSeconds / 3600).toFixed(1)));
    const now = new Date();
    const endHour = String(now.getHours()).padStart(2, '0');
    const endMin = String(now.getMinutes()).padStart(2, '0');

    // approximate start time
    const startMs = now.getTime() - elapsedSeconds * 1000;
    const startDate = new Date(startMs);
    const startHour = String(startDate.getHours()).padStart(2, '0');
    const startMin = String(startDate.getMinutes()).padStart(2, '0');

    const yearStr = startDate.getFullYear();
    const monthStr = String(startDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(startDate.getDate()).padStart(2, '0');

    setAddInitialValues({
      date: `${yearStr}-${monthStr}-${dayStr}`,
      startTime: `${startHour}:${startMin}`,
      endTime: `${endHour}:${endMin}`,
      breakMinutes: 0,
      note: 'Canlı sayaç ile kaydedildi',
      grossHours: hours,
      netHours: hours,
    });
    setActiveTab('mesai-ekle');
  };

  const handleSelectDateForAdd = (dateStr: string) => {
    setAddInitialValues({
      date: dateStr,
    });
    setActiveTab('mesai-ekle');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col font-sans select-none sm:select-auto">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 inset-x-4 max-w-sm mx-auto bg-[#2d3133] text-white p-3.5 rounded-2xl shadow-2xl z-50 transition-all duration-300 flex items-center gap-3 border border-white/10 animate-in slide-in-from-top-6">
          <span className="material-symbols-outlined text-[#85f8c4] text-[26px]">task_alt</span>
          <div>
            <p className="text-xs font-bold leading-tight">{toast.title}</p>
            <p className="text-[11px] text-[#bccac0] mt-0.5">{toast.subtitle}</p>
          </div>
        </div>
      )}

      {/* Main App Container */}
      {activeTab === 'kayit' ? (
        <main className="flex-1 flex flex-col relative w-full pt-4">
          <div className="max-w-md mx-auto w-full px-4 mb-1 flex justify-between items-center">
            {settings.isLoggedIn ? (
              <button
                onClick={() => setActiveTab('ana-sayfa')}
                className="text-xs font-bold text-[#006948] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Uygulamaya Dön
              </button>
            ) : (
              <span className="text-xs font-semibold text-gray-500">Yeni Üyelik</span>
            )}
            <button
              onClick={() => setActiveTab('giris')}
              className="text-xs font-bold text-[#565e74] hover:text-[#006948] cursor-pointer"
            >
              Giriş Yap →
            </button>
          </div>
          <RegisterView
            settings={settings}
            onRegisterSuccess={handleRegisterSuccess}
            onGoToLogin={() => setActiveTab('giris')}
          />
        </main>
      ) : !settings.isLoggedIn || activeTab === 'giris' ? (
        <main className="flex-1 flex flex-col relative w-full pt-4">
          <div className="max-w-md mx-auto w-full px-4 mb-2 flex justify-between items-center">
            {settings.isLoggedIn ? (
              <button
                onClick={() => setActiveTab('ana-sayfa')}
                className="text-xs font-bold text-[#006948] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Uygulamaya Dön
              </button>
            ) : (
              <span className="text-xs font-semibold text-gray-500">Güvenli Giriş</span>
            )}
            <button
              onClick={() => setActiveTab('kayit')}
              className="text-xs font-bold text-[#565e74] hover:text-[#006948] cursor-pointer"
            >
              Kayıt Ol →
            </button>
          </div>
          <AuthSetupView
            settings={settings}
            onSaveSettings={handleUpdateSettings}
            onEnterApp={() => setActiveTab('ana-sayfa')}
            onGoToRegister={() => setActiveTab('kayit')}
          />
        </main>
      ) : (
        <>
          {/* Top Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            settings={settings}
            showBack={activeTab === 'mesai-ekle'}
            onBack={() => setActiveTab('ana-sayfa')}
            onLogout={handleLogout}
          />

          {/* Body Content */}
          <main className="flex-1 flex flex-col relative w-full pt-16">
            {activeTab === 'ana-sayfa' && (
              <HomeView
                records={records}
                settings={settings}
                setActiveTab={setActiveTab}
                onLiveSave={handleLiveSave}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                onDeleteRecord={handleDeleteRecord}
              />
            )}

            {activeTab === 'takvim' && (
              <CalendarView
                records={records}
                settings={settings}
                setActiveTab={setActiveTab}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                onSelectDateForAdd={handleSelectDateForAdd}
                onDeleteRecord={handleDeleteRecord}
              />
            )}

            {activeTab === 'mesai-ekle' && (
              <AddOvertimeView
                settings={settings}
                onSaveRecord={handleSaveRecord}
                onCancel={() => {
                  setAddInitialValues(undefined);
                  setActiveTab('ana-sayfa');
                }}
                initialValues={addInitialValues}
              />
            )}

            {activeTab === 'raporlar' && (
              <ReportsView
                records={records}
                settings={settings}
                selectedMonth={selectedMonth}
              />
            )}

            {activeTab === 'ayarlar' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onOpenRegisterScreen={() => setActiveTab('kayit')}
                onLogout={handleLogout}
              />
            )}
          </main>

          {/* Bottom Navigation Bar */}
          {activeTab !== 'mesai-ekle' && (
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </>
      )}
    </div>
  );
}
