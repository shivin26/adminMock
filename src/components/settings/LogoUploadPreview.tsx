import React from 'react';
import { Upload } from 'lucide-react';

export interface LogoUploadPreviewProps {
  logoUrl: string;
  platformName: string;
  onUrlChange: (newUrl: string) => void;
}

export const LogoUploadPreview: React.FC<LogoUploadPreviewProps> = ({
  logoUrl,
  platformName,
  onUrlChange,
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUrlChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 bg-[#FAF9F6] border border-[#E4DCC9] rounded-2xl flex flex-col gap-4">
      <div className="flex items-center gap-3 pb-3 border-b border-[#E4DCC9]">
        <div className="w-9 h-9 rounded-xl bg-[#18281F] text-[#E6C35C] flex items-center justify-center shrink-0">
          <Upload size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#18281F]">Brand Visual Assets Preview</h4>
          <p className="text-xs text-[#6B7C70]">
            Preview active brand logo rendering on top header bar.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-3.5 bg-[#18281F] rounded-xl border border-[#243A2D]">
        <div className="w-11 h-11 rounded-xl bg-white text-[#18281F] flex items-center justify-center overflow-hidden shrink-0 border border-[#C4A066] p-1">
          <img
            src={logoUrl || '/logo.png'}
            alt="Platform Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-[#E6C35C] font-bold uppercase tracking-wider">Header Brand Live View</span>
          <span className="text-sm font-bold text-white font-serif">{platformName || 'DigiLocal'}</span>
        </div>

        <label className="ml-auto cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FAF9F6] hover:bg-[#EFE8D8] text-[#18281F] rounded-lg border border-[#E4DCC9] transition-all shadow-sm">
            <Upload size={14} /> Upload Logo File
          </span>
        </label>
      </div>
    </div>
  );
};
