import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  MapPin,
  RefreshCw,
  Target,
  Clock,
  AlertCircle,
} from "lucide-react";

const NeumorphicCard = ({ children, className = "", noBorder = false }) => (
  <div
    className={`p-5 rounded-2xl ${className}`}
    style={{
      background: '#ecf0f3',
      boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255, 0.5)',
      border: noBorder ? 'none' : '1px solid rgba(255,255,255,0.8)',
    }}
  >
    {children}
  </div>
);

const CompactStatCard = ({ title, value, change, isPositive, icon: Icon, gradient }) => (
  <NeumorphicCard className="relative overflow-hidden">
    <div className="flex items-center justify-between mb-2">
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>
          {title}
        </p>
        <h3 className="text-2xl font-bold" style={{ color: '#1e293b' }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>
      </div>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: gradient,
          boxShadow: '3px 3px 6px rgba(0,0,0,0.15)',
        }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {change !== undefined && (
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="w-3 h-3 text-green-500" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500" />
        )}
        <span 
          className="text-xs font-semibold"
          style={{ color: isPositive ? '#10b981' : '#ef4444' }}
        >
          {Math.abs(change)}% {isPositive ? 'increase' : 'decrease'}
        </span>
      </div>
    )}
  </NeumorphicCard>
);

const InsightCard = ({ icon: Icon, gradient, title, value, subtitle }) => (
  <NeumorphicCard>
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: gradient,
          boxShadow: '2px 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: '#64748b' }}>{title}</p>
        <p className="text-lg font-bold" style={{ color: '#1e293b' }}>{value}</p>
        {subtitle && (
          <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{subtitle}</p>
        )}
      </div>
    </div>
  </NeumorphicCard>
);

const AnalyticsPage = ({ analyticsData, syncStatus, onRefresh }) => {
  if (!analyticsData) return null;
  
  const { stats, trends, distribution } = analyticsData;

  // Calculate valuable metrics
  const conversionRate = ((stats.activeClients / stats.totalClients) * 100).toFixed(1);
  const avgLogsPerUser = stats.totalUsers > 0 ? Math.round(stats.totalLogs / stats.totalUsers) : 0;
  const clientsPerArea = stats.uniquePincodes > 0 ? Math.round(stats.totalClients / stats.uniquePincodes) : 0;
  
  // Calculate growth (compare last 2 months)
  const lastMonth = trends[trends.length - 1]?.clients || 0;
  const prevMonth = trends[trends.length - 2]?.clients || 0;
  const growth = prevMonth > 0 ? (((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-5">
      {/* Sync Status in Top Right - Integrated with header in parent component */}
      
      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <CompactStatCard 
          title="Total Clients" 
          value={stats.totalClients} 
          change={parseFloat(growth)}
          isPositive={growth > 0}
          icon={Users} 
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <CompactStatCard 
          title="Active Rate" 
          value={`${conversionRate}%`} 
          change={2.3}
          isPositive={true}
          icon={Activity} 
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
        <CompactStatCard 
          title="GPS Coverage" 
          value={`${stats.coordinatesCoverage}%`}
          change={5.1}
          isPositive={true}
          icon={MapPin} 
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <CompactStatCard 
          title="Avg Logs/User" 
          value={avgLogsPerUser}
          change={1.8}
          isPositive={true}
          icon={Target} 
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        />
      </div>

      {/* Insights Grid - More compact */}
      <div className="grid grid-cols-6 gap-3">
        <InsightCard
          icon={Users}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          title="Team Size"
          value={stats.totalUsers}
          subtitle="Active users"
        />
        <InsightCard
          icon={MapPin}
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          title="Service Areas"
          value={stats.uniquePincodes}
          subtitle="Unique pincodes"
        />
        <InsightCard
          icon={Target}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          title="Density"
          value={clientsPerArea}
          subtitle="Clients per area"
        />
        <InsightCard
          icon={Activity}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          title="Inactive"
          value={stats.totalClients - stats.activeClients}
          subtitle="Need attention"
        />
        <InsightCard
          icon={AlertCircle}
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          title="Missing GPS"
          value={stats.totalClients - stats.withCoordinates}
          subtitle="Need geocoding"
        />
        <InsightCard
          icon={Clock}
          gradient="linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
          title="Total Logs"
          value={`${(stats.totalLogs / 1000).toFixed(1)}K`}
          subtitle="Tracking records"
        />
      </div>

      {/* Charts Row - Reduced Height */}
      <div className="grid grid-cols-2 gap-4">
        {/* Growth Trend */}
        <NeumorphicCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  boxShadow: '2px 2px 4px rgba(67, 233, 123, 0.3)',
                }}
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: '#1e293b' }}>Growth Trends</h3>
                <p className="text-xs" style={{ color: '#64748b' }}>Last 6 months</p>
              </div>
            </div>
            <span className="text-lg font-bold text-green-500">+{growth}%</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#43e97b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#43e97b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#ecf0f3', 
                  border: '1px solid rgba(255,255,255,0.8)', 
                  borderRadius: '12px',
                  boxShadow: '4px 4px 8px rgba(163,177,198,0.4)',
                  padding: '8px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area 
                type="monotone" 
                dataKey="clients" 
                stroke="#667eea" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorClients)"
                name="Total"
              />
              <Area 
                type="monotone" 
                dataKey="active" 
                stroke="#43e97b" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActive)"
                name="Active"
              />
            </AreaChart>
          </ResponsiveContainer>
        </NeumorphicCard>

        {/* Performance Metrics */}
        <NeumorphicCard>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '2px 2px 4px rgba(102, 126, 234, 0.3)',
              }}
            >
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: '#1e293b' }}>Performance Metrics</h3>
              <p className="text-xs" style={{ color: '#64748b' }}>Key business indicators</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#ecf0f3', 
                  border: '1px solid rgba(255,255,255,0.8)', 
                  borderRadius: '12px',
                  boxShadow: '4px 4px 8px rgba(163,177,198,0.4)',
                  padding: '8px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line 
                type="monotone" 
                dataKey="clients" 
                stroke="#667eea" 
                strokeWidth={2.5} 
                name="Total"
                dot={{ fill: '#667eea', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="active" 
                stroke="#43e97b" 
                strokeWidth={2.5} 
                name="Active"
                dot={{ fill: '#43e97b', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="withLocation" 
                stroke="#f093fb" 
                strokeWidth={2.5} 
                name="GPS"
                dot={{ fill: '#f093fb', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </NeumorphicCard>
      </div>

      {/* Quick Insights - More compact */}
      <NeumorphicCard>
        <h3 className="text-sm font-bold mb-3" style={{ color: '#1e293b' }}>
          📊 Quick Insights & Actions
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#667eea' }}>Growth Rate</p>
            <p className="text-xl font-bold" style={{ color: '#1e293b' }}>{growth}%</p>
            <p className="text-xs" style={{ color: '#64748b' }}>vs last month</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(67, 233, 123, 0.1)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#43e97b' }}>Active Rate</p>
            <p className="text-xl font-bold" style={{ color: '#1e293b' }}>{conversionRate}%</p>
            <p className="text-xs" style={{ color: '#64748b' }}>client engagement</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(240, 147, 251, 0.1)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#f093fb' }}>Needs GPS</p>
            <p className="text-xl font-bold" style={{ color: '#1e293b' }}>{stats.totalClients - stats.withCoordinates}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>clients to geocode</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(250, 112, 154, 0.1)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#fa709a' }}>Avg Density</p>
            <p className="text-xl font-bold" style={{ color: '#1e293b' }}>{clientsPerArea}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>clients per area</p>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};

export default AnalyticsPage;