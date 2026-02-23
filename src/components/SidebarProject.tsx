import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Home,
  FileText,
  Calendar,
  Users,
  Package,
  TrendingUp,
  FolderOpen,
  Wrench,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import { useProjectContext } from '@/components/ProjectContextProvider';

const verticalTools = [
  'Columns & Beams',
  'Slabs',
  'Formwork',
  'Finishes',
  'Flooring',
  'Equipment Planning',
];

const horizontalTools = [
  'Earthworks',
  'Roadworks',
  'Drainage',
  'Utilities',
  'Asphalt',
  'Survey Layout',
];

export default function SidebarProject() {
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const { activeProject } = useProjectContext();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  const basePath = `/projects/${projectId}`;
  const tools = activeProject?.project_orientation === 'Horizontal' ? horizontalTools : verticalTools;

  const menuItems = [
    { icon: Home, label: 'Project Overview', path: `${basePath}/overview` },
    { icon: FileText, label: 'Estimates & BOQ', path: `${basePath}/estimates` },
    { icon: Calendar, label: 'Schedule', path: `${basePath}/schedule` },
    { icon: Users, label: 'Manpower', path: `${basePath}/manpower` },
    { icon: Package, label: 'Inventory', path: `${basePath}/inventory` },
    { icon: TrendingUp, label: 'Progress', path: `${basePath}/progress` },
    { icon: FolderOpen, label: 'Documents', path: `${basePath}/documents` },
    { icon: Wrench, label: 'Engineering Tools', path: `${basePath}/tools` },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="h-16 border-b px-4 flex items-center justify-between">
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Active Project</p>
              <p className="text-sm font-semibold truncate">{activeProject?.name || 'Project Workspace'}</p>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={cn('p-1.5 rounded-lg hover:bg-accent transition-colors', !sidebarOpen && 'mx-auto')}
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <Link
            to="/projects"
            className={cn(
              'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors mb-2',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              !sidebarOpen && 'justify-center'
            )}
            title={!sidebarOpen ? 'Back to Projects' : undefined}
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Back to Projects</span>}
          </Link>

          <ul className="space-y-1 mb-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

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
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          {sidebarOpen && (
            <div className="px-3 py-2 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Conditional Tools ({activeProject?.project_orientation || 'Vertical'})
              </h3>
            </div>
          )}

          <ul className="space-y-1">
            {tools.map((tool) => (
              <li key={tool}>
                <Link
                  to={`${basePath}/tools`}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                    'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    !sidebarOpen && 'justify-center'
                  )}
                  title={!sidebarOpen ? tool : undefined}
                >
                  <Wrench className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{tool}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
