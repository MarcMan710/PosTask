import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tagId => params.append('tags', tagId));
      }

      const response = await axios.get(`/api/tasks?${params.toString()}`);
      setTasks(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/tasks', taskData);
      setTasks(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/tasks/${id}`, taskData);
      setTasks(prev => prev.map(task => task.id === id ? response.data : task));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderTasks = async (positions) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post('/api/tasks/reorder', { positions });
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Error reordering tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext; 