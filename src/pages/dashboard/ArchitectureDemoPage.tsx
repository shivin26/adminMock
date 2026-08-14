import React, { useState } from 'react';
import { z } from 'zod';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/data-table/DataTable';
import { ColumnDef, TableAction } from '../../types/table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Form } from '../../components/form/Form';
import { FormInput } from '../../components/form/FormInput';
import { FormSelect } from '../../components/form/FormSelect';
import { toast } from '../../components/feedback/ToastSystem';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
}

const mockUsers: UserRecord[] = [
  { id: 'usr_1', name: 'Alex Johnson', email: 'alex@digilocal.com', role: 'super_admin', status: 'active', lastActive: '2 mins ago' },
  { id: 'usr_2', name: 'Sarah Connor', email: 'sarah@digilocal.com', role: 'admin', status: 'active', lastActive: '1 hour ago' },
  { id: 'usr_3', name: 'Michael Scott', email: 'michael@digilocal.com', role: 'manager', status: 'inactive', lastActive: '3 days ago' },
  { id: 'usr_4', name: 'Dwight Schrute', email: 'dwight@digilocal.com', role: 'user', status: 'pending', lastActive: 'Never' },
];

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['super_admin', 'admin', 'manager', 'user']),
});

type UserFormValues = z.infer<typeof userSchema>;

export const ArchitectureDemoPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>(mockUsers);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const columns: ColumnDef<UserRecord>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      accessor: (row) => (
        <Badge variant={row.role === 'super_admin' ? 'gold' : 'secondary'} className="capitalize">
          {row.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => (
        <Badge
          variant={row.status === 'active' ? 'forest' : row.status === 'pending' ? 'warning' : 'destructive'}
          className="capitalize"
        >
          {row.status}
        </Badge>
      ),
    },
    { key: 'lastActive', header: 'Last Active', sortable: true },
  ];

  const actions: TableAction<UserRecord>[] = [
    {
      label: 'Edit',
      icon: <Edit2 className="h-3.5 w-3.5" />,
      onClick: (row) => toast.info('Edit Record', `Editing record for ${row.name}`),
    },
    {
      label: 'Delete',
      variant: 'destructive',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: (row) => {
        setUsers((prev) => prev.filter((u) => u.id !== row.id));
        toast.success('Record Deleted', `Removed ${row.name} from the system.`);
      },
    },
  ];

  const handleCreateUser = (values: UserFormValues) => {
    const newUser: UserRecord = {
      id: `usr_${Date.now()}`,
      name: values.name,
      email: values.email,
      role: values.role,
      status: 'active',
      lastActive: 'Just now',
    };
    setUsers((prev) => [newUser, ...prev]);
    setIsModalOpen(false);
    toast.success('User Created', `Successfully added ${values.name}`);
  };

  const toggleLoadingState = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <span className="font-mono-meta text-xs text-[var(--gold)] font-semibold">
            COMPONENT ARCHITECTURE SHOWCASE
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Reusable System Components
          </h1>
          <p className="text-sm font-body text-[var(--muted-foreground)] mt-1">
            Interactive demonstration of generic DataTable, Modal, Form, and Toast primitives with brand styling.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={toggleLoadingState}>
            Simulate Loading
          </Button>
          <Button variant="ink" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
            Add User Modal
          </Button>
        </div>
      </div>

      {/* Toast Notification Triggers Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Global Toast Notification System</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="default" onClick={() => toast.success('Action Completed', 'Data saved successfully.')}>
            Success Toast
          </Button>
          <Button variant="ink" onClick={() => toast.info('System Notice', 'Maintenance scheduled for 02:00 UTC.')}>
            Ink Info Toast
          </Button>
          <Button variant="destructive" onClick={() => toast.error('API Request Failed', '500 Internal Server Error.')}>
            Error Toast
          </Button>
          <Button variant="outline" onClick={() => toast.warning('Storage Warning', '90% quota exceeded.')}>
            Warning Toast
          </Button>
        </CardContent>
      </Card>

      {/* Generic Reusable Data Table */}
      <Card className="p-6">
        <h3 className="font-serif text-2xl font-semibold text-[var(--foreground)] mb-4">
          Generic Type-Safe DataTable Primitive
        </h3>
        <DataTable
          columns={columns}
          data={users}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          actions={actions}
          pagination={{
            page: 1,
            limit: 10,
            totalItems: users.length,
            totalPages: 1,
            onPageChange: () => {},
          }}
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
        description="Create a new user entry using the reusable Form primitive."
      >
        <Form schema={userSchema} onSubmit={handleCreateUser} options={{ defaultValues: { role: 'user' } }}>
          {({ formState }) => (
            <div className="space-y-4">
              <FormInput name="name" label="Full Name" placeholder="Jane Doe" required />
              <FormInput name="email" label="Email Address" placeholder="jane@digilocal.com" type="email" required />
              <FormSelect
                name="role"
                label="Role"
                options={[
                  { label: 'Super Admin', value: 'super_admin' },
                  { label: 'Admin', value: 'admin' },
                  { label: 'Manager', value: 'manager' },
                  { label: 'User', value: 'user' },
                ]}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" isLoading={formState.isSubmitting}>
                  Save User
                </Button>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};
