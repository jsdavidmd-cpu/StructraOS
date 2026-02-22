import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ManpowerPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder data
  const workers = [
    { id: 1, employeeNumber: 'EMP-001', name: 'Juan Dela Cruz', trade: 'Mason', dailyRate: 950, type: 'direct', status: 'active' },
    { id: 2, employeeNumber: 'EMP-002', name: 'Pedro Santos', trade: 'Carpenter', dailyRate: 900, type: 'direct', status: 'active' },
    { id: 3, employeeNumber: 'EMP-003', name: 'Maria Garcia', trade: 'Helper', dailyRate: 650, type: 'direct', status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manpower Management</h2>
          <p className="text-muted-foreground">
            Manage workers, crews, and labor resources
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Worker
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search workers by name, trade, or employee number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workers Directory</CardTitle>
          <CardDescription>{workers.length} active workers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium">{worker.employeeNumber}</TableCell>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{worker.trade}</TableCell>
                  <TableCell>₱{worker.dailyRate.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{worker.type}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {worker.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
