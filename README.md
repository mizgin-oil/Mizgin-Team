# Mizgin Oil Team Management System

A professional employee time-tracking and management system for Mizgin Oil's team.

## 🚀 Deployment

This application is optimized for deployment with Supabase integration.

### 1. Supabase Setup
Run the following SQL in your Supabase SQL Editor to set up the database:

```sql
-- Create tables and policies
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'employee')) DEFAULT 'employee',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE work_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    check_in TIMESTAMPTZ DEFAULT now() NOT NULL,
    check_out TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow admin manage categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow public read employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow admin manage employees" ON employees FOR ALL USING (true);
CREATE POLICY "Allow public read work_logs" ON work_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert work_logs" ON work_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update work_logs" ON work_logs FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete work_logs" ON work_logs FOR DELETE USING (true);

-- Seed Admin
INSERT INTO employees (name, job_title, email, password, role)
VALUES ('Super Admin', 'Director', 'mizgin.oil.duhok@gmail.com', '@@##2323@#@#', 'admin');
```

### 2. Configuration
1. Set up your environment variables for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Add `VITE_GEMINI_API_KEY` to your environment variables for AI features.

### 3. Vercel Deployment
1. Connect your repository to a new Vercel project.
2. In the Vercel Dashboard, go to **Settings > Environment Variables**.
3. Add the following keys:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
4. Deploy! The included `vercel.json` handles SPA routing automatically.
- **Geofenced Check-in/out**: Employees must be within 100m of the facility.
- **Admin Dashboard**: Manage staff, categories, and view live attendance.
- **AI Performance Analysis**: Get insights into work patterns using Gemini.
- **Responsive Design**: Works perfectly on mobile and desktop.
