export interface Student {
  id: string;
  name: string;
  class_name: string;
  grade_level: string;
  date_of_birth: string;
  parent_id?: string;
  parent_name?: string;
  teacher_id?: string;
  teacher_name?: string;
  contact_number: string;
  email?: string;
  address: string;
  payment_status: boolean;
  payment_date: string | null;
  enrollment_date: string;
  status: "active" | "inactive" | "transferred";
  notes?: string;
  created_at?: string;
  updated_at?: string;
  parent?: {
    id: string;
    name: string;
    email: string;
    contact_number: string;
  };
  teacher?: {
    id: string;
    name: string;
    employee_id: string;
  };
}

export interface StudentFormData {
  name: string;
  class_name: string;
  grade_level: string;
  date_of_birth: string;
  parent_name: string;
  teacher_id?: string;
  teacher_name?: string;
  contact_number: string;
  email?: string;
  address: string;
  enrollment_date: string;
  status: "active" | "inactive" | "transferred";
  notes?: string;
}
