'use client';

import { useRouter } from 'next/navigation';
import { Form, Input, Button, Switch, Select, message } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { createUser } from '@/lib/userApi';
import { listRoles } from '@/lib/roleApi';
import { User } from '@/types/user';
import useSWR from 'swr';

export default function AddUserPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  const { data: roles } = useSWR('roles', listRoles);

  const onFinish = async (values: Partial<User>) => {
    try {
      await createUser(values);
      message.success('User created successfully');
      router.push('/settings/user-management');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to create user');
    }
  };

  const onCancel = () => router.push('/settings/user-management');

  return (
    <GenericFormLayout
      title="Create User"
      onCancel={onCancel}
      form={
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Name"
            name="full_name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Role"
            name="fk_role_id"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role" loading={!roles}>
              {roles?.map((role: any) => (
                <Select.Option key={role.pk_role_id} value={role.pk_role_id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Active" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      }
    />
  );
}
