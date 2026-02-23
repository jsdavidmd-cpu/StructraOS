import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProjectContext } from '@/components/ProjectContextProvider';
import { Calculator, Zap, PieChart, Package, Home } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  routes: {
    vertical?: string;
    horizontal?: string;
  };
}

const VERTICAL_TOOLS: Tool[] = [
  {
    id: 'columns-beams',
    name: 'Columns & Beams',
    description: 'Design and estimate reinforced concrete columns, beams, and structural frames.',
    icon: Home,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    routes: {
      vertical: 'estimates',
    },
  },
  {
    id: 'slabs',
    name: 'Slabs',
    description: 'Calculate slab reinforcement, formwork, and material requirements.',
    icon: PieChart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    routes: {
      vertical: 'estimates',
    },
  },
  {
    id: 'formwork',
    name: 'Formwork Management',
    description: 'Track formwork inventory, reuse cycles, and cost optimization.',
    icon: Package,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    routes: {
      vertical: 'estimates',
    },
  },
  {
    id: 'finishes',
    name: 'Finishes',
    description: 'Estimate paint, tiles, cladding, and other finishing works.',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    routes: {
      vertical: 'estimates',
    },
  },
  {
    id: 'flooring',
    name: 'Flooring',
    description: 'Plan and cost flooring systems including materials and labor.',
    icon: Home,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    routes: {
      vertical: 'estimates',
    },
  },
  {
    id: 'equipment',
    name: 'Equipment Planning',
    description: 'Calculate equipment requirements, scheduling, and rental costs.',
    icon: Calculator,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    routes: {
      vertical: 'estimates',
    },
  },
];

const HORIZONTAL_TOOLS: Tool[] = [
  {
    id: 'earthworks',
    name: 'Earthworks',
    description: 'Estimate excavation, soil removal, and compaction for horizontal projects.',
    icon: Home,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    routes: {
      horizontal: 'estimates',
    },
  },
  {
    id: 'roadworks',
    name: 'Roadworks',
    description: 'Design road structures, calculate material quantities, and cost estimates.',
    icon: Zap,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    routes: {
      horizontal: 'estimates',
    },
  },
  {
    id: 'drainage',
    name: 'Drainage Systems',
    description: 'Plan drainage networks, pipes, and stormwater management systems.',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    routes: {
      horizontal: 'estimates',
    },
  },
  {
    id: 'utilities',
    name: 'Utilities',
    description: 'Calculate water supply, electrical, and telecommunications infrastructure.',
    icon: Zap,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    routes: {
      horizontal: 'estimates',
    },
  },
  {
    id: 'asphalt',
    name: 'Asphalt & Paving',
    description: 'Estimate asphalt mixes, paving schedules, and road surfacing costs.',
    icon: PieChart,
    color: 'text-gray-700',
    bgColor: 'bg-gray-200',
    routes: {
      horizontal: 'estimates',
    },
  },
  {
    id: 'survey-layout',
    name: 'Survey & Layout',
    description: 'Manage surveying tasks, staking, and layout verification.',
    icon: Calculator,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    routes: {
      horizontal: 'estimates',
    },
  },
];

export default function ProjectEngineeringToolsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { activeProject } = useProjectContext();

  const isHorizontal = activeProject?.project_orientation === 'Horizontal';
  const tools = isHorizontal ? HORIZONTAL_TOOLS : VERTICAL_TOOLS;

  const handleToolClick = (tool: Tool) => {
    const routeKey = isHorizontal ? 'horizontal' : 'vertical';
    const route = tool.routes[routeKey as keyof typeof tool.routes];
    if (route && projectId) {
      navigate(`/projects/${projectId}/${route}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Engineering Tools</h2>
        <p className="text-muted-foreground">
          Specialized calculators and tools for {activeProject?.project_orientation || 'Vertical'} projects.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Tools</CardTitle>
          <CardDescription>
            Select a tool to access calculators, estimators, and project-specific workflows. All data is scoped to this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.id} className="border overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className={`inline-flex p-2 rounded-lg ${tool.bgColor} w-fit mb-2`}>
                      <Icon className={`h-5 w-5 ${tool.color}`} />
                    </div>
                    <CardTitle className="text-base">{tool.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                    <Button
                      onClick={() => handleToolClick(tool)}
                      className="w-full"
                      variant="default"
                    >
                      Open Tool
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Navigate to related project modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}/overview`)}
              className="h-auto flex-col items-start p-3"
            >
              <span className="font-semibold">Project Overview</span>
              <span className="text-xs text-muted-foreground">View project details</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}/estimates`)}
              className="h-auto flex-col items-start p-3"
            >
              <span className="font-semibold">Estimates & BOQ</span>
              <span className="text-xs text-muted-foreground">Manage estimates</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}`)}
              className="h-auto flex-col items-start p-3"
            >
              <span className="font-semibold">All Modules</span>
              <span className="text-xs text-muted-foreground">Full project dashboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
