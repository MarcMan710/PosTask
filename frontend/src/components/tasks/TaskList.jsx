import React, { useState, useEffect } from 'react';
import { List, Card, Button, Modal, message, Space, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';

const { Option } = Select;

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      message.error('Failed to fetch projects');
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const url = selectedProject
        ? `/api/projects/${selectedProject}/tasks`
        : '/api/tasks';
      const response = await axios.get(url);
      setTasks(response.data);
    } catch (error) {
      message.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (values) => {
    try {
      setLoading(true);
      await axios.post('/api/tasks', values);
      message.success('Task created successfully');
      setModalVisible(false);
      fetchTasks();
    } catch (error) {
      message.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (values) => {
    try {
      setLoading(true);
      await axios.put(`/api/tasks/${selectedTask.id}`, values);
      message.success('Task updated successfully');
      setModalVisible(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      message.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      message.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      message.error('Failed to delete task');
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'blue';
      default:
        return 'default';
    }
  };

  return (
    <div className="task-list">
      <div className="task-header">
        <h2>Tasks</h2>
        <Space>
          <Select
            style={{ width: 200 }}
            placeholder="Filter by project"
            allowClear
            value={selectedProject}
            onChange={setSelectedProject}
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedTask(null);
              setModalVisible(true);
            }}
          >
            New Task
          </Button>
        </Space>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={tasks}
        loading={loading}
        renderItem={(task) => (
          <List.Item>
            <Card
              title={task.title}
              extra={
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(task)}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteTask(task.id)}
                  />
                </Space>
              }
            >
              <p>{task.description}</p>
              <Space>
                <Tag color={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </Tag>
                <Tag color={getPriorityColor(task.priority)}>
                  {task.priority.toUpperCase()}
                </Tag>
              </Space>
              <div className="task-meta">
                <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
                <p>Assigned to: {task.assigned_to_name || 'Unassigned'}</p>
              </div>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={selectedTask ? 'Edit Task' : 'New Task'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedTask(null);
        }}
        footer={null}
        width={800}
      >
        <TaskForm
          initialValues={selectedTask}
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
          loading={loading}
        />
      </Modal>

      <style jsx>{`
        .task-list {
          padding: 24px;
        }
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .task-meta {
          margin-top: 16px;
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
        }
      `}</style>
    </div>
  );
};

export default TaskList; 