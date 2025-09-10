'use client';

import { useRouter, usePathname } from 'next/navigation';
import GenericCrudTable from '@/components/GenericCrudTable';
import GenericListLayout from '@/components/GenericListLayout';
import { listUsers, deleteUser } from '@/lib/userApi';
import { User } from '@/types/user';
import { getModuleAccess } from '@/lib/auth';
import { useState } from 'react';
import SearchFilters from '@/components/SearchFilters';

export default function UserManagementPage() {
  const router = useRouter();
  const pathname = usePathname() || '';

  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({
    username: '',
    email: '',
    full_name: '',
  });

  const handleSearch = (filters: Record<string, string>) => {
    setSearchFilters(filters);
  };

  const handleClear = () => {
    setSearchFilters({
      username: '',
      email: '',
      full_name: '',
    });
  };

  // navigation handlers
  const goToAdd = () => router.push('/settings/user-management/add');
  const goToEdit = (id: number) =>
    router.push(`/settings/user-management/edit/${id}`);
  const goToDetail = (id: number) =>
    router.push(`/settings/user-management/detail/${id}`);

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (v: any) => (v == null ? '-' : v),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (v: any) => (v == null ? '-' : v),
    },
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 200,
      render: (v: any) => (v == null ? '-' : v),
    },
    {
      title: 'Role',
      dataIndex: 'roles',
      key: 'roles',
      width: 200,
      render: (roles: any[]) => {
        if (!roles || roles.length === 0) return '-';
        return roles.map((role) => role.name).join(', ');
      },
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (v: any) => (v == null ? '-' : v ? 'Yes' : 'No'),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: any) => (v == null ? '-' : new Date(v).toLocaleDateString()),
    },
  ];

  const api = { list: listUsers, remove: deleteUser };

  const permissions = getModuleAccess({ path: pathname }) || {
    is_view: true,
    is_add: true,
    is_update: true,
    is_delete: true,
    is_detail: true,
    is_activation: false,
    is_approval: false,
  };

  const filterComponent = (
    <SearchFilters
      fields={[
        { key: 'username', placeholder: 'Search by Username' },
        { key: 'email', placeholder: 'Search by Email' },
        { key: 'full_name', placeholder: 'Search by Name' },
      ]}
      onSearch={handleSearch}
      onClear={handleClear}
    />
  );

  return (
    <GenericListLayout
      title="User Management"
      left={filterComponent}
      right={
        <GenericCrudTable
          columns={columns}
          api={api}
          permissions={permissions as any}
          onView={(id: number) => goToDetail(id)}
          onEdit={(row: User) => goToEdit(row.pk_user_id)}
          rowKey={'pk_user_id'}
          pageSize={10}
          refreshKey={searchFilters} // Pass searchFilters as refreshKey to trigger API call only on search or clear
        />
      }
      onAdd={permissions?.is_add ? goToAdd : undefined}
      addLabel="Create User"
    />
  );
}
