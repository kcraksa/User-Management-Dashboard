'use client';
import { Typography, Card, Table, Divider } from 'antd';
import { Bar } from '@ant-design/charts';
import { useProtectedRoute } from '@/utils/auth';

const tableData = [
  {
    key: '1',
    product: 'Product A',
    batch: 'B001',
    status: 'Completed',
    location: 'Warehouse 1',
  },
  {
    key: '2',
    product: 'Product B',
    batch: 'B002',
    status: 'In Progress',
    location: 'Warehouse 2',
  },
  {
    key: '3',
    product: 'Product C',
    batch: 'B003',
    status: 'Pending',
    location: 'Warehouse 3',
  },
];

const columns = [
  { title: 'Product', dataIndex: 'product', key: 'product' },
  { title: 'Batch', dataIndex: 'batch', key: 'batch' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Location', dataIndex: 'location', key: 'location' },
];

const chartData = [
  { status: 'Completed', value: 10 },
  { status: 'In Progress', value: 5 },
  { status: 'Pending', value: 3 },
];

const chartConfig = {
  data: chartData,
  xField: 'value',
  yField: 'status',
  seriesField: 'status',
  color: ({ status }: { status: string }) =>
    status === 'Completed'
      ? '#1976D2'
      : status === 'In Progress'
        ? '#FFC107'
        : '#888',
  legend: false,
  height: 220,
  barWidthRatio: 0.6,
};

export default function Dashboard() {
  useProtectedRoute();

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2} style={{ color: '#1976D2' }}>
        Dashboard
      </Typography.Title>
      <Divider />
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <Card
          title="Access Management System Status"
          style={{ flex: 1, minWidth: 320, maxWidth: 400 }}
          bodyStyle={{ padding: 16 }}
        >
          <Bar {...chartConfig} />
        </Card>
        <Card
          title="Access Management System Table"
          style={{ flex: 2, minWidth: 400 }}
          bodyStyle={{ padding: 16 }}
        >
          <Table
            dataSource={tableData}
            columns={columns}
            pagination={false}
            size="middle"
            bordered
          />
        </Card>
      </div>
    </div>
  );
}
