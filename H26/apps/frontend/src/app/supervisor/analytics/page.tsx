'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function AnalyticsPage() {
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [skillGaps, setSkillGaps] = useState({});
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [teamRes, skillRes, topRes] = await Promise.all([
          apiClient.get('/analytics/team-performance'),
          apiClient.get('/analytics/skill-gap-analysis'),
          apiClient.get('/analytics/top-performers'),
        ]);

        setTeamPerformance(teamRes.data);
        setSkillGaps(skillRes.data);
        setTopPerformers(topRes.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading analytics...</div>;
  }

  // Prepare data for radar chart
  const radarData = teamPerformance.slice(0, 1).map(emp => ({
    name: emp.name,
    'Coding Quality': emp.detailedScores?.codingQuality || 0,
    'Delivery Speed': emp.detailedScores?.deliverySpeed || 0,
    'Testing Quality': emp.detailedScores?.testingQuality || 0,
    'Architecture': emp.detailedScores?.architecture || 0,
    'Problem Solving': emp.detailedScores?.problemSolving || 0,
    'Documentation': emp.detailedScores?.documentation || 0,
    'Ownership': emp.detailedScores?.ownership || 0,
    'AI Usage': emp.detailedScores?.aiUsage || 0,
  }))[0];

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Team Analytics</h1>
        <p className="text-slate-400">Detailed insights into your team's performance</p>
      </div>

      {/* Top Performers */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Top Performers</h2>
        <div className="space-y-3">
          {topPerformers.map((performer: any, idx: number) => (
            <div key={performer.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {idx + 1}
                </div>
                <p className="font-medium text-white">{performer.name}</p>
              </div>
              <div className="text-2xl font-bold text-green-400">{performer.performanceScore.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Performance Comparison */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Team Performance Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={teamPerformance.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} angle={-45} textAnchor="end" height={100} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="readinessScore" fill="#3b82f6" name="Readiness" />
            <Bar dataKey="performanceScore" fill="#10b981" name="Performance" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Skill Distribution */}
      {radarData && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Skill Distribution Example</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[radarData]}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Skill Gaps */}
      <div className="grid grid-cols-2 gap-6">
        {Object.entries(skillGaps).slice(0, 4).map(([skill, employees]: any) => (
          <div key={skill} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="font-bold text-white mb-4">{skill.replace(/([A-Z])/g, ' $1').trim()}</h3>
            <div className="space-y-2">
              {employees.slice(0, 5).map((emp: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">{emp.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, (emp.score / 100) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-blue-400 w-8 text-right">{emp.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
