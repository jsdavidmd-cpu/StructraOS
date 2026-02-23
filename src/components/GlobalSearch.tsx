import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FolderKanban, FileText, Package, CheckSquare, Layers, Users, ListTree, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { globalSearchService, type SearchResult } from '@/services/globalSearchService';
import { useAuthStore } from '@/store/authStore';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

const iconMap: Record<string, any> = {
  FolderKanban,
  FileText,
  Package,
  CheckSquare,
  Layers,
  Users,
  ListTree,
};

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      if (profile?.organization_id) {
        const searchResults = await globalSearchService.search(query, profile.organization_id, 5);
        setResults(searchResults);
        setSelectedIndex(0);
      }
      setLoading(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, profile?.organization_id]);

  // Group results by type
  const groupedResults = globalSearchService.groupByType(results);
  const resultTypes = Object.keys(groupedResults);

  // Navigate to selected result
  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.path);
    onClose();
    setQuery('');
    setResults([]);
  }, [navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, handleSelect]);

  // Reset when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[600px] p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, estimates, materials, tasks..."
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              autoFocus
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[500px] p-2">
          {!query.trim() && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Start typing to search across all modules</p>
              <p className="text-xs mt-2">Projects • Estimates • Materials • Tasks • Assemblies • Workers • BOQ Items</p>
            </div>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-2">Try different keywords or check spelling</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              {resultTypes.map((type) => {
                const typeResults = groupedResults[type];
                const Icon = iconMap[globalSearchService.getTypeIcon(type as SearchResult['type'])] || Search;

                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 px-2 py-1 mb-1">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {globalSearchService.getTypeName(type as SearchResult['type'])}
                      </h3>
                      <span className="text-xs text-muted-foreground">({typeResults.length})</span>
                    </div>

                    <div className="space-y-1">
                      {typeResults.map((result) => {
                        const globalIndex = results.indexOf(result);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              'w-full text-left px-3 py-2.5 rounded-md transition-colors',
                              'hover:bg-accent focus:outline-none',
                              isSelected && 'bg-accent'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{result.title}</div>
                                {result.subtitle && (
                                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                                    {result.subtitle}
                                  </div>
                                )}
                                {result.description && (
                                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                                    {result.description}
                                  </div>
                                )}
                              </div>
                              {result.metadata?.status && (
                                <span
                                  className={cn(
                                    'text-xs px-2 py-0.5 rounded-full whitespace-nowrap',
                                    result.metadata.status === 'active' && 'bg-green-100 text-green-700',
                                    result.metadata.status === 'draft' && 'bg-gray-100 text-gray-700',
                                    result.metadata.status === 'completed' && 'bg-blue-100 text-blue-700',
                                    result.metadata.status === 'approved' && 'bg-emerald-100 text-emerald-700'
                                  )}
                                >
                                  {result.metadata.status}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2 bg-muted/50 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Enter</kbd>
              <span>Open</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
          <div className="text-xs">
            {results.length > 0 && `${results.length} result${results.length > 1 ? 's' : ''}`}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
