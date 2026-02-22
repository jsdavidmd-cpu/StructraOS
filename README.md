# STRUCTRA – Construction Management System

A comprehensive construction management system built for the Philippines NCR market, featuring estimating, manpower tracking, inventory, scheduling, and progress monitoring.

## Tech Stack

- **Frontend:** Vite + React 18 + TypeScript
- **Desktop:** Electron with auto-update
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **UI:** Tailwind CSS + ShadCN components
- **Charts:** Recharts
- **State Management:** Zustand
- **Offline Support:** IndexedDB (Dexie)

## Features

### 1. Estimator
- Materials, labor, and equipment database
- Assembly-based costing
- Bill of Quantities (BOQ) generation
- Unit Price Analysis
- OCM (Overhead, Contingency, Miscellaneous) & Profit calculation
- PDF proposal export

### 2. Manpower & Attendance
- Worker registration (direct/subcon/pakyaw)
- Daily attendance tracking
- Crew management
- Activity deployment
- Productivity monitoring
- Payroll-ready reports

### 3. Daily Logbook
- Weather and site conditions
- Manpower summary
- Activities accomplished
- Materials tracking
- Equipment utilization
- Photo attachments
- Auto-generated PDF reports

### 4. Inventory
- Multi-warehouse support
- Stock cards
- Purchase order integration
- Material issuance to BOQ activities
- Wastage tracking

### 5. Scheduling
- Task generation from BOQ
- Productivity-based duration calculation
- Gantt chart visualization
- Baseline vs actual tracking

### 6. Progress Monitoring
- Daily progress entries
- Cost and schedule variance analysis
- S-curve visualization
- Photo documentation

### 7. Cost Control
- Budget vs actual analysis
- Change order management
- Cash flow tracking

### 8. Documents
- Drawing management
- RFIs (Request for Information)
- Transmittals
- Punch lists

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your Supabase credentials to `.env`

4. Run development server:
```bash
npm run dev
```

5. Run Electron app:
```bash
npm run electron:dev
```

## Build

```bash
npm run electron:build
```

## Database Setup

1. Create a new Supabase project
2. Run migrations in `supabase/migrations/`
3. Apply RLS policies
4. Seed initial data

## Currency Format

All amounts are formatted as Philippine Peso (₱) with comma separators and 2 decimal places:
- ₱1,234.56
- VAT Mode: EXCLUSIVE

## License

Proprietary
