import React, { useState, useEffect } from 'react';
import { List, Card, Button, Modal, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import axios from 'axios';
import ProjectForm from './ProjectForm';
import ProjectMembers from './ProjectMembers';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      message.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (values) => {
    try {
      setLoading(true);
      await axios.post('/api/projects', values);
      message.success('Project created successfully');
      setModalVisible(false);
      fetchProjects();
    } catch (error) {
      message.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (values) => {
    try {
      setLoading(true);
      await axios.put(`/api/projects/${selectedProject.id}`, values);
      message.success('Project updated successfully');
      setModalVisible(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      message.error('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`/api/projects/${projectId}`);
      message.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      message.error('Failed to delete project');
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  const handleMembers = (projectId) => {
    setCurrentProjectId(projectId);
    setMembersModalVisible(true);
  };

  const getProjectRole = (project) => {
    if (project.is_owner) return 'Owner';
    if (project.is_admin) return 'Admin';
    return 'Member';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Owner':
        return 'gold';
      case 'Admin':
        return 'red';
      case 'Member':
        return 'blue';
      default:
        return 'default';
    }
  };

  return (
    <div className="project-list">
      <div className="project-header">
        <h2>Projects</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedProject(null);
            setModalVisible(true);
          }}
        >
          New Project
        </Button>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={projects}
        loading={loading}
        renderItem={(project) => (
          <List.Item>
            <Card
              title={project.name}
              extra={
                <Space>
                  <Button
                    type="text"
                    icon={<TeamOutlined />}
                    onClick={() => handleMembers(project.id)}
                  />
                  {project.is_owner && (
                    <>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(project)}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteProject(project.id)}
                      />
                    </>
                  )}
                </Space>
              }
            >
              <p>{project.description}</p>
              <Tag color={getRoleColor(getProjectRole(project))}>
                {getProjectRole(project)}
              </Tag>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={selectedProject ? 'Edit Project' : 'New Project'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedProject(null);
        }}
        footer={null}
      >
        <ProjectForm
          initialValues={selectedProject}
          onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
          loading={loading}
        />
      </Modal>

      <Modal
        title="Project Members"
        open={membersModalVisible}
        onCancel={() => setMembersModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentProjectId && (
          <ProjectMembers
            projectId={currentProjectId}
            isOwner={projects.find(p => p.id === currentProjectId)?.is_owner}
            onMemberChange={fetchProjects}
          />
        )}
      </Modal>

      <style jsx>{`
        .project-list {
          padding: 24px;
        }
        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default ProjectList; 