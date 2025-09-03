'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, Switch, message, Spin } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { createRole } from '@/lib/roleApi';
import { listApps } from '@/lib/appApi';
import { mutate } from 'swr';
import useSWR from 'swr';

export default function RoleAddPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: apps, isLoading } = useSWR(['listApps'], listApps);

  useEffect(() => {
    // preselect if only one
    if (Array.isArray(apps) && apps.length === 1) {
      form.setFieldsValue({ fk_apps_id: apps[0].pk_apps_id });
    }
  }, [apps, form]);

  const onSave = async () => {
    try {
      const vals = await form.validateFields();
      const created = await createRole(vals);
      message.success('Created');
      // Add to cache
      mutate(
        ['listRoles'],
        (current: any) => [...(current || []), created],
        false,
      );
      router.push('/settings/role-management');
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Failed');
    }
  };

  const onCancel = () => router.push('/settings/role-management');

  if (isLoading) return <Spin />;

  return (
    <GenericFormLayout
      title="Create Role"
      onSave={onSave}
      onCancel={onCancel}
      form={
        <Form form={form} layout="vertical">
          <Form.Item name="fk_apps_id" label="App" rules={[{ required: true }]}>
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
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      }
    />
  );
}
