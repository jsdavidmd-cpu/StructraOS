/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  electronAPI?: {
    exportPDF: (data: { html: string; filename: string }) => Promise<{ success: boolean; path?: string; message?: string }>;
    exportFile: (data: { content: string; filename: string; filters?: any[] }) => Promise<{ success: boolean; path?: string; message?: string }>;
    saveAttachment: (data: { buffer: ArrayBuffer; filename: string }) => Promise<{ success: boolean; path?: string; message?: string }>;
    getAppVersion: () => Promise<string>;
  };
}
