import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Input } from '../common/Input/Input';
import { Button } from '../common/Button/Button';
import { useCreatePerson } from '../../hooks/usePeople';
import { useToast } from '../../context/ToastContext';
import type { PersonType } from '../../types/people.types';
import { User, Mail, Phone, Home, Store, UserPlus } from 'lucide-react';

export interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const createPersonMutation = useCreatePerson();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [personType, setPersonType] = useState<PersonType>('user');
  const [societyName, setSocietyName] = useState('Anupam Society');
  const [flatNumber, setFlatNumber] = useState('');
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Daily Grocery & Produce');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    createPersonMutation.mutate(
      {
        name,
        email,
        phone,
        personType,
        societyName,
        flatNumber: flatNumber.trim() || undefined,
        storeName: (personType === 'vendor' || personType === 'user_vendor') ? storeName.trim() || undefined : undefined,
        category: (personType === 'vendor' || personType === 'user_vendor') ? category : undefined,
      },
      {
        onSuccess: (newPerson) => {
          addToast({
            type: 'success',
            title: 'Person Profile Registered',
            description: `Successfully created ${newPerson.name} (${newPerson.personType.toUpperCase()}) profile in platform directory.`,
          });
          setName('');
          setEmail('');
          setPhone('');
          setFlatNumber('');
          setStoreName('');
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Directory Profile"
      subtitle="Manually create a resident user, vendor store owner, or staff profile."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          placeholder="e.g. Rahul Sharma"
          leftIcon={<User size={14} />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="rahul@example.com"
            leftIcon={<Mail size={14} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            leftIcon={<Phone size={14} />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 text-xs font-bold text-[#18281F]">
            <label className="uppercase tracking-wider">Account Role / Type</label>
            <select
              value={personType}
              onChange={(e) => setPersonType(e.target.value as PersonType)}
              className="w-full p-2.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs font-medium text-[#18281F] outline-none cursor-pointer"
            >
              <option value="user">User (Customer / Resident)</option>
              <option value="vendor">Vendor Store Owner</option>
              <option value="user_vendor">User &amp; Vendor (Dual Role)</option>
              <option value="sub_admin">Sub-Admin Staff</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-bold text-[#18281F]">
            <label className="uppercase tracking-wider">Associated Society</label>
            <select
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs font-medium text-[#18281F] outline-none cursor-pointer"
            >
              <option value="Anupam Society">Anupam Society</option>
              <option value="Greenwood Heights Society">Greenwood Heights Society</option>
              <option value="Sunrise Apartments">Sunrise Apartments</option>
            </select>
          </div>
        </div>

        {(personType === 'user' || personType === 'user_vendor') && (
          <Input
            label="Flat / Residence Address"
            placeholder="e.g. A-104"
            leftIcon={<Home size={14} />}
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
          />
        )}

        {(personType === 'vendor' || personType === 'user_vendor') && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Store Entity Name"
              placeholder="e.g. FreshBites Organics"
              leftIcon={<Store size={14} />}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5 text-xs font-bold text-[#18281F]">
              <label className="uppercase tracking-wider">Store Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs font-medium text-[#18281F] outline-none cursor-pointer"
              >
                <option value="Daily Grocery & Produce">Daily Grocery &amp; Produce</option>
                <option value="Organic Fruits & Snacks">Organic Fruits &amp; Snacks</option>
                <option value="Dairy & Milk Products">Dairy &amp; Milk Products</option>
                <option value="Home & Laundry Care">Home &amp; Laundry Care</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4DCC9]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createPersonMutation.isPending}
            leftIcon={<UserPlus size={14} />}
          >
            Register Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};
