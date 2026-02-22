// Supabase Database Types
// Auto-generated types for type-safe database access

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          contact_number: string | null;
          email: string | null;
          tin: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          email: string;
          full_name: string | null;
          role: 'admin' | 'engineer' | 'foreman' | 'viewer';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          location: string | null;
          client_name: string | null;
          contract_amount: number | null;
          start_date: string | null;
          end_date: string | null;
          status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      materials: {
        Row: {
          id: string;
          organization_id: string;
          code: string | null;
          name: string;
          unit: string;
          ncr_price: number;
          description: string | null;
          supplier: string | null;
          category: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['materials']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['materials']['Insert']>;
      };
      labor_types: {
        Row: {
          id: string;
          organization_id: string;
          trade: string;
          daily_rate: number;
          skill_level: 'helper' | 'skilled' | 'foreman' | 'specialist';
          description: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['labor_types']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['labor_types']['Insert']>;
      };
      equipment: {
        Row: {
          id: string;
          organization_id: string;
          code: string | null;
          name: string;
          rate_type: 'hourly' | 'daily' | 'monthly';
          rate: number;
          description: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['equipment']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['equipment']['Insert']>;
      };
      assemblies: {
        Row: {
          id: string;
          organization_id: string;
          code: string | null;
          name: string;
          unit: string;
          description: string | null;
          category: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assemblies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['assemblies']['Insert']>;
      };
      assembly_components: {
        Row: {
          id: string;
          assembly_id: string;
          type: 'material' | 'labor' | 'equipment';
          ref_id: string;
          qty: number;
          remarks: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assembly_components']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['assembly_components']['Insert']>;
      };
      estimates: {
        Row: {
          id: string;
          organization_id: string;
          project_id: string | null;
          estimate_number: string;
          project_name: string;
          floor_area: number | null;
          location: string | null;
          client_name: string | null;
          ocm_overhead: number;
          ocm_contingency: number;
          ocm_misc: number;
          ocm_profit: number;
          vat_type: 'exclusive' | 'inclusive';
          vat_rate: number;
          status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'revised';
          version: number;
          subtotal: number;
          total_amount: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['estimates']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['estimates']['Insert']>;
      };
      boq_items: {
        Row: {
          id: string;
          estimate_id: string;
          item_number: string | null;
          trade: string | null;
          description: string;
          unit: string;
          qty: number;
          assembly_id: string | null;
          unit_price: number;
          amount: number;
          is_manual: boolean;
          notes: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['boq_items']['Row'], 'id' | 'amount' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['boq_items']['Insert']>;
      };
      workers: {
        Row: {
          id: string;
          organization_id: string;
          employee_number: string | null;
          name: string;
          trade: string | null;
          daily_rate: number;
          type: 'direct' | 'subcon' | 'pakyaw';
          status: 'active' | 'inactive' | 'terminated';
          contact_number: string | null;
          address: string | null;
          emergency_contact: string | null;
          emergency_contact_number: string | null;
          sss_number: string | null;
          philhealth_number: string | null;
          pagibig_number: string | null;
          tin: string | null;
          date_hired: string | null;
          date_terminated: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['workers']['Insert']>;
      };
      attendance: {
        Row: {
          id: string;
          project_id: string;
          worker_id: string;
          date: string;
          time_in: string | null;
          time_out: string | null;
          hours: number;
          overtime: number;
          activity: string | null;
          location: string | null;
          crew_id: string | null;
          verified_by: string | null;
          verified_at: string | null;
          status: 'present' | 'absent' | 'halfday' | 'leave';
          remarks: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>;
      };
      daily_logs: {
        Row: {
          id: string;
          project_id: string;
          date: string;
          weather_am: string | null;
          weather_pm: string | null;
          temperature: string | null;
          site_conditions: string | null;
          safety_issues: string | null;
          delays: string | null;
          instructions: string | null;
          visitors: string | null;
          status: 'draft' | 'finalized' | 'approved';
          finalized_by: string | null;
          finalized_at: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_logs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['daily_logs']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
