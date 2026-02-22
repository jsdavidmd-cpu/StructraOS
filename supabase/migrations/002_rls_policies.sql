-- STRUCTRA Row Level Security Policies
-- All tables require RLS for multi-tenant security

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE assemblies ENABLE ROW LEVEL SECURITY;
ALTER TABLE assembly_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_manpower ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE actual_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE transmittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transmittal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE punch_lists ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's organization_id
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Users can view profiles in their organization
CREATE POLICY "Users can view own organization profiles"
  ON profiles FOR SELECT
  USING (organization_id = public.user_organization_id());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Authenticated users can create their own profile during signup
CREATE POLICY "Authenticated users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Admins can insert profiles for other users
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id = public.user_organization_id());

CREATE POLICY "Admins can update organization"
  ON organizations FOR UPDATE
  USING (id = public.user_organization_id() AND public.is_admin());

-- ============================================================================
-- PROJECTS
-- ============================================================================

CREATE POLICY "Users can view organization projects"
  ON projects FOR SELECT
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Admins can insert projects"
  ON projects FOR INSERT
  WITH CHECK (organization_id = public.user_organization_id() AND public.is_admin());

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  USING (organization_id = public.user_organization_id() AND public.is_admin());

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (organization_id = public.user_organization_id() AND public.is_admin());

-- ============================================================================
-- MATERIALS
-- ============================================================================

CREATE POLICY "Users can view materials"
  ON materials FOR SELECT
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can insert materials"
  ON materials FOR INSERT
  WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "Users can update materials"
  ON materials FOR UPDATE
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Admins can delete materials"
  ON materials FOR DELETE
  USING (organization_id = public.user_organization_id() AND public.is_admin());

-- ============================================================================
-- LABOR TYPES
-- ============================================================================

CREATE POLICY "Users can view labor types"
  ON labor_types FOR SELECT
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can insert labor types"
  ON labor_types FOR INSERT
  WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "Users can update labor types"
  ON labor_types FOR UPDATE
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Admins can delete labor types"
  ON labor_types FOR DELETE
  USING (organization_id = public.user_organization_id() AND public.is_admin());

-- ============================================================================
-- EQUIPMENT
-- ============================================================================

CREATE POLICY "Users can view equipment"
  ON equipment FOR SELECT
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can insert equipment"
  ON equipment FOR INSERT
  WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "Users can update equipment"
  ON equipment FOR UPDATE
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Admins can delete equipment"
  ON equipment FOR DELETE
  USING (organization_id = public.user_organization_id() AND public.is_admin());

-- ============================================================================
-- ASSEMBLIES
-- ============================================================================

CREATE POLICY "Users can view assemblies"
  ON assemblies FOR SELECT
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can insert assemblies"
  ON assemblies FOR INSERT
  WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "Users can update assemblies"
  ON assemblies FOR UPDATE
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can delete assemblies"
  ON assemblies FOR DELETE
  USING (organization_id = public.user_organization_id());

-- ============================================================================
-- ASSEMBLY COMPONENTS
-- ============================================================================

CREATE POLICY "Users can view assembly components"
  ON assembly_components FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assemblies
      WHERE assemblies.id = assembly_components.assembly_id
      AND assemblies.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can insert assembly components"
  ON assembly_components FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assemblies
      WHERE assemblies.id = assembly_components.assembly_id
      AND assemblies.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can update assembly components"
  ON assembly_components FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assemblies
      WHERE assemblies.id = assembly_components.assembly_id
      AND assemblies.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can delete assembly components"
  ON assembly_components FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assemblies
      WHERE assemblies.id = assembly_components.assembly_id
      AND assemblies.organization_id = public.user_organization_id()
    )
  );

-- ============================================================================
-- ESTIMATES
-- ============================================================================

CREATE POLICY "Users can view estimates"
  ON estimates FOR SELECT
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can insert estimates"
  ON estimates FOR INSERT
  WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "Users can update estimates"
  ON estimates FOR UPDATE
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Admins can delete estimates"
  ON estimates FOR DELETE
  USING (organization_id = public.user_organization_id() AND public.is_admin());

-- ============================================================================
-- BOQ ITEMS
-- ============================================================================

CREATE POLICY "Users can view boq items"
  ON boq_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM estimates
      WHERE estimates.id = boq_items.estimate_id
      AND estimates.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can insert boq items"
  ON boq_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM estimates
      WHERE estimates.id = boq_items.estimate_id
      AND estimates.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can update boq items"
  ON boq_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM estimates
      WHERE estimates.id = boq_items.estimate_id
      AND estimates.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can delete boq items"
  ON boq_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM estimates
      WHERE estimates.id = boq_items.estimate_id
      AND estimates.organization_id = public.user_organization_id()
    )
  );

-- ============================================================================
-- WORKERS
-- ============================================================================

CREATE POLICY "Users can view workers"
  ON workers FOR SELECT
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can insert workers"
  ON workers FOR INSERT
  WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "Users can update workers"
  ON workers FOR UPDATE
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Admins can delete workers"
  ON workers FOR DELETE
  USING (organization_id = public.user_organization_id() AND public.is_admin());

-- ============================================================================
-- CREWS
-- ============================================================================

CREATE POLICY "Users can view crews"
  ON crews FOR SELECT
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can manage crews"
  ON crews FOR ALL
  USING (organization_id = public.user_organization_id());

-- ============================================================================
-- CREW MEMBERS
-- ============================================================================

CREATE POLICY "Users can view crew members"
  ON crew_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crews
      WHERE crews.id = crew_members.crew_id
      AND crews.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage crew members"
  ON crew_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM crews
      WHERE crews.id = crew_members.crew_id
      AND crews.organization_id = public.user_organization_id()
    )
  );

-- ============================================================================
-- ATTENDANCE
-- ============================================================================

CREATE POLICY "Users can view attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = attendance.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can insert attendance"
  ON attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = attendance.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can update attendance"
  ON attendance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = attendance.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can delete attendance"
  ON attendance FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = attendance.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

-- ============================================================================
-- DEPLOYMENT
-- ============================================================================

CREATE POLICY "Users can manage deployment"
  ON deployment FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM attendance a
      JOIN projects p ON p.id = a.project_id
      WHERE a.id = deployment.attendance_id
      AND p.organization_id = public.user_organization_id()
    )
  );

-- ============================================================================
-- DAILY LOGS
-- ============================================================================

CREATE POLICY "Users can view daily logs"
  ON daily_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = daily_logs.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage daily logs"
  ON daily_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = daily_logs.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

-- ============================================================================
-- LOG RELATED TABLES (inherit from daily_logs)
-- ============================================================================

CREATE POLICY "Users can manage log manpower"
  ON log_manpower FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM daily_logs dl
      JOIN projects p ON p.id = dl.project_id
      WHERE dl.id = log_manpower.log_id
      AND p.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage log activities"
  ON log_activities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM daily_logs dl
      JOIN projects p ON p.id = dl.project_id
      WHERE dl.id = log_activities.log_id
      AND p.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage log materials"
  ON log_materials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM daily_logs dl
      JOIN projects p ON p.id = dl.project_id
      WHERE dl.id = log_materials.log_id
      AND p.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage log equipment"
  ON log_equipment FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM daily_logs dl
      JOIN projects p ON p.id = dl.project_id
      WHERE dl.id = log_equipment.log_id
      AND p.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage log photos"
  ON log_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM daily_logs dl
      JOIN projects p ON p.id = dl.project_id
      WHERE dl.id = log_photos.log_id
      AND p.organization_id = public.user_organization_id()
    )
  );

-- ============================================================================
-- INVENTORY MODULE
-- ============================================================================

CREATE POLICY "Users can view warehouses"
  ON warehouses FOR SELECT
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can manage warehouses"
  ON warehouses FOR ALL
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can manage inventory items"
  ON inventory_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM warehouses
      WHERE warehouses.id = inventory_items.warehouse_id
      AND warehouses.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage stock cards"
  ON stock_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM inventory_items ii
      JOIN warehouses w ON w.id = ii.warehouse_id
      WHERE ii.id = stock_cards.inventory_item_id
      AND w.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage purchase orders"
  ON purchase_orders FOR ALL
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can manage po items"
  ON po_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM purchase_orders
      WHERE purchase_orders.id = po_items.po_id
      AND purchase_orders.organization_id = public.user_organization_id()
    )
  );

-- ============================================================================
-- SCHEDULING
-- ============================================================================

CREATE POLICY "Users can manage tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

-- ============================================================================
-- PROGRESS
-- ============================================================================

CREATE POLICY "Users can manage progress entries"
  ON progress_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = progress_entries.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage progress photos"
  ON progress_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = progress_photos.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

-- ============================================================================
-- COST CONTROL
-- ============================================================================

CREATE POLICY "Users can manage budgets"
  ON budgets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = budgets.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage budget items"
  ON budget_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM budgets b
      JOIN projects p ON p.id = b.project_id
      WHERE b.id = budget_items.budget_id
      AND p.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage change orders"
  ON change_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = change_orders.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage actual costs"
  ON actual_costs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = actual_costs.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

CREATE POLICY "Users can manage drawings"
  ON drawings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = drawings.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage rfis"
  ON rfis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = rfis.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage transmittals"
  ON transmittals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = transmittals.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage transmittal items"
  ON transmittal_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transmittals t
      JOIN projects p ON p.id = t.project_id
      WHERE t.id = transmittal_items.transmittal_id
      AND p.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "Users can manage punch lists"
  ON punch_lists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = punch_lists.project_id
      AND projects.organization_id = public.user_organization_id()
    )
  );
