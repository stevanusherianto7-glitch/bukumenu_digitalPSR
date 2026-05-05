import { vi } from 'vitest';

export const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  data: null,
  error: null,
  on: vi.fn().mockReturnValue({ data: null }),
  removeAllSubscriptions: vi.fn(),
};

export const mockSupabaseAuth = {
  getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  onAuthStateChange: vi.fn(),
};

export const createMockSupabaseClient = () => ({
  auth: mockSupabaseAuth,
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockResolvedValue({ data: [], error: null }),
    delete: vi.fn().mockResolvedValue({ data: [], error: null }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }),
  realtime: {
    on: vi.fn().mockReturnValue({ data: null }),
  },
});

export const vi_mock = vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => createMockSupabaseClient()),
}));
