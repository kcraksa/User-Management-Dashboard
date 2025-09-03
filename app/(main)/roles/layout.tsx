'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb, Button, Row, Col } from 'antd';

export default function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 12 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item>Roles</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col>
          <Button type="primary" onClick={() => router.push('/roles/add')}>
            Add Role
          </Button>
        </Col>
      </Row>
      <div>{children}</div>
    </div>
  );
}
