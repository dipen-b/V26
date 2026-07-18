'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get('/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading projects...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">My Projects</h1>
        <p className="text-slate-400">View your assigned projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project: any) => (
          <div key={project.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer">
            <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>
            )}
            {project.department && (
              <p className="text-xs text-slate-500">Department: {project.department}</p>
            )}
            {project.tasks && (
              <p className="text-xs text-slate-400 mt-3">
                {project.tasks.length} tasks assigned
              </p>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No projects assigned yet
        </div>
      )}
    </div>
  );
}
