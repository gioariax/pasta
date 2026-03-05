import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { SettingsProvider } from './contexts/SettingsContext';
import { DateProvider } from './contexts/DateContext';

import { AppLayout } from './components/layout/AppLayout';
import Transactions from './pages/Transactions';
import Charts from './pages/Charts';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <DateProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/charts" element={<Charts />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </DateProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
