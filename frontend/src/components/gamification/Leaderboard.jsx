import React from 'react';
import { useGamification } from '../contexts/GamificationContext';

const Leaderboard = () => {
  const { leaderboard, loading, error } = useGamification();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-6">
        Leaderboard
      </h2>
      <div className="space-y-4">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.userId}
            className={`flex items-center justify-between p-4 rounded-lg ${
              index === 0
                ? 'bg-yellow-100 dark:bg-yellow-900'
                : index === 1
                ? 'bg-gray-100 dark:bg-gray-800'
                : index === 2
                ? 'bg-orange-100 dark:bg-orange-900'
                : 'bg-light-primary dark:bg-dark-primary'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0
                    ? 'bg-yellow-500 text-white'
                    : index === 1
                    ? 'bg-gray-400 text-white'
                    : index === 2
                    ? 'bg-orange-500 text-white'
                    : 'bg-primary-500 text-white'
                }`}
              >
                {index + 1}
              </div>
              <div>
                <div className="font-semibold text-light-primary dark:text-dark-primary">
                  User {entry.userId.slice(0, 8)}
                </div>
                <div className="text-sm text-light-secondary dark:text-dark-secondary">
                  {entry.achievementsCompleted} achievements
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-primary-500">
              {entry.totalPoints} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard; 