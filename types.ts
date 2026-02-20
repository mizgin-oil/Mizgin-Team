
export interface JobCategory {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  categoryId: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
}

export interface WorkLog {
  id: string;
  employeeId: string;
  checkIn: string; // ISO string
  checkOut?: string; // ISO string
}

export interface AppState {
  currentUser: Employee | null;
  employees: Employee[];
  categories: JobCategory[];
  workLogs: WorkLog[];
}
