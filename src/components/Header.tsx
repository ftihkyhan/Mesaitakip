import React, { useState } from 'react';
import { ActiveTab, UserSettings } from '../types/overtime';
import { APP_LOGO_URL } from '../utils/storage';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: UserSettings;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onLogout?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

const NOTIFICATION_STORAGE_KEY = 'mesaitakip_notifications_v2';

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Pazar mesaisi onaylandı',
    subtitle: 'Hafta sonu mesaisi bordroya eklendi (+₺3.500)',
    time: 'Bugün',
    type: 'success',
  },
  {
    id: 'notif-2',
    title: '29 Ekim mesaisi incelemede',
    subtitle: 'İK onayından sonra netleşecektir.',
    time: 'Dün',
    type: 'warning',
  },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  title,
  showBack = false,
  onBack,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Manage notifications state & persistence
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
      return DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const handleClearAllNotifications = () => {
    setNotifications([]);
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear notifications', e);
    }
  };

  const handleDismissNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update notifications', e);
    }
  };

  const handleRestoreNotifications = () => {
    setNotifications(DEFAULT_NOTIFICATIONS);
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    } catch (e) {
      console.error('Failed to restore notifications', e);
    }
  };

  const getPageTitle = () => {
    if (title) return title;
    switch (activeTab) {
      case 'ana-sayfa':
        return 'Ana Sayfa';
      case 'takvim':
        return 'Takvim Ve Rapor';
      case 'mesai-ekle':
        return 'Mesai Ekle';
      case 'raporlar':
        return 'Raporlar & Analiz';
      case 'ayarlar':
        return 'Ayarlar & Profil';
      case 'giris':
        return 'Hesap Kurulumu';
      case 'kayit':
        return 'Kullanıcı Kaydı';
      default:
        return 'Ana Sayfa';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#f7f9fb]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              aria-label="Geri Dön"
              onClick={onBack || (() => setActiveTab('ana-sayfa'))}
              className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full text-[#191c1e] hover:bg-[#eceef0] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : null}

          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setActiveTab('ana-sayfa')}
          >
            <img
              alt="MesaiTakip Logo"
              className="h-8 w-auto object-contain drop-shadow-sm"
              src={APP_LOGO_URL}
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#006948] leading-none">
                MesaiTakip
              </span>
              <span className="text-[17px] font-bold text-[#191c1e] leading-tight truncate max-w-[170px]">
                {getPageTitle()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 relative">
          {/* Notifications Button */}
          <button
            aria-label="Bildirimler"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#3d4a42] hover:text-[#006948] hover:bg-[#eceef0] transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-[23px]">notifications</span>
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#006948] ring-2 ring-white"></span>
            )}
          </button>

          {/* Profile Avatar */}
          <div
            className="pl-1 cursor-pointer relative"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            title="Profil ve Hesap Menüsü"
          >
            <img
              alt={settings.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#006948]/20 hover:ring-[#006948] transition-all"
              src={settings.avatarUrl}
            />
          </div>

          {/* Profile Menu Popover */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
                <img
                  src={settings.avatarUrl}
                  alt={settings.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#006948]/20"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#191c1e] truncate">{settings.name}</span>
                  <span className="text-[11px] text-gray-500 truncate">{settings.email}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setActiveTab('ayarlar');
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#006948]">
                    manage_accounts
                  </span>
                  <span>Profil & Ayarlar</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setActiveTab('kayit');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#006948]">
                    person_add
                  </span>
                  <span>Yeni Hesap Oluştur</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-red-600">logout</span>
                    <span>Çıkış Yap</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Notification Popover */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2">
              {/* Header with Title and Clear Action */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#191c1e]">Bildirimler</span>
                  {notifications.length > 0 && (
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-[#006948] px-1.5 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllNotifications}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      title="Tüm bildirimleri temizle"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                      <span>Bildirimleri Temizle</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                    title="Kapat"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>

              {/* Notification List or Empty State */}
              {notifications.length === 0 ? (
                <div className="py-6 px-3 flex flex-col items-center justify-center text-center gap-2 text-[#565e74]">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-2xl">notifications_off</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Bildiriminiz Bulunmuyor</span>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      Tüm bildirimler başarıyla temizlendi.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-1 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2.5 rounded-xl text-xs flex items-start justify-between gap-2 border transition-all ${
                        notif.type === 'success'
                          ? 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
                          : notif.type === 'warning'
                          ? 'bg-amber-50/70 border-amber-100 text-amber-950'
                          : 'bg-gray-50 border-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[17px] mt-0.5 shrink-0 ${
                            notif.type === 'success'
                              ? 'text-[#006948]'
                              : notif.type === 'warning'
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {notif.type === 'success'
                            ? 'check_circle'
                            : notif.type === 'warning'
                            ? 'schedule'
                            : 'info'}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 justify-between">
                            <span className="font-bold text-xs truncate">{notif.title}</span>
                            <span className="text-[10px] text-gray-500 shrink-0 font-medium">
                              {notif.time}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-600 leading-snug mt-0.5">
                            {notif.subtitle}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDismissNotification(notif.id)}
                        className="text-gray-400 hover:text-red-600 w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 shrink-0 cursor-pointer"
                        title="Bu bildirimi sil"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
