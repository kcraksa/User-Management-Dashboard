'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, Switch, message, Spin } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { getRole, updateRole } from '@/lib/roleApi';
import { listApps } from '@/lib/appApi';
import useSWR, { mutate } from 'swr';

export default function RoleEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form] = Form.useForm();

  const { data: apps } = useSWR(['listApps'], listApps);
  const {
    data: role,
    error,
    isLoading,
  } = useSWR(['getRole', params.id], ([, id]) => getRole(Number(id)));

  useEffect(() => {
    if (role) {
      form.setFieldsValue({
        fk_apps_id: role.fk_apps_id,
        name: role.name,
        description: role.description,
        active: role.active,
      });
    }
  }, [role, form]);

  useEffect(() => {
    if (error) {
      message.error(error?.response?.data?.message || 'Failed to fetch role');
    }
  }, [error]);

  const onSave = async () => {
    try {
      const vals = await form.validateFields();
      await updateRole(Number(params.id), vals);
      message.success('Updated');
      // Invalidate and update cache
      mutate(['getRole', params.id], vals, false);
      router.push('/settings/role-management');
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Failed');
    }
  };

  const onCancel = () => router.push('/settings/role-management');

  return (
    <GenericFormLayout
      title="Edit Role"
      onSave={onSave}
      onCancel={onCancel}
      form={
        <Spin spinning={isLoading}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="fk_apps_id"
              label="App"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select app">
                {Array.isArray(apps)
                  ? apps.map((a: any) => (
                      <Select.Option
                        key={String(a.pk_apps_id)}
                        value={a.pk_apps_id}
                      >
                        {a.name}
                      </Select.Option>
                    ))
                  : null}
              </Select>
            </Form.Item>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input />
            </Form.Item>
            <Form.Item name="active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </Spin>
      }
    />
  );
}
