// Временная заглушка для Supabase client
export const getSupabaseClient = () => {
  console.warn("Supabase client is deprecated - using FastAPI backend instead");
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  } as any;
};