import React from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Activity, MapPin, Target, Clock,
  AlertCircle, Award, AlertTriangle, CheckCircle, Sparkles
} from "lucide-react";

// Soft neumorphic card like the reference image
const SoftCard = ({ children, className = "", noPadding = false }) => (
  <div
    className={`${noPadding ? '' : 'p-6'} rounded-3xl ${className}`}
    style={{
      background: '#f0f4f8',
      boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
    }}
  >
    {children}
  </div>
);

// Main metric card with soft shadows
const MetricCard = ({ title, value, change, isPositive, icon: Icon, iconBg }) => (
  <SoftCard>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" 
           style={{ color: '#a0aec0' }}>
          {title}
        </p>
        <h3 className="text-5xl font-black mb-3" style={{ color: '#2d3748' }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>
        {change !== undefined && (
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: isPositive ? '#d4f4dd' : '#ffd4d4',
            }}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#48bb78' }} />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" style={{ color: '#f56565' }} />
            )}
            <span 
              className="text-xs font-bold"
              style={{ color: isPositive ? '#48bb78' : '#f56565' }}
            >
              {Math.abs(change)}% {isPositive ? 'increase' : 'decrease'}
            </span>
          </div>
        )}
      </div>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          background: iconBg,
          boxShadow: '4px 4px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </SoftCard>
);

// Small insight card
const InsightCard = ({ icon: Icon, iconBg, title, value, subtitle }) => (
  <SoftCard className="text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
      style={{
        background: iconBg,
        boxShadow: '4px 4px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Icon className="w-7 h-7 text-white" />
    </div>
    <p className="text-xs font-semibold uppercase tracking-wide mb-1" 
       style={{ color: '#a0aec0' }}>
      {title}
    </p>
    <p className="text-3xl font-black mb-1" style={{ color: '#2d3748' }}>
      {value}
    </p>
    {subtitle && (
      <p className="text-xs font-medium" style={{ color: '#718096' }}>
        {subtitle}
      </p>
    )}
  </SoftCard>
);

// 3D-style bar with rounded caps
const RoundedBar = (props) => {
  const { fill, x, y, width, height } = props;
  
  return (
    <g>
      <defs>
        <linearGradient id={`gradient-${x}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#764ba2" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#gradient-${x})`}
        rx={width / 2}
        ry={width / 2}
      />
    </g>
  );
};

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
    { name: 'Active', value: stats.activeClients, color: '#48bb78' },
    { name: 'Inactive', value: stats.totalClients - stats.activeClients, color: '#ed64a6' }
  ];

  const gpsStatusData = [
    { name: 'With GPS', value: stats.withCoordinates, color: '#4299e1' },
    { name: 'Missing GPS', value: stats.totalClients - stats.withCoordinates, color: '#f56565' }
  ];

  const topAreasData = Array.isArray(distribution) ? distribution.slice(0, 5).map(area => ({
    ...area,
    displayArea: area.area || 'Unknown'
  })) : [];
  
  const userLeaderboard = Array.isArray(analyticsData.leaderboard) ? analyticsData.leaderboard : [];

  const inactiveCount = stats.totalClients - stats.activeClients;
  const missingGPS = stats.totalClients - stats.withCoordinates;
  
  const actionItems = [
    {
      icon: AlertTriangle,
      iconBg: '#fc8181',
      title: `${inactiveCount} clients inactive >30 days`,
      action: 'Review engagement strategy',
      show: inactiveCount > 0
    },
    {
      icon: CheckCircle,
      iconBg: '#68d391',
      title: `${stats.coordinatesCoverage}% GPS coverage`,
      action: stats.coordinatesCoverage > 80 ? 'Excellent coverage!' : 'Needs improvement',
      show: true
    }
  ].filter(item => item.show);

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 gap-6">
        <div onClick={() => onGoToClients()} className="cursor-pointer">
          <MetricCard
            title="Total Clients"
            value={stats.totalClients}
            change={parseFloat(growth)}
            isPositive={growth > 0}
            icon={Users}
            iconBg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </div>

        <div onClick={() => onGoToClients()} className="cursor-pointer">
          <MetricCard
            title="Active Rate"
            value={`${conversionRate}%`}
            change={2.3}
            isPositive={true}
            icon={Activity}
            iconBg="linear-gradient(135deg, #48bb78 0%, #38b2ac 100%)"
          />
        </div>

        <div onClick={() => onGoToClients()} className="cursor-pointer">
          <MetricCard
            title="GPS Coverage"
            value={`${stats.coordinatesCoverage}%`}
            change={5.1}
            isPositive={true}
            icon={MapPin}
            iconBg="linear-gradient(135deg, #4299e1 0%, #3182ce 100%)"
          />
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-6 gap-4">
        <div onClick={() => onGoToUsers()} className="cursor-pointer">
          <InsightCard
            icon={Users}
            iconBg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            title="Team Size"
            value={stats.totalUsers}
            subtitle="Active users"
          />
        </div>

        <div onClick={() => onGoToClients()} className="cursor-pointer">
          <InsightCard
            icon={MapPin}
            iconBg="linear-gradient(135deg, #48bb78 0%, #38b2ac 100%)"
            title="Service Areas"
            value={stats.uniquePincodes}
            subtitle="Unique pincodes"
          />
        </div>

        <InsightCard
          icon={Target}
          iconBg="linear-gradient(135deg, #4299e1 0%, #3182ce 100%)"
          title="Density"
          value={clientsPerArea}
          subtitle="Clients per area"
        />

        <div onClick={() => onGoToClients()} className="cursor-pointer">
          <InsightCard
            icon={Activity}
            iconBg="linear-gradient(135deg, #ed64a6 0%, #d53f8c 100%)"
            title="Inactive"
            value={inactiveCount}
            subtitle="Need attention"
          />
        </div>

        <div onClick={() => onGoToClients()} className="cursor-pointer">
          <InsightCard
            icon={AlertCircle}
            iconBg="linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)"
            title="Missing GPS"
            value={missingGPS}
            subtitle="Need geocoding"
          />
        </div>

        <InsightCard
          icon={Clock}
          iconBg="linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)"
          title="Total Logs"
          value={`${(stats.totalLogs / 1000).toFixed(1)}K`}
          subtitle="Tracking records"
        />
      </div>

      {/* Action Items */}
      <SoftCard>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '4px 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black" style={{ color: "#2d3748" }}>
              Action Items
            </h3>
            <p className="text-sm font-medium" style={{ color: "#718096" }}>
              Important tasks requiring attention
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {actionItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onGoToClients()}
              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:translate-y-[-2px]"
              style={{
                background: '#f0f4f8',
                boxShadow: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: item.iconBg,
                  boxShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold mb-0.5" style={{ color: "#2d3748" }}>
                  {item.title}
                </p>
                <p className="text-xs font-medium" style={{ color: "#718096" }}>
                  {item.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SoftCard>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Client Status */}
        <SoftCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ background: '#48bb78' }} />
            <h3 className="text-base font-black" style={{ color: "#2d3748" }}>
              Client Status
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={clientStatusData}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                cornerRadius={8}
              >
                {clientStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: '#f0f4f8',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 8px #d1d9e6',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </SoftCard>

        {/* GPS Coverage */}
        <SoftCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ background: '#4299e1' }} />
            <h3 className="text-base font-black" style={{ color: "#2d3748" }}>
              GPS Coverage
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={gpsStatusData}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                cornerRadius={8}
              >
                {gpsStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: '#f0f4f8',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 8px #d1d9e6',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </SoftCard>

        {/* Top Areas */}
        <SoftCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ background: '#667eea' }} />
            <h3 className="text-base font-black" style={{ color: "#2d3748" }}>
              Top Areas
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topAreasData} layout="vertical">
              <XAxis 
                type="number" 
                stroke="#a0aec0" 
                style={{ fontSize: '12px', fontWeight: '500' }} 
              />
              <YAxis 
                type="category" 
                dataKey="displayArea" 
                stroke="#a0aec0" 
                style={{ fontSize: '12px', fontWeight: '500' }}
                width={80}
              />
              <Tooltip 
                contentStyle={{
                  background: '#f0f4f8',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 8px #d1d9e6',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              />
              <Bar 
                dataKey="clients" 
                fill="#667eea"
                radius={[0, 12, 12, 0]}
                shape={<RoundedBar />}
              />
            </BarChart>
          </ResponsiveContainer>
        </SoftCard>
      </div>

      {/* User Leaderboard */}
      <SoftCard>
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)",
              boxShadow: "4px 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black" style={{ color: "#2d3748" }}>
              Top Performers
            </h3>
            <p className="text-sm font-medium" style={{ color: "#718096" }}>
              Best team members this month
            </p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {userLeaderboard.slice(0, 5).map((user, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectUser(user);
                onGoToUsers();
              }}
              className="cursor-pointer transition-all hover:translate-y-[-4px]"
            >
              <SoftCard className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-black text-xl"
                  style={{
                    background: idx === 0
                      ? "linear-gradient(135deg, #f6ad55, #ed8936)"
                      : idx === 1
                      ? "linear-gradient(135deg, #cbd5e0, #a0aec0)"
                      : idx === 2
                      ? "linear-gradient(135deg, #d69e71, #cd7f32)"
                      : "linear-gradient(135deg, #a0aec0, #718096)",
                    boxShadow: '4px 4px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {idx + 1}
                </div>

                <p className="text-sm font-black mb-3 truncate" style={{ color: "#2d3748" }}>
                  {user.name}
                </p>

                <div className="space-y-2">
                  <div 
                    className="px-3 py-2 rounded-xl"
                    style={{
                      background: '#e6f2ff',
                    }}
                  >
                    <p className="text-sm font-bold" style={{ color: '#667eea' }}>
                      {user.meetings_held}
                    </p>
                    <p className="text-xs font-medium" style={{ color: '#718096' }}>
                      meetings
                    </p>
                  </div>
                  <div 
                    className="px-3 py-2 rounded-xl"
                    style={{
                      background: '#e6ffed',
                    }}
                  >
                    <p className="text-sm font-bold" style={{ color: '#48bb78' }}>
                      {user.clients_created}
                    </p>
                    <p className="text-xs font-medium" style={{ color: '#718096' }}>
                      clients
                    </p>
                  </div>
                </div>
              </SoftCard>
            </div>
          ))}
        </div>
      </SoftCard>
    </div>
  );
};

export default AnalyticsPage;