CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  employee_id TEXT UNIQUE NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  hire_date DATE NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  assigned_classes TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  salary DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  address TEXT,
  payment_status BOOLEAN DEFAULT FALSE,
  payment_date DATE,
  payment_amount DECIMAL(10,2),
  payment_method TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  contact_number TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  payment_status BOOLEAN DEFAULT FALSE,
  payment_date DATE,
  enrollment_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date DATE NOT NULL,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_student_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE students 
    SET payment_status = NEW.payment_status,
        payment_date = NEW.payment_date
    WHERE parent_id = NEW.id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_student_payment_status_trigger 
    AFTER UPDATE OF payment_status, payment_date ON parents 
    FOR EACH ROW EXECUTE FUNCTION update_student_payment_status();

alter publication supabase_realtime add table teachers;
alter publication supabase_realtime add table parents;
alter publication supabase_realtime add table students;
alter publication supabase_realtime add table payments;

INSERT INTO teachers (name, employee_id, contact_number, email, address, date_of_birth, hire_date, department, position, assigned_classes, status, salary, notes) VALUES
('Ms. Sarah Johnson', 'EMP001', '+63 912 345 6789', 'sarah.johnson@school.edu', '123 Teacher St, Quezon City', '1985-03-15', '2020-06-01', 'Elementary', 'Head Teacher', '{"Grade 3 - Rose", "Grade 3 - Sunflower"}', 'active', 35000, 'Excellent teacher with strong leadership skills.'),
('Mr. Michael Chen', 'EMP002', '+63 923 456 7890', 'michael.chen@school.edu', '456 Education Ave, Manila', '1988-07-22', '2021-08-15', 'Elementary', 'Teacher', '{"Grade 1 - Daisy"}', 'active', 28000, NULL),
('Ms. Maria Santos', 'EMP003', '+63 934 567 8901', 'maria.santos@school.edu', '789 Learning Blvd, Makati', '1982-11-10', '2019-03-01', 'Elementary', 'Senior Teacher', '{"Grade 5 - Hibiscus", "Grade 6 - Sampaguita"}', 'on_leave', 32000, 'Currently on maternity leave.');

INSERT INTO parents (name, contact_number, email, address, payment_status, payment_date, payment_amount, payment_method) VALUES
('John Doe', '+63 912 345 6789', 'john.doe@example.com', '123 Main St, Quezon City', true, '2023-07-15', 250.00, 'cash'),
('Maria Santos', '+63 923 456 7890', 'maria.santos@example.com', '456 Oak Ave, Manila', false, NULL, NULL, NULL),
('Robert Garcia', '+63 934 567 8901', 'robert.garcia@example.com', '789 Pine St, Makati', true, '2023-07-10', 250.00, 'gcash');

INSERT INTO students (name, class_name, grade_level, date_of_birth, parent_id, teacher_id, contact_number, email, address, payment_status, payment_date, enrollment_date, status, notes) 
SELECT 
  'Jane Doe', 'Grade 3 - Rose', 'Grade 3', '2015-05-15', p.id, t.id, '+63 912 345 6789', 'john.doe@example.com', '123 Main St, Quezon City', true, '2023-07-15', '2023-06-01', 'active', 'Excellent student, very active in class activities.'
FROM parents p, teachers t 
WHERE p.email = 'john.doe@example.com' AND t.employee_id = 'EMP001';

INSERT INTO students (name, class_name, grade_level, date_of_birth, parent_id, teacher_id, contact_number, address, payment_status, payment_date, enrollment_date, status) 
SELECT 
  'Miguel Santos', 'Grade 1 - Daisy', 'Grade 1', '2017-03-20', p.id, t.id, '+63 923 456 7890', '456 Oak Ave, Manila', false, NULL, '2023-06-01', 'active'
FROM parents p, teachers t 
WHERE p.email = 'maria.santos@example.com' AND t.employee_id = 'EMP002';

INSERT INTO students (name, class_name, grade_level, date_of_birth, parent_id, teacher_id, contact_number, email, address, payment_status, payment_date, enrollment_date, status, notes) 
SELECT 
  'Rebecca Garcia', 'Grade 4 - Tulip', 'Grade 4', '2014-08-10', p.id, t.id, '+63 934 567 8901', 'robert.garcia@example.com', '789 Pine St, Makati', true, '2023-07-10', '2023-06-01', 'active', 'Good performance in mathematics.'
FROM parents p, teachers t 
WHERE p.email = 'robert.garcia@example.com' AND t.employee_id = 'EMP003';
