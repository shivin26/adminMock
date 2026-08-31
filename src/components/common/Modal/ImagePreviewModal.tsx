import React from 'react';
import { Modal } from './Modal';
import { Button } from '../Button/Button';
import { ExternalLink, Download, Image as ImageIcon } from 'lucide-react';

export interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  subtitle?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Vendor Profile & Logo Preview',
  subtitle,
}) => {
  if (!imageUrl) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle || 'Click and open high-resolution uploaded profile picture'}
      size="lg"
    >
      <div className="flex flex-col items-center gap-4 font-sans">
        {/* Full Image Container */}
        <div className="relative w-full max-h-[70vh] flex items-center justify-center bg-[#18281F] rounded-2xl overflow-hidden p-3 border border-[#E4DCC9] shadow-inner group">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl transition-all duration-300 group-hover:scale-105"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between w-full pt-3 border-t border-[#E4DCC9] text-xs">
          <div className="flex items-center gap-2 text-[#6B7C70] font-mono">
            <ImageIcon size={15} className="text-[#C4A066]" />
            <span>Uploaded Vendor Profile Photo</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#18281F] bg-[#EFE8D8] hover:bg-[#E4DCC9] border border-[#E4DCC9] rounded-xl transition-all shadow-xs"
            >
              <ExternalLink size={14} className="text-[#C4A066]" /> Open in New Tab
            </a>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
