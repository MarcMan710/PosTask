import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { TaskProvider } from './contexts/TaskContext';
import { SubtaskProvider } from './contexts/SubtaskContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GamificationProvider } from './contexts/GamificationContext';
import Navbar from './components/common/Navbar';
import ThemeToggle from './components/common/ThemeToggle';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load components
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const TaskList = lazy(() => import('./components/tasks/TaskList'));
const TaskForm = lazy(() => import('./components/tasks/TaskForm'));
const ProjectList = lazy(() => import('./components/projects/ProjectList'));
const Achievements = lazy(() => import('./components/gamification/Achievements'));
const Leaderboard = lazy(() => import('./components/gamification/Leaderboard'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ProjectProvider>
            <TaskProvider>
              <SubtaskProvider>
                <GamificationProvider>
                  <Router>
                    <div className="min-h-screen bg-light-primary dark:bg-dark-primary transition-colors duration-200">
                      <Navbar />
                      <div className="flex">
                        <div className="w-1/4 p-4 border-r border-light-tertiary dark:border-dark-tertiary bg-light-secondary dark:bg-dark-secondary min-h-screen transition-colors duration-200">
                          <Suspense fallback={<LoadingSpinner />}>
                            <ProjectList />
                          </Suspense>
                        </div>
                        <main className="flex-1 p-4">
                          <div className="absolute top-4 right-4">
                            <ThemeToggle />
                          </div>
                          <Suspense fallback={<LoadingSpinner />}>
                            <Routes>
                              <Route path="/login" element={<Login />} />
                              <Route path="/register" element={<Register />} />
                              <Route
                                path="/"
                                element={
                                  <ProtectedRoute>
                                    <TaskList />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/create"
                                element={
                                  <ProtectedRoute>
                                    <TaskForm />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/edit/:id"
                                element={
                                  <ProtectedRoute>
                                    <TaskForm />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/achievements"
                                element={
                                  <ProtectedRoute>
                                    <Achievements />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/leaderboard"
                                element={
                                  <ProtectedRoute>
                                    <Leaderboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                          </Suspense>
                        </main>
                      </div>
                    </div>
                  </Router>
                </GamificationProvider>
              </SubtaskProvider>
            </TaskProvider>
          </ProjectProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
