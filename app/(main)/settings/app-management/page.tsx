'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button, message, Select, Row, Col } from 'antd';
import GenericCrudTable from '@/components/GenericCrudTable';
import GenericListLayout from '@/components/GenericListLayout';
import { listApps, deleteApp } from '@/lib/appApi';
import { getModuleAccess } from '@/lib/auth';

export default function AppManagementPage() {
  const router = useRouter();
  const pathname = usePathname();

  // navigation handlers: use route pages instead of modal
  const goToAdd = () => router.push('/settings/app-management/add');
  const goToEdit = (id: number) =>
    router.push(`/settings/app-management/edit/${id}`);
  const goToDetail = (id: number) =>
    router.push(`/settings/app-management/detail/${id}`);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 250 },
    { title: 'Key', dataIndex: 'key', key: 'key', width: 200 },
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
        <div>
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <label style={{ fontWeight: 600 }}>Status</label>
              <Select placeholder="Select status" style={{ width: '100%' }} />
            </Col>

            <Col span={24}>
              <label style={{ fontWeight: 600 }}>Other Component</label>
              <Select placeholder="Select" style={{ width: '100%' }} />
            </Col>

            <Col
              span={24}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                marginTop: 8,
              }}
            >
              <Button type="primary">Search</Button>
              <Button
                onClick={() => {
                  // basic export placeholder: re-use current list fetch and trigger download later
                  // implement server-side export or CSV generation as needed
                  message.info('Export triggered');
                }}
              >
                Export
              </Button>
            </Col>
          </Row>
        </div>
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
        />
      }
      onAdd={getModuleAccess({ path: pathname })?.is_add ? goToAdd : undefined}
      addLabel="Create App"
    />
  );
}
