import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const SubtaskContext = createContext();

export const useSubtask = () => useContext(SubtaskContext);

export const SubtaskProvider = ({ children }) => {
  const [subtasks, setSubtasks] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api/subtasks';

  const fetchSubtasks = async (taskId) => {
    try {
      setLoading(prev => ({ ...prev, [taskId]: true }));
      const response = await axios.get(`${API_URL}/task/${taskId}`);
      setSubtasks(prev => ({ ...prev, [taskId]: response.data }));
      setLoading(prev => ({ ...prev, [taskId]: false }));
    } catch (err) {
      setError('Failed to fetch subtasks');
      setLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const createSubtask = async (taskId, subtaskData) => {
    try {
      const response = await axios.post(API_URL, { ...subtaskData, task_id: taskId });
      setSubtasks(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), response.data]
      }));
      return response.data;
    } catch (err) {
      setError('Failed to create subtask');
      throw err;
    }
  };

  const updateSubtask = async (id, subtaskData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, subtaskData);
      const taskId = response.data.task_id;
      setSubtasks(prev => ({
        ...prev,
        [taskId]: prev[taskId].map(subtask =>
          subtask.id === id ? response.data : subtask
        )
      }));
      return response.data;
    } catch (err) {
      setError('Failed to update subtask');
      throw err;
    }
  };

  const deleteSubtask = async (id, taskId) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSubtasks(prev => ({
        ...prev,
        [taskId]: prev[taskId].filter(subtask => subtask.id !== id)
      }));
    } catch (err) {
      setError('Failed to delete subtask');
      throw err;
    }
  };

  const reorderSubtasks = async (taskId, startPosition, endPosition) => {
    try {
      const response = await axios.post(`${API_URL}/task/${taskId}/reorder`, {
        startPosition,
        endPosition
      });
      setSubtasks(prev => ({
        ...prev,
        [taskId]: response.data
      }));
    } catch (err) {
      setError('Failed to reorder subtasks');
      throw err;
    }
  };

  const value = {
    subtasks,
    loading,
    error,
    fetchSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    reorderSubtasks
  };

  return (
    <SubtaskContext.Provider value={value}>
      {children}
    </SubtaskContext.Provider>
  );
}; 