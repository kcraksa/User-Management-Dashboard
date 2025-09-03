'use client';

import React from 'react';
import { Row, Col, Card, Button, Breadcrumb } from 'antd';
import { usePathname } from 'next/navigation';

type Props = {
  title?: string;
  breadcrumb?: React.ReactNode;
  form: React.ReactNode;
  right?: React.ReactNode;
  onCancel?: () => void;
  onSave?: () => void;
  onAdd?: () => void;
  saveLabel?: string;
  addLabel?: string;
};

export default function GenericFormLayout({
  title = 'Form',
  breadcrumb,
  form,
  right,
  onCancel,
  onSave,
  onAdd,
  saveLabel = 'Save',
  addLabel = 'Add',
}: Props) {
  const pathname = usePathname();

  // Check if current page is add or edit to hide Add button
  const isAddOrEditPage =
    pathname.includes('/add') || pathname.includes('/edit');

  // Check if current page is detail to hide Save/Edit button
  const isDetailPage = pathname.includes('/detail');

  // Generate breadcrumb automatically from pathname if not provided
  const generateBreadcrumb = () => {
    if (breadcrumb) return breadcrumb;
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbItems = pathSegments.map((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      return (
        <Breadcrumb.Item key={href}>
          <a href={href}>
            {segment.charAt(0).toUpperCase() + segment.slice(1)}
          </a>
        </Breadcrumb.Item>
      );
    });
    return <Breadcrumb>{breadcrumbItems}</Breadcrumb>;
  };

  return (
    <main className="container">
      <div
        style={{
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          {/* Title on the left */}
          <h2 style={{ margin: 0, marginTop: 8 }}>{title.toUpperCase()}</h2>
          {right}
        </div>
        <div>
          {/* Breadcrumb on the right */}
          {generateBreadcrumb()}
        </div>
      </div>

      <Row gutter={16}>
        <Col xs={24} md={24} lg={24}>
          <Card size="small" bordered>
            {form}
          </Card>

          {/* action buttons placed below the form for better UX */}
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            {onAdd && !isAddOrEditPage && (
              <Button type="default" onClick={onAdd}>
                {addLabel}
              </Button>
            )}
            {onSave && !isDetailPage && (
              <Button type="primary" onClick={onSave}>
                {saveLabel}
              </Button>
            )}
            {onCancel && <Button onClick={onCancel}>Cancel</Button>}
          </div>
        </Col>
      </Row>
    </main>
  );
}
