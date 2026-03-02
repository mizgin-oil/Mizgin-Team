
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || 'https://oqrywtrwtzttgdubeczt.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcnl3dHJ3dHp0dGdkdWJlY3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODYwNjAsImV4cCI6MjA4NzE2MjA2MH0.mStYjpVL1HzFvyDVd4IzNC1GBwt3rsm3MHLDzKGLAfs';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
