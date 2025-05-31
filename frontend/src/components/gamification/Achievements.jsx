import React from 'react';
import { useGamification } from '../contexts/GamificationContext';

const Achievements = () => {
  const { userProgress, loading, error } = useGamification();

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

  if (!userProgress) {
    return null;
  }

  const { progress, stats } = userProgress;

  return (
    <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg p-6 shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-4">
          Your Progress
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-light-primary dark:bg-dark-primary p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary-500">{stats.totalPoints}</div>
            <div className="text-light-secondary dark:text-dark-secondary">Total Points</div>
          </div>
          <div className="bg-light-primary dark:bg-dark-primary p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary-500">{stats.completedAchievements}</div>
            <div className="text-light-secondary dark:text-dark-secondary">Achievements</div>
          </div>
          <div className="bg-light-primary dark:bg-dark-primary p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary-500">{stats.currentStreak}</div>
            <div className="text-light-secondary dark:text-dark-secondary">Current Streak</div>
          </div>
          <div className="bg-light-primary dark:bg-dark-primary p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary-500">{stats.longestStreak}</div>
            <div className="text-light-secondary dark:text-dark-secondary">Longest Streak</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary mb-4">
          Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {progress.map((item) => (
            <div
              key={item.achievementId}
              className={`bg-light-primary dark:bg-dark-primary p-4 rounded-lg ${
                item.completed ? 'border-2 border-primary-500' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{item.Achievement.icon}</div>
                <div>
                  <h4 className="font-semibold text-light-primary dark:text-dark-primary">
                    {item.Achievement.name}
                  </h4>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    {item.Achievement.description}
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-light-tertiary dark:bg-dark-tertiary rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{
                          width: `${(item.progress / item.Achievement.requirement) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-light-secondary dark:text-dark-secondary mt-1">
                      {item.progress} / {item.Achievement.requirement}
                    </div>
                  </div>
                  {item.completed && (
                    <div className="text-primary-500 text-sm mt-2">
                      +{item.Achievement.points} points
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements; 