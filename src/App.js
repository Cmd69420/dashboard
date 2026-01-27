import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import Dashboard from './components/Dashboard';

// Wrapper component to handle company-based routing
function CompanyDashboard() {
  const { companyName } = useParams();
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let userCompanySubdomain = "";

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      isAdmin = payload.isAdmin === true || payload.isSuperAdmin === true;
      userCompanySubdomain = payload.companySubdomain || localStorage.getItem("companySubdomain") || "";
    } catch (e) {
      console.error("Token parse error:", e);
    }
  }

  // If user is not admin or token is invalid, redirect to login
  if (!token || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // If company name in URL doesn't match user's company (and user is not super admin), redirect
  const isSuperAdmin = token && JSON.parse(atob(token.split(".")[1])).isSuperAdmin;
  if (!isSuperAdmin && companyName && companyName !== userCompanySubdomain) {
    return <Navigate to={`/dashboard/${userCompanySubdomain}`} replace />;
  }

  return <Dashboard />;
}

function App() {
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let userCompanySubdomain = "";

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      isAdmin = payload.isAdmin === true || payload.isSuperAdmin === true;
      userCompanySubdomain = payload.companySubdomain || localStorage.getItem("companySubdomain") || "";
    } catch (e) {}
  }

  return (
    <Routes>
      {/* Login page (public) */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Company-based dashboard route */}
      <Route
        path="/dashboard/:companyName"
        element={<CompanyDashboard />}
      />

      {/* Legacy dashboard route - redirect to company-based route */}
      <Route
        path="/dashboard"
        element={
          token && isAdmin && userCompanySubdomain ? (
            <Navigate to={`/dashboard/${userCompanySubdomain}`} replace />
          ) : token && isAdmin ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Default fallback: redirect user to the correct page */}
      <Route
        path="*"
        element={
          <Navigate 
            to={
              token && isAdmin && userCompanySubdomain 
                ? `/dashboard/${userCompanySubdomain}` 
                : token && isAdmin 
                ? "/dashboard" 
                : "/login"
            } 
            replace 
          />
        }
      />
    </Routes>
  );
}

export default App;