'use client';

import React from 'react';
import { Row, Col, Card, Button, Breadcrumb } from 'antd';
import { usePathname, useRouter } from 'next/navigation';

function prettifySegment(s: string) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

type Props = {
  title?: string;
  breadcrumb?: React.ReactNode;
  left?: React.ReactNode;
  right: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
};

export default function GenericListLayout({
  title = 'List',
  breadcrumb,
  left,
  right,
  onAdd,
  addLabel = 'Add',
}: Props) {
  const pathname = usePathname() || '';
  const router = useRouter();

  const defaultBreadcrumb = React.useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    return (
      <Breadcrumb>
        {parts.map((p, idx) => {
          const href = '/' + parts.slice(0, idx + 1).join('/');
          const isLast = idx === parts.length - 1;
          return (
            <Breadcrumb.Item key={href}>
              {isLast ? (
                prettifySegment(p)
              ) : (
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(href);
                  }}
                  href={href}
                >
                  {prettifySegment(p)}
                </a>
              )}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    );
  }, [pathname, router]);

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
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Breadcrumb on the right */}
          <div>
            {breadcrumb ?? defaultBreadcrumb ?? (
              <Breadcrumb>
                <Breadcrumb.Item>{title}</Breadcrumb.Item>
              </Breadcrumb>
            )}
          </div>
        </div>
      </div>

      {/* Add button placed below the title/breadcrumb and aligned to the right */}
      {onAdd && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 12,
          }}
        >
          <Button type="primary" onClick={onAdd}>
            {addLabel}
          </Button>
        </div>
      )}

      <Row gutter={16}>
        <Col xs={24} md={8} lg={6} style={{ marginBottom: 12 }}>
          <Card size="small" bordered>
            {left}
          </Card>
        </Col>
        <Col xs={24} md={16} lg={18}>
          <Card size="small" bordered>
            {right}
          </Card>
        </Col>
      </Row>
    </main>
  );
}
