import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ScreenRecord from "./pages/ScreenRecord";

import Registration from "./pages/Register";
import Hero from "./pages/Hero";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/Notfound";
import ProtectedRoute from "./components/PrivateRoute";
import Features from "./components/Features";

import BusinessSSO from "./pages/BusinessSSO";
import Dashboard from "./pages/Dashboard";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Billing from "./components/Billing";
import "./App.css";



const App = () => {
  return (

    <Router>
      <div className="flex flex-col min-h-screen">

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="user">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* <Route path="/home" element={<Home />} /> */}
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/features" element={<Features />} />
            <Route path="/business-sso" element={<BusinessSSO />} />
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

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />

            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/billing" element={<Billing />} />
          </Routes>
        </main>

      </div>
    </Router>

  );
};

export default App;