import { createContext, useContext, useState } from 'react';
import * as authService from '../api/authService';

const STORAGE_KEY = 'ecommerce_current_user';
const AuthContext = createContext(null);

function readStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(readStoredUser);

  function setSession(user) {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  async function login(email, password) {
    const user = await authService.login(email, password);
    setSession(user);
    return user;
  }

  async function register(name, email, password) {
    const user = await authService.register(name, email, password);
    setSession(user);
    return user;
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = {
    currentUser,
    isAuthenticated: currentUser !== null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
