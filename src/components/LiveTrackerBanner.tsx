import React, { useEffect, useState } from 'react';
import { UserSettings } from '../types/overtime';
import { formatTL } from '../utils/storage';

interface LiveTrackerBannerProps {
  settings: UserSettings;
  isOpen: boolean;
  onToggle: () => void;
  onFinishAndSave: (elapsedSeconds: number, accruedEarnings: number) => void;
}

export const LiveTrackerBanner: React.FC<LiveTrackerBannerProps> = ({
  settings,
  isOpen,
  onToggle,
  onFinishAndSave,
}) => {
  const [seconds, setSeconds] = useState(2535); // Initial 42m 15s to match mock exactly
  const [isRunning, setIsRunning] = useState(true);

  // Overtime multiplier for live counter defaults to weekday 1.5x or weekend 2.0x based on today's day
  const today = new Date().getDay(); // 0 is Sun, 6 is Sat
  const isWeekend = today === 0 || (settings.workSystemDays === 5 && today === 6);
  const liveMultiplier = isWeekend ? 2.0 : 1.5;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpen && isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isRunning]);

  if (!isOpen) return null;

  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  // Accrued earnings = (seconds / 3600) * hourlyRate * multiplier
  const accruedEarnings = (seconds / 3600) * settings.hourlyRate * liveMultiplier;

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#e0e3e5] border border-[#bccac0]/30 shadow-sm animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#006948] font-extrabold tracking-wider flex items-center gap-1.5 uppercase">
          <span className="w-2 h-2 rounded-full bg-[#006948] animate-ping"></span>
          Canlı Sayaç Çalışıyor ({liveMultiplier}x)
        </span>
        <span className="text-[17px] font-extrabold text-[#191c1e] font-mono tracking-tight">
          {hrs}:{mins}:{secs}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-[#3d4a42]">
        <span>
          Anlık Tahakkuk: <strong className="text-[#006948] font-bold">{formatTL(accruedEarnings)}</strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="text-[11px] font-semibold text-[#565e74] hover:text-[#191c1e]"
          >
            {isRunning ? 'Duraklat' : 'Devam Et'}
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => onFinishAndSave(seconds, accruedEarnings)}
            className="text-[12px] font-bold text-[#ba1a1a] hover:underline cursor-pointer"
          >
            Bitir ve Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
