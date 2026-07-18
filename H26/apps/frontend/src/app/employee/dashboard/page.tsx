'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tasksRes, evaluationsRes] = await Promise.all([
          apiClient.get('/tasks'),
          apiClient.get('/evaluations'),
        ]);

        setTasks(tasksRes.data);
        setEvaluations(evaluationsRes.data);

        if (evaluationsRes.data.length > 0) {
          const latest = evaluationsRes.data[0];
          setPerformanceMetrics({
            readiness: latest.readinessScore,
            scores: latest.scores,
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const performanceData = performanceMetrics?.scores
    ? [
        { name: 'Coding Quality', value: performanceMetrics.scores.codingQuality },
        { name: 'Delivery Speed', value: performanceMetrics.scores.deliverySpeed },
        { name: 'Testing Quality', value: performanceMetrics.scores.testingQuality },
        { name: 'Architecture', value: performanceMetrics.scores.architecture },
        { name: 'Problem Solving', value: performanceMetrics.scores.problemSolving },
        { name: 'Documentation', value: performanceMetrics.scores.documentation },
        { name: 'Ownership', value: performanceMetrics.scores.ownership },
        { name: 'AI Usage', value: performanceMetrics.scores.aiUsage },
      ]
    : [];

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  if (loading) {
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
        <h1 className="text-4xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName}
        </h1>
        <p className="text-slate-400">Welcome back to SkillProof AI</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-sm text-slate-400 mb-2">Readiness Score</p>
          <div className="text-3xl font-bold text-blue-400">
            {performanceMetrics?.readiness ? `${performanceMetrics.readiness.toFixed(1)}` : '--'}
          </div>
          <p className="text-xs text-slate-500 mt-2">Based on latest evaluation</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-sm text-slate-400 mb-2">Tasks Assigned</p>
          <div className="text-3xl font-bold text-green-400">{taskStats.total}</div>
          <p className="text-xs text-slate-500 mt-2">{taskStats.completed} completed</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-sm text-slate-400 mb-2">In Progress</p>
          <div className="text-3xl font-bold text-yellow-400">{taskStats.inProgress}</div>
          <p className="text-xs text-slate-500 mt-2">Active tasks</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-sm text-slate-400 mb-2">Evaluations</p>
          <div className="text-3xl font-bold text-purple-400">{evaluations.length}</div>
          <p className="text-xs text-slate-500 mt-2">Total received</p>
        </div>
      </div>

      {/* Performance Chart */}
      {performanceData.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">My Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
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
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Tasks</h2>
        <div className="space-y-3">
          {tasks.slice(0, 5).map((task: any) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div>
                <p className="font-medium text-white">{task.title}</p>
                <p className="text-xs text-slate-400 mt-1">{task.project?.name || 'General'}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${task.completionPercentage}%` }}
                  />
                </div>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  task.status === 'completed'
                    ? 'bg-green-900/30 text-green-400'
                    : task.status === 'in_progress'
                    ? 'bg-blue-900/30 text-blue-400'
                    : 'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-slate-400 text-center py-4">No tasks assigned yet</p>
          )}
        </div>
      </div>

      {/* Recent Evaluations */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Evaluations</h2>
        <div className="space-y-3">
          {evaluations.slice(0, 3).map((evaluation: any) => (
            <div key={evaluation.id} className="p-4 bg-slate-700/50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-white">
                  {evaluation.supervisor.firstName} {evaluation.supervisor.lastName}
                </p>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  evaluation.isApproved
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {evaluation.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Readiness Score: <span className="font-bold text-blue-400">{evaluation.readinessScore.toFixed(1)}</span>
              </p>
            </div>
          ))}
          {evaluations.length === 0 && (
            <p className="text-slate-400 text-center py-4">No evaluations yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
