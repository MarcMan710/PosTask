import React, { useState, useEffect } from 'react';
import { Card, List, Button, Select, message, Modal, Avatar, Tag, Tooltip } from 'antd';
import { UserAddOutlined, UserDeleteOutlined, CrownOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const ProjectMembers = ({ projectId, isOwner, onMemberChange }) => {
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchUsers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/members`);
      setMembers(response.data);
    } catch (error) {
      message.error('Failed to fetch project members');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      message.error('Failed to fetch users');
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) {
      message.error('Please select a user');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/api/projects/${projectId}/members`, {
        userId: selectedUser
      });
      message.success('Member added successfully');
      setAddMemberModalVisible(false);
      setSelectedUser(null);
      fetchMembers();
      if (onMemberChange) onMemberChange();
    } catch (error) {
      message.error('Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axios.delete(`/api/projects/${projectId}/members/${memberId}`);
      message.success('Member removed successfully');
      fetchMembers();
      if (onMemberChange) onMemberChange();
    } catch (error) {
      message.error('Failed to remove member');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await axios.put(`/api/projects/${projectId}/members/${memberId}`, {
        role: newRole
      });
      message.success('Member role updated successfully');
      fetchMembers();
      if (onMemberChange) onMemberChange();
    } catch (error) {
      message.error('Failed to update member role');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'gold';
      case 'admin':
        return 'red';
      case 'member':
        return 'blue';
      default:
        return 'default';
    }
  };

  return (
    <Card
      title="Project Members"
      extra={
        isOwner && (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setAddMemberModalVisible(true)}
          >
            Add Member
          </Button>
        )
      }
    >
      <List
        className="member-list"
        itemLayout="horizontal"
        dataSource={members}
        renderItem={(member) => (
          <List.Item
            actions={
              isOwner && member.role !== 'owner'
                ? [
                    <Select
                      value={member.role}
                      onChange={(value) => handleRoleChange(member.id, value)}
                      style={{ width: 100 }}
                    >
                      <Option value="admin">Admin</Option>
                      <Option value="member">Member</Option>
                    </Select>,
                    <Tooltip title="Remove Member">
                      <Button
                        type="text"
                        danger
                        icon={<UserDeleteOutlined />}
                        onClick={() => handleRemoveMember(member.id)}
                      />
                    </Tooltip>
                  ]
                : []
            }
          >
            <List.Item.Meta
              avatar={
                <Avatar>
                  {member.username.charAt(0).toUpperCase()}
                </Avatar>
              }
              title={
                <span>
                  {member.username}
                  {member.role === 'owner' && (
                    <CrownOutlined style={{ marginLeft: 8, color: '#faad14' }} />
                  )}
                </span>
              }
              description={
                <Tag color={getRoleColor(member.role)}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Tag>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title="Add Project Member"
        open={addMemberModalVisible}
        onOk={handleAddMember}
        onCancel={() => {
          setAddMemberModalVisible(false);
          setSelectedUser(null);
        }}
        confirmLoading={loading}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a user"
          value={selectedUser}
          onChange={setSelectedUser}
        >
          {users
            .filter(user => !members.some(member => member.user_id === user.id))
            .map(user => (
              <Option key={user.id} value={user.id}>
                {user.username}
              </Option>
            ))}
        </Select>
      </Modal>

      <style jsx>{`
        .member-list {
          max-height: 400px;
          overflow-y: auto;
        }
      `}</style>
    </Card>
  );
};

export default ProjectMembers; 