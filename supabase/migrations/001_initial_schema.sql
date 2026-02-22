-- STRUCTRA Database Schema
-- Construction Management System for Philippines NCR

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations/Companies
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  contact_number TEXT,
  email TEXT,
  tin TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'engineer', 'foreman', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  client_name TEXT,
  contract_amount NUMERIC(15, 2),
  start_date DATE,
  end_date DATE,
  status TEXT CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')) DEFAULT 'planning',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ESTIMATOR MODULE
-- ============================================================================

-- Materials Master List
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  ncr_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  description TEXT,
  supplier TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labor Types/Trades
CREATE TABLE labor_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  trade TEXT NOT NULL,
  daily_rate NUMERIC(10, 2) NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('helper', 'skilled', 'foreman', 'specialist')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment Master List
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  rate_type TEXT CHECK (rate_type IN ('hourly', 'daily', 'monthly')) NOT NULL,
  rate NUMERIC(12, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assemblies (Unit Price Analysis templates)
CREATE TABLE assemblies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assembly Components (breakdown of materials, labor, equipment)
CREATE TABLE assembly_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assembly_id UUID REFERENCES assemblies(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('material', 'labor', 'equipment')) NOT NULL,
  ref_id UUID NOT NULL, -- references materials.id, labor_types.id, or equipment.id
  qty NUMERIC(12, 4) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estimates/Proposals
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  estimate_number TEXT NOT NULL,
  project_name TEXT NOT NULL,
  floor_area NUMERIC(12, 2),
  location TEXT,
  client_name TEXT,
  
  -- OCM (Overhead, Contingency, Miscellaneous)
  ocm_overhead NUMERIC(5, 2) DEFAULT 0, -- percentage
  ocm_contingency NUMERIC(5, 2) DEFAULT 0,
  ocm_misc NUMERIC(5, 2) DEFAULT 0,
  ocm_profit NUMERIC(5, 2) DEFAULT 0,
  
  -- VAT
  vat_type TEXT CHECK (vat_type IN ('exclusive', 'inclusive')) DEFAULT 'exclusive',
  vat_rate NUMERIC(5, 2) DEFAULT 12,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'revised')) DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  
  -- Totals (computed)
  subtotal NUMERIC(15, 2) DEFAULT 0,
  total_amount NUMERIC(15, 2) DEFAULT 0,
  
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill of Quantities Items
CREATE TABLE boq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
  item_number TEXT,
  trade TEXT,
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  qty NUMERIC(12, 2) NOT NULL DEFAULT 0,
  
  -- Pricing
  assembly_id UUID REFERENCES assemblies(id),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount NUMERIC(15, 2) GENERATED ALWAYS AS (qty * unit_price) STORED,
  
  -- For manual entries
  is_manual BOOLEAN DEFAULT FALSE,
  
  notes TEXT,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MANPOWER & ATTENDANCE MODULE
-- ============================================================================

-- Workers
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  employee_number TEXT,
  name TEXT NOT NULL,
  trade TEXT,
  daily_rate NUMERIC(10, 2) DEFAULT 0,
  type TEXT CHECK (type IN ('direct', 'subcon', 'pakyaw')) DEFAULT 'direct',
  status TEXT CHECK (status IN ('active', 'inactive', 'terminated')) DEFAULT 'active',
  
  -- Personal Info
  contact_number TEXT,
  address TEXT,
  emergency_contact TEXT,
  emergency_contact_number TEXT,
  
  -- Government IDs
  sss_number TEXT,
  philhealth_number TEXT,
  pagibig_number TEXT,
  tin TEXT,
  
  date_hired DATE,
  date_terminated DATE,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crews/Teams
CREATE TABLE crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  foreman_id UUID REFERENCES workers(id),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crew Members
CREATE TABLE crew_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id UUID REFERENCES crews(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  joined_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(crew_id, worker_id)
);

-- Attendance Records
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Time tracking
  time_in TIME,
  time_out TIME,
  hours NUMERIC(4, 2) DEFAULT 8,
  overtime NUMERIC(4, 2) DEFAULT 0,
  
  -- Work details
  activity TEXT,
  location TEXT,
  crew_id UUID REFERENCES crews(id),
  
  -- Verification
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  
  -- Status
  status TEXT CHECK (status IN ('present', 'absent', 'halfday', 'leave')) DEFAULT 'present',
  
  remarks TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(worker_id, date, project_id)
);

-- Deployment (linking attendance to BOQ activities for productivity tracking)
CREATE TABLE deployment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendance_id UUID REFERENCES attendance(id) ON DELETE CASCADE,
  boq_item_id UUID REFERENCES boq_items(id),
  qty_output NUMERIC(12, 2) DEFAULT 0,
  manhours NUMERIC(6, 2),
  productivity NUMERIC(10, 4) GENERATED ALWAYS AS (
    CASE WHEN manhours > 0 THEN qty_output / manhours ELSE 0 END
  ) STORED,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DAILY LOGBOOK MODULE
-- ============================================================================

-- Daily Logs
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Weather
  weather_am TEXT,
  weather_pm TEXT,
  temperature TEXT,
  
  -- Site conditions
  site_conditions TEXT,
  safety_issues TEXT,
  delays TEXT,
  instructions TEXT,
  visitors TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'finalized', 'approved')) DEFAULT 'draft',
  finalized_by UUID REFERENCES profiles(id),
  finalized_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id, date)
);

-- Log Manpower Summary
CREATE TABLE log_manpower (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  trade TEXT NOT NULL,
  count INTEGER NOT NULL,
  total_manhours NUMERIC(6, 2) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log Activities Accomplished
CREATE TABLE log_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  boq_item_id UUID REFERENCES boq_items(id),
  description TEXT NOT NULL,
  qty_today NUMERIC(12, 2) NOT NULL,
  unit TEXT,
  location TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log Materials
CREATE TABLE log_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  item_name TEXT NOT NULL,
  
  received NUMERIC(12, 2) DEFAULT 0,
  issued NUMERIC(12, 2) DEFAULT 0,
  balance NUMERIC(12, 2) DEFAULT 0,
  
  unit TEXT,
  supplier TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log Equipment
CREATE TABLE log_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id),
  equipment_name TEXT NOT NULL,
  
  hours NUMERIC(6, 2) NOT NULL,
  operator TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log Photos
CREATE TABLE log_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  location TEXT,
  taken_by UUID REFERENCES profiles(id),
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INVENTORY MODULE
-- ============================================================================

-- Warehouses
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  incharge UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Items (links to materials)
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  
  current_stock NUMERIC(12, 2) DEFAULT 0,
  min_stock NUMERIC(12, 2) DEFAULT 0,
  max_stock NUMERIC(12, 2) DEFAULT 0,
  
  last_received_date DATE,
  last_issued_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(warehouse_id, material_id)
);

-- Stock Cards (transaction history)
CREATE TABLE stock_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'transfer')) NOT NULL,
  
  quantity NUMERIC(12, 2) NOT NULL,
  unit_cost NUMERIC(12, 2),
  
  reference_number TEXT,
  supplier TEXT,
  project_id UUID REFERENCES projects(id),
  boq_item_id UUID REFERENCES boq_items(id),
  
  balance_after NUMERIC(12, 2) NOT NULL,
  
  remarks TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Orders
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  supplier TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  
  po_date DATE NOT NULL,
  delivery_date DATE,
  
  subtotal NUMERIC(15, 2) DEFAULT 0,
  vat_amount NUMERIC(15, 2) DEFAULT 0,
  total_amount NUMERIC(15, 2) DEFAULT 0,
  
  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'received', 'cancelled')) DEFAULT 'draft',
  
  terms TEXT,
  notes TEXT,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PO Items
CREATE TABLE po_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  qty NUMERIC(12, 2) NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  amount NUMERIC(15, 2) GENERATED ALWAYS AS (qty * unit_price) STORED,
  
  qty_received NUMERIC(12, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SCHEDULING MODULE
-- ============================================================================

-- Tasks (generated from BOQ items or manual)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  boq_item_id UUID REFERENCES boq_items(id),
  
  task_name TEXT NOT NULL,
  description TEXT,
  
  -- Schedule
  planned_start DATE,
  planned_end DATE,
  planned_duration INTEGER, -- days
  
  actual_start DATE,
  actual_end DATE,
  actual_duration INTEGER,
  
  -- Resources
  crew_id UUID REFERENCES crews(id),
  productivity_rate NUMERIC(10, 4), -- units per manhour
  
  -- Progress
  qty_planned NUMERIC(12, 2),
  qty_completed NUMERIC(12, 2) DEFAULT 0,
  percent_complete NUMERIC(5, 2) DEFAULT 0,
  
  -- Dependencies
  predecessor_ids UUID[],
  lag_days INTEGER DEFAULT 0,
  
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')) DEFAULT 'not_started',
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROGRESS MODULE
-- ============================================================================

-- Progress Entries
CREATE TABLE progress_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  boq_item_id UUID REFERENCES boq_items(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  qty_today NUMERIC(12, 2) NOT NULL,
  qty_to_date NUMERIC(12, 2) NOT NULL,
  percent_complete NUMERIC(5, 2),
  
  remarks TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress Photos
CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  storage_path TEXT NOT NULL,
  caption TEXT,
  location TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COST CONTROL MODULE
-- ============================================================================

-- Budget (from approved estimate)
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  estimate_id UUID REFERENCES estimates(id),
  
  approved_amount NUMERIC(15, 2) NOT NULL,
  approved_date DATE,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Items
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  boq_item_id UUID REFERENCES boq_items(id),
  
  category TEXT,
  description TEXT NOT NULL,
  budgeted_amount NUMERIC(15, 2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change Orders
CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  co_number TEXT NOT NULL,
  
  description TEXT NOT NULL,
  reason TEXT,
  
  amount NUMERIC(15, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  
  requested_by UUID REFERENCES profiles(id),
  requested_date DATE,
  approved_by UUID REFERENCES profiles(id),
  approved_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actual Costs (aggregated from inventory issues + attendance)
CREATE TABLE actual_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  boq_item_id UUID REFERENCES boq_items(id),
  
  cost_type TEXT CHECK (cost_type IN ('material', 'labor', 'equipment', 'other')) NOT NULL,
  cost_date DATE NOT NULL,
  
  amount NUMERIC(15, 2) NOT NULL,
  
  reference_id UUID, -- links to stock_cards.id or attendance.id
  description TEXT,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTS MODULE
-- ============================================================================

-- Drawings
CREATE TABLE drawings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  drawing_number TEXT NOT NULL,
  title TEXT NOT NULL,
  discipline TEXT CHECK (discipline IN ('architectural', 'structural', 'electrical', 'mechanical', 'civil', 'plumbing')),
  revision TEXT,
  
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  
  uploaded_by UUID REFERENCES profiles(id),
  upload_date DATE DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFIs (Request for Information)
CREATE TABLE rfis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  rfi_number TEXT NOT NULL,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  
  drawing_ref TEXT,
  spec_ref TEXT,
  
  status TEXT CHECK (status IN ('open', 'answered', 'closed')) DEFAULT 'open',
  
  raised_by UUID REFERENCES profiles(id),
  raised_date DATE DEFAULT CURRENT_DATE,
  
  answer TEXT,
  answered_by UUID REFERENCES profiles(id),
  answered_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transmittals
CREATE TABLE transmittals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  transmittal_number TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  
  from_party TEXT NOT NULL,
  to_party TEXT NOT NULL,
  attention TEXT,
  
  subject TEXT,
  purpose TEXT,
  
  sent_by UUID REFERENCES profiles(id),
  received_by TEXT,
  received_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transmittal Items
CREATE TABLE transmittal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transmittal_id UUID REFERENCES transmittals(id) ON DELETE CASCADE,
  
  document_type TEXT,
  document_number TEXT,
  description TEXT NOT NULL,
  copies INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Punch Lists
CREATE TABLE punch_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  item_number TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  
  trade TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'verified')) DEFAULT 'open',
  
  identified_by UUID REFERENCES profiles(id),
  identified_date DATE DEFAULT CURRENT_DATE,
  
  assigned_to UUID REFERENCES workers(id),
  target_date DATE,
  
  completed_date DATE,
  verified_by UUID REFERENCES profiles(id),
  verified_date DATE,
  
  remarks TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_materials_org ON materials(organization_id);
CREATE INDEX idx_estimates_project ON estimates(project_id);
CREATE INDEX idx_boq_items_estimate ON boq_items(estimate_id);
CREATE INDEX idx_workers_org ON workers(organization_id);
CREATE INDEX idx_attendance_project_date ON attendance(project_id, date);
CREATE INDEX idx_attendance_worker ON attendance(worker_id);
CREATE INDEX idx_daily_logs_project_date ON daily_logs(project_id, date);
CREATE INDEX idx_stock_cards_item ON stock_cards(inventory_item_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_progress_entries_project ON progress_entries(project_id);

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_labor_types_updated_at BEFORE UPDATE ON labor_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assemblies_updated_at BEFORE UPDATE ON assemblies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON estimates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boq_items_updated_at BEFORE UPDATE ON boq_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON crews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_entries_updated_at BEFORE UPDATE ON progress_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
