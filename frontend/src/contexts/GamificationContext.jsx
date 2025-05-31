import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
  const [userProgress, setUserProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProgress = async () => {
    try {
      const response = await axios.get('/api/gamification/progress');
      setUserProgress(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch progress');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/gamification/leaderboard');
      setLeaderboard(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch leaderboard');
    }
  };

  const updateTaskProgress = async () => {
    try {
      const response = await axios.post('/api/gamification/task-progress');
      await fetchUserProgress(); // Refresh progress after update
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task progress');
      throw err;
    }
  };

  const updateStreak = async () => {
    try {
      const response = await axios.post('/api/gamification/streak');
      await fetchUserProgress(); // Refresh progress after update
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update streak');
      throw err;
    }
  };

  useEffect(() => {
    const initializeGamification = async () => {
      setLoading(true);
      await Promise.all([fetchUserProgress(), fetchLeaderboard()]);
      setLoading(false);
    };

    initializeGamification();
  }, []);

  const value = {
    userProgress,
    leaderboard,
    loading,
    error,
    updateTaskProgress,
    updateStreak,
    refreshProgress: fetchUserProgress,
    refreshLeaderboard: fetchLeaderboard
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}; 