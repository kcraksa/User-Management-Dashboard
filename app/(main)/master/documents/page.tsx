'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  Card,
  Typography,
  Button,
  message,
  Modal,
  Drawer,
  Space,
  Input,
  Switch,
} from 'antd';
import axios from '@/lib/axios';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const { Title } = Typography;
const { Search } = Input;

export default function DocumentsPage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  // UI state for preview/detail/filter/pagination
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItem, setDetailItem] = useState<any | null>(null);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add document modal state
  const [addVisible, setAddVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    file: null as File | null,
    storage: 's3',
    source_id: '123',
    source_type: 'project',
    document_type: '', // will be set from uploaded file
    reg_date: '2024-06-01',
    document_no: '',
    version_no: '1',
    has_expired: false,
    expired_date: '',
  });

  // Edit document modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null as number | null,
    name: '',
    file: null as File | null,
    storage: 's3',
    source_id: '',
    source_type: '',
    document_type: '',
    reg_date: '',
    document_no: '',
    version_no: '',
    has_expired: false,
    expired_date: '',
  });

  // helper to get document type from file extension
  const getDocumentType = (file: File | null) => {
    if (!file) return '';
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) return '';
    // map common extensions to types
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    return ext;
  };

  // update document_type when file changes
  useEffect(() => {
    setAddForm((prev) => ({
      ...prev,
      document_type: getDocumentType(prev.file),
    }));
  }, [addForm.file]);

  // expose fetchDocuments so we can re-use after add
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') return; // user not logged in

    fetchDocuments();
  }, [status]);

  // fetchDocuments function
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8003/api/v1/documents');
      const payload = res.data;

      // API returns { success, message, data: { '1': {...}, '2': {...} } }
      const documentsObj = payload?.data ?? payload;
      let docsArray: any[] = [];

      if (Array.isArray(documentsObj)) {
        docsArray = documentsObj;
      } else if (documentsObj && typeof documentsObj === 'object') {
        // convert keyed object to array
        docsArray = Object.values(documentsObj as Record<string, any>);
      }

      // normalize array items
      const normalized = docsArray.map((d) => ({
        pk_document_id: d?.pk_document_id ?? d?.id,
        document_no: d?.document_no,
        name: d?.name,
        document_type: d?.document_type ?? d?.type,
        created_at: d?.created_at ?? d?.created_date,
        s3_key: d?.s3_key,
        s3_bucket: d?.s3_bucket,
        original_name: d?.original_name,
        raw: d,
      }));

      setDocuments(normalized);
    } catch (err: any) {
      console.error(err);
      message.error('Gagal mengambil dokumen');
    } finally {
      setLoading(false);
    }
  };

  // handle add submit
  const handleAddSubmit = async () => {
    // validate
    if (!addForm.name) return message.warning('Nama dokumen diperlukan');
    if (!addForm.file) return message.warning('File diperlukan');

    setAddLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', addForm.name);
      formData.append('file', addForm.file as Blob);
      formData.append('storage', addForm.storage);
      formData.append('source_id', String(addForm.source_id));
      formData.append('source_type', addForm.source_type);
      formData.append('document_type', addForm.document_type);
      formData.append('reg_date', addForm.reg_date);
      formData.append('document_no', addForm.document_no);
      formData.append('version_no', addForm.version_no);
      formData.append('has_expired', addForm.has_expired ? 'true' : 'false');
      formData.append('expired_date', addForm.expired_date || '');

      const res = await axios.post(
        'http://localhost:8003/api/v1/documents',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      if (res.status >= 200 && res.status < 300) {
        message.success('Dokumen berhasil ditambahkan');
        setAddVisible(false);
        // refresh list
        fetchDocuments();
      } else {
        message.error('Gagal menambah dokumen');
      }
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || 'Gagal menambah dokumen');
    } finally {
      setAddLoading(false);
    }
  };

  // helper to build preview URL from s3 info (fallback to env)
  const buildPreviewUrl = (item: any) => {
    if (!item) return null;
    const key = item.s3_key || item.raw?.s3_key;
    const bucket = item.s3_bucket || item.raw?.s3_bucket;
    // allow override via env var
    const s3Base = process.env.NEXT_PUBLIC_S3_BASE || null;
    if (s3Base && key)
      return `${s3Base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
    if (bucket && key)
      return `https://doc-stg.s3.amazonaws.com/${bucket}/${key.replace(/^\//, '')}`;
    // fallback to original_name if available
    return item.original_name || null;
  };

  const handlePreview = (item: any) => {
    const url = buildPreviewUrl(item);
    if (!url) return message.warning('Preview tidak tersedia');
    setPreviewName(item.original_name || item.name || 'Preview');
    setPreviewUrl(url);
    setPreviewVisible(true);
  };

  const handleDetail = (item: any) => {
    setDetailItem(item);
    setDetailVisible(true);
  };

  // open edit modal and fetch detail
  const handleOpenEdit = async (record: any) => {
    const id =
      record?.pk_document_id || record?.raw?.pk_document_id || record?.id;
    if (!id) return message.warning('Tidak dapat mendapatkan ID dokumen');
    setEditLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8003/api/v1/documents/${id}`,
      );
      const payload = res.data;
      // payload expected to contain the document object (may be under data or directly)
      const doc = payload?.data ?? payload;

      setEditForm({
        id: doc?.pk_document_id ?? doc?.id ?? id,
        name: doc?.name ?? '',
        file: null,
        storage: doc?.storage ?? 's3',
        source_id: String(doc?.source_id ?? ''),
        source_type: doc?.source_type ?? '',
        document_type: doc?.document_type ?? '',
        reg_date:
          (doc?.reg_date || doc?.created_at || '').split('T')?.[0] || '',
        document_no: doc?.document_no ?? '',
        version_no: doc?.version_no ?? '',
        has_expired: Boolean(doc?.has_expired),
        expired_date: doc?.expired_date ? doc.expired_date.split('T')?.[0] : '',
      });
      setEditVisible(true);
    } catch (err: any) {
      console.error(err);
      message.error('Gagal mengambil detail dokumen');
    } finally {
      setEditLoading(false);
    }
  };

  // delete document with confirmation
  const handleDelete = (record: any) => {
    const id =
      record?.pk_document_id || record?.raw?.pk_document_id || record?.id;
    if (!id) return message.warning('Tidak dapat mendapatkan ID dokumen');

    Modal.confirm({
      title: 'Hapus dokumen',
      content: `Yakin ingin menghapus dokumen #${id}? Tindakan ini tidak dapat dibatalkan.`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          setLoading(true);
          await axios.delete(`http://localhost:8003/api/v1/documents/${id}`);
          message.success('Dokumen berhasil dihapus');
          fetchDocuments();
        } catch (err: any) {
          console.error(err);
          message.error(
            err?.response?.data?.message || 'Gagal menghapus dokumen',
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'pk_document_id', key: 'pk_document_id' },
    { title: 'Document No', dataIndex: 'document_no', key: 'document_no' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'document_type', key: 'document_type' },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" onClick={() => handleOpenEdit(record)}>
            Edit
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
          <Button size="small" onClick={() => handleDetail(record)}>
            Detail
          </Button>
          <Button size="small" onClick={() => handlePreview(record)}>
            Preview
          </Button>
        </Space>
      ),
    },
  ];

  // client-side filtering
  const filtered = useMemo(() => {
    if (!search) return documents;
    const q = search.toLowerCase();
    return documents.filter((d) => {
      return (
        String(d.name || '')
          .toLowerCase()
          .includes(q) ||
        String(d.document_no || '')
          .toLowerCase()
          .includes(q) ||
        String(d.original_name || '')
          .toLowerCase()
          .includes(q)
      );
    });
  }, [documents, search]);

  // pagination slice
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              Documents
            </Title>
            <Search
              placeholder="Cari nama atau nomor dokumen"
              onSearch={(v) => {
                setSearch(v);
                setCurrentPage(1);
              }}
              allowClear
              style={{ width: 360 }}
            />
          </div>
          <div>
            <Button type="primary" onClick={() => setAddVisible(true)}>
              Tambah Dokumen
            </Button>
          </div>
        </div>

        {/* spacing between filter and table */}
        <div style={{ height: 16 }} />

        <Table
          columns={columns}
          dataSource={paged}
          loading={loading}
          rowKey="pk_document_id"
          pagination={{
            current: currentPage,
            pageSize,
            total: filtered.length,
            showSizeChanger: true,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || pageSize);
            },
          }}
        />

        <Modal
          visible={previewVisible}
          title={previewName}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width={800}
          centered
        >
          {previewUrl ? (
            <div
              style={{ position: 'relative', width: '100%', height: '60vh' }}
            >
              <Image
                src={previewUrl}
                alt={previewName || 'preview'}
                fill
                style={{ objectFit: 'contain' }}
                unoptimized
              />
            </div>
          ) : (
            <div>Preview tidak tersedia</div>
          )}
        </Modal>

        <Drawer
          title={detailItem ? `Detail #${detailItem.pk_document_id}` : 'Detail'}
          placement="right"
          width={520}
          onClose={() => setDetailVisible(false)}
          open={detailVisible}
        >
          {detailItem ? (
            <div
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: 12,
              }}
            >
              {JSON.stringify(detailItem.raw || detailItem, null, 2)}
            </div>
          ) : (
            <div>—</div>
          )}
        </Drawer>

        {/* Add Document Modal */}
        <Modal
          title="Tambah Dokumen"
          open={addVisible}
          onCancel={() => setAddVisible(false)}
          onOk={handleAddSubmit}
          confirmLoading={addLoading}
          width={620}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label
                style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
              >
                Nama Dokumen
              </label>
              <Input
                placeholder="Nama Dokumen"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
              >
                File
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setAddForm({ ...addForm, file: e.target.files?.[0] || null })
                }
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
                >
                  Document No
                </label>
                <Input
                  placeholder="Document No"
                  value={addForm.document_no}
                  onChange={(e) =>
                    setAddForm({ ...addForm, document_no: e.target.value })
                  }
                />
              </div>
              <div style={{ width: 140 }}>
                <label
                  style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
                >
                  Version
                </label>
                <Input
                  placeholder="Version"
                  value={addForm.version_no}
                  onChange={(e) =>
                    setAddForm({ ...addForm, version_no: e.target.value })
                  }
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
                >
                  Source ID
                </label>
                <Input
                  placeholder="Source ID"
                  value={addForm.source_id}
                  onChange={(e) =>
                    setAddForm({ ...addForm, source_id: e.target.value })
                  }
                />
              </div>
              <div style={{ width: 160 }}>
                <label
                  style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
                >
                  Source Type
                </label>
                <Input
                  placeholder="Source Type"
                  value={addForm.source_type}
                  onChange={(e) =>
                    setAddForm({ ...addForm, source_type: e.target.value })
                  }
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 1fr',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 600, marginBottom: 6 }}>
                  Reg Date
                </label>
                <Input
                  type="date"
                  value={addForm.reg_date}
                  onChange={(e) =>
                    setAddForm({ ...addForm, reg_date: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <label style={{ fontWeight: 600, marginBottom: 6 }}>
                  Has Expired
                </label>
                <Switch
                  checked={addForm.has_expired}
                  onChange={(v) => setAddForm({ ...addForm, has_expired: v })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 600, marginBottom: 6 }}>
                  Expired Date
                </label>
                <Input
                  type="date"
                  value={addForm.expired_date}
                  onChange={(e) =>
                    setAddForm({ ...addForm, expired_date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* Edit Document Modal */}
        <Modal
          title="Edit Dokumen"
          open={editVisible}
          onCancel={() => setEditVisible(false)}
          onOk={async () => {
            // submit updated data
            if (!editForm.id)
              return message.warning('ID dokumen tidak tersedia');
            setEditLoading(true);
            try {
              const formData = new FormData();
              formData.append('name', editForm.name);
              if (editForm.file) formData.append('file', editForm.file as Blob);
              formData.append('storage', editForm.storage);
              formData.append('source_id', String(editForm.source_id));
              formData.append('source_type', editForm.source_type);
              formData.append('document_type', editForm.document_type);
              formData.append('reg_date', editForm.reg_date);
              formData.append('document_no', editForm.document_no);
              formData.append('version_no', editForm.version_no);
              formData.append(
                'has_expired',
                editForm.has_expired ? 'true' : 'false',
              );
              formData.append('expired_date', editForm.expired_date || '');

              // try PUT to update
              await axios.post(
                `http://localhost:8003/api/v1/documents/${editForm.id}`,
                formData,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                },
              );

              message.success('Dokumen berhasil diperbarui');
              setEditVisible(false);
              fetchDocuments();
            } catch (err: any) {
              console.error(err);
              message.error(
                err?.response?.data?.message || 'Gagal memperbarui dokumen',
              );
            } finally {
              setEditLoading(false);
            }
          }}
          confirmLoading={editLoading}
          width={620}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label
                style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
              >
                Nama Dokumen
              </label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
              >
                File (opsional, unggah untuk mengganti)
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    file: e.target.files?.[0] || null,
                  })
                }
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
                >
                  Document No
                </label>
                <Input
                  value={editForm.document_no}
                  onChange={(e) =>
                    setEditForm({ ...editForm, document_no: e.target.value })
                  }
                />
              </div>
              <div style={{ width: 140 }}>
                <label
                  style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
                >
                  Version
                </label>
                <Input
                  value={editForm.version_no}
                  onChange={(e) =>
                    setEditForm({ ...editForm, version_no: e.target.value })
                  }
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
                >
                  Source ID
                </label>
                <Input
                  value={editForm.source_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, source_id: e.target.value })
                  }
                />
              </div>
              <div style={{ width: 160 }}>
                <label
                  style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
                >
                  Source Type
                </label>
                <Input
                  value={editForm.source_type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, source_type: e.target.value })
                  }
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 1fr',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 600, marginBottom: 6 }}>
                  Reg Date
                </label>
                <Input
                  type="date"
                  value={editForm.reg_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, reg_date: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <label style={{ fontWeight: 600, marginBottom: 6 }}>
                  Has Expired
                </label>
                <Switch
                  checked={editForm.has_expired}
                  onChange={(v) => setEditForm({ ...editForm, has_expired: v })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontWeight: 600, marginBottom: 6 }}>
                  Expired Date
                </label>
                <Input
                  type="date"
                  value={editForm.expired_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, expired_date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </Modal>
      </Card>
    </div>
  );
}
