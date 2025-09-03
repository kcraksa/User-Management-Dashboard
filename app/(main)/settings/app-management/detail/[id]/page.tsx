'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Switch, message, Spin } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { getApp } from '@/lib/appApi';
import useSWR from 'swr';

export default function AppDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form] = Form.useForm();

  const {
    data: app,
    error,
    isLoading,
  } = useSWR(['getApp', params.id], ([, id]) => getApp(Number(id)));

  useEffect(() => {
    if (app) {
      form.setFieldsValue(app);
    }
  }, [app, form]);

  useEffect(() => {
    if (error) {
      message.error(error?.response?.data?.message || 'Failed to fetch app');
    }
  }, [error]);

  const onEdit = () =>
    router.push(`/settings/app-management/edit/${params.id}`);
  const onCancel = () => router.push('/settings/app-management');

  return (
    <GenericFormLayout
      title="App Detail"
      onSave={onEdit}
      saveLabel="Edit"
      onCancel={onCancel}
      form={
        <Spin spinning={isLoading}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Name">
              <Input disabled />
            </Form.Item>
            <Form.Item name="key" label="Key">
              <Input disabled />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input disabled />
            </Form.Item>
            <Form.Item name="active" label="Active" valuePropName="checked">
              <Switch disabled />
            </Form.Item>
          </Form>
        </Spin>
      }
    />
  );
}
