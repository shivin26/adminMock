import React, { useState, useMemo } from 'react';
import './SupportTagManagementModal.css';
import { Drawer } from '../common/Drawer/Drawer';
import { Input } from '../common/Input/Input';
import { Button } from '../common/Button/Button';
import {
  Tag,
  Search,
  Plus,
  Edit2,
  Trash2,
  GitMerge,
  BarChart2,
  Palette,
  Check,
} from 'lucide-react';

export interface SupportTag {
  id: string;
  name: string;
  color: string;
  description: string;
  usageCount: number;
  isSystem: boolean;
}

const PRESET_SYSTEM_TAGS: SupportTag[] = [
  { id: '1', name: 'Payment', color: '#EF4444', description: 'UPI & Gateway settlements', usageCount: 142, isSystem: true },
  { id: '2', name: 'Refund', color: '#F59E0B', description: 'Vendor refund disputes', usageCount: 88, isSystem: true },
  { id: '3', name: 'Subscription', color: '#3B82F6', description: 'Plan renewals & upgrades', usageCount: 115, isSystem: true },
  { id: '4', name: 'Vendor', color: '#10B981', description: 'Seller onboarding inquiries', usageCount: 94, isSystem: true },
  { id: '5', name: 'Society', color: '#8B5CF6', description: 'Residential society admin', usageCount: 76, isSystem: true },
  { id: '6', name: 'Login', color: '#6366F1', description: 'Authentication issues', usageCount: 52, isSystem: true },
  { id: '7', name: 'OTP', color: '#EC4899', description: 'SMS OTP dispatch failures', usageCount: 38, isSystem: true },
  { id: '8', name: 'Orders', color: '#14B8A6', description: 'Order fulfillment status', usageCount: 164, isSystem: true },
  { id: '9', name: 'Delivery', color: '#84CC16', description: 'Gate delivery partner access', usageCount: 120, isSystem: true },
  { id: '10', name: 'Inventory', color: '#EAB308', description: 'Stock sync issues', usageCount: 45, isSystem: true },
  { id: '11', name: 'Billing', color: '#C8A878', description: 'Tax invoices & GST', usageCount: 98, isSystem: true },
  { id: '12', name: 'Technical', color: '#211A19', description: 'System API & server errors', usageCount: 210, isSystem: true },
  { id: '13', name: 'UI', color: '#64748B', description: 'Frontend layout glitches', usageCount: 32, isSystem: true },
  { id: '14', name: 'Backend', color: '#0284C7', description: 'Database & webhook issues', usageCount: 64, isSystem: true },
  { id: '15', name: 'Critical', color: '#DC2626', description: 'Severe platform outages', usageCount: 18, isSystem: true },
  { id: '16', name: 'Urgent', color: '#B91C1C', description: 'SLA alert escalation', usageCount: 42, isSystem: true },
  { id: '17', name: 'Spam', color: '#475569', description: 'Abusive or bot inquiries', usageCount: 12, isSystem: true },
  { id: '18', name: 'Duplicate', color: '#94A3B8', description: 'Merged duplicate ticket', usageCount: 26, isSystem: true },
  { id: '19', name: 'Feature Request', color: '#059669', description: 'New feature suggestions', usageCount: 54, isSystem: true },
  { id: '20', name: 'Bug', color: '#D97706', description: 'Reported software defect', usageCount: 82, isSystem: true },
  { id: '21', name: 'Enhancement', color: '#2563EB', description: 'Performance optimization', usageCount: 39, isSystem: true },
];

const PRESET_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#C8A878', '#211A19', '#0284C7', '#059669',
];

export interface SupportTagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportTagManagementModal: React.FC<SupportTagManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tags, setTags] = useState<SupportTag[]>(PRESET_SYSTEM_TAGS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create / Edit Form state
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagDescription, setTagDescription] = useState('');
  const [tagColor, setTagColor] = useState('#C8A878');

  // Merge Tags state
  const [isMerging, setIsMerging] = useState(false);
  const [sourceTagId, setSourceTagId] = useState('');
  const [targetTagId, setTargetTagId] = useState('');

  const filteredTags = useMemo(() => {
    if (!searchTerm.trim()) return tags;
    const q = searchTerm.toLowerCase();
    return tags.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [tags, searchTerm]);

  const handleSaveTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    if (isEditing) {
      setTags(
        tags.map((t) =>
          t.id === isEditing
            ? { ...t, name: tagName.trim(), description: tagDescription.trim(), color: tagColor }
            : t
        )
      );
      setIsEditing(null);
    } else {
      const newTag: SupportTag = {
        id: `tag-${Date.now()}`,
        name: tagName.trim(),
        color: tagColor,
        description: tagDescription.trim() || 'Custom administrator tag',
        usageCount: 0,
        isSystem: false,
      };
      setTags([newTag, ...tags]);
    }

    setTagName('');
    setTagDescription('');
    setTagColor('#C8A878');
  };

  const handleStartEdit = (t: SupportTag) => {
    setIsEditing(t.id);
    setTagName(t.name);
    setTagDescription(t.description);
    setTagColor(t.color);
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  const handleExecuteMerge = () => {
    if (!sourceTagId || !targetTagId || sourceTagId === targetTagId) return;
    const source = tags.find((t) => t.id === sourceTagId);
    const target = tags.find((t) => t.id === targetTagId);
    if (!source || !target) return;

    // Transfer usage count to target & delete source
    setTags(
      tags
        .map((t) => (t.id === targetTagId ? { ...t, usageCount: t.usageCount + source.usageCount } : t))
        .filter((t) => t.id !== sourceTagId)
    );

    setIsMerging(false);
    setSourceTagId('');
    setTargetTagId('');
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Enterprise Tag Management & Taxonomy"
      subtitle="Manage system tags, custom labels, color coding, merge duplicates, and tag analytics."
      size="xl"
    >
      <div className="flex flex-col gap-5 max-h-[74vh] overflow-y-auto pr-1">
        {/* Top Controls: Search Bar & Merge Toggle */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
            <input
              type="text"
              placeholder="Search tags by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs text-[#211A19] outline-none focus:border-[#C8A878]"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<GitMerge size={14} />}
            onClick={() => setIsMerging(!isMerging)}
          >
            {isMerging ? 'Close Merge Tool' : 'Merge Tags'}
          </Button>
        </div>

        {/* Merge Tool Collapsible Box */}
        {isMerging && (
          <div className="p-4 bg-[#FEF3C7] border border-[#F59E0B]/50 rounded-2xl flex flex-col gap-3">
            <span className="text-xs font-bold text-[#D97706] flex items-center gap-1.5">
              <GitMerge size={14} /> Merge Duplicate Tags
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#211A19]">Source Tag (To Delete):</label>
                <select
                  value={sourceTagId}
                  onChange={(e) => setSourceTagId(e.target.value)}
                  className="p-2 bg-white border border-[#E7DFD5] rounded-xl outline-none"
                >
                  <option value="">Select source tag...</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.name} ({t.usageCount} uses)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#211A19]">Target Tag (To Keep):</label>
                <select
                  value={targetTagId}
                  onChange={(e) => setTargetTagId(e.target.value)}
                  className="p-2 bg-white border border-[#E7DFD5] rounded-xl outline-none"
                >
                  <option value="">Select target tag...</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.name} ({t.usageCount} uses)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleExecuteMerge}
                disabled={!sourceTagId || !targetTagId || sourceTagId === targetTagId}
              >
                Confirm Merge
              </Button>
            </div>
          </div>
        )}

        {/* Create / Edit Tag Form */}
        <form onSubmit={handleSaveTag} className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-3">
          <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider">
            {isEditing ? 'Edit Existing Tag' : 'Create New System Tag'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tag Name"
              placeholder="e.g. UPI-Failed, Security-Check..."
              leftIcon={<Tag size={14} />}
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              required
            />

            <Input
              label="Description"
              placeholder="Short usage instructions..."
              value={tagDescription}
              onChange={(e) => setTagDescription(e.target.value)}
            />
          </div>

          {/* Color Picker Palette */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#211A19] flex items-center gap-1.5">
              <Palette size={13} className="text-[#C8A878]" /> Color Coding Accent
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="w-7 h-7 rounded-full flex items-center justify-center border transition-all"
                  style={{ backgroundColor: c, borderColor: tagColor === c ? '#211A19' : 'transparent' }}
                  onClick={() => setTagColor(c)}
                >
                  {tagColor === c && <Check size={14} className="text-white" />}
                </button>
              ))}
              <input
                type="color"
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
                className="w-8 h-8 rounded-full border border-[#E7DFD5] cursor-pointer"
                title="Custom Color"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7DFD5]">
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditing(null);
                  setTagName('');
                  setTagDescription('');
                }}
              >
                Cancel Edit
              </Button>
            )}
            <Button type="submit" size="sm" leftIcon={<Plus size={14} />}>
              {isEditing ? 'Save Tag Changes' : 'Create Tag'}
            </Button>
          </div>
        </form>

        {/* Tag Analytics Grid */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 size={13} className="text-[#C8A878]" /> Active Taxonomy ({filteredTags.length} Tags)
          </span>

          <div className="tag-management-grid">
            {filteredTags.map((t) => (
              <div key={t.id} className="tag-card-item">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="color-picker-dot" style={{ backgroundColor: t.color }} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[#211A19] text-xs truncate flex items-center gap-1.5">
                      #{t.name}
                      {t.isSystem && (
                        <span className="text-[9px] bg-[#EEE5DA] text-[#211A19] px-1 rounded font-semibold uppercase">
                          SYSTEM
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-[#78716C] truncate">{t.description}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#C8A878] bg-[#FAF8F5] border border-[#E7DFD5] px-2 py-0.5 rounded-lg whitespace-nowrap">
                    {t.usageCount} uses
                  </span>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(t)}
                    className="p-1 text-[#78716C] hover:text-[#211A19]"
                    title="Edit Tag"
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTag(t.id)}
                    className="p-1 text-[#78716C] hover:text-rose-600"
                    title="Delete Tag"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
