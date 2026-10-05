import React, { useRef, useState } from 'react';
import { AVATAR_PRESETS, processImageUpload } from '../utils/avatar';

interface AvatarPickerModalProps {
  isOpen: boolean;
  currentAvatarUrl: string;
  onClose: () => void;
  onSelectAvatar: (url: string) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  currentAvatarUrl,
  onClose,
  onSelectAvatar,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsProcessing(true);
    try {
      const base64Url = await processImageUpload(file, 256);
      onSelectAvatar(base64Url);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Fotoğraf yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 border border-[#e6e8ea]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] text-xl">account_circle</span>
            <h3 className="text-sm font-bold text-[#191c1e]">Profil Fotoğrafı Seç / Yükle</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Current Avatar Big Preview */}
        <div className="flex flex-col items-center gap-2 py-1">
          <div className="relative">
            <img
              src={currentAvatarUrl}
              alt="Mevcut Fotoğraf"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-[#006948]/20 shadow-sm"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#006948] text-white flex items-center justify-center shadow-md hover:bg-[#00855d] transition-all cursor-pointer"
              title="Cihazdan Fotoğraf Seç"
            >
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </button>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Aktif Profil Resmi</span>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-2 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Upload Custom Photo Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">upload</span>
            <span>{isProcessing ? 'İşleniyor...' : 'Cihazımdan Fotoğraf Yükle'}</span>
          </button>
        </div>

        {/* Preset Avatars Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#191c1e]">Veya Hazır Avatarlardan Seç:</span>
          <div className="grid grid-cols-3 gap-2.5">
            {AVATAR_PRESETS.map((preset) => {
              const isSelected = currentAvatarUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectAvatar(preset.url);
                    onClose();
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#006948] bg-emerald-50/50 ring-2 ring-[#006948]/20'
                      : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-12 h-12 rounded-full object-cover shadow-xs"
                    />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#006948] text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-700 font-medium text-center truncate w-full">
                    {preset.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};
