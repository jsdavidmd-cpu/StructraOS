import Dexie, { type Table } from 'dexie';

// Define interfaces for cached data
export interface CachedMaterial {
  id: string;
  name: string;
  unit: string;
  ncr_price: number;
  category: string | null;
  updatedAt: number;
}

export interface CachedLaborType {
  id: string;
  trade: string;
  daily_rate: number;
  skill_level: string;
  updatedAt: number;
}

export interface CachedAssembly {
  id: string;
  name: string;
  unit: string;
  category: string | null;
  updatedAt: number;
}

export interface CachedProject {
  id: string;
  name: string;
  location: string | null;
  status: string;
  updatedAt: number;
}

// IndexedDB Database for offline caching
export class StructraDB extends Dexie {
  materials!: Table<CachedMaterial>;
  laborTypes!: Table<CachedLaborType>;
  assemblies!: Table<CachedAssembly>;
  projects!: Table<CachedProject>;

  constructor() {
    super('StructraDB');
    
    this.version(1).stores({
      materials: 'id, name, category, updatedAt',
      laborTypes: 'id, trade, updatedAt',
      assemblies: 'id, name, category, updatedAt',
      projects: 'id, name, status, updatedAt',
    });
  }
}

export const db = new StructraDB();

// Cache invalidation time (24 hours)
export const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Check if cache is still valid
export const isCacheValid = (updatedAt: number): boolean => {
  return Date.now() - updatedAt < CACHE_DURATION;
};

// Clear all caches
export const clearAllCaches = async (): Promise<void> => {
  await db.materials.clear();
  await db.laborTypes.clear();
  await db.assemblies.clear();
  await db.projects.clear();
};
