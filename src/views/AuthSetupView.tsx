import React, { useState } from 'react';
import { UserSettings } from '../types/overtime';
import { APP_LOGO_URL, findUserByEmail, DEFAULT_DEMO_USER } from '../utils/storage';

interface AuthSetupViewProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onEnterApp: () => void;
  onGoToRegister?: () => void;
}

export const AuthSetupView: React.FC<AuthSetupViewProps> = ({
  settings,
  onSaveSettings,
  onEnterApp,
  onGoToRegister,
}) => {
  const [email, setEmail] = useState(settings.email);
  const [password, setPassword] = useState('GuvenliMesai2024!');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isNotRegistered, setIsNotRegistered] = useState(false);

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    setAuthError('');
    setIsNotRegistered(false);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    setIsNotRegistered(false);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setAuthError('Lütfen e-posta adresinizi giriniz.');
      return;
    }

    if (!password) {
      setAuthError('Lütfen şifrenizi giriniz.');
      return;
    }

    // Lookup user in local storage
    const existing = findUserByEmail(trimmedEmail);

    // Reject random unregistered emails!
    if (!existing) {
      setIsNotRegistered(true);
      setAuthError('Bu e-posta adresiyle kayıtlı bir hesap bulunamadı. Lütfen önce yeni hesap oluşturun.');
      return;
    }

    // Check password
    if (existing.passwordHash && existing.passwordHash !== password) {
      setAuthError('Girdiğiniz şifre hatalı. Lütfen kontrol ediniz.');
      return;
    }

    // Successful login: load this registered user's profile and settings
    const updated: UserSettings = {
      ...settings,
      name: existing.name || settings.name,
      email: existing.email,
      phone: existing.phone,
      company: existing.company,
      title: existing.title,
      workSystemDays: existing.workSystemDays,
      hourlyRate: existing.hourlyRate,
      monthlyTargetHours: existing.monthlyTargetHours,
      mealBonusDefault: existing.mealBonusDefault,
      isLoggedIn: true,
    };

    onSaveSettings(updated);
    onEnterApp();
  };

  const handleDemoLogin = () => {
    setEmail(DEFAULT_DEMO_USER.email);
    setPassword(DEFAULT_DEMO_USER.passwordHash);
    setAuthError('');
    setIsNotRegistered(false);

    const demo: UserSettings = {
      ...settings,
      name: DEFAULT_DEMO_USER.name,
      email: DEFAULT_DEMO_USER.email,
      phone: DEFAULT_DEMO_USER.phone,
      company: DEFAULT_DEMO_USER.company,
      title: DEFAULT_DEMO_USER.title,
      workSystemDays: DEFAULT_DEMO_USER.workSystemDays,
      hourlyRate: DEFAULT_DEMO_USER.hourlyRate,
      monthlyTargetHours: DEFAULT_DEMO_USER.monthlyTargetHours,
      mealBonusDefault: DEFAULT_DEMO_USER.mealBonusDefault,
      isLoggedIn: true,
    };

    onSaveSettings(demo);
    onEnterApp();
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-2 pb-16 antialiased">
      {/* Top Brand Anchor */}
      <div className="flex flex-col items-center text-center mt-1 mb-4">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#eceef0] shadow-md mb-2 overflow-hidden border border-[#bccac0]/20">
          <img
            alt="MesaiTakip Logo"
            className="w-full h-full object-cover"
            src={APP_LOGO_URL}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[22px] font-extrabold text-[#191c1e]">Mesai</span>
          <span className="text-[22px] font-extrabold text-[#006948]">Takip</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-extrabold uppercase tracking-wider ml-1">
            Pro
          </span>
        </div>
        <p className="text-xs text-[#3d4a42] mt-0.5 font-medium">Mesai ve Ek Kazanç Hesaplayıcı</p>
      </div>

      {/* Top Segmented Mode Switcher: Giriş Yap | Yeni Hesap Oluştur */}
      <div className="grid grid-cols-2 p-1 bg-[#eceef0] rounded-xl mb-4 text-xs font-bold shadow-inner">
        <button
          type="button"
          className="py-2.5 rounded-lg bg-white text-[#006948] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-default"
        >
          <span className="material-symbols-outlined text-base">login</span>
          <span>Giriş Yap</span>
        </button>
        {onGoToRegister && (
          <button
            type="button"
            onClick={() => {
              onGoToRegister();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="py-2.5 rounded-lg text-[#565e74] hover:text-[#191c1e] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>Yeni Hesap Aç</span>
          </button>
        )}
      </div>

      {/* Form Container */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {/* Login Credentials Card (ONLY email & password) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948] text-xl">lock</span>
              Kullanıcı Girişi
            </h2>
            <span className="text-[11px] font-semibold text-[#565e74] bg-[#eceef0] px-2.5 py-0.5 rounded-full">
              Güvenli Oturum
            </span>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-1.5 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-red-600 shrink-0">error</span>
                <span className="font-semibold">{authError}</span>
              </div>
              {isNotRegistered && onGoToRegister && (
                <button
                  type="button"
                  onClick={() => {
                    onGoToRegister();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-[#006948] font-bold underline text-left mt-0.5 cursor-pointer"
                >
                  Buraya tıklayarak yeni hesap oluşturabilirsiniz →
                </button>
              )}
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#3d4a42]">
              E-posta Adresi
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#565e74] text-xl pointer-events-none">
                mail
              </span>
              <input
                className="w-full h-12 pl-10 pr-4 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006948]/20 transition-all placeholder:text-[#6d7a72]"
                placeholder="ornek@sirket.com"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#3d4a42]">Şifre</label>
              <span className="text-[11px] text-[#565e74]">Demo: GuvenliMesai2024!</span>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#565e74] text-xl pointer-events-none">
                lock
              </span>
              <input
                className="w-full h-12 pl-10 pr-12 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006948]/20 transition-all"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                aria-label="Şifreyi Göster"
                className="absolute right-3 w-8 h-8 flex items-center justify-center text-[#565e74] hover:text-[#191c1e] rounded-full transition-colors cursor-pointer"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            className="w-full h-12 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#006948]/20 active:scale-98 transition-all cursor-pointer"
          >
            <span>Giriş Yap ve Başla</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>

          {onGoToRegister && (
            <button
              type="button"
              onClick={() => {
                onGoToRegister();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full h-11 bg-white text-[#006948] border-2 border-[#006948]/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-50 active:scale-98 transition-all cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Hesabın yok mu? Yeni Hesap Oluştur</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-xl bg-[#dae2fd] text-[#131b2e] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#bec6e0] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">science</span>
            <span>Demo Hesap ile Hızlı Giriş (Ahmet Yılmaz)</span>
          </button>
        </div>

        {/* Trust & Privacy Note */}
        <div className="flex items-center justify-center gap-1.5 pt-2 text-[#565e74]">
          <span
            className="material-symbols-outlined text-sm text-[#006948]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shield
          </span>
          <span className="text-xs">Verileriniz ve hesap bilgileriniz cihazınızda güvenle saklanır</span>
        </div>
      </form>
    </div>
  );
};
