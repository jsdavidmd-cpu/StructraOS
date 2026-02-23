-- Add documents table for project document management

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'specification',
  file_url TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can view documents in their organization
CREATE POLICY "Users can view org documents"
  ON documents FOR SELECT
  USING (organization_id = public.user_organization_id());

-- Users can insert documents for their organization
CREATE POLICY "Users can insert documents"
  ON documents FOR INSERT
  WITH CHECK (organization_id = public.user_organization_id());

-- Users can update their own documents
CREATE POLICY "Users can update documents"
  ON documents FOR UPDATE
  USING (organization_id = public.user_organization_id());

-- Users can delete their own documents
CREATE POLICY "Users can delete documents"
  ON documents FOR DELETE
  USING (organization_id = public.user_organization_id());
