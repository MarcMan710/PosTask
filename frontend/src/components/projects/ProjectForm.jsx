import React from 'react';
import { Form, Input, Button } from 'antd';

const { TextArea } = Input;

const ProjectForm = ({ initialValues, onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="name"
        label="Project Name"
        rules={[{ required: true, message: 'Please enter project name' }]}
      >
        <Input placeholder="Enter project name" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please enter project description' }]}
      >
        <TextArea rows={4} placeholder="Enter project description" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {initialValues ? 'Update Project' : 'Create Project'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProjectForm; 