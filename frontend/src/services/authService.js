import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.id);
    return user;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred during login' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  return token ? { token } : null;
}; 