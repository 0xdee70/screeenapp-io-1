import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ScreenRecord from "./pages/ScreenRecord";
import Home from "./pages/Home";
import Registration from "./pages/Register";
import Hero from "./pages/Hero";
import AuthCallback from "./pages/AuthCallback";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";
// import { ThemeProvider } from "./components/ThemeProvider";
// import { ThemeToggle } from "./components/Toggle";
import NotFound from "./pages/Notfound";
import ProtectedRoute from "./components/PrivateRoute";
import MasterAdminDashboard from "./pages/MasterAdminDashboard";
import MasterAdminLogin from "./pages/MasterAdminLogin";
import AdminLogin from "./pages/AdminLogin";

export default function App() {
  return (
    // <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <Router>
      {/* <div className="min-h-screen bg-background text-foreground"> */}
      {/* <ThemeToggle /> */}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/screen"
          element={
            <ProtectedRoute requiredRole="user">
              <ScreenRecord />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/master-admin"
          element={
            <ProtectedRoute requiredRole="master_admin">
              <MasterAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
        <Route path="/master-login" element={<MasterAdminLogin />} />
      </Routes>
      {/* </div> */}
    </Router>
    // </ThemeProvider>
  );
}