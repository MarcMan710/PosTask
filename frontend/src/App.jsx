import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import { SubtaskProvider } from './context/SubtaskContext';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import ProjectList from './components/ProjectList';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          <SubtaskProvider>
            <Router>
              <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="flex">
                  <div className="w-1/4 p-4 border-r border-gray-200 bg-white min-h-screen">
                    <ProjectList />
                  </div>
                  <main className="flex-1 p-4">
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
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </Router>
          </SubtaskProvider>
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
