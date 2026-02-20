
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oqrywtrwtzttgdubeczt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcnl3dHJ3dHp0dGdkdWJlY3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODYwNjAsImV4cCI6MjA4NzE2MjA2MH0.mStYjpVL1HzFvyDVd4IzNC1GBwt3rsm3MHLDzKGLAfs';

export const supabase = createClient(supabaseUrl, supabaseKey);
