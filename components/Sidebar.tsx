'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { 
  MessageSquare, 
  FileText, 
  Bot, 
  Search, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Home
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
    description: 'Main dashboard'
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: MessageSquare,
    description: 'AI Chat interface'
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: FileText,
    description: 'Document management'
  },
  {
    title: 'Agents',
    href: '/agents',
    icon: Bot,
    description: 'AI Agents'
  },
  {
    title: 'Search',
    href: '/search',
    icon: Search,
    description: 'Semantic search'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'User settings'
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className={cn(
      "relative flex flex-col border-r bg-background transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Toggle Button */}
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed ? "px-2" : "px-3",
                  isActive && "bg-secondary"
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn(
                  "h-4 w-4",
                  collapsed ? "mr-0" : "mr-2"
                )} />
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </Button>
            </Link>
          );
        })}

        {/* Admin Section */}
        {session?.user?.role === 'admin' && (
          <>
            <div className={cn(
              "mt-6 pt-6 border-t",
              collapsed && "mx-2"
            )}>
              {!collapsed && (
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Admin
                </p>
              )}
              <Link href="/admin">
                <Button
                  variant={pathname?.startsWith('/admin') ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed ? "px-2" : "px-3"
                  )}
                  title={collapsed ? "Admin Dashboard" : undefined}
                >
                  <Shield className={cn(
                    "h-4 w-4",
                    collapsed ? "mr-0" : "mr-2"
                  )} />
                  {!collapsed && (
                    <span className="truncate">Admin Dashboard</span>
                  )}
                </Button>
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* User Info (when expanded) */}
      {!collapsed && session?.user && (
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">
                {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}