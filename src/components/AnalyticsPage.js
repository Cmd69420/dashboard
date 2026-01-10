import React from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, Tooltip, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Activity, MapPin, Target, Clock,
  AlertCircle, Award, AlertTriangle, CheckCircle, ChevronRight
} from "lucide-react";

// Soft neumorphic card
const NeuCard = ({ children, className = "", pressed = false }) => (
  <div
    className={`rounded-3xl ${className}`}
    style={{
      background: '#E0E5EC',
      boxShadow: pressed 
        ? 'inset 9px 9px 16px rgba(163, 177, 198, 0.6), inset -9px -9px 16px rgba(255, 255, 255, 0.5)'
        : '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)',
    }}
  >
    {children}
  </div>
);

// Icon container with pressed effect
const IconBox = ({ icon: Icon, color, size = "md" }) => {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };
  
  return (
    <div
      className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center`}
      style={{
        background: '#E0E5EC',
        boxShadow: 'inset 9px 9px 16px rgba(163, 177, 198, 0.6), inset -9px -9px 16px rgba(255, 255, 255, 0.5)',
      }}
    >
      <Icon className={`${size === 'lg' ? 'w-8 h-8' : size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'}`} style={{ color }} />
    </div>
  );
};

// Main metric card
const MetricCard = ({ title, value, change, isPositive, icon: Icon, iconColor }) => (
  <NeuCard className="p-6 cursor-pointer hover:translate-y-[-2px] transition-transform">
    <div className="flex justify-between items-start mb-4">
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#A0AEC0' }}>
        {title}
      </span>
      <IconBox icon={Icon} color={iconColor} />
    </div>
    <div className="flex items-baseline gap-3">
      <span className="text-4xl font-black" style={{ color: '#2D3748' }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      {change !== undefined && (
        <span 
          className="flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg"
          style={{
            background: isPositive ? '#D4F4DD' : '#FFD4D4',
            color: isPositive ? '#48BB78' : '#F56565'
          }}
        >
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
  </NeuCard>
);

// Small insight card
const InsightCard = ({ icon: Icon, iconColor, title, value, subtitle, onClick }) => (
  <NeuCard className={`p-4 text-center ${onClick ? 'cursor-pointer hover:translate-y-[-2px]' : ''} transition-transform`}>
    <IconBox icon={Icon} color={iconColor} size="sm" />
    <p className="text-[10px] font-bold uppercase mt-2 mb-1" style={{ color: '#A0AEC0' }}>
      {title}
    </p>
    <p className="text-lg font-bold mb-0.5" style={{ color: '#2D3748' }}>
      {value}
    </p>
    {subtitle && (
      <p className="text-[10px]" style={{ color: '#718096' }}>
        {subtitle}
      </p>
    )}
  </NeuCard>
);

const AnalyticsPage = ({
  analyticsData,
  syncStatus,
  onRefresh,
  onGoToClients,
  onGoToUsers,
  onSelectUser,
}) => {
  if (!analyticsData) return null;
  
  const { stats, trends, distribution } = analyticsData;

  const conversionRate = stats.totalClients > 0
    ? ((stats.activeClients / stats.totalClients) * 100).toFixed(1)
    : "0.0";
  const clientsPerArea = stats.uniquePincodes > 0 
    ? Math.round(stats.totalClients / stats.uniquePincodes) 
    : 0;
  
  const lastMonth = trends?.[trends.length - 1]?.clients ?? 0;
  const prevMonth = trends?.[trends.length - 2]?.clients ?? 0;
  const growth = prevMonth > 0 
    ? (((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1) 
    : 0;

  const clientStatusData = [
    { name: 'Active', value: stats.activeClients, color: '#48BB78' },
    { name: 'Inactive', value: stats.totalClients - stats.activeClients, color: '#ED64A6' }
  ];

  const topAreasData = Array.isArray(distribution) ? distribution.slice(0, 5).map((area, idx) => ({
    ...area,
    displayArea: area.area || 'Unknown',
    percentage: idx === 0 ? 85 : idx === 1 ? 35 : 20,
    gradient: idx === 0 
      ? 'linear-gradient(90deg, #667EEA 0%, #764BA2 100%)'
      : 'linear-gradient(90deg, #9F7AEA 0%, #667EEA 100%)'
  })) : [];
  
  const userLeaderboard = Array.isArray(analyticsData.leaderboard) ? analyticsData.leaderboard : [];

  const inactiveCount = stats.totalClients - stats.activeClients;
  
  const actionItems = [
    {
      icon: AlertTriangle,
      iconBg: '#FCA5A5',
      color: '#EF4444',
      title: `${inactiveCount} clients inactive >30 days`,
      action: 'Review engagement strategy',
      show: inactiveCount > 0
    },
    {
      icon: CheckCircle,
      iconBg: '#86EFAC',
      color: '#10B981',
      title: `${stats.coordinatesCoverage}% GPS coverage`,
      action: stats.coordinatesCoverage > 80 ? 'Excellent coverage across all active sectors!' : 'Needs improvement',
      show: true
    }
  ].filter(item => item.show);

  return (
    <div className="space-y-8" style={{ background: '#E0E5EC', minHeight: '100vh' }}>
      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 gap-8">
        <div onClick={() => onGoToClients()}>
          <MetricCard
            title="Total Clients"
            value={stats.totalClients}
            change={parseFloat(growth)}
            isPositive={growth > 0}
            icon={Users}
            iconColor="#6366F1"
          />
        </div>

        <div onClick={() => onGoToClients()}>
          <MetricCard
            title="Active Rate"
            value={`${conversionRate}%`}
            change={2.3}
            isPositive={true}
            icon={Activity}
            iconColor="#10B981"
          />
        </div>

        <div onClick={() => onGoToClients()}>
          <MetricCard
            title="GPS Coverage"
            value={`${stats.coordinatesCoverage}%`}
            change={5.1}
            isPositive={true}
            icon={MapPin}
            iconColor="#3B82F6"
          />
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-6 gap-6">
        <div onClick={() => onGoToUsers()}>
          <InsightCard
            icon={Users}
            iconColor="#6366F1"
            title="Team Size"
            value={stats.totalUsers}
            subtitle="Active users"
            onClick={() => onGoToUsers()}
          />
        </div>

        <div onClick={() => onGoToClients()}>
          <InsightCard
            icon={MapPin}
            iconColor="#10B981"
            title="Areas"
            value={stats.uniquePincodes}
            subtitle="Unique pincodes"
            onClick={() => onGoToClients()}
          />
        </div>

        <InsightCard
          icon={Target}
          iconColor="#3B82F6"
          title="Density"
          value={clientsPerArea}
          subtitle="Clients per area"
        />

        <div onClick={() => onGoToClients()}>
          <InsightCard
            icon={Activity}
            iconColor="#EC4899"
            title="Inactive"
            value={inactiveCount}
            subtitle="Need attention"
            onClick={() => onGoToClients()}
          />
        </div>

        <div onClick={() => onGoToClients()}>
          <InsightCard
            icon={AlertCircle}
            iconColor="#F97316"
            title="Missing"
            value={stats.totalClients - stats.withCoordinates}
            subtitle="Need geocoding"
            onClick={() => onGoToClients()}
          />
        </div>

        <InsightCard
          icon={Clock}
          iconColor="#8B5CF6"
          title="Total Logs"
          value={`${(stats.totalLogs / 1000).toFixed(1)}K`}
          subtitle="Tracking records"
        />
      </div>

      {/* Action Items */}
      <NeuCard className="p-8 rounded-[40px]">
        <div className="flex items-center gap-4 mb-8">
          <IconBox icon={Target} color="#6366F1" />
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#2D3748' }}>
              Action Items
            </h2>
            <p className="text-sm" style={{ color: '#A0AEC0' }}>
              Important tasks requiring immediate attention
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {actionItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onGoToClients()}
              className="p-4 flex items-center gap-4 group cursor-pointer transition-all hover:translate-x-1"
              style={{
                background: '#E0E5EC',
                boxShadow: 'inset 9px 9px 16px rgba(163, 177, 198, 0.6), inset -9px -9px 16px rgba(255, 255, 255, 0.5)',
                borderRadius: '16px'
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: item.iconBg }}
              >
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <p className="font-bold" style={{ color: '#2D3748' }}>
                  {item.title}
                </p>
                <p className="text-xs" style={{ color: '#A0AEC0' }}>
                  {item.action}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          ))}
        </div>
      </NeuCard>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-8">
        {/* Client Status */}
        <NeuCard className="p-8 rounded-[40px]">
          <h3 className="font-bold mb-6 flex items-center gap-2" style={{ color: '#2D3748' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#48BB78' }} />
            Client Status
          </h3>
          
          <div className="relative flex justify-center py-4">
            <div 
              className="w-48 h-48 rounded-full flex items-center justify-center"
              style={{
                background: '#E0E5EC',
                boxShadow: 'inset 9px 9px 16px rgba(163, 177, 198, 0.6), inset -9px -9px 16px rgba(255, 255, 255, 0.5)',
              }}
            >
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    fill="none"
                    stroke="#48BB78"
                    strokeWidth="18"
                    strokeDasharray={`${(stats.activeClients / stats.totalClients) * 377} 377`}
                    strokeLinecap="round"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    fill="none"
                    stroke="#ED64A6"
                    strokeWidth="18"
                    strokeDasharray={`${((stats.totalClients - stats.activeClients) / stats.totalClients) * 377} 377`}
                    strokeDashoffset={`-${(stats.activeClients / stats.totalClients) * 377}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold" style={{ color: '#2D3748' }}>
                    {stats.totalClients}
                  </p>
                  <p className="text-[10px] uppercase font-bold" style={{ color: '#A0AEC0' }}>
                    Total
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded" style={{ background: '#48BB78' }} />
              <span className="text-xs font-bold" style={{ color: '#2D3748' }}>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded" style={{ background: '#ED64A6' }} />
              <span className="text-xs font-bold" style={{ color: '#2D3748' }}>Inactive</span>
            </div>
          </div>
        </NeuCard>

        {/* Top Areas */}
        <NeuCard className="p-8 rounded-[40px]">
          <h3 className="font-bold mb-6 flex items-center gap-2" style={{ color: '#2D3748' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#6366F1' }} />
            Top Areas
          </h3>
          
          <div className="space-y-8 mt-4">
            {topAreasData.slice(0, 2).map((area, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color: '#A0AEC0' }}>
                    Area {area.displayArea}
                  </span>
                  <span className="text-xs font-bold" style={{ color: '#2D3748' }}>
                    {area.clients} clients
                  </span>
                </div>
                <div 
                  className="h-6 rounded-full overflow-hidden"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: 'inset 9px 9px 16px rgba(163, 177, 198, 0.6), inset -9px -9px 16px rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${area.percentage}%`,
                      background: area.gradient
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </NeuCard>
      </div>

      {/* Top Performers */}
      <NeuCard className="p-8 rounded-[40px]">
        <div className="flex items-center gap-4 mb-8">
          <IconBox icon={Award} color="#F97316" />
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#2D3748' }}>
              Top Performers
            </h2>
            <p className="text-sm" style={{ color: '#A0AEC0' }}>
              Best team members this month
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {userLeaderboard.slice(0, 2).map((user, idx) => (
            <NeuCard
              key={idx}
              className="p-6 text-center space-y-4 cursor-pointer hover:translate-y-[-4px] transition-transform"
              onClick={() => {
                onSelectUser(user);
                onGoToUsers();
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl"
                style={{
                  background: idx === 0
                    ? 'linear-gradient(145deg, #f6ad55, #ed8936)'
                    : 'linear-gradient(145deg, #cbd5e0, #a0aec0)',
                  boxShadow: '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)',
                }}
              >
                {idx + 1}
              </div>
              <div>
                <p className="font-bold text-lg" style={{ color: '#2D3748' }}>
                  {user.name}
                </p>
                <p className="text-xs" style={{ color: '#A0AEC0' }}>
                  {idx === 0 ? 'Senior Consultant' : 'Area Manager'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div 
                  className="py-2 rounded-xl"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: 'inset 9px 9px 16px rgba(163, 177, 198, 0.6), inset -9px -9px 16px rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <p className="font-bold text-sm" style={{ color: '#6366F1' }}>
                    {user.meetings_held}
                  </p>
                  <p className="text-[10px] uppercase font-bold" style={{ color: '#A0AEC0' }}>
                    Meetings
                  </p>
                </div>
                <div 
                  className="py-2 rounded-xl"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: 'inset 9px 9px 16px rgba(163, 177, 198, 0.6), inset -9px -9px 16px rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <p className="font-bold text-sm" style={{ color: '#10B981' }}>
                    {user.clients_created}
                  </p>
                  <p className="text-[10px] uppercase font-bold" style={{ color: '#A0AEC0' }}>
                    Clients
                  </p>
                </div>
              </div>
            </NeuCard>
          ))}

          {/* Add KPI Card */}
          <div
            className="p-6 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all hover:translate-y-[-4px]"
            style={{
              background: '#E0E5EC',
              boxShadow: 'inset 9px 9px 16px rgba(163, 177, 198, 0.6), inset -9px -9px 16px rgba(255, 255, 255, 0.5)',
              border: '2px dashed #CBD5E0'
            }}
          >
            <div className="text-slate-400 mb-2">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase" style={{ color: '#A0AEC0' }}>
              Add KPI
            </p>
          </div>

          {/* Boost Performance Card */}
          <div
            className="p-6 rounded-3xl flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0.1))',
              boxShadow: '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)',
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white"
              style={{
                background: '#6366F1',
                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
              }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="font-bold text-sm text-center mb-3" style={{ color: '#2D3748' }}>
              Boost Performance
            </p>
            <button
              className="px-4 py-2 text-xs font-bold rounded-xl text-white"
              style={{
                background: '#6366F1',
                boxShadow: '4px 4px 8px rgba(99, 102, 241, 0.3)'
              }}
            >
              View Tips
            </button>
          </div>
        </div>
      </NeuCard>
    </div>
  );
};

export default AnalyticsPage;