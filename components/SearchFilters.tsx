'use client';

import React, { useState, useCallback } from 'react';
import { Input, Button, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

interface SearchField {
  key: string;
  placeholder: string;
}

interface SearchFiltersProps {
  fields: SearchField[];
  // eslint-disable-next-line no-unused-vars
  onSearch: (filters: Record<string, string>) => void;
  onClear: () => void;
}

export default function SearchFilters({
  fields,
  onSearch,
  onClear,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach((field) => {
      initial[field.key] = '';
    });
    return initial;
  });

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    const cleared: Record<string, string> = {};
    fields.forEach((field) => {
      cleared[field.key] = '';
    });
    setFilters(cleared);
    onClear();
  };

  return (
    <div
      style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {fields.map((field) => (
          <Input
            key={field.key}
            placeholder={field.placeholder}
            value={filters[field.key]}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            prefix={<SearchOutlined />}
          />
        ))}
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Search
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            Clear
          </Button>
        </Space>
      </Space>
    </div>
  );
}
