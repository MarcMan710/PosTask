import React, { useState, useEffect } from 'react';
import { Button, Card, List, message, Modal, Input, Upload, Tooltip } from 'antd';
import { UploadOutlined, LinkOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const FileAttachment = ({ taskId, onAttachmentChange }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      const response = await axios.get(`/api/attachments/tasks/${taskId}/attachments`);
      setAttachments(response.data);
    } catch (error) {
      message.error('Failed to fetch attachments');
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await axios.post(`/api/attachments/tasks/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('File uploaded successfully');
      fetchAttachments();
      if (onAttachmentChange) onAttachmentChange();
    } catch (error) {
      message.error('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!linkUrl) {
      message.error('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/api/attachments/tasks/${taskId}/links`, { url: linkUrl });
      message.success('Link added successfully');
      setLinkModalVisible(false);
      setLinkUrl('');
      fetchAttachments();
      if (onAttachmentChange) onAttachmentChange();
    } catch (error) {
      message.error('Failed to add link');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    try {
      await axios.delete(`/api/attachments/attachments/${attachmentId}`);
      message.success('Attachment deleted successfully');
      fetchAttachments();
      if (onAttachmentChange) onAttachmentChange();
    } catch (error) {
      message.error('Failed to delete attachment');
    }
  };

  const handleDownload = async (attachment) => {
    if (attachment.is_link) {
      window.open(attachment.link_url, '_blank');
      return;
    }

    try {
      const response = await axios.get(`/api/attachments/attachments/${attachment.id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to download file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card title="Attachments" className="file-attachment-card">
      <div className="attachment-actions">
        <Upload
          customRequest={({ file }) => handleFileUpload(file)}
          showUploadList={false}
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        >
          <Button icon={<UploadOutlined />} loading={loading}>
            Upload File
          </Button>
        </Upload>
        <Button
          icon={<LinkOutlined />}
          onClick={() => setLinkModalVisible(true)}
          loading={loading}
        >
          Add Link
        </Button>
      </div>

      <List
        className="attachment-list"
        itemLayout="horizontal"
        dataSource={attachments}
        renderItem={(attachment) => (
          <List.Item
            actions={[
              <Tooltip title="Download">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(attachment)}
                />
              </Tooltip>,
              <Tooltip title="Delete">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(attachment.id)}
                />
              </Tooltip>,
            ]}
          >
            <List.Item.Meta
              title={
                <span>
                  {attachment.is_link ? (
                    <LinkOutlined style={{ marginRight: 8 }} />
                  ) : (
                    <UploadOutlined style={{ marginRight: 8 }} />
                  )}
                  {attachment.file_name}
                </span>
              }
              description={
                attachment.is_link
                  ? 'Link attachment'
                  : `${attachment.file_type} - ${formatFileSize(attachment.file_size)}`
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title="Add Link"
        open={linkModalVisible}
        onOk={handleAddLink}
        onCancel={() => setLinkModalVisible(false)}
        confirmLoading={loading}
      >
        <Input
          placeholder="Enter URL"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          prefix={<LinkOutlined />}
        />
      </Modal>

      <style jsx>{`
        .file-attachment-card {
          margin-bottom: 16px;
        }
        .attachment-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .attachment-list {
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>
    </Card>
  );
};

export default FileAttachment; 