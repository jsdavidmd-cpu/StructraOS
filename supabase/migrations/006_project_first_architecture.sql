-- ============================================================================
-- STRUCTRA PROJECT-FIRST ARCHITECTURE (SaaS-ready)
-- NOTE: Calculator logic/tables are intentionally untouched.
-- ============================================================================

-- 1) PROJECTS CORE TABLE (create if not present, then normalize columns)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.organizations(id),
  name text NOT NULL,
  client text,
  location text,
  project_orientation text,
  project_sector text,
  project_subtype text,
  status text DEFAULT 'Planning',
  start_date date,
  end_date date,
  budget numeric,
  created_at timestamp DEFAULT now()
);

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS company_id uuid,
  ADD COLUMN IF NOT EXISTS client text,
  ADD COLUMN IF NOT EXISTS project_orientation text,
  ADD COLUMN IF NOT EXISTS project_sector text,
  ADD COLUMN IF NOT EXISTS project_subtype text,
  ADD COLUMN IF NOT EXISTS budget numeric;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'organization_id'
  ) THEN
    EXECUTE 'UPDATE public.projects SET company_id = organization_id WHERE company_id IS NULL';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_project_orientation_check'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_project_orientation_check
      CHECK (project_orientation IN ('Vertical','Horizontal') OR project_orientation IS NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_company_id_fkey'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_company_id ON public.projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_orientation ON public.projects(project_orientation);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON public.projects(project_sector);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- 2) LINK EXISTING MODULE TABLES TO PROJECTS
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['estimates','manpower','schedule','inventory','progress_logs','documents','daily_logbook']
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS project_id uuid', t);
      EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', t, t || '_project_id_fkey');
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL',
        t,
        t || '_project_id_fkey'
      );
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(project_id)', 'idx_' || t || '_project_id', t);
    END IF;
  END LOOP;
END $$;

-- 3) ESTIMATE VERSIONING
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'estimates'
  ) THEN
    ALTER TABLE public.estimates
      ADD COLUMN IF NOT EXISTS version int DEFAULT 1,
      ADD COLUMN IF NOT EXISTS is_final boolean DEFAULT false;

    CREATE INDEX IF NOT EXISTS idx_estimates_project_id ON public.estimates(project_id);
    CREATE INDEX IF NOT EXISTS idx_estimates_project_version ON public.estimates(project_id, version DESC);
  END IF;
END $$;

-- 4) TEMPLATE LIBRARY
CREATE TABLE IF NOT EXISTS public.project_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  orientation text,
  sector text,
  subtype text,
  template_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'project_templates_orientation_check'
  ) THEN
    ALTER TABLE public.project_templates
      ADD CONSTRAINT project_templates_orientation_check
      CHECK (orientation IN ('Vertical','Horizontal') OR orientation IS NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_project_templates_company_id ON public.project_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_project_templates_lookup ON public.project_templates(orientation, sector, subtype);

-- 5) FUTURE-READY PROJECT PERMISSIONS
CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'Viewer',
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (project_id, profile_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'project_members_role_check'
  ) THEN
    ALTER TABLE public.project_members
      ADD CONSTRAINT project_members_role_check
      CHECK (role IN ('Admin','Project Manager','Engineer','Quantity Surveyor','Viewer'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_profile_id ON public.project_members(profile_id);

-- 6) RLS FOR NEW TABLES (compatible with existing user_organization_id() helper)
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'projects_org_access'
  ) THEN
    CREATE POLICY projects_org_access
      ON public.projects
      FOR ALL
      USING (company_id = public.user_organization_id())
      WITH CHECK (company_id = public.user_organization_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_templates' AND policyname = 'project_templates_org_access'
  ) THEN
    CREATE POLICY project_templates_org_access
      ON public.project_templates
      FOR ALL
      USING (company_id = public.user_organization_id())
      WITH CHECK (company_id = public.user_organization_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_members' AND policyname = 'project_members_project_access'
  ) THEN
    CREATE POLICY project_members_project_access
      ON public.project_members
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.projects p
          WHERE p.id = project_members.project_id
            AND p.company_id = public.user_organization_id()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.projects p
          WHERE p.id = project_members.project_id
            AND p.company_id = public.user_organization_id()
        )
      );
  END IF;
END $$;
