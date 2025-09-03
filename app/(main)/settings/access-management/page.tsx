'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button, message, Select, Row, Col } from 'antd';
import GenericCrudTable from '@/components/GenericCrudTable';
import GenericListLayout from '@/components/GenericListLayout';
import { listAccess, deleteAccess } from '@/lib/accessApi';
import { AccessItem } from '@/types/access';
import { listRoles } from '@/lib/roleApi';
import { getModuleAccess } from '@/lib/auth';
import useSWR, { preload } from 'swr';
import { listMenus } from '@/lib/menuApi';
import { useEffect } from 'react';

export default function AccessManagementPage() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: roles } = useSWR(['listRoles'], listRoles);

  useEffect(() => {
    preload(['listMenus'], listMenus);
  }, []);

  // navigation handlers: use route pages instead of modal
  const goToAdd = () => router.push('/settings/access-management/add');
  const goToEdit = (id: number) =>
    router.push(`/settings/access-management/edit/${id}`);
  const goToDetail = (id: number) =>
    router.push(`/settings/access-management/detail/${id}`);

  const columns = [
    {
      title: 'Module',
      dataIndex: ['module', 'name'],
      key: 'module',
      width: 250,
      render: (_: any, r: any) => r.module?.name ?? '-',
    },
    {
      title: 'Role',
      dataIndex: 'fk_role_id',
      key: 'fk_role_id',
      width: 200,
      render: (v: any) =>
        Array.isArray(roles)
          ? (roles.find((x: any) => x.pk_role_id === v)?.name ?? v)
          : v,
    },
    {
      title: 'View',
      dataIndex: 'is_view',
      key: 'is_view',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Add',
      dataIndex: 'is_add',
      key: 'is_add',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Detail',
      dataIndex: 'is_detail',
      key: 'is_detail',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Update',
      dataIndex: 'is_update',
      key: 'is_update',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Delete',
      dataIndex: 'is_delete',
      key: 'is_delete',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Approval',
      dataIndex: 'is_approval',
      key: 'is_approval',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Activation',
      dataIndex: 'is_activation',
      key: 'is_activation',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
  ];

  const api = { list: listAccess, remove: deleteAccess };

  return (
    <GenericListLayout
      title="Access Management"
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
          onEdit={(row: AccessItem) => goToEdit(row.pk_modulerole_id)}
          rowKey={'pk_modulerole_id'}
          pageSize={20}
        />
      }
      onAdd={getModuleAccess({ path: pathname })?.is_add ? goToAdd : undefined}
      addLabel="Create Access"
    />
  );
}
