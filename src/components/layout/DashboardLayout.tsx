import { Outlet, useMatch } from 'react-router-dom';
import SidebarGlobal from '@/components/SidebarGlobal';
import SidebarProject from '@/components/SidebarProject';
import Header from './Header';
import { useAppStore } from '@/store/appStore';
import { useEffect } from 'react';
import { useProjectContext } from '@/components/ProjectContextProvider';

export default function DashboardLayout() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const projectMatch = useMatch('/projects/:projectId/*');
  const { setActiveProjectId } = useProjectContext();

  useEffect(() => {
    const nextProjectId = projectMatch?.params?.projectId ?? null;
    setActiveProjectId(nextProjectId);
  }, [projectMatch?.params?.projectId, setActiveProjectId]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {projectMatch ? <SidebarProject /> : <SidebarGlobal />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className={`flex-1 overflow-auto p-6 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
