# STRUCTRA Architecture Documentation

## System Overview

STRUCTRA is a full-stack construction management system designed for the Philippine NCR market. It follows a modern, scalable architecture with offline-first capabilities.

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3 + ShadCN UI components
- **State Management:** Zustand with persistence
- **Routing:** React Router v6
- **Forms:** Native HTML5 with controlled components
- **Charts:** Recharts (for future modules)

### Desktop
- **Runtime:** Electron 28
- **IPC:** Context Bridge for secure main-renderer communication
- **Features:** PDF export, file attachments, auto-update

### Backend
- **Database:** Supabase (PostgreSQL 15)
- **Authentication:** Supabase Auth (JWT-based)
- **Storage:** Supabase Storage (for images/documents)
- **API:** Supabase auto-generated REST API
- **Real-time:** Supabase Realtime subscriptions (future use)

### Offline Support
- **Caching:** Dexie.js (IndexedDB wrapper)
- **Sync Strategy:** Optimistic UI updates with eventual consistency

## Architecture Patterns

### 1. Feature-Based Folder Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (ShadCN)
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── auth/            # Auth-specific components
├── pages/
│   ├── estimator/       # Estimator module pages
│   ├── manpower/        # Manpower module pages
│   ├── logbook/         # Daily logbook pages
│   └── ...
├── services/
│   ├── authService.ts   # Authentication logic
│   ├── estimateService.ts
│   └── ...
├── store/
│   ├── authStore.ts     # Auth state
│   └── appStore.ts      # App-wide state
├── lib/
│   ├── supabase.ts      # Supabase client
│   ├── db.ts            # IndexedDB (Dexie)
│   ├── currency.ts      # PHP currency utilities
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
```

### 2. Service Layer Pattern

All data access goes through service modules:

```typescript
// Example: estimateService.ts
export const estimateService = {
  async getEstimates() { ... },
  async createEstimate() { ... },
  async updateEstimate() { ... },
  // ...
}
```

**Benefits:**
- Centralized business logic
- Easy to mock for testing
- Clear separation of concerns
- Reusable across components

### 3. Row-Level Security (RLS)

Every table has RLS policies enforcing:
- Multi-tenancy (organization_id filtering)
- Role-based access control (admin/engineer/foreman/viewer)
- Audit trail (created_by, updated_at)

```sql
-- Example RLS Policy
CREATE POLICY "Users can view own organization estimates"
  ON estimates FOR SELECT
  USING (organization_id = auth.user_organization_id());
```

### 4. Offline-First Caching

```typescript
// Check IndexedDB cache first
const cachedData = await db.materials.toArray();
if (isCacheValid(cachedData[0]?.updatedAt)) {
  return cachedData;
}

// Fetch from Supabase if cache stale
const { data } = await supabase.from('materials').select('*');
await db.materials.bulkPut(data);
return data;
```

### 5. State Management Strategy

- **Global State (Zustand):** Auth, app settings, current project
- **Server State:** Fetched via services, cached locally
- **Local State (useState):** Component-specific UI state
- **Persistence:** Auth state persisted to localStorage

## Data Flow

### Estimate Creation Flow

```
User Action (Create Estimate)
    ↓
estimateService.createEstimate()
    ↓
Supabase REST API
    ↓
PostgreSQL INSERT (with RLS check)
    ↓
Return new estimate data
    ↓
Update local state
    ↓
Navigate to estimate detail page
```

### BOQ Calculation Flow

```
User enters qty/unit_price
    ↓
onChange handler
    ↓
estimateService.updateBOQItem()
    ↓
PostgreSQL UPDATE
    ↓
GENERATED column calculates amount (qty * unit_price)
    ↓
Fetch updated row
    ↓
Re-calculate totals in UI
    ↓
Display updated summary
```

## Database Schema Design

### Core Principles

1. **Normalized Design:** 3NF normalization to reduce redundancy
2. **Audit Fields:** All tables have created_at, updated_at, created_by
3. **Soft Deletes:** Use is_active flags instead of hard deletes (where applicable)
4. **Computed Columns:** Use GENERATED columns for derived values (e.g., amount = qty * unit_price)

### Key Tables

**estimates**
- Main estimate/proposal record
- Contains OCM percentages and totals
- Links to optional project

**boq_items**
- Individual line items in BOQ
- Can reference assemblies for auto-pricing
- Generated amount column for real-time calculation

**assemblies & assembly_components**
- Reusable unit price analysis templates
- Components link to materials/labor/equipment
- Enables consistent pricing across estimates

**attendance & deployment**
- Daily worker check-in/out
- Links attendance to BOQ activities
- Tracks productivity (qty_output/manhours)

### Relationships

```
organizations (1) ─── (∞) profiles
organizations (1) ─── (∞) projects
projects (1) ─── (∞) estimates
estimates (1) ─── (∞) boq_items
boq_items (∞) ─── (1) assemblies
```

## Security Architecture

### Authentication Flow

1. User submits credentials
2. Supabase Auth validates
3. JWT token issued (1 hour expiry)
4. Token stored in localStorage
5. Auto-refresh on expiry
6. Profile fetched and cached

### Authorization Layers

1. **Supabase RLS:** Database-level security
2. **API Validation:** Ensure valid organization_id
3. **UI Guards:** ProtectedRoute component
4. **Role Checks:** Helper functions (isAdmin, isEngineer)

### API Security

- All requests include JWT in Authorization header
- Supabase validates token server-side
- RLS policies enforce data isolation
- Rate limiting via Supabase (future)

## Electron Integration

### Main Process (`electron/main.js`)

- Creates BrowserWindow
- Handles IPC messages
- Manages file system operations
- PDF generation via printToPDF

### Renderer Process (React App)

- Standard web app
- No direct Node.js access
- Uses IPC via exposed API

### IPC Communication

```typescript
// Renderer (React)
window.electronAPI.exportPDF({ html, filename })

// Preload (Context Bridge)
contextBridge.exposeInMainWorld('electronAPI', {
  exportPDF: (data) => ipcRenderer.invoke('export-pdf', data)
})

// Main Process
ipcMain.handle('export-pdf', async (event, { html, filename }) => {
  // Generate PDF and save
})
```

## Performance Considerations

### Current Optimizations

1. **Lazy Loading:** Routes loaded on-demand
2. **Memoization:** React.memo for expensive components
3. **Debouncing:** Input handlers debounced (future)
4. **IndexedDB:** Reduces API calls
5. **Generated Columns:** Database calculates amounts

### Future Optimizations

1. **Virtual Scrolling:** For large BOQ tables
2. **Pagination:** For estimate lists
3. **React Query:** For better server state management
4. **Web Workers:** For heavy calculations
5. **CDN:** For static assets

## Error Handling

### Strategy

1. **Try-Catch:** All async operations wrapped
2. **User Feedback:** Toast notifications (future)
3. **Logging:** Console errors in development
4. **Graceful Degradation:** Fallback UI on errors

### Example

```typescript
try {
  await estimateService.createEstimate(data);
} catch (error) {
  console.error('Failed to create estimate:', error);
  // Show toast notification
  // Revert optimistic update
}
```

## Testing Strategy (Future)

### Unit Tests
- Services with mocked Supabase
- Currency utilities
- Business logic functions

### Integration Tests
- Auth flow
- CRUD operations
- RLS policy validation

### E2E Tests (Playwright)
- Critical user journeys
- Estimate creation flow
- BOQ editing

## Deployment

### Web Deployment

1. Build: `npm run build`
2. Output: `dist/` folder
3. Host: Vercel, Netlify, or any static host
4. Env vars: Set in hosting platform

### Desktop Deployment

1. Build: `npm run electron:build`
2. Output: `dist-electron/` with installer
3. Distribution: GitHub Releases or direct download
4. Auto-update: Configure update server

## Monitoring (Future)

### Application Monitoring
- Sentry for error tracking
- Google Analytics for usage
- Custom event tracking

### Database Monitoring
- Supabase built-in analytics
- Query performance tracking
- Connection pooling stats

## Scalability Considerations

### Current Limitations

- Single Supabase instance
- No horizontal scaling
- Limited to Supabase quotas

### Future Scaling

1. **Database:** Upgrade Supabase tier or migrate to managed PostgreSQL
2. **CDN:** CloudFlare for static assets
3. **Caching:** Redis for session/query cache
4. **Load Balancing:** Multiple app instances
5. **Microservices:** Split into domain services

## Maintenance

### Regular Tasks

1. **Dependency Updates:** Monthly npm audit
2. **Database Backups:** Automated via Supabase
3. **RLS Audit:** Quarterly security review
4. **Performance Review:** Monitor slow queries

### Version Control

- Git for source code
- Semantic versioning (MAJOR.MINOR.PATCH)
- Migration scripts versioned in `supabase/migrations/`

---

**Last Updated:** 2026-02-11  
**Architecture Version:** 1.0
