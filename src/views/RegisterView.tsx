import React, { useState, useMemo, useRef } from 'react';
import { UserSettings } from '../types/overtime';
import { APP_LOGO_URL, saveRegisteredUser, findUserByEmail } from '../utils/storage';
import { AvatarPickerModal } from '../components/AvatarPickerModal';

interface RegisterViewProps {
  settings: UserSettings;
  onRegisterSuccess: (newUser: UserSettings) => void;
  onGoToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  settings,
  onRegisterSuccess,
  onGoToLogin,
}) => {
  // Step 1: Personal & Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Work & Salary Details
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [workDays, setWorkDays] = useState<5 | 6>(5);
  const [calcMode, setCalcMode] = useState<'hourly' | 'monthly'>('hourly');
  const [monthlySalary, setMonthlySalary] = useState<number>(56250);
  const [hourlyRate, setHourlyRate] = useState<number>(250);
  const [mealBonus, setMealBonus] = useState<number>(150);
  const [monthlyTargetHours, setMonthlyTargetHours] = useState<number>(35);

  // Step management (1: Basic Info, 2: Work & Rates)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Agreements
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeKvkk, setAgreeKvkk] = useState(true);

  // Field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for auto-scrolling to errors
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { text: '', color: '', pct: 0 };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { text: 'Zayıf', color: 'bg-red-500', pct: 25 };
    if (score <= 2) return { text: 'Orta', color: 'bg-amber-500', pct: 50 };
    if (score <= 3) return { text: 'İyi', color: 'bg-blue-500', pct: 75 };
    return { text: 'Çok Güçlü', color: 'bg-emerald-500', pct: 100 };
  }, [password]);

  // Hourly rate calculation from monthly salary
  // 4857 Sayılı İş Kanunu: Aylık Net Maaş ÷ 225 saat = Saatlik Taban Ücret
  const calculatedHourlyRate = useMemo(() => {
    if (calcMode === 'monthly') {
      const derived = Math.round((monthlySalary / 225) * 100) / 100;
      return derived > 0 ? derived : 250;
    }
    return hourlyRate;
  }, [calcMode, monthlySalary, hourlyRate]);

  // Validate step 1 fields
  const validateStep1 = () => {
    const errors: typeof fieldErrors = {};

    if (!name.trim()) {
      errors.name = 'Lütfen adınızı ve soyadınızı giriniz.';
    }

    if (!email.trim()) {
      errors.email = 'Lütfen e-posta adresinizi giriniz.';
    } else if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Geçerli bir e-posta adresi giriniz (örn: ad@sirket.com).';
    } else {
      const existing = findUserByEmail(email);
      if (existing) {
        errors.email = 'Bu e-posta adresiyle kayıtlı bir hesap zaten var. Giriş yapabilirsiniz.';
      }
    }

    if (!password) {
      errors.password = 'Lütfen şifre belirleyiniz.';
    } else if (password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalıdır.';
    }

    if (confirmPassword !== password) {
      errors.confirmPassword = 'Girdiğiniz şifreler birbiriyle eşleşmiyor.';
    }

    setFieldErrors(errors);

    // Focus first invalid input
    if (errors.name) {
      nameRef.current?.focus();
    } else if (errors.email) {
      emailRef.current?.focus();
    } else if (errors.password) {
      passwordRef.current?.focus();
    } else if (errors.confirmPassword) {
      confirmPasswordRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleStep1Next = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validateStep1()) {
      setFieldErrors({});
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAdjustRate = (delta: number) => {
    if (calcMode === 'hourly') {
      setHourlyRate((prev) => Math.max(50, prev + delta));
    } else {
      setMonthlySalary((prev) => Math.max(17002, prev + delta * 225));
    }
  };

  const handleCompleteRegistration = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateStep1()) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!agreeTerms || !agreeKvkk) {
      setFieldErrors((prev) => ({
        ...prev,
        general: 'Lütfen kullanıcı sözleşmesi ve KVKK aydınlatma metnini onaylayınız.',
      }));
      return;
    }

    setIsSubmitting(true);

    const finalRate = calcMode === 'monthly' ? calculatedHourlyRate : hourlyRate;

    const newUser: UserSettings = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatarUrl: avatarUrl || settings.avatarUrl,
      phone: phone.trim() || undefined,
      company: company.trim() || 'Özel Sektör',
      title: title.trim() || 'Çalışan',
      workSystemDays: workDays,
      hourlyRate: finalRate,
      monthlyTargetHours: monthlyTargetHours || 35,
      mealBonusDefault: mealBonus,
      isLoggedIn: true,
    };

    saveRegisteredUser({
      id: 'usr-' + Date.now(),
      email: newUser.email,
      passwordHash: password,
      name: newUser.name,
      phone: newUser.phone,
      company: newUser.company,
      title: newUser.title,
      workSystemDays: newUser.workSystemDays,
      hourlyRate: newUser.hourlyRate,
      monthlyTargetHours: newUser.monthlyTargetHours,
      mealBonusDefault: newUser.mealBonusDefault,
      createdAt: new Date().toISOString(),
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onRegisterSuccess(newUser);
    }, 200);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-2 pb-16 antialiased">
      {/* Top Brand Header */}
      <div className="flex flex-col items-center text-center mt-1 mb-4">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#eceef0] shadow-md mb-2 overflow-hidden border border-[#bccac0]/20">
          <img
            alt="MesaiTakip Logo"
            className="w-full h-full object-cover"
            src={APP_LOGO_URL}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[22px] font-extrabold text-[#191c1e]">Yeni Hesap</span>
          <span className="text-[22px] font-extrabold text-[#006948]">Oluştur</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-extrabold uppercase tracking-wider ml-1">
            Pro
          </span>
        </div>
        <p className="text-xs text-[#3d4a42] mt-0.5 font-medium">
          Hak ettiğin fazla mesai ve ek kazançları şeffafça hesapla
        </p>
      </div>

      {/* Top Segmented Mode Switcher: Giriş Yap | Yeni Hesap Oluştur */}
      <div className="grid grid-cols-2 p-1 bg-[#eceef0] rounded-xl mb-4 text-xs font-bold shadow-inner">
        <button
          type="button"
          onClick={onGoToLogin}
          className="py-2.5 rounded-lg text-[#565e74] hover:text-[#191c1e] transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">login</span>
          <span>Giriş Yap</span>
        </button>
        <button
          type="button"
          className="py-2.5 rounded-lg bg-white text-[#006948] shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          <span>Yeni Hesap Aç</span>
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-[#e6e8ea] mb-4">
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
              currentStep === 1 ? 'text-[#006948]' : 'text-gray-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                currentStep === 1
                  ? 'bg-[#006948] text-white'
                  : 'bg-emerald-100 text-[#006948]'
              }`}
            >
              1
            </span>
            <span>Kişisel Bilgiler</span>
          </button>

          <span className="h-0.5 flex-1 mx-3 bg-[#e6e8ea]">
            <span
              className={`block h-full transition-all duration-300 ${
                currentStep === 2 ? 'w-full bg-[#006948]' : 'w-0'
              }`}
            ></span>
          </span>

          <button
            type="button"
            onClick={() => {
              if (validateStep1()) {
                setCurrentStep(2);
              }
            }}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
              currentStep === 2 ? 'text-[#006948]' : 'text-gray-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                currentStep === 2
                  ? 'bg-[#006948] text-white'
                  : 'bg-[#eceef0] text-gray-500'
              }`}
            >
              2
            </span>
            <span>Çalışma & Ücret</span>
          </button>
        </div>
      </div>

      {/* General Error Alert */}
      {fieldErrors.general && (
        <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-base text-red-600 shrink-0">error</span>
          <span>{fieldErrors.general}</span>
        </div>
      )}

      {/* STEP 1: Personal & Security */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100">
              <h2 className="text-[16px] font-bold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006948] text-xl">person</span>
                Kişisel & İletişim Bilgileri
              </h2>
              <span className="text-[11px] font-semibold text-[#565e74] bg-[#eceef0] px-2 py-0.5 rounded-full">
                Adım 1/2
              </span>
            </div>

            {/* Avatar Photo Picker */}
            <div className="flex items-center gap-3 p-2.5 bg-[#f2f4f6] rounded-2xl">
              <div
                className="relative cursor-pointer group shrink-0"
                onClick={() => setIsAvatarModalOpen(true)}
              >
                <img
                  src={avatarUrl}
                  alt="Profil"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#006948]/20 group-hover:ring-[#006948] shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#006948] text-white flex items-center justify-center text-[10px] shadow-sm ring-1 ring-white">
                  <span className="material-symbols-outlined text-[12px]">photo_camera</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#191c1e]">Profil Fotoğrafı</span>
                <span className="text-[11px] text-gray-500">Kendi fotoğrafını yükle veya avatar seç</span>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="text-[11px] text-[#006948] font-bold text-left hover:underline mt-0.5 cursor-pointer"
                >
                  Fotoğraf Seç / Değiştir →
                </button>
              </div>
            </div>

            {/* Ad Soyad */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#3d4a42] flex justify-between">
                <span>Ad Soyad *</span>
                {fieldErrors.name && (
                  <span className="text-red-600 text-[11px] font-bold">{fieldErrors.name}</span>
                )}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#565e74] text-lg pointer-events-none">
                  badge
                </span>
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Örn: Ahmet Yılmaz"
                  className={`w-full h-11 pl-10 pr-3 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 transition-all placeholder:text-[#6d7a72] ${
                    fieldErrors.name ? 'ring-2 ring-red-400 bg-red-50/50' : 'focus:ring-[#006948]/20'
                  }`}
                />
              </div>
            </div>

            {/* E-posta */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#3d4a42] flex justify-between">
                <span>E-posta Adresi *</span>
                {fieldErrors.email && (
                  <span className="text-red-600 text-[11px] font-bold">{fieldErrors.email}</span>
                )}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#565e74] text-lg pointer-events-none">
                  mail
                </span>
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="ahmet.yilmaz@sirket.com"
                  className={`w-full h-11 pl-10 pr-3 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 transition-all placeholder:text-[#6d7a72] ${
                    fieldErrors.email ? 'ring-2 ring-red-400 bg-red-50/50' : 'focus:ring-[#006948]/20'
                  }`}
                />
              </div>
            </div>

            {/* Telefon */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#3d4a42] flex items-center justify-between">
                <span>Cep Telefonu</span>
                <span className="text-[10px] text-gray-400">İsteğe Bağlı</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#565e74] text-lg pointer-events-none">
                  phone
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full h-11 pl-10 pr-3 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006948]/20 transition-all placeholder:text-[#6d7a72]"
                />
              </div>
            </div>
          </div>

          {/* Security & Password Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex flex-col gap-3.5">
            <h2 className="text-[16px] font-bold text-[#191c1e] flex items-center gap-2 pb-1 border-b border-gray-100">
              <span className="material-symbols-outlined text-[#006948] text-xl">lock</span>
              Giriş Şifresi
            </h2>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#3d4a42] flex justify-between">
                <span>Şifre Belirleyin *</span>
                {fieldErrors.password && (
                  <span className="text-red-600 text-[11px] font-bold">{fieldErrors.password}</span>
                )}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#565e74] text-lg pointer-events-none">
                  lock_outline
                </span>
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="En az 6 karakter"
                  className={`w-full h-11 pl-10 pr-10 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                    fieldErrors.password ? 'ring-2 ring-red-400 bg-red-50/50' : 'focus:ring-[#006948]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#565e74] hover:text-[#191c1e] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Strength Meter */}
              {password && (
                <div className="mt-1 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500">Şifre Gücü:</span>
                    <span className="font-bold">{passwordStrength.text}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.pct}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#3d4a42] flex justify-between">
                <span>Şifre Tekrarı *</span>
                {fieldErrors.confirmPassword && (
                  <span className="text-red-600 text-[11px] font-bold">
                    {fieldErrors.confirmPassword}
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#565e74] text-lg pointer-events-none">
                  enhanced_encryption
                </span>
                <input
                  ref={confirmPasswordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword)
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="Şifrenizi tekrar yazınız"
                  className={`w-full h-11 pl-10 pr-3 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                    fieldErrors.confirmPassword
                      ? 'ring-2 ring-red-400 bg-red-50/50'
                      : 'focus:ring-[#006948]/20'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons for Step 1 */}
          <div className="flex flex-col gap-2 pt-1">
            {/* Primary Submit Button: Can directly create account or advance to step 2 */}
            <button
              type="button"
              onClick={handleStep1Next}
              className="w-full h-12 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#006948]/20 active:scale-98 transition-all cursor-pointer"
            >
              <span>Devam Et: Çalışma & Ücret Düzeni</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>

            {/* Direct Quick Create Button with default 5-day / 250 TL rate */}
            <button
              type="button"
              onClick={handleCompleteRegistration}
              disabled={isSubmitting}
              className="w-full h-11 bg-white text-[#006948] border border-[#006948]/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-50 active:scale-98 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Standart Ayarlarla Hemen Hesabı Oluştur</span>
            </button>

            <button
              type="button"
              onClick={onGoToLogin}
              className="w-full py-2.5 text-[#565e74] hover:text-[#006948] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>Zaten bir hesabın var mı?</span>
              <strong className="text-[#006948] underline">Giriş Yap</strong>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Work & Calculation Preferences */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-4">
          {/* Company & Role Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100">
              <h2 className="text-[16px] font-bold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006948] text-xl">business</span>
                Şirket & Unvan
              </h2>
              <span className="text-[11px] font-semibold text-[#006948] bg-emerald-50 px-2 py-0.5 rounded-full">
                Adım 2/2
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#3d4a42]">Şirket / Kurum</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Örn: ABC Teknoloji"
                  className="w-full h-11 px-3 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]/20"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#3d4a42]">Göreviniz / Unvan</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Saha Mühendisi"
                  className="w-full h-11 px-3 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]/20"
                />
              </div>
            </div>
          </div>

          {/* Work Schedule (5 vs 6 days) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#191c1e]">Haftalık Çalışma Sistemi</label>
              <span className="text-[10px] text-[#006948] font-bold">4857 İş Kanunu</span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-[#f2f4f6] rounded-xl">
              <button
                type="button"
                onClick={() => setWorkDays(5)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                  workDays === 5
                    ? 'bg-white text-[#191c1e] shadow-sm font-bold'
                    : 'text-[#565e74] hover:bg-[#eceef0]'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <span
                    className={`material-symbols-outlined text-base ${
                      workDays === 5 ? 'text-[#006948]' : 'text-gray-400'
                    }`}
                  >
                    {workDays === 5 ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span>Haftada 5 Gün</span>
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#006948]/10 text-[#006948]">
                  Cts-Paz 2x Mesai
                </span>
              </button>

              <button
                type="button"
                onClick={() => setWorkDays(6)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                  workDays === 6
                    ? 'bg-white text-[#191c1e] shadow-sm font-bold'
                    : 'text-[#565e74] hover:bg-[#eceef0]'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <span
                    className={`material-symbols-outlined text-base ${
                      workDays === 6 ? 'text-[#006948]' : 'text-gray-400'
                    }`}
                  >
                    {workDays === 6 ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span>Haftada 6 Gün</span>
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e0e3e5] text-[#3d4a42]">
                  Pazar 2x Mesai
                </span>
              </button>
            </div>
          </div>

          {/* Wage / Rate Assistant Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6e8ea] flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006948] to-[#85f8c4]"></div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#191c1e]">Taban Ücret Belirleme</label>
                <p className="text-[11px] text-[#565e74]">Fazla mesai saatlik çarpanı için</p>
              </div>

              {/* Mode switch */}
              <div className="flex bg-[#f2f4f6] p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setCalcMode('hourly')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    calcMode === 'hourly' ? 'bg-white text-[#006948] shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Saatlik
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('monthly')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    calcMode === 'monthly' ? 'bg-white text-[#006948] shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Maaştan Bul
                </button>
              </div>
            </div>

            {calcMode === 'monthly' ? (
              /* Monthly to hourly wizard */
              <div className="flex flex-col gap-2 bg-[#f2f4f6] p-3 rounded-xl border border-gray-100">
                <span className="text-[11px] text-[#3d4a42] font-semibold">
                  Aylık Net Maaşınızı Giriniz:
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 font-bold text-[#006948] text-xs">₺</span>
                    <input
                      type="number"
                      value={monthlySalary}
                      onChange={(e) => setMonthlySalary(Number(e.target.value))}
                      className="w-full h-10 pl-7 pr-3 bg-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#006948]/20"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">÷ 225 sa</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-xs">
                  <span className="text-[#005236] font-medium">Hesaplanan Saatlik Taban:</span>
                  <span className="font-extrabold text-[#006948] text-sm">
                    ₺ {calculatedHourlyRate.toFixed(2)} / saat
                  </span>
                </div>
              </div>
            ) : (
              /* Direct hourly rate stepper & manual input */
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 bg-[#f2f4f6] p-2 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => handleAdjustRate(-10)}
                    className="w-10 h-10 rounded-xl bg-white text-[#191c1e] flex items-center justify-center shadow-xs active:scale-95 transition-transform shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">remove</span>
                  </button>

                  <div className="flex items-center justify-center flex-1 bg-white rounded-xl px-2 py-1 shadow-xs border border-gray-100">
                    <span className="text-base text-[#006948] font-bold mr-1">₺</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={hourlyRate === 0 ? '' : hourlyRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setHourlyRate(isNaN(val) ? 0 : val);
                      }}
                      className="w-24 text-[24px] text-center font-extrabold text-[#191c1e] focus:outline-none bg-transparent"
                      placeholder="250"
                    />
                    <span className="text-xs text-[#565e74] ml-1">/ saat</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdjustRate(10)}
                    className="w-10 h-10 rounded-xl bg-white text-[#191c1e] flex items-center justify-center shadow-xs active:scale-95 transition-transform shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1.5">
                  {[-25, -10, 10, 50].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => handleAdjustRate(delta)}
                      className="flex-1 py-1.5 rounded-lg bg-[#eceef0] text-[#3d4a42] text-[11px] font-bold text-center hover:bg-[#e6e8ea] active:scale-95 cursor-pointer"
                    >
                      {delta > 0 ? `+₺${delta}` : `-₺${Math.abs(delta)}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extra preferences (Meal bonus & Monthly target) */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#565e74]">
                  Günlük Yemek/Yol Primi
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-[#006948]">₺</span>
                  <input
                    type="number"
                    value={mealBonus}
                    onChange={(e) => setMealBonus(Number(e.target.value))}
                    className="w-full h-9 pl-6 pr-2 bg-[#f2f4f6] rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#565e74]">
                  Aylık Hedef Mesai Saati
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={monthlyTargetHours}
                    onChange={(e) => setMonthlyTargetHours(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#f2f4f6] rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2 text-[11px] text-gray-500 font-semibold">
                    Saat
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal & Terms Checkboxes */}
          <div className="flex flex-col gap-2 p-3 bg-white rounded-2xl border border-[#e6e8ea] text-xs text-[#3d4a42]">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-[#006948] focus:ring-[#006948] accent-[#006948]"
              />
              <span className="leading-snug">
                <strong className="text-[#006948]">Kullanıcı Sözleşmesi</strong> ve{' '}
                <strong className="text-[#006948]">KVKK Aydınlatma Metni</strong>'ni okudum ve kabul
                ediyorum.
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeKvkk}
                onChange={(e) => setAgreeKvkk(e.target.checked)}
                className="mt-0.5 rounded text-[#006948] focus:ring-[#006948] accent-[#006948]"
              />
              <span className="leading-snug">
                Mesai kayıtlarımın cihazımda yerel olarak güvenle saklanmasını onaylıyorum.
              </span>
            </label>
          </div>

          {/* Action Buttons for Step 2 */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-24 h-12 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 active:scale-95 cursor-pointer"
              >
                ← Geri
              </button>

              <button
                type="button"
                onClick={handleCompleteRegistration}
                disabled={isSubmitting}
                className="flex-1 h-12 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#006948]/20 active:scale-98 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">how_to_reg</span>
                <span>{isSubmitting ? 'Hesap Oluşturuluyor...' : 'Yeni Hesabı Oluştur ve Başla'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onGoToLogin}
              className="w-full py-2 text-[#565e74] hover:text-[#006948] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>Zaten bir hesabın var mı?</span>
              <strong className="text-[#006948] underline">Giriş Yap</strong>
            </button>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        currentAvatarUrl={avatarUrl}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelectAvatar={(url) => setAvatarUrl(url)}
      />

      {/* Trust & Privacy Note */}
      <div className="flex items-center justify-center gap-1.5 pt-4 text-[#565e74]">
        <span
          className="material-symbols-outlined text-sm text-[#006948]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          shield
        </span>
        <span className="text-xs">Verileriniz cihazınızda gizlilikle korunur</span>
      </div>
    </div>
  );
};
