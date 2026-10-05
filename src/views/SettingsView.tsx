import React, { useState } from 'react';
import { UserSettings } from '../types/overtime';
import { formatTL, saveRegisteredUser, findUserByEmail } from '../utils/storage';
import { AvatarPickerModal } from '../components/AvatarPickerModal';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetData?: () => void;
  onOpenSetupScreen?: () => void;
  onOpenRegisterScreen?: () => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenRegisterScreen,
  onLogout,
}) => {
  const [name, setName] = useState(settings.name);
  const [email, setEmail] = useState(settings.email);
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl);
  const [phone, setPhone] = useState(settings.phone || '');
  const [company, setCompany] = useState(settings.company || '');
  const [title, setTitle] = useState(settings.title || '');
  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate);
  const [workDays, setWorkDays] = useState<5 | 6>(settings.workSystemDays);
  const [targetHours, setTargetHours] = useState(settings.monthlyTargetHours);
  const [mealBonus, setMealBonus] = useState(settings.mealBonusDefault);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSave = () => {
    const updated: UserSettings = {
      ...settings,
      name,
      email,
      avatarUrl,
      phone,
      company,
      title,
      hourlyRate,
      workSystemDays: workDays,
      monthlyTargetHours: targetHours,
      mealBonusDefault: mealBonus,
    };
    onUpdateSettings(updated);

    // Also sync to registered users database
    const existing = findUserByEmail(email);
    saveRegisteredUser({
      id: existing?.id || 'usr-' + Date.now(),
      email: updated.email,
      passwordHash: existing?.passwordHash || 'GuvenliMesai2024!',
      name: updated.name,
      phone: updated.phone,
      company: updated.company,
      title: updated.title,
      workSystemDays: updated.workSystemDays,
      hourlyRate: updated.hourlyRate,
      monthlyTargetHours: updated.monthlyTargetHours,
      mealBonusDefault: updated.mealBonusDefault,
      createdAt: existing?.createdAt || new Date().toISOString(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSelectAvatar = (newUrl: string) => {
    setAvatarUrl(newUrl);
    const updated: UserSettings = {
      ...settings,
      avatarUrl: newUrl,
    };
    onUpdateSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-2 pb-28 gap-4">
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-[18px] font-bold text-[#191c1e]">Ayarlar & Profil</h2>
        {savedSuccess && (
          <span className="text-xs font-bold text-[#006948] bg-emerald-50 px-2.5 py-1 rounded-full animate-in fade-in">
            ✓ Değişiklikler Kaydedildi
          </span>
        )}
      </div>

      {/* Profile Card with Photo Edit Overlay */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex items-center gap-3.5">
        <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
          <img
            src={avatarUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-[#006948]/20 group-hover:ring-[#006948] shadow-xs transition-all"
          />
          <span
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#006948] text-white flex items-center justify-center shadow-md ring-2 ring-white"
            title="Fotoğrafı Değiştir"
          >
            <span className="material-symbols-outlined text-[13px]">photo_camera</span>
          </span>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#191c1e] truncate">{name}</span>
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="text-[11px] text-[#006948] font-bold hover:underline"
            >
              Fotoğraf Değiştir
            </button>
          </div>
          <span className="text-xs text-[#565e74] truncate">{email}</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-extrabold uppercase">
              Pro Kullanıcı
            </span>
            {title && (
              <span className="text-[11px] text-[#3d4a42] font-semibold truncate max-w-[120px]">
                {title}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        currentAvatarUrl={avatarUrl}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelectAvatar={handleSelectAvatar}
      />

      {/* Personal Info Edit */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex flex-col gap-3">
        <span className="text-xs font-bold text-[#191c1e]">Kullanıcı & Şirket Bilgileri</span>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#565e74]">Ad Soyad</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-3 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#565e74]">E-posta Adresi</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[#565e74]">Şirket / Kurum</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Örn: ABC Teknoloji"
              className="w-full h-11 px-3 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]/20"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[#565e74]">Göreviniz / Unvan</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Sistem Mühendisi"
              className="w-full h-11 px-3 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#565e74]">Cep Telefonu</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XXX XX XX"
            className="w-full h-11 px-3 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]/20"
          />
        </div>
      </div>

      {/* Salary & Work Schedule Settings */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex flex-col gap-3.5">
        <span className="text-xs font-bold text-[#191c1e]">Çalışma Düzeni & Ücretler</span>

        {/* Work days toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[#565e74]">Haftalık Çalışma Sistemi</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#f2f4f6] rounded-xl">
            <button
              type="button"
              onClick={() => setWorkDays(5)}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                workDays === 5
                  ? 'bg-white text-[#006948] shadow-xs'
                  : 'text-[#565e74] hover:text-[#191c1e]'
              }`}
            >
              Haftada 5 Gün (Cts-Paz 2x)
            </button>
            <button
              type="button"
              onClick={() => setWorkDays(6)}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                workDays === 6
                  ? 'bg-white text-[#006948] shadow-xs'
                  : 'text-[#565e74] hover:text-[#191c1e]'
              }`}
            >
              Haftada 6 Gün (Pazar 2x)
            </button>
          </div>
        </div>

        {/* Hourly Rate Stepper */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#565e74]">Saatlik Taban Ücret</label>
            <span className="text-xs font-extrabold text-[#006948]">{formatTL(hourlyRate)}/saat</span>
          </div>
          <div className="flex items-center gap-2 bg-[#f2f4f6] p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setHourlyRate((prev) => Math.max(10, prev - 10))}
              className="w-10 h-10 rounded-xl bg-white font-bold text-base hover:bg-gray-50 active:scale-95 shadow-xs cursor-pointer"
            >
              -
            </button>
            <div className="flex items-center justify-center flex-1 bg-white rounded-xl px-2 py-1 shadow-xs border border-gray-100">
              <span className="text-sm font-bold text-[#006948] mr-1">₺</span>
              <input
                type="number"
                step="any"
                min="1"
                value={hourlyRate === 0 ? '' : hourlyRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setHourlyRate(isNaN(val) ? 0 : val);
                }}
                className="w-24 text-[20px] text-center font-extrabold text-[#191c1e] focus:outline-none bg-transparent"
                placeholder="250"
              />
              <span className="text-[11px] text-[#565e74] ml-1">/ saat</span>
            </div>
            <button
              type="button"
              onClick={() => setHourlyRate((prev) => prev + 10)}
              className="w-10 h-10 rounded-xl bg-white font-bold text-base hover:bg-gray-50 active:scale-95 shadow-xs cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Quick chips in settings */}
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            {[-25, -10, 10, 50].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => setHourlyRate((prev) => Math.max(10, prev + delta))}
                className="flex-1 py-1 rounded-lg bg-[#f2f4f6] text-[#3d4a42] text-[11px] font-bold text-center hover:bg-[#e6e8ea] active:scale-95"
              >
                {delta > 0 ? `+₺${delta}` : `-₺${Math.abs(delta)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Target Hours */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#565e74]">Aylık Hedef Mesai Saati</label>
            <span className="text-xs font-bold text-[#191c1e]">{targetHours} Saat</span>
          </div>
          <input
            type="range"
            min={10}
            max={90}
            step={5}
            value={targetHours}
            onChange={(e) => setTargetHours(Number(e.target.value))}
            className="accent-[#006948] w-full"
          />
        </div>

        {/* Meal Bonus Default */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#565e74]">Günlük Yemek Primi</label>
            <span className="text-xs font-bold text-[#006948]">{formatTL(mealBonus)}</span>
          </div>
          <input
            type="number"
            value={mealBonus}
            onChange={(e) => setMealBonus(Number(e.target.value))}
            className="w-full h-10 px-3 bg-[#f2f4f6] rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full h-11 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all mt-1"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Ayarları Kaydet</span>
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {onOpenRegisterScreen && (
          <button
            onClick={onOpenRegisterScreen}
            className="w-full py-3 bg-[#006948] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Yeni Kullanıcı Kaydı Yap (Kayıt Ol)</span>
          </button>
        )}

        {onLogout && (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Hesaptan Çıkış Yap</span>
          </button>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 border border-[#e6e8ea]">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">logout</span>
            </div>

            <div className="text-center flex flex-col gap-1">
              <h3 className="text-sm font-bold text-[#191c1e]">Çıkış Yapılsın mı?</h3>
              <p className="text-xs text-gray-500 leading-snug">
                Mevcut oturumunuz güvenle kapatılacak ve giriş ekranına yönlendirileceksiniz.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout?.();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Version Info */}
      <div className="text-center pt-2 pb-4 text-[#565e74] text-[11px]">
        <span>MesaiTakip Pro v2.4.0 • 4857 Sayılı Kanun Uyumlu</span>
      </div>
    </div>
  );
};
