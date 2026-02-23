# STRUCTRA Setup and Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git (optional)

## 1. Initial Setup

### Clone or Download
```bash
cd e:\Structra
```

### Install Dependencies
```bash
npm install
```

## 2. Supabase Configuration

### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database provisioning

### B. Run Migrations
1. Copy SQL from `supabase/migrations/001_initial_schema.sql`
2. Go to Supabase Dashboard > SQL Editor
3. Paste and execute the schema
4. Copy and run `002_rls_policies.sql`
5. Copy and run `003_seed_data.sql` (after replacing `{{ORG_ID}}`)
6. Run migrations 004-014 in order (see Migration List below)
7. **Important:** Run `015_consolidate_inventory_schema.sql` to fix schema conflicts
8. **Important:** Run `016_add_unique_constraints.sql` for data integrity
9. **Important:** Run `017_add_missing_indexes.sql` for performance

**Migration List (run in order):**
- 001: Initial schema (42 tables)
- 002: RLS policies
- 003: Seed data (NCR materials/labor/equipment)
- 004: Assembly components
- 005: Comprehensive enhancements (rebar, formwork, calculators)
- 006: Project-first architecture
- 007: Documents table
- 008: Schedule enhancements
- 009: WBS and phases
- 010: Seed residential project
- 011: Inventory system
- 012: Seed inventory data
- 013: Seed progress data
- 014: Storage buckets
- **015: Consolidate inventory schema (FIX)**
- **016: Add unique constraints (ENHANCEMENT)**
- **017: Add missing indexes (PERFORMANCE)**

**Storage Buckets Required:**
- `progress-photos`: For progress monitoring photo uploads (10 MB per file limit)
- `documents`: For project document uploads (50 MB per file limit)

The migration creates these buckets automatically with proper RLS policies and file size limits.

### C. Create First Organization
```sql
-- Run in Supabase SQL Editor
INSERT INTO organizations (name, address, email)
VALUES ('Your Company Name', 'Manila, Philippines', 'info@company.com')
RETURNING id;
```
**Copy the returned ID** - you'll need it for seed data.

### D. Replace Organization ID in Seed Data
1. Open `supabase/migrations/003_seed_data.sql`
2. Replace all instances of `{{ORG_ID}}` with your organization ID
3. Run the seed data migration

### E. Get Supabase Credentials
1. Go to Project Settings > API
2. Copy:
   - Project URL (e.g., `https://xxx.supabase.co`)
   - anon/public key

### F. Connect This Repo to Supabase CLI (Recommended)

This project already includes migration files in `supabase/migrations` and npm scripts for Supabase CLI.

1. Install Supabase CLI (if not installed):
```bash
npm install -g supabase
```

2. Login once:
```bash
npm run supabase:login
```

3. Link this repo to the hosted project:
```bash
npm run supabase:link
```

4. Migration workflow:
```bash
# Create a new timestamped migration file
npm run supabase:migration:new -- add_new_table

# Push all pending migrations to hosted database
npm run supabase:push

# Pull remote schema changes into a migration
npm run supabase:pull
```

5. Optional local Supabase stack:
```bash
npm run supabase:start
npm run supabase:status
npm run supabase:stop
```

## 3. Environment Configuration

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Create First Admin User

### Option A: Via Supabase Dashboard
1. Go to Authentication > Users
2. Click "Add User"
3. Enter email and password
4. Copy the user ID

### Option B: Via App Signup
Just use the signup form in the app (will default to 'viewer' role)

### Update User Role to Admin
```sql
-- Run in Supabase SQL Editor (replace user_id)
UPDATE profiles 
SET role = 'admin', 
    organization_id = 'your-org-id-here'
WHERE id = 'user-id-from-signup';
```

## 5. Development

### Start Development Server
```bash
npm run dev
```
App will be available at `http://localhost:5173`

### Start Electron App (Optional)
```bash
npm run electron:dev
```

## 6. Usage Guide

### Global Search

The system includes a powerful global search feature that searches across all modules:

**How to use:**
- Click the search button in the sidebar
- Or press **Ctrl+K** (Windows/Linux) or **⌘K** (Mac) to open search
- Type your search query to find:
  - Projects (by name, client, location)
  - Estimates (by number, project name)
  - Materials (by name, category)
  - Schedule Tasks (by name, description)
  - Assemblies (by name, code)
  - Workers (by name, trade)
  - BOQ Items (by item number, description)

**Navigation:**
- Use ↑↓ arrow keys to navigate results
- Press **Enter** to open selected item
- Press **Esc** to close search

### Creating Your First Estimate

1. **Login** with your admin credentials
2. Navigate to **Estimates** module
3. Click **"New Estimate"**
4. Go to **Project Details** tab:
   - Enter project name, location, client
   - Set floor area
5. Go to **Bill of Quantities** tab:
   - Click **"Add Item"** for each work item
   - Enter:
     - Trade (e.g., "Concrete Works")
     - Description (e.g., "Concrete Slab 4" thick")
     - Unit (e.g., "sq.m")
     - Quantity
     - Unit Price
   - Amount is auto-calculated
6. Go to **Summary & OCM** tab:
   - Adjust OCM percentages:
     - Overhead: 5%
     - Contingency: 5%
     - Miscellaneous: 3%
     - Profit: 10%
   - VAT defaults to 12% (exclusive)
7. Review total cost breakdown
8. Click **Save**
9. Click **Export PDF** when ready

### Using Assemblies for Unit Price

**Note:** Assembly-based costing requires additional setup:

1. Materials, labor types, and equipment must be populated
2. Assemblies must be created with components
3. BOQ items can reference assemblies for automatic unit price calculation

NCR baseline materials, labor, and equipment are included in seed data.

## 7. Production Build

### Web Application
```bash
npm run build
```
Output will be in `dist/` folder - deploy to any static hosting (Vercel, Netlify, etc.)

**Performance Optimizations:**
- ✅ Lazy loading implemented for all routes
- ✅ Code-splitting: Main bundle ~467 KB (down from 1,370 KB)
- ✅ Heavy components loaded on-demand (calculators, charts, editors)
- ✅ Initial page load: 140 KB gzipped (main bundle + CSS)
- ✅ Database indexes optimized for common queries

### Electron Desktop App
```bash
npm run electron:build
```
Output in `dist-electron/` as Windows installer (.exe)

## 8. Database Maintenance

### Backup
Use Supabase Dashboard > Database > Backups (automated daily)

### Manual Backup
```bash
# Download via Supabase CLI or Dashboard
```

## 9. Feature Modules Status

✅ **Implemented:**
- Authentication & Authorization
- Dashboard with stats
- Projects (Project-first architecture)
- Estimator with BOQ (full CRUD)
- Schedule Management (Gantt charts, WBS, phases)
- Inventory Management (warehouses, materials, stock levels, movements)
- Progress Monitoring (S-curves, earned value, BOQ tracking, photo documentation)
- **Global Search (Ctrl+K/⌘K) across all modules**
- Currency utilities (₱ formatting)
- Offline caching (IndexedDB)
- Responsive UI
- **Performance optimizations (lazy loading, code-splitting)**
- **Database optimizations (unique constraints, indexes)**

🚧 **Planned (Placeholders Created):**
- Manpower Management (full features)
- Daily Attendance
- Construction Daily Logbook (PDF generation)
- Cost Control (budget vs actual)
- Document Management
- Purchase Orders & Procurement

## 10. Customization

### Adjust OCM Defaults
Edit `src/services/estimateService.ts`:
```typescript
ocm_overhead: 5,    // Change default %
ocm_contingency: 5,
ocm_misc: 3,
ocm_profit: 10,
```

### Modify Labor Rates
Update seed data or edit via future admin panel

### Add Categories
Extend `materials`, `labor_types`, `equipment` categories in seed data

## 11. Troubleshooting

### "Missing Supabase environment variables"
- Double-check `.env` file exists
- Ensure values don't have quotes around them
- Restart dev server after changes

### RLS Policy Errors
- Verify user is assigned to an organization
- Check user role in profiles table
- Confirm RLS policies are applied

### BOQ items not calculating
- Ensure qty and unit_price are numbers
- Check for JavaScript errors in console

### Login Issues
- Verify Supabase project is active
- Check auth URL redirect settings
- Confirm user exists in Supabase Auth

### Progress Monitoring Stuck Loading
- Ensure project has at least one estimate created
- Check that `014_create_storage_buckets.sql` migration was run
- Verify storage buckets exist in Supabase Dashboard > Storage
- If no estimate exists, create one for the project first

### Photo/Document Upload Errors
- Run migration `014_create_storage_buckets.sql` if not done
- Verify buckets exist: `progress-photos` and `documents`
- Check RLS policies are applied to storage.objects
- Ensure user is authenticated before uploading

### Slow Performance
- Ensure all 17 migrations have been run (especially 015-017)
- Check browser network tab for slow API calls
- Migration 017 adds critical indexes for query performance
- Clear browser cache if experiencing stale data issues

### Duplicate Data Errors
- If seeing "unique constraint violation" errors after upgrade
- This is expected - migration 016 adds data integrity constraints
- Review and remove duplicate estimate numbers, bar marks, or template names
- Constraints ensure data quality going forward

## 12. Next Steps

### Implement Full Modules
1. **Manpower:** Complete worker CRUD, crew management
2. **Attendance:** Daily check-in/out with time tracking
3. **Daily Logbook:** All sections + PDF generation
4. **Inventory:** Stock management with PO integration
5. **Schedule:** Gantt chart with dependencies
6. **Progress:** S-curves and variance analysis

### Performance Optimization
- Implement virtual scrolling for large BOQ tables
- Add pagination for estimates list
- Optimize Supabase queries with indexes

### Security Enhancements
- Add rate limiting
- Implement audit logging
- Enable 2FA for admin accounts

## Support

For questions or issues:
- Check Supabase logs
- Review browser console for errors
- Verify database connectivity
- Check RLS policy evaluation

---

**License:** Proprietary  
**Version:** 1.0.0  
**Built for:** Philippines NCR Construction Market
