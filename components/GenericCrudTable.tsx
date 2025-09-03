'use client';

import React, { useEffect, useState } from 'react';
import { Table, Space, Button, Modal, message, Input } from 'antd';
import { ColumnsType } from 'antd/es/table';
import useSWR, { mutate } from 'swr';

export type RolePermissions = {
  is_view?: boolean;
  is_add?: boolean;
  is_detail?: boolean;
  is_update?: boolean;
  is_delete?: boolean;
  is_approval?: boolean;
  is_activation?: boolean;
};

type CrudApi = {
  list: Function;
  remove?: Function;
};

type Props<T> = {
  columns: ColumnsType<T>;
  api: CrudApi;
  permissions?: RolePermissions;
  onView?: Function;
  onEdit?: Function;
  rowKey?: string | Function;
  pageSize?: number;
  refreshKey?: any;
};

export default function GenericCrudTable<T extends { [key: string]: any }>({
  columns,
  api,
  permissions = {},
  onView,
  onEdit,
  rowKey = 'id',
  pageSize = 15,
  refreshKey,
}: Props<T>) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1); // reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [q]);

  const {
    data: res,
    error,
    isLoading,
  } = useSWR(
    ['list', api.list.name, page, pageSize, debouncedQ, refreshKey],
    () => api.list({ page, per_page: pageSize, q: debouncedQ }),
  );

  const list = res?.data ?? res;
  const data =
    list?.data && Array.isArray(list.data)
      ? list.data
      : Array.isArray(list)
        ? list
        : list
          ? [list]
          : [];
  const total = list?.total ?? (list?.per_page ? list.total : data.length);

  useEffect(() => {
    if (error) {
      message.error(error?.response?.data?.message || 'Failed to load data');
    }
  }, [error]);

  const handleDelete = async (id: number) => {
    if (!api.remove) return;
    try {
      await api.remove(id);
      message.success('Deleted');
      mutate(['list', api.list.name, page, pageSize, debouncedQ, refreshKey]);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  // helper to find the id value for a row based on rowKey prop
  const getRowId = (r: any) => {
    try {
      if (typeof rowKey === 'function') return rowKey(r);
      if (typeof rowKey === 'string') return r[rowKey] ?? r.id;
      return r.id;
    } catch {
      return r.id;
    }
  };

  const actionColumn = {
    title: 'Actions',
    key: 'actions',
    width: 220,
    fixed: 'right' as const,
    render: (_: any, r: any) => (
      <Space>
        {permissions?.is_detail && onView && (
          <Button size="small" onClick={() => onView(Number(getRowId(r)))}>
            View
          </Button>
        )}
        {permissions?.is_update && onEdit && (
          <Button size="small" onClick={() => onEdit(r)}>
            Edit
          </Button>
        )}
        {permissions?.is_delete && api.remove && (
          <Button
            size="small"
            danger
            onClick={() =>
              Modal.confirm({
                title: 'Confirm delete',
                onOk: () => handleDelete(Number(getRowId(r))),
              })
            }
          >
            Delete
          </Button>
        )}
      </Space>
    ),
  };

  const finalColumns = [...columns, actionColumn];

  return (
    <div>
      <Space
        style={{
          marginBottom: 12,
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Input
          placeholder="Search"
          allowClear
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: 300 }}
        />
      </Space>
      <Table<T>
        dataSource={data}
        columns={finalColumns as ColumnsType<T>}
        rowKey={rowKey as any}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p) => setPage(p),
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}
