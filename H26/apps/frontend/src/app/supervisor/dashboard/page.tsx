'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  UsersIcon, CheckBadgeIcon, AcademicCapIcon, ExclamationTriangleIcon, HeartIcon,
} from '@heroicons/react/24/outline';

function StatCard({ label, value, sub, accent, icon: Icon }: any) {
  return (
    <div className="sp-card sp-card-hover sp-stat sp-animate-in" style={{ ['--accent' as any]: accent }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          <div className="mt-2 text-3xl font-bold" style={{ color: accent }}>{value}</div>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${accent}1f`, color: accent }}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Ready: 'bg-green-500/15 text-green-400',
  Progressing: 'bg-blue-500/15 text-blue-400',
  Developing: 'bg-amber-500/15 text-amber-400',
  'At Risk': 'bg-red-500/15 text-red-400',
};

export default function SupervisorDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [readinessTrends, setReadinessTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, teamRes, trendsRes] = await Promise.all([
          apiClient.get('/analytics/dashboard'),
          apiClient.get('/analytics/team-performance'),
          apiClient.get('/analytics/readiness-trends'),
        ]);
        setDashboardData(dashRes.data);
        setTeamPerformance(teamRes.data);
        setReadinessTrends(trendsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="p-8 space-y-6">
        <div className="sp-skeleton h-10 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="sp-skeleton h-28" />)}
        </div>
        <div className="sp-skeleton h-72" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="sp-animate-in">
        <h1 className="text-3xl font-bold tracking-tight text-white">Team Dashboard</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Overview of your team's performance and readiness.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Employees" value={dashboardData.totalEmployees} sub="On your team" accent="#6366f1" icon={UsersIcon} />
        <StatCard label="Ready for Project" value={dashboardData.readyForProject} sub="Score ≥ 85" accent="#22c55e" icon={CheckBadgeIcon} />
        <StatCard label="Needs Mentoring" value={dashboardData.needsMentoring} sub="Score < 50" accent="#f59e0b" icon={AcademicCapIcon} />
        <StatCard label="At Risk" value={dashboardData.atRisk} sub="Score < 60" accent="#ef4444" icon={ExclamationTriangleIcon} />
        <StatCard label="Team Health" value={dashboardData.teamHealthScore} sub="Overall health" accent="#3b82f6" icon={HeartIcon} />
      </div>

      {/* Team Performance Table */}
      <div className="sp-card sp-animate-in">
        <h2 className="sp-heading mb-4">Team Performance Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                <th className="pb-3 font-medium">Employee</th>
                <th className="pb-3 font-medium">Readiness</th>
                <th className="pb-3 font-medium">Performance</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map((member: any) => (
                <tr
                  key={member.id}
                  className="border-t transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}
                      >
                        {member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{member.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.role || 'Team Member'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, member.readinessScore)}%`, background: 'linear-gradient(90deg,#3b82f6,#6366f1)' }} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--accent-blue)' }}>
                        {member.readinessScore?.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, member.performanceScore)}%`, background: 'linear-gradient(90deg,#22c55e,#16a34a)' }} />
                      </div>
                      <span className="text-sm font-semibold text-green-400">
                        {member.performanceScore?.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className={`sp-pill ${STATUS_STYLES[member.status] || STATUS_STYLES['At Risk']}`}>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
              {teamPerformance.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                    No team members yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Readiness Trends */}
      {readinessTrends.length > 0 && readinessTrends[0]?.data?.length > 0 && (
        <div className="sp-card sp-animate-in">
          <h2 className="sp-heading mb-4">Readiness Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={readinessTrends[0]?.data || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#263248" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #33415a', borderRadius: 12, color: '#f1f5f9' }} />
              <Line type="monotone" dataKey="score" stroke="url(#lineGrad)" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
