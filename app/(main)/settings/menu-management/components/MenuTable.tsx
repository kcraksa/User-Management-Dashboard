'use client';

import React from 'react';
import { Table, Button, Space, Modal } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { MenuItem } from '@/types/menu';

type Props = {
  data: MenuItem[];
  loading?: boolean;
  permissions: {
    is_view?: boolean;
    is_add?: boolean;
    is_detail?: boolean;
    is_update?: boolean;
    is_delete?: boolean;
  };
  onView: Function;
  onEdit: Function;
  onDelete: Function;
};

export default function MenuTable({
  data,
  loading,
  permissions,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const columns: ColumnsType<MenuItem> = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 250 },
    { title: 'URL View', dataIndex: 'url_view', key: 'url_view', width: 200 },
    {
      title: 'Parent',
      dataIndex: 'parent_id',
      key: 'parent_id',
      width: 150,
      render: (v) => v ?? '-',
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (v) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_: any, r) => (
        <Space>
          {permissions.is_detail && (
            <Button size="small" onClick={() => onView(r.pk_module_id)}>
              View
            </Button>
          )}
          {permissions.is_update && (
            <Button size="small" onClick={() => onEdit(r)}>
              Edit
            </Button>
          )}
          {permissions.is_delete && (
            <Button
              size="small"
              danger
              onClick={() =>
                Modal.confirm({
                  title: 'Confirm delete',
                  onOk: () => onDelete(r.pk_module_id),
                })
              }
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey={(r) => r.pk_module_id}
      loading={loading}
    />
  );
}
