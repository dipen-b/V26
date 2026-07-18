'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface SidebarProps {
  role: 'employee' | 'supervisor';
}

export function Sidebar({ role }: SidebarProps) {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const employeeLinks = [
    { name: 'Dashboard', href: '/employee/dashboard' },
    { name: 'My Tasks', href: '/employee/tasks' },
    { name: 'My Projects', href: '/employee/projects' },
    { name: 'My Evaluations', href: '/employee/evaluations' },
    { name: 'My Growth', href: '/employee/growth' },
    { name: 'Profile', href: '/employee/profile' },
  ];

  const supervisorLinks = [
    { name: 'Dashboard', href: '/supervisor/dashboard' },
    { name: 'Team', href: '/supervisor/team' },
    { name: 'Analytics', href: '/supervisor/analytics' },
    { name: 'Evaluations', href: '/supervisor/evaluations' },
    { name: 'Profile', href: '/supervisor/profile' },
  ];

  const links = role === 'employee' ? employeeLinks : supervisorLinks;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 h-screen flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">SkillProof AI</h2>
        <p className="text-xs text-slate-400 mt-1">{role === 'employee' ? 'Employee' : 'Supervisor'} Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition"
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-6 border-t border-slate-700">
        <div className="mb-4">
          <p className="text-sm font-medium text-white truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
