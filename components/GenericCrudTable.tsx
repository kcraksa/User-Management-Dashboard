'use client';

import React, { useEffect, useState } from 'react';
import { Table, Input, Space, Button, Modal, message } from 'antd';
import { ColumnsType } from 'antd/es/table';

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
  searchFields?: string[];
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
  searchFields = [],
  refreshKey,
}: Props<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | undefined>(undefined);

  const fetch = async () => {
    setLoading(true);
    try {
      const params: any = { page, per_page: pageSize };
      if (q) params.q = q;
      const res = await api.list(params);
      // handle both paginated and array
      const list = res?.data ?? res;
      if (list?.data && Array.isArray(list.data)) {
        setData(list.data);
        setTotal(list.total ?? (list.per_page ? list.total : undefined));
      } else if (Array.isArray(list)) {
        setData(list);
        setTotal(list.length);
      } else {
        setData(list ? [list] : []);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q, refreshKey]);

  const handleSearch = (val: string) => {
    setQ(val);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!api.remove) return;
    try {
      await api.remove(id);
      message.success('Deleted');
      fetch();
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
        <Input.Search
          placeholder="Search"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </Space>
      <Table<T>
        dataSource={data}
        columns={finalColumns as ColumnsType<T>}
        rowKey={rowKey as any}
        loading={loading}
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
