'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button, message, Select, Row, Col } from 'antd';
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

export default function RoleManagementPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    preload(['listApps'], listApps);
  }, []);

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
            permissions={
              (getModuleAccess({ path: pathname }) || {}) as RolePermissions
            }
            onView={(id: number) => goToDetail(id)}
            onEdit={(row: RoleItem) => goToEdit(row.pk_role_id)}
            rowKey={'pk_role_id'}
            pageSize={15}
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
