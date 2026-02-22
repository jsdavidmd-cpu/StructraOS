import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { assemblyService } from '@/services/assemblyService';
import { formatCurrency } from '@/lib/currency';
import { useAuthStore } from '@/store/authStore';

interface Assembly {
  id: string;
  code: string | null;
  name: string;
  unit: string;
  category: string | null;
  is_active: boolean;
  unit_price?: number;
}

export default function AssembliesPage() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    unit: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    loadAssemblies();
  }, []);

  const loadAssemblies = async () => {
    try {
      setLoading(true);
      const data = await assemblyService.getAssemblies();

      // Calculate unit prices for each assembly
      const assembliesWithPrices = await Promise.all(
        data.map(async (asm: any) => {
          try {
            const fullAsm = await assemblyService.getAssembly(asm.id);
            return {
              ...asm,
              unit_price: fullAsm.unit_price,
            };
          } catch (error) {
            console.error('Error loading assembly details:', error);
            return {
              ...asm,
              unit_price: 0,
            };
          }
        })
      );

      setAssemblies(assembliesWithPrices);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(assembliesWithPrices.map((a: any) => a.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories.sort());
    } catch (error) {
      console.error('Failed to load assemblies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssembly = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.unit.trim()) {
      alert('Assembly name and unit are required');
      return;
    }

    try {
      const newAssembly = await assemblyService.createAssembly({
        organization_id: profile?.organization_id || '795acdd9-9a69-4699-aaee-2787f7babce0',
        code: formData.code || null,
        name: formData.name,
        unit: formData.unit,
        category: formData.category || null,
        description: formData.description || null,
        is_active: true,
      } as any);

      setFormData({
        code: '',
        name: '',
        unit: '',
        category: '',
        description: '',
      });
      setIsCreating(false);

      // Navigate to detail page to add components
      navigate(`/assemblies/${(newAssembly as any).id}`);
    } catch (error) {
      console.error('Failed to create assembly:', error);
      alert('Failed to create assembly');
    }
  };

  const handleDeleteAssembly = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assembly?')) {
      return;
    }

    try {
      await assemblyService.deleteAssembly(id);
      setAssemblies(assemblies.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Failed to delete assembly:', error);
      alert('Failed to delete assembly');
    }
  };

  const filteredAssemblies = assemblies.filter((asm) => {
    const matchSearch = asm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asm.code && asm.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = !selectedCategory || asm.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assemblies</h1>
          <p className="text-gray-600 mt-2">
            Manage unit price analysis templates
          </p>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Assembly
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Assembly</DialogTitle>
              <DialogDescription>
                Add a new assembly template for unit price analysis
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAssembly} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g., ASM-009"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Concrete 28 MPa"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="e.g., cu.m, sq.m, pc, kg"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Concrete Works"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional notes..."
                  rows={3}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create & Setup Components
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assembly Library</CardTitle>
          <CardDescription>
            {assemblies.length} assemblies available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading assemblies...
              </div>
            ) : filteredAssemblies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No assemblies found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssemblies.map((asm) => (
                      <TableRow key={asm.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {asm.code || '-'}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() =>
                              navigate(`/assemblies/${asm.id}`)
                            }
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {asm.name}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {asm.unit}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {asm.category || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(asm.unit_price || 0)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/assemblies/${asm.id}`)
                                }
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View & Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteAssembly(asm.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
