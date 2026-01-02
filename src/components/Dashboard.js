// Dashboard.js - Updated with User Management
import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  HardDrive,
  Package,
  TrendingUp,
  Users,
  LogOut,
  Home,
  RefreshCw,
  Settings,
  Sparkles,
  Phone,
} from "lucide-react";
// Import page components
import AnalyticsPage from "./AnalyticsPage";
import ClientsPage from "./ClientsPage";
import UsersPage from "./UsersPage";
import UserLogsPage from "./UserLogsPage";
import UserMeetingsPage from "./UserMeetingsPage";
import UserExpensesPage from "./UserExpensesPage";
import UserManagementPage from "./UserManagementPage";
import ClientServicesPage from './ClientServicesPage';
import ClientServicesModal from './ClientServicesModal';
import BillingPlansPage from "./BillingPlansPage";
import BillingHistoryPage from "./BillingHistoryPage";

const API_BASE_URL = "https://geo-track-1.onrender.com";

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState("analytics");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [profileOpen, setProfileOpen] = useState(false);

  // clients + pagination
  const [clients, setClients] = useState([]);
  const [clientsPage, setClientsPage] = useState(1);
  const CLIENTS_PER_PAGE = 50;
  const [clientsTotalPages, setClientsTotalPages] = useState(1);
  const [clientsTotal, setClientsTotal] = useState(0);

  // users
  const [users, setUsers] = useState([]);
  const [userExpenses] = useState({});
  const [userClockIns] = useState({});
  const [userMeetings] = useState({});

  // user detail pages
  const [locationLogs] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [meetingsPagination, setMeetingsPagination] = useState({ 
    page: 1, limit: 20, total: 0, totalPages: 1 
  });
  const [expenses, setExpenses] = useState([]);
  const [expensesPagination, setExpensesPagination] = useState({ 
    page: 1, limit: 20, total: 0, totalPages: 1 
  });

  //clientservicestate
  const [selectedClientForServices, setSelectedClientForServices] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [billingOpen, setBillingOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState(null);


  // auto-open Billing menu when a billing page is active
  useEffect(() => {
    if (currentPage === "billingPlans" || currentPage === "billingHistory") {
      setBillingOpen(true);
    }
  }, [currentPage]);

  // auth check
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      window.location.href = "/login";
      return;
    }

    try {
      const payload = JSON.parse(atob(storedToken.split(".")[1]));

      if (!payload?.isAdmin) {
        alert("Unauthorized – Admin access only");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      setToken(storedToken);          // ✅ CRITICAL
      setCurrentUserId(payload.id);
    } catch (e) {
      alert("Invalid token. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  // ➕ OUTSIDE CLICK CLOSE
  useEffect(() => {
    const handler = (e) => {
      if (profileOpen && !e.target.closest(".profile-dropdown")) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const [token, setToken] = useState(null);

  // [All fetch functions - keeping them the same]
  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    try {
      const analyticsRes = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!analyticsRes.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await analyticsRes.json();

      const clients = data?.clients ?? {};
      const users = data?.users ?? {};
      const locations = data?.locations ?? {};

      const totalClients = Number(clients.total_clients ?? 0);
      const withLocation = Number(clients.clients_with_location ?? 0);

      const stats = {
        totalClients,
        activeClients: Number(clients.active_clients ?? 0),
        withCoordinates: withLocation,
        uniquePincodes: Number(clients.unique_pincodes ?? 0),
        totalUsers: Number(users.total_users ?? 0),
        totalLogs: Number(locations.total_logs ?? 0),
        coordinatesCoverage:
          totalClients > 0
            ? ((withLocation / totalClients) * 100).toFixed(1)
            : "0.0",
      };

      // 🔹 Fetch ALL clients for analytics calculations
      const clientsRes = await fetch(
        `${API_BASE_URL}/admin/clients?limit=10000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!clientsRes.ok) {
        throw new Error("Failed to fetch clients for analytics");
      }

      const clientsData = await clientsRes.json();

      console.log("Clients analytics response:", clientsData);

      if (!Array.isArray(clientsData.clients)) {
        throw new Error("Clients list missing or invalid");
      }

      const allClients = clientsData.clients;

      const trends = calculateTrends(allClients);
      const distribution = calculateDistribution(allClients);

      setAnalyticsData({ stats, trends, distribution });
      setError(null); // clear previous errors
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Failed to load analytics.");
    }
  }, [token]);

  const fetchClients = useCallback(
    async (page = 1, limit = CLIENTS_PER_PAGE) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/clients?page=${page}&limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch clients");

        const data = await response.json();

        setClients(data.clients || []);

        if (data.pagination) {
          setClientsPage(data.pagination.page || page);
          setClientsTotalPages(data.pagination.totalPages || 1);
          setClientsTotal(
            data.pagination.total || (data.clients || []).length
          );
        }
      } catch (err) {
        console.error("Clients error:", err);
        setError("Failed to load clients.");
      }
    },[token]);


  // ✅ fetchUsers FIRST
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Users error:", err);
    }
  }, [token]);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sync/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch sync status");

      const data = await response.json();
      setSyncStatus(data.lastSync);
    } catch (err) {
      console.error("Sync status error:", err);
      setSyncStatus(null);
    }
  }, [token]);

  // ✅ fetchData SECOND
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      if (currentPage === "analytics") {
        await Promise.all([fetchAnalytics(), fetchSyncStatus()]);
      } 
      else if (currentPage === "clients") {
        await fetchClients(clientsPage, CLIENTS_PER_PAGE); // ✅ ADD THIS
      }
      else if (currentPage === "users") {
        await fetchUsers();
      }
    } finally {
      setLoading(false);
    }
  }, [token, currentPage,fetchAnalytics,fetchSyncStatus,fetchUsers,fetchClients,clientsPage]);

  // ✅ effect #1
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (currentPage !== "users" && currentPage !== "userManagement") return;

    const interval = setInterval(() => {
      fetchUsers();
    }, 60000);

    return () => clearInterval(interval);
  }, [currentPage, fetchUsers]);

  // const fetchAllUserExpenses = async () => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/admin/expenses/summary`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     if (!response.ok) {
  //       setUserExpenses({});
  //       return;
  //     }
  //     const data = await response.json();
  //     const map = {};
  //     (data.summary || []).forEach((row) => {
  //       map[row.id] = Number(row.total_expense) || 0;
  //     });
  //     setUserExpenses(map);
  //   } catch (err) {
  //     console.error("Failed to fetch expenses:", err);
  //   }
  // };

  // const fetchAllUserMeetingsSummary = async () => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/admin/meetings/summary/all`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     if (!response.ok) return;
  //     const data = await response.json();
  //     const map = {};
  //     (data.summary || []).forEach((row) => {
  //       map[row.id] = {
  //         total: Number(row.total_meetings) || 0,
  //         completed: Number(row.completed_meetings) || 0,
  //         inProgress: Number(row.in_progress_meetings) || 0,
  //       };
  //     });
  //     setUserMeetings((prev) => ({ ...prev, ...map }));
  //   } catch (err) {
  //     console.error("Failed to fetch meetings summary:", err);
  //   }
  // };

  const fetchUserMeetingsDetail = async (page = 1, limit = 20) => {
    if (!selectedUser?.id) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/user-meetings/${selectedUser.id}?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch meetings");
      const data = await response.json();
      const m = data.meetings || [];
      setMeetings(m);
      if (data.pagination) {
        setMeetingsPagination({
          page: data.pagination.page || page,
          limit: data.pagination.limit || limit,
          total: data.pagination.total || m.length,
          totalPages: data.pagination.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Meetings error:", err);
      setMeetings([]);
    }
  };

  const fetchUserExpensesDetail = async (page = 1, limit = 20) => {
    if (!selectedUser?.id) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/user-expenses/${selectedUser.id}?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      const e = data.expenses || [];
      setExpenses(e);
      if (data.pagination) {
        setExpensesPagination({
          page: data.pagination.page || page,
          limit: data.pagination.limit || limit,
          total: data.pagination.total || e.length,
          totalPages: data.pagination.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Expenses error:", err);
      setExpenses([]);
    }
  };

  const calculateTrends = (clients) => {
    const monthlyData = {};
    clients.forEach((client) => {
      const date = new Date(client.created_at);
      if (isNaN(date)) return;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, clients: 0, active: 0, withLocation: 0 };
      }
      monthlyData[monthKey].clients++;
      if (client.status === "active") monthlyData[monthKey].active++;
      if (client.latitude && client.longitude) monthlyData[monthKey].withLocation++;
    });
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map((data) => ({
        month: new Date(data.month + "-01").toLocaleDateString("en-US", { month: "short" }),
        clients: data.clients,
        active: data.active,
        withLocation: data.withLocation,
      }));
  };

  const calculateDistribution = (clients) => {
    const pincodeCount = {};
    clients.forEach((client) => {
      const pincode = client.pincode || "Unknown";
      pincodeCount[pincode] = (pincodeCount[pincode] || 0) + 1;
    });
    return Object.entries(pincodeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name: `Pin: ${name}`, value }));
  };

  const handleViewUserLogs = (user) => {
    setSelectedUser(user);
    setCurrentPage("userLogs");
  };

  const handleViewUserMeetings = (user) => {
    setSelectedUser(user);
    setMeetingsPagination({ page: 1, limit: 20, total: 0, totalPages: 1 });
    setCurrentPage("userMeetings");
  };

  const handleViewUserExpenses = (user) => {
    setSelectedUser(user);
    setExpensesPagination({ page: 1, limit: 20, total: 0, totalPages: 1 });
    setCurrentPage("userExpenses");
  };

  const navItems = [
  { id: "analytics", label: "Dashboard", icon: Home },
  { id: "clients", label: "Clients", icon: FileText },
  { id: "clientServices", label: "Client Services", icon: Package }, // NEW
  { id: "users", label: "Team Activity", icon: Users },
  { id: "userManagement", label: "User Management", icon: Settings },
];

  const handleEditClientServices = (client) => {
  setSelectedClientForServices(client);
};

  return (
    <div className="min-h-screen" style={{ background: '#ecf0f3' }}>
      {/* Neumorphic Sidebar */}
      <aside 
        className="fixed top-0 left-0 h-full w-72 p-6"
        style={{ 
          background: '#ecf0f3',
        }}
      >
        {/* Logo */}
        <div 
          className="mb-10 p-6 rounded-3xl flex items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '9px 9px 16px rgba(163,177,198,0.6)',
          }}
        >
          <img src="/logo.png" alt="GeoTrack" className="w-12 h-12 object-contain" />
          <span className="text-2xl font-bold text-white">GeoTrack</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className="w-full p-5 rounded-2xl flex items-center gap-4 transition-all duration-200"
                style={
                  isActive
                    ? {
                        background: '#e6eaf0',
                        boxShadow: 'inset 8px 8px 16px #c5c8cf, inset -8px -8px 16px #ffffff',
                      }
                    : {
                        background: '#e6eaf0',
                        boxShadow: '8px 8px 16px #c5c8cf, -8px -8px 16px #ffffff',
                      }
                }
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ color: isActive ? '#667eea' : '#718096' }}
                />
                <span 
                  className="font-semibold text-base"
                  style={{ color: isActive ? '#667eea' : '#718096' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Pricing & Billing */}
        <div className="mt-4">
          <button
            onClick={() => setBillingOpen(prev => !prev)}
            className="w-full p-5 rounded-2xl flex items-center gap-4"
            style={{
              background: '#e6eaf0',
              boxShadow: '8px 8px 16px #c5c8cf, -8px -8px 16px #ffffff',
            }}
          >
            <Package className="w-6 h-6 text-slate-600" />
            <span className="font-semibold text-slate-700">
              Pricing & Billing
            </span>
          </button>

          {billingOpen && (
            <div className="ml-6 mt-3 space-y-2">
              <button
                onClick={() => setCurrentPage("billingPlans")}
                className="w-full text-left px-4 py-2 rounded-xl text-sm transition"
                style={{
                  background:
                    currentPage === "billingPlans"
                      ? "#dfe6f3"
                      : "#ecf0f3",
                  fontWeight: currentPage === "billingPlans" ? "600" : "400",
                }}
              >
                • Plans
              </button>

              <button
                onClick={() => setCurrentPage("billingHistory")}
                className="w-full text-left px-4 py-2 rounded-xl text-sm transition"
                style={{
                  background:
                    currentPage === "billingHistory"
                      ? "#dfe6f3"
                      : "#ecf0f3",
                  fontWeight: currentPage === "billingHistory" ? "600" : "400",
                }}
              >
                • History
              </button>
            </div>
          )}
        </div>



        {/* Sidebar Metric */}
        <div
          className="absolute bottom-8 left-6 right-6 p-5 rounded-2xl"
          style={{
            background: '#e6eaf0',
            boxShadow: '8px 8px 16px #c5c8cf, -8px -8px 16px #ffffff',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">
                Storage Used
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
                62%
            </span>
          </div>

          {/* Progress Bar */}
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{
              background: '#d1d9e6',
              boxShadow: 'inset 2px 2px 4px #c5c8cf, inset -2px -2px 4px #ffffff',
            }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: '62%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
              }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            6.2 GB of 10 GB used
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 p-6 max-h-screen overflow-y-auto">
        {/* Page Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#1e293b' }}>
              {currentPage === "analytics" && "Dashboard Overview"}
              {currentPage === "clients" && "Client Management"}
              {currentPage === "clientServices" && "Client Services"}
              {currentPage === "users" && "Team Activity"}
              {currentPage === "userManagement" && "User Management"}
              {currentPage === "userLogs" && "Location Tracking"}
              {currentPage === "userMeetings" && "Meeting History"}
              {currentPage === "userExpenses" && "Expense Reports"}
              {currentPage === "billingPlans" && "Pricing Plans"}
              {currentPage === "billingHistory" && "Billing History"}
            </h1>
            <p style={{ color: '#64748b' }}>
              {currentPage === "analytics" && "Monitor your business performance"}
              {currentPage === "clients" && "View and manage all your clients"}
              {currentPage === "clientServices" && "Manage all client service subscriptions"}
              {currentPage === "users" && "Track your team members"}
              {currentPage === "userManagement" && "Add, edit, and manage user accounts"}
              {currentPage === "userLogs" && "Detailed location history"}
              {currentPage === "userMeetings" && "Complete meeting logs"}
              {currentPage === "userExpenses" && "Track and review expenses"}
              {currentPage === "billingPlans" && "Manage and view all available subscription plans"}
              {currentPage === "billingHistory" && "View your past billing and invoices"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {currentPage === "analytics" && syncStatus && (
              <button 
                onClick={fetchData}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '4px 4px 8px rgba(102, 126, 234, 0.4)',
                }}
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </button>
            )}

            {/* PROFILE DROPDOWN */}
            <div className="relative profile-dropdown">
              <button
                onClick={() => setProfileOpen(p => !p)}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: '#e6eaf0',
                  boxShadow: '6px 6px 12px #c5c8cf, -6px -6px 12px #ffffff',
                }}
              >
                <Users className="w-5 h-5 text-slate-600" />
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 mt-4 w-64 rounded-2xl p-4 z-50"
                  style={{
                    background: '#ecf0f3',
                    boxShadow: '8px 8px 16px #c5c8cf, -8px -8px 16px #ffffff',
                  }}
                >
                  {/* Header */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                      Admin Account
                    </p>
                    <p className="text-xs" style={{ color: '#64748b' }}>
                      Billing & access
                    </p>
                  </div>

                  {/* Upgrade */}
                  <button
                    className="w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all hover:scale-[1.02]"
                    style={{
                      background: '#ecf0f3',
                      boxShadow:
                        'inset 4px 4px 8px rgba(163,177,198,0.45), inset -4px -4px 8px rgba(255,255,255,0.8)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        boxShadow: '3px 3px 6px rgba(102,126,234,.4)',
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      Upgrade Plan
                    </span>
                  </button>

                  {/* Contact Sales */}
                  <button
                    className="w-full flex items-center gap-3 p-3 rounded-xl mb-3 transition-all hover:scale-[1.02]"
                    style={{
                      background: '#ecf0f3',
                      boxShadow:
                        'inset 4px 4px 8px rgba(163,177,198,0.45), inset -4px -4px 8px rgba(255,255,255,0.8)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: '#e6eaf0',
                        boxShadow: 'inset 2px 2px 4px #c5c8cf, inset -2px -2px 4px #ffffff',
                      }}
                    >
                      <Phone className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      Contact Sales
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="my-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />

                  {/* Logout */}
                  <button
                    onClick={() => {
                      // ✅ Clear all auth data
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      

                      // Optional: clear everything (safe for admin apps)
                      // localStorage.clear();

                      window.location.href = "/login";
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
                    style={{
                      background: '#ecf0f3',
                      boxShadow:
                        'inset 4px 4px 8px rgba(163,177,198,0.45), inset -4px -4px 8px rgba(255,255,255,0.8)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: '#fee2e2',
                        boxShadow: '2px 2px 4px rgba(239,68,68,.3)',
                      }}
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      Logout
                    </span>
                  </button>

                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div 
            className="mb-6 p-5 rounded-2xl border-l-4"
            style={{
              background: '#fed7d7',
              borderColor: '#fc8181',
              boxShadow: '8px 8px 16px #c5c8cf, -8px -8px 16px #ffffff'
            }}
          >
            <p style={{ color: '#c53030' }} className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: '#e6eaf0',
                boxShadow: 'inset 8px 8px 16px #c5c8cf, inset -8px -8px 16px #ffffff',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              <TrendingUp className="w-8 h-8" style={{ color: '#667eea' }} />
            </div>
            <p className="mt-6 font-medium" style={{ color: '#718096' }}>Loading your data...</p>
          </div>
        ) : currentPage === "analytics" && analyticsData ? (
          <AnalyticsPage
            analyticsData={analyticsData}
            syncStatus={syncStatus}
            onRefresh={fetchData}
          />
        ) : currentPage === "analytics" ? (
          <div className="p-6 text-slate-600">No analytics data available</div>
        ): currentPage === "clients" ? (
          <ClientsPage
            clients={clients}
            clientsPage={clientsPage}
            clientsTotalPages={clientsTotalPages}
            clientsTotal={clientsTotal}
            onRefresh={() => fetchClients(clientsPage, CLIENTS_PER_PAGE)}
            onPageChange={setClientsPage}
            onEditServices={handleEditClientServices}
          />
        ) : currentPage === "clientServices" ? (
          <ClientServicesPage
            onRefresh={fetchData}
            onEditServices={handleEditClientServices}
          />
        ) : currentPage === "users" ? (
          <UsersPage
            users={users}
            userClockIns={userClockIns}
            userExpenses={userExpenses}
            userMeetings={userMeetings}
            onRefresh={fetchUsers}
            onViewLogs={handleViewUserLogs}
            onViewMeetings={handleViewUserMeetings}
            onViewExpenses={handleViewUserExpenses}
                      />
        ) : currentPage === "userManagement" ? (
          <UserManagementPage
            users={users}
            currentUserId={currentUserId}
            onRefresh={fetchUsers}
          />
        ) : currentPage === "userLogs" ? (
          <UserLogsPage
            selectedUser={selectedUser}
            locationLogs={locationLogs}
            onBack={() => setCurrentPage("users")}
            onRefresh={fetchUsers}
          />
        ) : currentPage === "userMeetings" ? (
          <UserMeetingsPage
            selectedUser={selectedUser}
            meetings={meetings}
            pagination={meetingsPagination}
            onBack={() => setCurrentPage("users")}
            onRefresh={() =>
              fetchUserMeetingsDetail(
                meetingsPagination.page,
                meetingsPagination.limit
              )
            }
            onPageChange={(page) =>
              fetchUserMeetingsDetail(page, meetingsPagination.limit)
            }
          />
        ) : currentPage === "userExpenses" ? (
          <UserExpensesPage
            selectedUser={selectedUser}
            expenses={expenses}
            pagination={expensesPagination}
            onBack={() => setCurrentPage("users")}
            onRefresh={() =>
              fetchUserExpensesDetail(
                expensesPagination.page,
                expensesPagination.limit
              )
            }
            onPageChange={(page) =>
              fetchUserExpensesDetail(page, expensesPagination.limit)
            }
          />
        ) : currentPage === "billingPlans" ? (
          <BillingPlansPage />
        ) : currentPage === "billingHistory" ? (
          <BillingHistoryPage />
        ): null}

          {selectedClientForServices && (
            <ClientServicesModal
              client={selectedClientForServices}
              onClose={() => setSelectedClientForServices(null)}
            />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
