import { createClient, SupabaseClient } from '@supabase/supabase-js';

const CONFIG_STORAGE_KEY = 'thpt_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let activeClient: SupabaseClient | null = null;
let activeUrl = '';
let activeKey = '';

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored Supabase config:', e);
  }

  // Fallback to Vite env variables if available
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const cleanUrl = url.trim().replace(/\/$/, '');
  const cleanKey = anonKey.trim();

  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
  // Re-instantiate client
  initSupabaseClient();
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
  activeClient = null;
  activeUrl = '';
  activeKey = '';
}

export function isSupabaseConfigured(): boolean {
  const cfg = getSupabaseConfig();
  return Boolean(cfg.url && cfg.anonKey && cfg.url.startsWith('https://') && cfg.anonKey.length > 20);
}

export function initSupabaseClient(): SupabaseClient | null {
  const cfg = getSupabaseConfig();
  if (!cfg.url || !cfg.anonKey || !cfg.url.startsWith('https://')) {
    activeClient = null;
    return null;
  }

  if (activeClient && activeUrl === cfg.url && activeKey === cfg.anonKey) {
    return activeClient;
  }

  try {
    activeClient = createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    activeUrl = cfg.url;
    activeKey = cfg.anonKey;
    return activeClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    activeClient = null;
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (!activeClient) {
    return initSupabaseClient();
  }
  return activeClient;
}

export async function testSupabaseConnection(
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; message: string; details?: any }> {
  const url = (customUrl || getSupabaseConfig().url).trim();
  const key = (customKey || getSupabaseConfig().anonKey).trim();

  if (!url || !key) {
    return {
      success: false,
      message: 'Vui lòng nhập đầy đủ Supabase Project URL và Public Anon Key!'
    };
  }

  if (!url.startsWith('https://')) {
    return {
      success: false,
      message: 'Project URL phải bắt đầu bằng https:// (ví dụ: https://xyz.supabase.co)'
    };
  }

  try {
    const testClient = createClient(url, key);
    
    // Probe database: check user_accounts or classes or students
    const { data, error } = await testClient.from('user_accounts').select('id').limit(1);

    if (error) {
      // If table user_accounts not found, probe students
      const secondProbe = await testClient.from('students').select('id').limit(1);
      if (secondProbe.error) {
        return {
          success: false,
          message: `Kết nối thành công đến máy chủ nhưng chưa tìm thấy bảng dữ liệu. Hãy chạy file supabase_schema.sql trong SQL Editor của Supabase! (Lỗi: ${error.message})`
        };
      }
    }

    return {
      success: true,
      message: 'Kết nối máy chủ Supabase thành công! Cơ sở dữ liệu hoạt động ổn định.',
      details: { url }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Không thể kết nối đến Supabase: ${err.message || 'Lỗi mạng hoặc sai định dạng URL'}`
    };
  }
}

// Initial client creation
export const supabase = initSupabaseClient();
