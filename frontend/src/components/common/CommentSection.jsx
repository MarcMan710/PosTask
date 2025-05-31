import React, { useState, useEffect } from 'react';
import { Card, List, Input, Button, Avatar, message, Space, Tag, Tooltip } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { TextArea } = Input;

const CommentSection = ({ taskId, onCommentChange }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchComments();
    fetchUsers();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/comments/tasks/${taskId}/comments`);
      setComments(response.data);
    } catch (error) {
      message.error('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      message.error('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`/api/comments/tasks/${taskId}/comments`, {
        content: newComment
      });
      message.success('Comment added successfully');
      setNewComment('');
      fetchComments();
      if (onCommentChange) onCommentChange();
    } catch (error) {
      message.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`/api/comments/comments/${commentId}`);
      message.success('Comment deleted successfully');
      fetchComments();
      if (onCommentChange) onCommentChange();
    } catch (error) {
      message.error('Failed to delete comment');
    }
  };

  const handleMentionSearch = (value, cursorPosition) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const searchTerm = mentionMatch[1].toLowerCase();
      setMentionSearch(searchTerm);
      setFilteredUsers(
        users.filter(user =>
          user.username.toLowerCase().includes(searchTerm)
        )
      );
      setShowMentions(true);
      setMentionPosition({
        top: 20, // Adjust based on your textarea position
        left: (mentionMatch.index + 1) * 8 // Approximate character width
      });
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (username) => {
    const textBeforeMention = newComment.slice(0, newComment.lastIndexOf('@'));
    const textAfterMention = newComment.slice(newComment.lastIndexOf('@') + mentionSearch.length + 1);
    setNewComment(`${textBeforeMention}@${username} ${textAfterMention}`);
    setShowMentions(false);
  };

  const renderCommentContent = (content) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <Tag key={index} color="blue">
            @{username}
          </Tag>
        );
      }
      return part;
    });
  };

  return (
    <Card title="Comments" className="comment-section">
      <div className="comment-input">
        <TextArea
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            handleMentionSearch(e.target.value, e.target.selectionStart);
          }}
          placeholder="Type a comment... Use @ to mention someone"
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
        {showMentions && (
          <div
            className="mention-dropdown"
            style={{
              position: 'absolute',
              top: mentionPosition.top,
              left: mentionPosition.left,
              zIndex: 1000,
              background: 'white',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="mention-item"
                onClick={() => handleMentionSelect(user.username)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  ':hover': { background: '#f5f5f5' }
                }}
              >
                <Avatar size="small" icon={<UserOutlined />} />
                <span style={{ marginLeft: 8 }}>{user.username}</span>
              </div>
            ))}
          </div>
        )}
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          loading={submitting}
          style={{ marginTop: 8 }}
        >
          Comment
        </Button>
      </div>

      <List
        className="comment-list"
        loading={loading}
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={(comment) => (
          <List.Item
            actions={[
              <Button
                type="text"
                danger
                onClick={() => handleDelete(comment.id)}
              >
                Delete
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar icon={<UserOutlined />}>
                  {comment.username.charAt(0).toUpperCase()}
                </Avatar>
              }
              title={
                <Space>
                  <span>{comment.username}</span>
                  <span className="comment-time">
                    {moment(comment.created_at).fromNow()}
                  </span>
                </Space>
              }
              description={renderCommentContent(comment.content)}
            />
          </List.Item>
        )}
      />

      <style jsx>{`
        .comment-section {
          margin-top: 16px;
        }
        .comment-input {
          margin-bottom: 16px;
          position: relative;
        }
        .comment-list {
          max-height: 400px;
          overflow-y: auto;
        }
        .comment-time {
          color: rgba(0, 0, 0, 0.45);
          font-size: 12px;
        }
        .mention-dropdown {
          max-height: 200px;
          overflow-y: auto;
        }
        .mention-item:hover {
          background-color: #f5f5f5;
        }
      `}</style>
    </Card>
  );
};

export default CommentSection; 