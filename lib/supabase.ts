import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "your-supabase-url";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY || "your-supabase-anon-key";

//export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
export const supabase = createClient<Database>(
  "https://yvzowaqtptjdjyozqnhj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2em93YXF0cHRqZGp5b3pxbmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MzY2NDAsImV4cCI6MjA3NjUxMjY0MH0.Db3aQqDeHECkT8Uc5IrdhjQg1_sDtbU37G3x2UpsKOA"
);
