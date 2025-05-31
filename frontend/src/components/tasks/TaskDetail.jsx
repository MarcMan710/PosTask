import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, Tabs } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import FileAttachment from './FileAttachment';
import CommentSection from './CommentSection';
import ActivityLog from './ActivityLog';
import TimeTracker from './TimeTracker';

const TaskDetail = ({ task, onEdit, onDelete, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await axios.put(`/api/tasks/${task.id}`, { status: newStatus });
      message.success('Task status updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      message.error('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentChange = () => {
    if (onUpdate) onUpdate();
  };

  const handleCommentChange = () => {
    if (onUpdate) onUpdate();
  };

  const handleTimeUpdate = () => {
    if (onUpdate) onUpdate();
  };

  const items = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <Descriptions bordered>
          <Descriptions.Item label="Status">
            <Tag color={task.status === 'completed' ? 'green' : 'blue'}>
              {task.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Priority">
            <Tag color={
              task.priority === 'high' ? 'red' :
              task.priority === 'medium' ? 'orange' : 'blue'
            }>
              {task.priority}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Due Date">
            {new Date(task.due_date).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={3}>
            {task.description}
          </Descriptions.Item>
          <Descriptions.Item label="Assigned To">
            {task.assigned_to_name || 'Unassigned'}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {task.created_by_name}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(task.created_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'time',
      label: 'Time Tracking',
      children: (
        <TimeTracker
          taskId={task.id}
          onTimeUpdate={handleTimeUpdate}
        />
      ),
    },
    {
      key: 'attachments',
      label: 'Attachments',
      children: (
        <FileAttachment
          taskId={task.id}
          onAttachmentChange={handleAttachmentChange}
        />
      ),
    },
    {
      key: 'comments',
      label: 'Comments',
      children: (
        <CommentSection
          taskId={task.id}
          onCommentChange={handleCommentChange}
        />
      ),
    },
    {
      key: 'activity',
      label: 'Activity',
      children: (
        <ActivityLog
          entityType="tasks"
          entityId={task.id}
          onActivityChange={onUpdate}
        />
      ),
    },
  ];

  return (
    <div className="task-detail">
      <Card
        title={task.title}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(task)}
              disabled={loading}
            >
              Edit
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(task.id)}
              disabled={loading}
            >
              Delete
            </Button>
          </Space>
        }
      >
        <Tabs items={items} />
      </Card>

      <style jsx>{`
        .task-detail {
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default TaskDetail; 