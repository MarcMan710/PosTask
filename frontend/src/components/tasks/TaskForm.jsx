import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button } from 'antd';
import moment from 'moment';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { format } from 'date-fns';
import TagSelector from './TagSelector';

const { TextArea } = Input;
const { Option } = Select;

const TaskForm = ({ initialValues, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const { createTask, updateTask, tasks } = useTask();
  const isEditing = Boolean(id);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (form.getFieldValue('project_id')) {
      fetchProjectMembers(form.getFieldValue('project_id'));
    }
  }, [form.getFieldValue('project_id')]);

  useEffect(() => {
    if (isEditing) {
      const task = tasks.find(t => t.id === parseInt(id));
      if (task) {
        form.setFieldsValue({
          ...task,
          due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : null,
          estimated_time: task.estimated_time ? task.estimated_time / 60 : null,
          tags: task.tags || []
        });
      }
    }
  }, [id, isEditing, tasks, form]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchProjectMembers = async (projectId) => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/members`);
      setProjectMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch project members:', error);
    }
  };

  const handleSubmit = async (values) => {
    const formattedValues = {
      ...values,
      due_date: values.due_date.toISOString(),
      estimated_time: values.estimated_time ? values.estimated_time * 60 : null,
    };
    try {
      if (isEditing) {
        await updateTask(parseInt(id), formattedValues);
      } else {
        await createTask(formattedValues);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </h1>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...initialValues,
          due_date: initialValues?.due_date ? moment(initialValues.due_date) : null,
          estimated_time: initialValues?.estimated_time ? initialValues.estimated_time / 60 : null,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="project_id"
          label="Project"
          rules={[{ required: true, message: 'Please select a project' }]}
        >
          <Select
            placeholder="Select a project"
            onChange={(value) => {
              form.setFieldsValue({ assigned_to: undefined });
              fetchProjectMembers(value);
            }}
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter task title' }]}
        >
          <Input placeholder="Enter task title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter task description' }]}
        >
          <TextArea rows={4} placeholder="Enter task description" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select task status' }]}
        >
          <Select placeholder="Select task status">
            <Option value="todo">To Do</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="completed">Completed</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true, message: 'Please select task priority' }]}
        >
          <Select placeholder="Select task priority">
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="due_date"
          label="Due Date"
          rules={[{ required: true, message: 'Please select due date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            showTime
            format="YYYY-MM-DD HH:mm"
            placeholder="Select due date and time"
          />
        </Form.Item>

        <Form.Item
          name="estimated_time"
          label="Estimated Time (hours)"
          rules={[{ type: 'number', min: 0, message: 'Please enter a valid time' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter estimated time in hours"
            step={0.5}
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="assigned_to"
          label="Assigned To"
        >
          <Select
            placeholder="Select assignee"
            allowClear
          >
            {projectMembers.map(member => (
              <Option key={member.user_id} value={member.user_id}>
                {member.username}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TaskForm; 