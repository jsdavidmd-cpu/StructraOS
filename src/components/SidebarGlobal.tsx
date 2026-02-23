import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LibraryBig, BarChart3, Shield, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import GlobalSearch from './GlobalSearch';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: LibraryBig, label: 'Templates Library', path: '/templates' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Shield, label: 'Administration', path: '/administration' },
];

export default function SidebarGlobal() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">STRUCTRA</span>
                <span className="text-xs font-semibold text-primary">Project-First</span>
              </div>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={cn('p-1.5 rounded-lg hover:bg-accent transition-colors', !sidebarOpen && 'mx-auto')}
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Global Search Button */}
        <div className="px-2 py-3 border-b">
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
              'bg-accent/50 hover:bg-accent text-muted-foreground hover:text-accent-foreground',
              !sidebarOpen && 'justify-center'
            )}
            title={!sidebarOpen ? 'Search (Ctrl+K)' : undefined}
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && (
              <>
                <span className="text-sm flex-1 text-left">Search...</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-background border rounded">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
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
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t p-4">
          {sidebarOpen ? (
            <div className="text-xs text-muted-foreground">
              <div>Version 2.0.0</div>
              <div className="mt-1">© 2026 STRUCTRA</div>
            </div>
          ) : (
            <div className="text-xs text-center text-muted-foreground">v2.0</div>
          )}
        </div>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </aside>
  );
}
