'use client';

import { useRouter, usePathname } from 'next/navigation';
import GenericCrudTable, {
  RolePermissions,
} from '@/components/GenericCrudTable';
import GenericListLayout from '@/components/GenericListLayout';
import { listRoles, deleteRole } from '@/lib/roleApi';
import { RoleItem } from '@/types/role';
import { getModuleAccess } from '@/lib/auth';
import { preload } from 'swr';
import { listApps } from '@/lib/appApi';
import { useEffect } from 'react';
import SearchFilters from '@/components/SearchFilters';
import { useState } from 'react';

export default function RoleManagementPage() {
  const router = useRouter();
  const pathname = usePathname() || '';

  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({
    name: '',
    description: '',
  });

  useEffect(() => {
    preload(['listApps'], listApps);
  }, []);

  const handleSearch = (filters: Record<string, string>) => {
    setSearchFilters(filters);
  };

  const handleClear = () => {
    setSearchFilters({
      name: '',
      description: '',
    });
  };

  // navigation handlers: use route pages instead of modal
  const goToAdd = () => router.push('/settings/role-management/add');
  const goToEdit = (id: number) =>
    router.push(`/settings/role-management/edit/${id}`);
  const goToDetail = (id: number) =>
    router.push(`/settings/role-management/detail/${id}`);

  const columns = [
    {
      title: 'App',
      dataIndex: ['app', 'name'],
      key: 'app',
      width: 200,
      render: (_: any, r: any) => r.app?.name ?? r.fk_apps_id ?? '-',
    },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 250 },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
  ];

  const api = { list: listRoles, remove: deleteRole };

  return (
    <>
      <GenericListLayout
        title="Role Management"
        left={
          <SearchFilters
            fields={[
              { key: 'name', placeholder: 'Search by Name' },
              { key: 'description', placeholder: 'Search by Description' },
            ]}
            onSearch={handleSearch}
            onClear={handleClear}
          />
        }
        right={
          <GenericCrudTable
            columns={columns}
            api={api}
            permissions={
              (getModuleAccess({ path: pathname }) || {}) as RolePermissions
            }
            onView={(id: number) => goToDetail(id)}
            onEdit={(row: RoleItem) => goToEdit(row.pk_role_id)}
            rowKey={'pk_role_id'}
            pageSize={15}
            refreshKey={searchFilters}
          />
        }
        onAdd={
          getModuleAccess({ path: pathname })?.is_add ? goToAdd : undefined
        }
        addLabel="Create Role"
      />
    </>
  );
}
