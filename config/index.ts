// Configuration Module
export const config = {
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    nodeEnv: process.env.NODE_ENV || "development",
  },
  shortCode: {
    length: parseInt(process.env.SHORT_CODE_LENGTH || "6", 10),
    charset: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
} as const;

