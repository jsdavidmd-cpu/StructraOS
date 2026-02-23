import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { projectService } from '@/services/projectService';

interface ProjectContextValue {
  activeProjectId: string | null;
  activeProject: any | null;
  setActiveProjectId: (projectId: string | null) => void;
  refreshActiveProject: () => Promise<void>;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export function ProjectContextProvider({ children }: { children: React.ReactNode }) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshActiveProject = async () => {
    if (!activeProjectId) {
      setActiveProject(null);
      return;
    }

    if (!isUuid(activeProjectId)) {
      setActiveProject(null);
      return;
    }

    try {
      setLoading(true);
      const project = await projectService.getProject(activeProjectId);
      setActiveProject(project);
    } catch {
      setActiveProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshActiveProject();
  }, [activeProjectId]);

  const value = useMemo(
    () => ({
      activeProjectId,
      activeProject,
      setActiveProjectId,
      refreshActiveProject,
      loading,
    }),
    [activeProjectId, activeProject, loading]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProjectContext must be used inside ProjectContextProvider');
  }
  return ctx;
}
