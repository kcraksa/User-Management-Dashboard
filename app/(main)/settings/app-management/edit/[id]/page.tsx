'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Switch, message, Spin } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { getApp, updateApp } from '@/lib/appApi';
import useSWR, { mutate } from 'swr';

export default function AppEditPage({ params }: { params: { id: string } }) {
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

  const onSave = () => {
    form
      .validateFields()
      .then((vals) => {
        updateApp(Number(params.id), vals)
          .then(() => {
            message.success('Updated');
            // Invalidate and update cache
            mutate(['getApp', params.id], vals, false);
            router.push('/settings/app-management');
          })
          .catch((e: any) => {
            message.error(e?.response?.data?.message || e?.message || 'Failed');
          });
      })
      .catch(() => {
        message.error('Validation failed');
      });
  };

  const onCancel = () => router.push('/settings/app-management');

  return (
    <GenericFormLayout
      title="Edit App"
      onSave={onSave}
      onCancel={onCancel}
      form={
        <Spin spinning={isLoading}>
          <Form form={form} layout="vertical">
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
              <Switch />
            </Form.Item>
          </Form>
        </Spin>
      }
    />
  );
}
