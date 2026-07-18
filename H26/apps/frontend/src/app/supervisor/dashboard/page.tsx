'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SupervisorDashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [readinessTrends, setReadinessTrends] = useState([]);
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
      <div className="p-8">
        <div className="text-center text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Team Dashboard</h1>
        <p className="text-slate-400">Overview of your team's performance and readiness</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-sm text-slate-400 mb-2">Total Employees</p>
          <div className="text-3xl font-bold text-white">{dashboardData.totalEmployees}</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-sm text-slate-400 mb-2">Ready for Project</p>
          <div className="text-3xl font-bold text-green-400">{dashboardData.readyForProject}</div>
          <p className="text-xs text-slate-500 mt-2">Score ≥ 85</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-sm text-slate-400 mb-2">Needs Mentoring</p>
          <div className="text-3xl font-bold text-yellow-400">{dashboardData.needsMentoring}</div>
          <p className="text-xs text-slate-500 mt-2">Score {'<'} 50</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-sm text-slate-400 mb-2">At Risk</p>
          <div className="text-3xl font-bold text-red-400">{dashboardData.atRisk}</div>
          <p className="text-xs text-slate-500 mt-2">Score {'<'} 60</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-sm text-slate-400 mb-2">Team Health Score</p>
          <div className="text-3xl font-bold text-blue-400">{dashboardData.teamHealthScore}</div>
          <p className="text-xs text-slate-500 mt-2">Overall team health</p>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Team Performance Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Employee</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Readiness</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Performance</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map((member: any) => (
                <tr key={member.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.role}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, member.readinessScore)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-blue-400">
                        {member.readinessScore.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${Math.min(100, member.performanceScore)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-green-400">
                        {member.performanceScore.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      member.status === 'Ready'
                        ? 'bg-green-900/30 text-green-400'
                        : member.status === 'At Risk'
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Readiness Trends */}
      {readinessTrends.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Readiness Trends (Last 10 Evaluations)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={readinessTrends[0]?.data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
