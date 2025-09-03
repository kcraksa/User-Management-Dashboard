'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Switch, message } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { createApp } from '@/lib/appApi';
import { mutate } from 'swr';

export default function AppAddPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  const onSave = async () => {
    try {
      const vals = await form.validateFields();
      const created = await createApp(vals);
      message.success('Created');
      // Add to cache
      mutate(
        ['listApps'],
        (current: any) => [...(current || []), created],
        false,
      );
      router.push('/settings/app-management');
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Failed');
    }
  };

  const onCancel = () => router.push('/settings/app-management');

  return (
    <GenericFormLayout
      title="Create App"
      onSave={onSave}
      onCancel={onCancel}
      form={
        <Form form={form} layout="vertical" initialValues={{ active: true }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="key" label="Key" rules={[{ required: true }]}>
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
