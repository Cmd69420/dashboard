import React from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Activity, MapPin, Target, Clock,
  AlertCircle, Award, AlertTriangle, CheckCircle, Sparkles
} from "lucide-react";

const NeumorphicCard = ({ children, className = "", glow = false }) => (
  <div
    className={`p-6 rounded-3xl ${className} transition-all duration-300 hover:scale-[1.02]`}
    style={{
      background: glow 
        ? 'linear-gradient(145deg, #f0f4f8, #e8ecf1)'
        : 'linear-gradient(145deg, #ffffff, #f0f4f8)',
      boxShadow: glow
        ? '12px 12px 24px rgba(163,177,198,0.4), -12px -12px 24px rgba(255,255,255, 0.9), inset 2px 2px 4px rgba(255,255,255,0.3)'
        : '8px 8px 16px rgba(163,177,198,0.5), -8px -8px 16px rgba(255,255,255, 0.9)',
      border: '1px solid rgba(255,255,255,0.8)',
    }}
  >
    {children}
  </div>
);

const CompactStatCard = ({ title, value, change, isPositive, icon: Icon, gradient, bgColor }) => (
  <NeumorphicCard glow>
    <div className="flex items-center justify-between mb-3">
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94a3b8', letterSpacing: '0.1em' }}>
          {title}
        </p>
        <h3 className="text-4xl font-black mb-1" style={{ 
          color: '#1e293b',
          textShadow: '2px 2px 4px rgba(0,0,0,0.05)'
        }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>
      </div>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
        style={{
          background: gradient || bgColor,
          boxShadow: '4px 4px 12px rgba(0,0,0,0.2), -2px -2px 8px rgba(255,255,255,0.1)',
        }}
      >
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 60%)'
          }}
        />
        <Icon className="w-8 h-8 text-white relative z-10" />
      </div>
    </div>
    {change !== undefined && (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{
        background: isPositive 
          ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))',
      }}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span 
          className="text-sm font-bold"
          style={{ color: isPositive ? '#10b981' : '#ef4444' }}
        >
          {Math.abs(change)}% {isPositive ? 'increase' : 'decrease'}
        </span>
      </div>
    )}
  </NeumorphicCard>
);

const InsightCard = ({ icon: Icon, gradient, title, value, subtitle, onClick }) => (
  <NeumorphicCard className={onClick ? "cursor-pointer" : ""}>
    <div className="flex flex-col items-center text-center gap-3">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
        style={{
          background: gradient,
          boxShadow: '4px 4px 12px rgba(0,0,0,0.2), -2px -2px 6px rgba(255,255,255,0.1)',
        }}
      >
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), transparent 70%)'
          }}
        />
        <Icon className="w-7 h-7 text-white relative z-10" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>
          {title}
        </p>
        <p className="text-2xl font-black mb-1" style={{ 
          color: '#1e293b',
          textShadow: '1px 1px 2px rgba(0,0,0,0.05)'
        }}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs font-medium" style={{ color: '#64748b' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  </NeumorphicCard>
);

const Custom3DBar = ({ x, y, width, height, fill, value }) => {
  const depth = 8;
  const topY = y - depth;
  
  return (
    <g>
      {/* Top face */}
      <path
        d={`M ${x},${topY} L ${x + width},${topY} L ${x + width + depth},${topY + depth} L ${x + depth},${topY + depth} Z`}
        fill={fill}
        opacity={0.9}
        style={{ filter: 'brightness(1.2)' }}
      />
      {/* Front face */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
      />
      {/* Side face */}
      <path
        d={`M ${x + width},${y} L ${x + width + depth},${y + depth} L ${x + width + depth},${y + height + depth} L ${x + width},${y + height} Z`}
        fill={fill}
        opacity={0.6}
        style={{ filter: 'brightness(0.8)' }}
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
    { name: 'Active', value: stats.activeClients, color: '#43e97b' },
    { name: 'Inactive', value: stats.totalClients - stats.activeClients, color: '#f093fb' }
  ];

  const gpsStatusData = [
    { name: 'With GPS', value: stats.withCoordinates, color: '#4facfe' },
    { name: 'Missing GPS', value: stats.totalClients - stats.withCoordinates, color: '#fa709a' }
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
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      title: `${inactiveCount} clients inactive >30 days`,
      action: 'Review engagement strategy',
      show: inactiveCount > 0
    },
    {
      icon: MapPin,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      title: `${missingGPS} clients missing GPS`,
      action: 'Schedule geocoding batch',
      show: missingGPS > 0
    },
    {
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      title: `${stats.coordinatesCoverage}% GPS coverage`,
      action: stats.coordinatesCoverage > 80 ? 'Excellent coverage!' : 'Needs improvement',
      show: true
    }
  ].filter(item => item.show);

  return (
    <div className="space-y-6" style={{ background: '#ecf0f3', minHeight: '100vh' }}>
      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 gap-6">
        <div onClick={() => onGoToClients()} className="cursor-pointer">
          <CompactStatCard
            title="Total Clients"
            value={stats.totalClients}
            change={parseFloat(growth)}
            isPositive={growth > 0}
            icon={Users}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </div>

        <div onClick={() => onGoToClients()} className="cursor-pointer">
          <CompactStatCard
            title="Active Rate"
            value={`${conversionRate}%`}
            change={2.3}
            isPositive={true}
            icon={Activity}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </div>

        <div onClick={() => onGoToClients()} className="cursor-pointer">
          <CompactStatCard
            title="GPS Coverage"
            value={`${stats.coordinatesCoverage}%`}
            change={5.1}
            isPositive={true}
            icon={MapPin}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-6 gap-4">
        <div onClick={() => onGoToUsers()}>
          <InsightCard
            icon={Users}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            title="Team Size"
            value={stats.totalUsers}
            subtitle="Active users"
            onClick={() => onGoToUsers()}
          />
        </div>

        <div onClick={() => onGoToClients()}>
          <InsightCard
            icon={MapPin}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            title="Service Areas"
            value={stats.uniquePincodes}
            subtitle="Unique pincodes"
            onClick={() => onGoToClients()}
          />
        </div>

        <InsightCard
          icon={Target}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          title="Density"
          value={clientsPerArea}
          subtitle="Clients per area"
        />

        <div onClick={() => onGoToClients()}>
          <InsightCard
            icon={Activity}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            title="Inactive"
            value={inactiveCount}
            subtitle="Need attention"
            onClick={() => onGoToClients()}
          />
        </div>

        <div onClick={() => onGoToClients()}>
          <InsightCard
            icon={AlertCircle}
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            title="Missing GPS"
            value={missingGPS}
            subtitle="Need geocoding"
            onClick={() => onGoToClients()}
          />
        </div>

        <InsightCard
          icon={Clock}
          gradient="linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)"
          title="Total Logs"
          value={`${(stats.totalLogs / 1000).toFixed(1)}K`}
          subtitle="Tracking records"
        />
      </div>

      {/* Action Items */}
      <NeumorphicCard glow>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '4px 4px 12px rgba(102,126,234,0.4)',
            }}
          >
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), transparent 70%)'
              }}
            />
            <Target className="w-6 h-6 text-white relative z-10" />
          </div>
          <div>
            <h3 className="text-lg font-black" style={{ color: "#1e293b" }}>
              Action Items
            </h3>
            <p className="text-xs font-medium" style={{ color: "#64748b" }}>
              Important tasks requiring attention
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {actionItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onGoToClients()}
              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              style={{
                background: "linear-gradient(145deg, #ffffff, #f0f4f8)",
                boxShadow: "6px 6px 12px rgba(163,177,198,0.4), -6px -6px 12px rgba(255,255,255,0.8)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                style={{
                  background: item.gradient,
                  boxShadow: '3px 3px 8px rgba(0,0,0,0.2)',
                }}
              >
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), transparent 70%)'
                  }}
                />
                <item.icon className="w-6 h-6 text-white relative z-10" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold mb-1" style={{ color: "#1e293b" }}>
                  {item.title}
                </p>
                <p className="text-xs font-medium" style={{ color: "#64748b" }}>
                  {item.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </NeumorphicCard>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        <NeumorphicCard glow>
          <h3 className="text-base font-black mb-4 flex items-center gap-2" style={{ color: "#1e293b" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }} />
            Client Status
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <defs>
                <filter id="shadow1" height="130%">
                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                </filter>
              </defs>
              <Pie
                data={clientStatusData}
                dataKey="value"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                style={{ filter: 'url(#shadow1)' }}
              >
                {clientStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: 'linear-gradient(145deg, #ffffff, #f0f4f8)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 8px rgba(163,177,198,0.5)',
                }}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </NeumorphicCard>

        <NeumorphicCard glow>
          <h3 className="text-base font-black mb-4 flex items-center gap-2" style={{ color: "#1e293b" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }} />
            GPS Coverage
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <defs>
                <filter id="shadow2" height="130%">
                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                </filter>
              </defs>
              <Pie
                data={gpsStatusData}
                dataKey="value"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                style={{ filter: 'url(#shadow2)' }}
              >
                {gpsStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: 'linear-gradient(145deg, #ffffff, #f0f4f8)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 8px rgba(163,177,198,0.5)',
                }}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </NeumorphicCard>

        <NeumorphicCard glow>
          <h3 className="text-base font-black mb-4 flex items-center gap-2" style={{ color: "#1e293b" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
            Top Areas
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topAreasData} layout="vertical">
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '11px' }} />
              <YAxis 
                type="category" 
                dataKey="displayArea" 
                stroke="#94a3b8" 
                style={{ fontSize: '11px' }}
                width={70}
              />
              <Tooltip 
                contentStyle={{
                  background: 'linear-gradient(145deg, #ffffff, #f0f4f8)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 8px rgba(163,177,198,0.5)',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              />
              <Bar 
                dataKey="clients" 
                fill="url(#barGradient)"
                radius={[0, 8, 8, 0]}
                shape={<Custom3DBar />}
              />
            </BarChart>
          </ResponsiveContainer>
        </NeumorphicCard>
      </div>

      {/* User Leaderboard */}
      <NeumorphicCard glow>
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              boxShadow: "4px 4px 12px rgba(250, 112, 154, 0.4)",
            }}
          >
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), transparent 70%)'
              }}
            />
            <Award className="w-7 h-7 text-white relative z-10" />
          </div>
          <div>
            <h3 className="text-lg font-black" style={{ color: "#1e293b" }}>
              Top Performers
            </h3>
            <p className="text-xs font-medium" style={{ color: "#64748b" }}>
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
              className="p-5 rounded-2xl text-center cursor-pointer hover:scale-[1.05] transition-all duration-300"
              style={{
                background: idx === 0
                  ? "linear-gradient(145deg, rgba(250,112,154,0.15), rgba(254,225,64,0.15))"
                  : "linear-gradient(145deg, #ffffff, #f0f4f8)",
                boxShadow: idx === 0
                  ? "6px 6px 12px rgba(250,112,154,0.3), -6px -6px 12px rgba(255,255,255,0.8)"
                  : "6px 6px 12px rgba(163,177,198,0.4), -6px -6px 12px rgba(255,255,255,0.8)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-black text-lg relative overflow-hidden"
                style={{
                  background: idx === 0
                    ? "linear-gradient(135deg,#fa709a,#fee140)"
                    : idx === 1
                    ? "linear-gradient(135deg,#cbd5e1,#e2e8f0)"
                    : idx === 2
                    ? "linear-gradient(135deg,#cd7f32,#e6a57e)"
                    : "linear-gradient(135deg,#94a3b8,#cbd5e1)",
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.2)',
                }}
              >
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), transparent 70%)'
                  }}
                />
                <span className="relative z-10">{idx + 1}</span>
              </div>

              <p className="text-sm font-black mb-2 truncate" style={{ color: "#1e293b" }}>
                {user.name}
              </p>

              <div className="space-y-1">
                <div className="px-3 py-1 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.05))'
                }}>
                  <p className="text-xs font-semibold" style={{ color: '#667eea' }}>
                    {user.meetings_held} meetings
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(67,233,123,0.1), rgba(56,249,215,0.05))'
                }}>
                  <p className="text-xs font-semibold" style={{ color: '#43e97b' }}>
                    {user.clients_created} clients
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </NeumorphicCard>
    </div>
  );
};

export default AnalyticsPage;