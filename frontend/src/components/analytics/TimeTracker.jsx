import React, { useState, useEffect } from 'react';
import { Card, Button, List, Tag, Modal, Input, message, Select, Space, Statistic, Row, Col } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

const TimeTracker = ({ taskId, onTimeUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [runningTimer, setRunningTimer] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [description, setDescription] = useState('');
  const [dateRange, setDateRange] = useState([moment().startOf('week'), moment().endOf('week')]);
  const [summary, setSummary] = useState({
    totalTime: 0,
    averageTime: 0,
    entriesCount: 0
  });

  useEffect(() => {
    fetchRunningTimer();
    fetchTimeEntries();
  }, [taskId]);

  const fetchRunningTimer = async () => {
    try {
      const response = await axios.get('/api/time-entries/running');
      if (response.data && response.data.task_id === taskId) {
        setRunningTimer(response.data);
      }
    } catch (error) {
      console.error('Error fetching running timer:', error);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/time-entries/task/${taskId}`);
      setTimeEntries(response.data);
      calculateSummary(response.data);
    } catch (error) {
      message.error('Failed to fetch time entries');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (entries) => {
    const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0);
    setSummary({
      totalTime,
      averageTime: entries.length ? Math.round(totalTime / entries.length) : 0,
      entriesCount: entries.length
    });
  };

  const startTimer = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/time-entries/start', {
        taskId,
        description
      });
      setRunningTimer(response.data);
      setDescription('');
      message.success('Timer started');
      if (onTimeUpdate) onTimeUpdate();
    } catch (error) {
      message.error('Failed to start timer');
    } finally {
      setLoading(false);
    }
  };

  const stopTimer = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/time-entries/stop/${runningTimer.id}`);
      setRunningTimer(null);
      fetchTimeEntries();
      message.success('Timer stopped');
      if (onTimeUpdate) onTimeUpdate();
    } catch (error) {
      message.error('Failed to stop timer');
    } finally {
      setLoading(false);
    }
  };

  const deleteTimeEntry = async (entryId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/time-entries/${entryId}`);
      fetchTimeEntries();
      message.success('Time entry deleted');
      if (onTimeUpdate) onTimeUpdate();
    } catch (error) {
      message.error('Failed to delete time entry');
    } finally {
      setLoading(false);
    }
  };

  const updateTimeEntry = async () => {
    try {
      setLoading(true);
      await axios.put(`/api/time-entries/${editingEntry.id}`, {
        description
      });
      setIsModalVisible(false);
      setEditingEntry(null);
      setDescription('');
      fetchTimeEntries();
      message.success('Time entry updated');
      if (onTimeUpdate) onTimeUpdate();
    } catch (error) {
      message.error('Failed to update time entry');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const showEditModal = (entry) => {
    setEditingEntry(entry);
    setDescription(entry.description || '');
    setIsModalVisible(true);
  };

  return (
    <div className="time-tracker">
      <Card title="Time Tracking" className="time-tracker-card">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Statistic
              title="Total Time"
              value={formatDuration(summary.totalTime)}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Average Time"
              value={formatDuration(summary.averageTime)}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Entries"
              value={summary.entriesCount}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
        </Row>

        <div className="timer-controls" style={{ marginTop: 16 }}>
          {!runningTimer ? (
            <Space>
              <TextArea
                placeholder="What are you working on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: 300 }}
              />
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={startTimer}
                loading={loading}
              >
                Start Timer
              </Button>
            </Space>
          ) : (
            <Space>
              <Tag color="processing" icon={<ClockCircleOutlined />}>
                Running: {formatDuration(Math.floor((Date.now() - new Date(runningTimer.start_time).getTime()) / 60000))}
              </Tag>
              <Button
                danger
                icon={<PauseCircleOutlined />}
                onClick={stopTimer}
                loading={loading}
              >
                Stop Timer
              </Button>
            </Space>
          )}
        </div>

        <List
          className="time-entries-list"
          loading={loading}
          itemLayout="horizontal"
          dataSource={timeEntries}
          renderItem={(entry) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => showEditModal(entry)}
                />,
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteTimeEntry(entry.id)}
                />
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <ClockCircleOutlined />
                    {formatDuration(entry.duration)}
                  </Space>
                }
                description={
                  <Space direction="vertical">
                    <span>{entry.description || 'No description'}</span>
                    <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                      {moment(entry.start_time).format('MMM D, YYYY HH:mm')}
                    </span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Edit Time Entry"
        open={isModalVisible}
        onOk={updateTimeEntry}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingEntry(null);
          setDescription('');
        }}
        confirmLoading={loading}
      >
        <TextArea
          placeholder="What were you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </Modal>

      <style jsx>{`
        .time-tracker {
          margin-bottom: 24px;
        }
        .time-tracker-card {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .timer-controls {
          margin-bottom: 24px;
        }
        .time-entries-list {
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
};

export default TimeTracker; 