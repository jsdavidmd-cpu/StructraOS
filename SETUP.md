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
- Estimator with BOQ (full CRUD)
- Currency utilities (₱ formatting)
- Offline caching (IndexedDB)
- Responsive UI

🚧 **Planned (Placeholders Created):**
- Manpower Management (full features)
- Daily Attendance
- Construction Daily Logbook (PDF generation)
- Inventory Management
- Project Scheduling (Gantt)
- Progress Monitoring
- Cost Control
- Document Management

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
