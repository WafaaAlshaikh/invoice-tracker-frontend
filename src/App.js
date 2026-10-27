import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/UsersPage";
import PrivateRoute from "./components/PrivateRoute";
import AIDashboard from "./pages/AIDashboard";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
<Route path="/ai-dashboard" element={
  <PrivateRoute>
    <AIDashboard />
  </PrivateRoute>
}/>
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }/>
        {}
        <Route path="/users" element={
          <PrivateRoute requiredRoles={["SUPERUSER", "ROLE_SUPERUSER"]}>
            <UsersPage />
          </PrivateRoute>
        }/>
        {/* ✅ Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;