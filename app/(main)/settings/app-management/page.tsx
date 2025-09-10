'use client';

import { useRouter, usePathname } from 'next/navigation';
import GenericCrudTable from '@/components/GenericCrudTable';
import GenericListLayout from '@/components/GenericListLayout';
import { listApps, deleteApp } from '@/lib/appApi';
import { getModuleAccess } from '@/lib/auth';
import SearchFilters from '@/components/SearchFilters';
import { useState } from 'react';

export default function AppManagementPage() {
  const router = useRouter();
  const pathname = usePathname() || '';

  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({
    name: '',
    description: '',
  });

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
  const goToAdd = () => router.push('/settings/app-management/add');
  const goToEdit = (id: number) =>
    router.push(`/settings/app-management/edit/${id}`);
  const goToDetail = (id: number) =>
    router.push(`/settings/app-management/detail/${id}`);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 250 },
    { title: 'Key', dataIndex: 'key', key: 200 },
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

  const api = { list: listApps, remove: deleteApp };

  return (
    <GenericListLayout
      title="App Management"
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
          permissions={(getModuleAccess({ path: pathname }) || {}) as any}
          onView={(id: number) => goToDetail(id)}
          onEdit={(row: any) => goToEdit(row.pk_apps_id)}
          rowKey={'pk_apps_id'}
          pageSize={15}
          refreshKey={searchFilters}
        />
      }
      onAdd={getModuleAccess({ path: pathname })?.is_add ? goToAdd : undefined}
      addLabel="Create App"
    />
  );
}
