export interface Teacher {
  id: string;
  name: string;
  employee_id: string;
  contact_number: string;
  email: string;
  address: string;
  date_of_birth: string;
  hire_date: string;
  department: string;
  position: string;
  assigned_classes: string[];
  status: "active" | "inactive" | "on_leave";
  salary?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherFormData {
  name: string;
  employee_id: string;
  contact_number: string;
  email: string;
  address: string;
  date_of_birth: string;
  hire_date: string;
  department: string;
  position: string;
  assigned_classes: string[];
  status: "active" | "inactive" | "on_leave";
  salary?: number;
  notes?: string;
}

export interface Parent {
  id: string;
  name: string;
  contact_number: string;
  email: string;
  address?: string;
  payment_status: boolean;
  payment_date: string | null;
  payment_amount?: number;
  payment_method?: string;
  receipt_url?: string;
  created_at?: string;
  updated_at?: string;
  students?: Student[];
}

export interface Payment {
  id: string;
  parent_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  receipt_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  parent?: Parent;
}
