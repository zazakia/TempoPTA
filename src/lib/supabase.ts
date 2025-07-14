import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const supabaseHelpers = {
  // Students
  async getStudents() {
    const { data, error } = await supabase.from("students").select(`
        *,
        parent:parents(*),
        teacher:teachers(*)
      `);
    if (error) throw error;
    return data;
  },

  async createStudent(
    student: Database["public"]["Tables"]["students"]["Insert"],
  ) {
    const { data, error } = await supabase
      .from("students")
      .insert(student)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStudent(
    id: string,
    updates: Database["public"]["Tables"]["students"]["Update"],
  ) {
    const { data, error } = await supabase
      .from("students")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteStudent(id: string) {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) throw error;
  },

  // Teachers
  async getTeachers() {
    const { data, error } = await supabase.from("teachers").select("*");
    if (error) throw error;
    return data;
  },

  async createTeacher(
    teacher: Database["public"]["Tables"]["teachers"]["Insert"],
  ) {
    const { data, error } = await supabase
      .from("teachers")
      .insert(teacher)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTeacher(
    id: string,
    updates: Database["public"]["Tables"]["teachers"]["Update"],
  ) {
    const { data, error } = await supabase
      .from("teachers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTeacher(id: string) {
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) throw error;
  },

  // Parents
  async getParents() {
    const { data, error } = await supabase.from("parents").select(`
        *,
        students(*)
      `);
    if (error) throw error;
    return data;
  },

  async createParent(
    parent: Database["public"]["Tables"]["parents"]["Insert"],
  ) {
    const { data, error } = await supabase
      .from("parents")
      .insert(parent)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateParent(
    id: string,
    updates: Database["public"]["Tables"]["parents"]["Update"],
  ) {
    const { data, error } = await supabase
      .from("parents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteParent(id: string) {
    const { error } = await supabase.from("parents").delete().eq("id", id);
    if (error) throw error;
  },

  // Payments
  async createPayment(
    payment: Database["public"]["Tables"]["payments"]["Insert"],
  ) {
    const { data, error } = await supabase
      .from("payments")
      .insert(payment)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPayments() {
    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        parent:parents(*)
      `,
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  // Statistics
  async getStatistics() {
    const [studentsResult, paymentsResult, parentsResult] = await Promise.all([
      supabase.from("students").select("payment_status, class_name"),
      supabase.from("payments").select("amount"),
      supabase.from("parents").select("payment_status, payment_date"),
    ]);

    if (studentsResult.error) throw studentsResult.error;
    if (paymentsResult.error) throw paymentsResult.error;
    if (parentsResult.error) throw parentsResult.error;

    const students = studentsResult.data;
    const payments = paymentsResult.data;
    const parents = parentsResult.data;

    const totalStudents = students.length;
    const paidStudents = students.filter((s) => s.payment_status).length;
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidParents = parents.filter((p) => p.payment_status).length;

    // Group by class
    const classSummary = students.reduce(
      (acc, student) => {
        const className = student.class_name;
        if (!acc[className]) {
          acc[className] = { total: 0, paid: 0 };
        }
        acc[className].total++;
        if (student.payment_status) {
          acc[className].paid++;
        }
        return acc;
      },
      {} as Record<string, { total: number; paid: number }>,
    );

    const classStats = Object.entries(classSummary).map(
      ([className, stats]) => ({
        className,
        percentagePaid: Math.round((stats.paid / stats.total) * 100),
      }),
    );

    return {
      totalStudents,
      paidStudents,
      totalCollected,
      paidParents,
      percentagePaid: Math.round((paidStudents / totalStudents) * 100),
      classSummary: classStats,
    };
  },
};
