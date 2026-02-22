import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Calendar,
  TrendingUp,
  BookOpen,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  Grid3x3,
  Hammer,
  Building2,
  Wrench,
  Palette,
  Droplet,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

const mainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Building2, label: 'Vertical BOQ', path: '/boq/vertical' },
  { icon: FileText, label: 'Estimates', path: '/estimates' },
  { icon: Layers, label: 'Assemblies', path: '/assemblies' },
  { icon: Grid3x3, label: 'Bar Schedule', path: '/estimates' },
  { icon: Hammer, label: 'Formwork Reuse', path: '/formwork-reuse' },
  { icon: Users, label: 'Manpower', path: '/manpower' },
  { icon: BookOpen, label: 'Daily Logbook', path: '/logbook' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: Calendar, label: 'Schedule', path: '/schedule' },
  { icon: TrendingUp, label: 'Progress', path: '/progress' },
  { icon: FolderOpen, label: 'Documents', path: '/documents' },
];

const toolsMenuItems = [
  { icon: Wrench, label: 'Concrete', path: '/calculators/concrete', badge: '🔨' },
  { icon: Wrench, label: 'Rebar', path: '/calculators/rebar', badge: '⚙️' },
  { icon: Wrench, label: 'Formwork', path: '/calculators/formwork', badge: '📐' },
  { icon: Hammer, label: 'Foundations', path: '/calculators/foundation', badge: '🏗️' },
  { icon: Building2, label: 'Columns & Beams', path: '/calculators/structural', badge: '📊' },
  { icon: Zap, label: 'Composite Slabs', path: '/calculators/composite-slab', badge: '⚡' },
  { icon: Wrench, label: 'Equipment', path: '/calculators/equipment', badge: '🏗️' },
  { icon: Palette, label: 'Finishes', path: '/calculators/finishes', badge: '🎨' },
  { icon: Droplet, label: 'Flooring', path: '/calculators/flooring', badge: '🏢' },
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">STRUCTRA</span>
                <span className="text-xs font-semibold text-primary">by Argentum</span>
              </div>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className={cn(
              'p-1.5 rounded-lg hover:bg-accent transition-colors',
              !sidebarOpen && 'mx-auto'
            )}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {/* Main Menu Section */}
          <ul className="space-y-1 mb-6">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      !sidebarOpen && 'justify-center'
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Tools Section Header */}
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</h3>
            </div>
          )}

          {/* Tools Menu Section */}
          <ul className="space-y-1">
            {toolsMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                             (location.pathname.startsWith(item.path));

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      !sidebarOpen && 'justify-center'
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs">{item.badge}</span>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          {sidebarOpen ? (
            <div className="text-xs text-muted-foreground">
              <div>Version 1.0.0</div>
              <div className="mt-1">© 2026 STRUCTRA</div>
            </div>
          ) : (
            <div className="text-xs text-center text-muted-foreground">v1.0</div>
          )}
        </div>
      </div>
    </aside>
  );
}
