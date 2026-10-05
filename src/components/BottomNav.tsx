import React from 'react';
import { ActiveTab } from '../types/overtime';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#f7f9fb]/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.04)] border-t border-[#e6e8ea]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-3 relative">
        {/* 1. Ana Sayfa */}
        <button
          onClick={() => setActiveTab('ana-sayfa')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all ${
            activeTab === 'ana-sayfa'
              ? 'text-[#006948] font-bold scale-105'
              : 'text-[#565e74] hover:text-[#006948]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'ana-sayfa' ? "'FILL' 1" : "'FILL' 0" }}
          >
            dashboard
          </span>
          <span className="text-[11px] leading-tight font-medium">Ana Sayfa</span>
        </button>

        {/* 2. Takvim */}
        <button
          onClick={() => setActiveTab('takvim')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all ${
            activeTab === 'takvim'
              ? 'text-[#006948] font-bold scale-105'
              : 'text-[#565e74] hover:text-[#006948]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'takvim' ? "'FILL' 1" : "'FILL' 0" }}
          >
            calendar_month
          </span>
          <span className="text-[11px] leading-tight font-medium">Takvim</span>
        </button>

        {/* 3. Floating Action Center (+) Mesai Ekle */}
        <div className="relative flex items-center justify-center -top-4">
          <button
            aria-label="Mesai Ekle"
            onClick={() => setActiveTab('mesai-ekle')}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_12px_24px_-4px_rgba(0,105,72,0.35)] active:scale-95 transition-all duration-200 ${
              activeTab === 'mesai-ekle'
                ? 'bg-[#002114] text-[#85f8c4] ring-4 ring-[#85f8c4]/30'
                : 'bg-[#006948] hover:bg-[#00855d] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[30px] leading-none">add</span>
          </button>
        </div>

        {/* 4. Raporlar */}
        <button
          onClick={() => setActiveTab('raporlar')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all ${
            activeTab === 'raporlar'
              ? 'text-[#006948] font-bold scale-105'
              : 'text-[#565e74] hover:text-[#006948]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'raporlar' ? "'FILL' 1" : "'FILL' 0" }}
          >
            analytics
          </span>
          <span className="text-[11px] leading-tight font-medium">Raporlar</span>
        </button>

        {/* 5. Ayarlar */}
        <button
          onClick={() => setActiveTab('ayarlar')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all ${
            activeTab === 'ayarlar'
              ? 'text-[#006948] font-bold scale-105'
              : 'text-[#565e74] hover:text-[#006948]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'ayarlar' ? "'FILL' 1" : "'FILL' 0" }}
          >
            manage_accounts
          </span>
          <span className="text-[11px] leading-tight font-medium">Ayarlar</span>
        </button>
      </div>
    </nav>
  );
};
