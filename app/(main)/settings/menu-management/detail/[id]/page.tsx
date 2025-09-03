'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, Switch, message, Spin } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { getMenu, listMenus } from '@/lib/menuApi';
import useSWR from 'swr';

export default function MenuDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form] = Form.useForm();

  const { data: menus } = useSWR(['listMenus'], listMenus);
  const {
    data: menu,
    error,
    isLoading,
  } = useSWR(['getMenu', params.id], ([, id]) => getMenu(Number(id)));

  useEffect(() => {
    if (menu) {
      form.setFieldsValue(menu);
    }
  }, [menu, form]);

  useEffect(() => {
    if (error) {
      message.error(error?.response?.data?.message || 'Failed to fetch menu');
    }
  }, [error]);

  const onEdit = () =>
    router.push(`/settings/menu-management/edit/${params.id}`);
  const onCancel = () => router.push('/settings/menu-management');

  return (
    <GenericFormLayout
      title="Menu Detail"
      onSave={onEdit}
      saveLabel="Edit"
      onCancel={onCancel}
      form={
        <Spin spinning={isLoading}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Name">
              <Input disabled />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input disabled />
            </Form.Item>
            <Form.Item name="url_view" label="URL View">
              <Input disabled />
            </Form.Item>
            <Form.Item name="url_create" label="URL Create">
              <Input disabled />
            </Form.Item>
            <Form.Item name="url_detail" label="URL Detail">
              <Input disabled />
            </Form.Item>
            <Form.Item name="url_update" label="URL Update">
              <Input disabled />
            </Form.Item>
            <Form.Item name="url_delete" label="URL Delete">
              <Input disabled />
            </Form.Item>
            <Form.Item name="url_approval" label="URL Approval">
              <Input disabled />
            </Form.Item>
            <Form.Item name="url_activation" label="URL Activation">
              <Input disabled />
            </Form.Item>
            <Form.Item name="parent_id" label="Parent">
              <Select disabled allowClear placeholder="Select parent">
                {menus?.map((d) => (
                  <Select.Option key={d.pk_module_id} value={d.pk_module_id}>
                    {d.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="ordering" label="Ordering">
              <Input type="number" disabled />
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
