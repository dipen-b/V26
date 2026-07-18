'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  role: 'employee' | 'supervisor';
}

export function Sidebar({ role }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const employeeLinks = [
    { name: 'Dashboard', href: '/employee/dashboard', icon: HomeIcon },
    { name: 'My Tasks', href: '/employee/tasks', icon: ClipboardDocumentListIcon },
    { name: 'My Projects', href: '/employee/projects', icon: FolderIcon },
    { name: 'My Evaluations', href: '/employee/evaluations', icon: ClipboardDocumentCheckIcon },
    { name: 'My Growth', href: '/employee/growth', icon: ArrowTrendingUpIcon },
    { name: 'Profile', href: '/employee/profile', icon: UserIcon },
  ];

  const supervisorLinks = [
    { name: 'Dashboard', href: '/supervisor/dashboard', icon: HomeIcon },
    { name: 'Team', href: '/supervisor/team', icon: UsersIcon },
    { name: 'Analytics', href: '/supervisor/analytics', icon: ChartBarIcon },
    { name: 'Evaluations', href: '/supervisor/evaluations', icon: ClipboardDocumentCheckIcon },
    { name: 'Profile', href: '/supervisor/profile', icon: UserIcon },
  ];

  const links = role === 'employee' ? employeeLinks : supervisorLinks;

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside
      className="w-64 h-screen flex flex-col sticky top-0 border-r"
      style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-strong))' }}
          >
            S
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">SkillProof AI</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {role === 'employee' ? 'Employee' : 'Supervisor'} Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = pathname === link.href || pathname?.startsWith(link.href + '/');
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sp-nav-link ${active ? 'sp-nav-link-active' : ''}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 mb-2"
          style={{ background: 'var(--surface-2)' }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            {initials || <UserIcon className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="sp-nav-link w-full">
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
