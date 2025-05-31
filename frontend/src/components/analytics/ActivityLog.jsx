import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Tag, message, Select, DatePicker } from 'antd';
import { UserOutlined, ProjectOutlined, FileOutlined, CommentOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ActivityLog = ({ entityType, entityId, onActivityChange }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [activityType, setActivityType] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, [entityType, entityId, dateRange, activityType]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let url = `/api/activities/${entityType}/${entityId}`;
      const params = new URLSearchParams();

      if (dateRange) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'));
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'));
      }

      if (activityType !== 'all') {
        params.append('type', activityType);
      }

      const response = await axios.get(`${url}?${params.toString()}`);
      setActivities(response.data);
    } catch (error) {
      message.error('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task':
        return <FileOutlined />;
      case 'project':
        return <ProjectOutlined />;
      case 'comment':
        return <CommentOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'create':
        return 'green';
      case 'update':
        return 'blue';
      case 'delete':
        return 'red';
      case 'comment':
        return 'purple';
      default:
        return 'default';
    }
  };

  const formatActivityDescription = (activity) => {
    const { type, action, details } = activity;
    let description = '';

    switch (type) {
      case 'task':
        switch (action) {
          case 'create':
            description = `created task "${details.title}"`;
            break;
          case 'update':
            description = `updated task "${details.title}"`;
            if (details.changes) {
              description += ` (${Object.keys(details.changes).join(', ')})`;
            }
            break;
          case 'delete':
            description = `deleted task "${details.title}"`;
            break;
          case 'status':
            description = `changed task status to "${details.new_status}"`;
            break;
          case 'assign':
            description = `assigned task to ${details.assignee_name}`;
            break;
          default:
            description = `${action} task`;
        }
        break;

      case 'project':
        switch (action) {
          case 'create':
            description = `created project "${details.name}"`;
            break;
          case 'update':
            description = `updated project "${details.name}"`;
            if (details.changes) {
              description += ` (${Object.keys(details.changes).join(', ')})`;
            }
            break;
          case 'delete':
            description = `deleted project "${details.name}"`;
            break;
          case 'member':
            description = `${details.action} ${details.member_name} as ${details.role}`;
            break;
          default:
            description = `${action} project`;
        }
        break;

      case 'comment':
        description = `commented: "${details.content.substring(0, 50)}${details.content.length > 50 ? '...' : ''}"`;
        break;

      default:
        description = `${action} ${type}`;
    }

    return description;
  };

  return (
    <Card
      title="Activity History"
      extra={
        <div className="activity-filters">
          <Select
            value={activityType}
            onChange={setActivityType}
            style={{ width: 120, marginRight: 8 }}
          >
            <Option value="all">All Activities</Option>
            <Option value="task">Tasks</Option>
            <Option value="project">Projects</Option>
            <Option value="comment">Comments</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            allowClear
          />
        </div>
      }
    >
      <List
        className="activity-list"
        loading={loading}
        itemLayout="horizontal"
        dataSource={activities}
        renderItem={(activity) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar icon={getActivityIcon(activity.type)}>
                  {activity.username.charAt(0).toUpperCase()}
                </Avatar>
              }
              title={
                <div className="activity-header">
                  <span className="activity-user">{activity.username}</span>
                  <Tag color={getActivityColor(activity.action)}>
                    {activity.action.toUpperCase()}
                  </Tag>
                  <span className="activity-time">
                    {moment(activity.created_at).fromNow()}
                  </span>
                </div>
              }
              description={formatActivityDescription(activity)}
            />
          </List.Item>
        )}
      />

      <style jsx>{`
        .activity-list {
          max-height: 500px;
          overflow-y: auto;
        }
        .activity-filters {
          display: flex;
          align-items: center;
        }
        .activity-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .activity-user {
          font-weight: 500;
        }
        .activity-time {
          color: rgba(0, 0, 0, 0.45);
          font-size: 12px;
        }
      `}</style>
    </Card>
  );
};

export default ActivityLog; 