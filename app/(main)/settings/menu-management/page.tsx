'use client';

import { usePathname } from 'next/navigation';
import {
  Button,
  message,
  Card,
  Row,
  Col,
  Tree,
  Form,
  Input,
  Select,
  Switch,
  Typography,
  Modal,
} from 'antd';
import React, { useState } from 'react';
import {
  FolderOutlined,
  FileOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { listMenus, deleteMenu, createMenu, updateMenu } from '@/lib/menuApi';
import { getModuleAccess } from '@/lib/auth';
import useSWR from 'swr';

const { Title } = Typography;

interface MenuNode {
  pk_module_id: number;
  name: string;
  fk_parent_id: number | null;
  url?: string;
  url_view?: string;
  url_create?: string;
  url_update?: string;
  url_detail?: string;
  url_delete?: string;
  url_approval?: string;
  url_activation?: string;
  active: boolean;
  children?: MenuNode[];
}

export default function MenuManagementPage() {
  const pathname = usePathname();
  const [form] = Form.useForm();

  const [selectedNode, setSelectedNode] = useState<MenuNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: menuData, mutate } = useSWR(['listMenus'], listMenus);

  // Get permissions for current page
  const permissions = getModuleAccess({ path: pathname });

  // Build tree structure from flat menu data
  const buildTree = (items: MenuNode[]): MenuNode[] => {
    if (!Array.isArray(items)) return [];

    const itemMap = new Map<number, MenuNode>();
    const tree: MenuNode[] = [];

    // First pass: create map of all items
    items.forEach((item) => {
      itemMap.set(item.pk_module_id, { ...item, children: [] });
    });

    // Second pass: build parent-child relationships
    items.forEach((item) => {
      const node = itemMap.get(item.pk_module_id);
      if (node && item.fk_parent_id && itemMap.has(item.fk_parent_id)) {
        const parent = itemMap.get(item.fk_parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      } else if (node) {
        tree.push(node);
      }
    });

    return tree;
  };

  // Convert tree to Ant Design Tree format
  const convertToTreeData = (nodes: MenuNode[]): any[] => {
    return nodes.map((node) => ({
      key: node.pk_module_id,
      title: node.name,
      icon:
        node.children && node.children.length > 0 ? (
          <FolderOutlined />
        ) : (
          <FileOutlined />
        ),
      children:
        node.children && node.children.length > 0
          ? convertToTreeData(node.children)
          : undefined,
      node: node,
    }));
  };

  // Safely get menu data array
  const getMenuDataArray = (): MenuNode[] => {
    if (Array.isArray(menuData)) return menuData;
    if ((menuData as any)?.data && Array.isArray((menuData as any).data))
      return (menuData as any).data;
    return [];
  };

  const treeData = convertToTreeData(buildTree(getMenuDataArray()));

  const handleNodeSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      const node = info.node.node as MenuNode;
      setSelectedNode(node);
      setIsEditing(false);
      form.setFieldsValue({
        name: node.name,
        fk_parent_id: node.fk_parent_id,
        url: node.url || '',
        url_view: node.url_view || '',
        url_create: node.url_create || '',
        url_update: node.url_update || '',
        url_detail: node.url_detail || '',
        url_delete: node.url_delete || '',
        url_approval: node.url_approval || '',
        url_activation: node.url_activation || '',
        active: node.active,
      });
    }
  };

  const handleCreate = () => {
    if (!permissions?.is_add) return;
    setSelectedNode(null);
    setIsEditing(true);
    form.resetFields();
    form.setFieldsValue({
      active: true,
      fk_parent_id: null,
    });
  };

  const handleEdit = () => {
    if (selectedNode && permissions?.is_update) {
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedNode || !permissions?.is_delete) return;

    Modal.confirm({
      title: 'Delete Menu',
      content: `Are you sure you want to delete "${selectedNode.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setLoading(true);
          await deleteMenu(selectedNode.pk_module_id);
          message.success('Menu deleted successfully');
          mutate();
          setSelectedNode(null);
          form.resetFields();
        } catch (error: any) {
          message.error('Failed to delete menu');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (selectedNode) {
        // Update existing menu
        await updateMenu(selectedNode.pk_module_id, values);
        message.success('Menu updated successfully');
      } else {
        // Create new menu
        await createMenu(values);
        message.success('Menu created successfully');
      }

      mutate();
      setIsEditing(false);
    } catch (error: any) {
      if (error?.errorFields) {
        message.warning('Please check the form fields');
      } else {
        message.error('Failed to save menu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (selectedNode) {
      form.setFieldsValue({
        name: selectedNode.name,
        fk_parent_id: selectedNode.fk_parent_id,
        url: selectedNode.url || '',
        url_view: selectedNode.url_view || '',
        url_create: selectedNode.url_create || '',
        url_update: selectedNode.url_update || '',
        url_detail: selectedNode.url_detail || '',
        url_delete: selectedNode.url_delete || '',
        url_approval: selectedNode.url_approval || '',
        url_activation: selectedNode.url_activation || '',
        active: selectedNode.active,
      });
    } else {
      form.resetFields();
    }
  };

  // Get parent options for dropdown
  const getParentOptions = (currentId?: number) => {
    const options: { label: string; value: number }[] = [];

    const collectOptions = (nodes: MenuNode[], level = 0) => {
      nodes.forEach((node) => {
        if (node.pk_module_id !== currentId) {
          options.push({
            label: '  '.repeat(level) + node.name,
            value: node.pk_module_id,
          });
          if (node.children) {
            collectOptions(node.children, level + 1);
          }
        }
      });
    };

    collectOptions(buildTree(getMenuDataArray()));
    return options;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Menu Management</Title>

      <Row gutter={24} style={{ height: 'calc(100vh - 200px)' }}>
        {/* Left Panel - Tree View */}
        <Col span={10}>
          <Card
            title="Menu Builder"
            extra={
              <div>
                {permissions?.is_add && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={handleCreate}
                    style={{ marginRight: 8 }}
                  >
                    Create
                  </Button>
                )}
                {permissions?.is_update && (
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={handleEdit}
                    disabled={!selectedNode}
                    style={{ marginRight: 8 }}
                  >
                    Rename
                  </Button>
                )}
                {permissions?.is_delete && (
                  <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    onClick={handleDelete}
                    disabled={!selectedNode || !permissions?.is_delete}
                    loading={loading}
                  >
                    Delete
                  </Button>
                )}
              </div>
            }
            bodyStyle={{ padding: '16px', height: '100%', overflow: 'auto' }}
          >
            <Tree
              showIcon
              defaultExpandAll
              onSelect={handleNodeSelect}
              treeData={treeData}
              style={{
                background: '#fafafa',
                padding: '8px',
                borderRadius: '4px',
              }}
            />
          </Card>
        </Col>

        {/* Right Panel - Form */}
        <Col span={14}>
          <Card
            title="Informasi Menu"
            extra={
              isEditing &&
              (permissions?.is_add || permissions?.is_update) && (
                <div>
                  <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                    Cancel
                  </Button>
                  <Button type="primary" onClick={handleSave} loading={loading}>
                    Save Menu Information
                  </Button>
                </div>
              )
            }
            bodyStyle={{ padding: '24px', height: '100%', overflow: 'auto' }}
          >
            <Form form={form} layout="vertical" disabled={!isEditing}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Nama"
                    rules={[
                      { required: true, message: 'Please enter menu name' },
                    ]}
                  >
                    <Input placeholder="Menu name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="fk_parent_id" label="Module">
                    <Select
                      placeholder="Select parent module"
                      allowClear
                      options={[
                        { label: 'None (Root)', value: null },
                        ...getParentOptions(selectedNode?.pk_module_id),
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="url" label="URL">
                <Input placeholder="Main URL" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="url_view" label="URL View">
                    <Input placeholder="View URL" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="url_create" label="URL Create">
                    <Input placeholder="Create URL" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="url_update" label="URL Update">
                    <Input placeholder="Update URL" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="url_detail" label="URL Detail">
                    <Input placeholder="Detail URL" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="url_delete" label="URL Delete">
                    <Input placeholder="Delete URL" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="url_approval" label="URL Approval">
                    <Input placeholder="Approval URL" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="url_activation" label="URL Activation">
                    <Input placeholder="Activation URL" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="active"
                    label="Active"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            {!isEditing && !selectedNode && (
              <div
                style={{
                  textAlign: 'center',
                  color: '#999',
                  marginTop: '60px',
                }}
              >
                Select a menu from the tree or create a new one to view/edit
                details
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
