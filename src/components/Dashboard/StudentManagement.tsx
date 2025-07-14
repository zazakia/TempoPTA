import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  ChevronDown,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Student, StudentFormData } from "@/types/student";
import { supabaseHelpers } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const StudentManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [availableParents, setAvailableParents] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, teachersData, parentsData] = await Promise.all([
        supabaseHelpers.getStudents(),
        supabaseHelpers.getTeachers(),
        supabaseHelpers.getParents(),
      ]);

      const formattedStudents = studentsData.map((student) => ({
        ...student,
        parent_name: student.parent?.name || "",
        teacher_name: student.teacher?.name || "",
      }));

      setStudents(formattedStudents);
      setAvailableTeachers(
        teachersData.map((t) => ({ id: t.id, name: t.name })),
      );
      setAvailableParents(parentsData.map((p) => ({ id: p.id, name: p.name })));
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search query and active tab
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parent_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active")
      return matchesSearch && student.status === "active";
    if (activeTab === "inactive")
      return matchesSearch && student.status === "inactive";
    if (activeTab === "transferred")
      return matchesSearch && student.status === "transferred";

    return matchesSearch;
  });

  // Form state for adding/editing student
  const [formData, setFormData] = useState<
    StudentFormData & { parent_id?: string }
  >({
    name: "",
    class_name: "",
    grade_level: "",
    date_of_birth: "",
    parent_name: "",
    parent_id: "",
    teacher_id: "",
    teacher_name: "",
    contact_number: "",
    email: "",
    address: "",
    enrollment_date: "",
    status: "active",
    notes: "",
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen && !isEditDialogOpen) {
      setFormData({
        name: "",
        class_name: "",
        grade_level: "",
        date_of_birth: "",
        parent_name: "",
        parent_id: "",
        teacher_id: "",
        teacher_name: "",
        contact_number: "",
        email: "",
        address: "",
        enrollment_date: "",
        status: "active",
        notes: "",
      });
    }
  }, [isAddDialogOpen, isEditDialogOpen]);

  // Load form data when editing
  useEffect(() => {
    if (isEditDialogOpen && selectedStudent) {
      setFormData({
        name: selectedStudent.name,
        class_name: selectedStudent.class_name,
        grade_level: selectedStudent.grade_level,
        date_of_birth: selectedStudent.date_of_birth,
        parent_name: selectedStudent.parent_name || "",
        parent_id: selectedStudent.parent_id || "",
        teacher_id: selectedStudent.teacher_id || "",
        teacher_name: selectedStudent.teacher_name || "",
        contact_number: selectedStudent.contact_number,
        email: selectedStudent.email || "",
        address: selectedStudent.address,
        enrollment_date: selectedStudent.enrollment_date,
        status: selectedStudent.status,
        notes: selectedStudent.notes || "",
      });
    }
  }, [isEditDialogOpen, selectedStudent]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new student
  const handleAddStudent = async () => {
    try {
      setSubmitting(true);
      const studentData = {
        name: formData.name,
        class_name: formData.class_name,
        grade_level: formData.grade_level,
        date_of_birth: formData.date_of_birth,
        parent_id: formData.parent_id || null,
        teacher_id: formData.teacher_id || null,
        contact_number: formData.contact_number,
        email: formData.email || null,
        address: formData.address,
        enrollment_date: formData.enrollment_date,
        status: formData.status,
        notes: formData.notes || null,
      };

      await supabaseHelpers.createStudent(studentData);
      await loadData();
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Student added successfully.",
      });
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle editing a student
  const handleEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      setSubmitting(true);
      const updates = {
        name: formData.name,
        class_name: formData.class_name,
        grade_level: formData.grade_level,
        date_of_birth: formData.date_of_birth,
        parent_id: formData.parent_id || null,
        teacher_id: formData.teacher_id || null,
        contact_number: formData.contact_number,
        email: formData.email || null,
        address: formData.address,
        enrollment_date: formData.enrollment_date,
        status: formData.status,
        notes: formData.notes || null,
      };

      await supabaseHelpers.updateStudent(selectedStudent.id, updates);
      await loadData();
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Student updated successfully.",
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting a student
  const handleDeleteStudent = async (studentId: string) => {
    try {
      await supabaseHelpers.deleteStudent(studentId);
      await loadData();
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(null);
      }
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "transferred":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Student Management
          </h1>
          <p className="text-muted-foreground">
            Manage student records and information
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Student list */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Search and select students to manage
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs
                defaultValue="all"
                className="mt-2"
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  <TabsTrigger value="transferred">Transferred</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading students...</span>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                          selectedStudent?.id === student.id
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {student.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.class_name}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(student.status)}>
                          {student.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No students found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Student details */}
        <div className="md:col-span-2">
          {selectedStudent ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{selectedStudent.name}</CardTitle>
                  <CardDescription>
                    Student details and information
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDeleteStudent(selectedStudent.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Class
                        </p>
                        <p>{selectedStudent.class_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Date of Birth
                        </p>
                        <p>{selectedStudent.date_of_birth}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Parent/Guardian
                        </p>
                        <p>{selectedStudent.parent_name || "Not assigned"}</p>
                      </div>
                    </div>
                    {selectedStudent.teacher_name && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Teacher
                          </p>
                          <p>{selectedStudent.teacher_name}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Contact Number
                        </p>
                        <p>{selectedStudent.contact_number}</p>
                      </div>
                    </div>
                    {selectedStudent.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Email
                          </p>
                          <p>{selectedStudent.email}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Address
                        </p>
                        <p>{selectedStudent.address}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Enrollment Date
                      </p>
                      <p>{selectedStudent.enrollment_date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Status
                      </p>
                      <Badge
                        variant={getStatusBadgeVariant(selectedStudent.status)}
                      >
                        {selectedStudent.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Payment Status
                      </p>
                      <Badge
                        variant={
                          selectedStudent.payment_status ? "default" : "outline"
                        }
                      >
                        {selectedStudent.payment_status ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                  </div>

                  {selectedStudent.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Notes
                      </p>
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {selectedStudent.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full border rounded-lg p-8">
              <div className="text-center">
                <ChevronDown className="h-10 w-10 mx-auto text-muted-foreground animate-bounce" />
                <h3 className="mt-4 text-lg font-medium">Select a Student</h3>
                <p className="text-muted-foreground">
                  Choose a student from the list to view and manage details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter the details of the new student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_name">Class</Label>
                <Input
                  id="class_name"
                  name="class_name"
                  placeholder="Enter class name"
                  value={formData.class_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade_level">Grade Level</Label>
                <Select
                  value={formData.grade_level}
                  onValueChange={(value) =>
                    handleSelectChange("grade_level", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade 1">Grade 1</SelectItem>
                    <SelectItem value="Grade 2">Grade 2</SelectItem>
                    <SelectItem value="Grade 3">Grade 3</SelectItem>
                    <SelectItem value="Grade 4">Grade 4</SelectItem>
                    <SelectItem value="Grade 5">Grade 5</SelectItem>
                    <SelectItem value="Grade 6">Grade 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent_id">Parent/Guardian</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => {
                    const parent = availableParents.find((p) => p.id === value);
                    handleSelectChange("parent_id", value);
                    handleSelectChange("parent_name", parent?.name || "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent/guardian" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableParents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher_id">Assigned Teacher</Label>
                <Select
                  value={formData.teacher_id}
                  onValueChange={(value) => {
                    const teacher = availableTeachers.find(
                      (t) => t.id === value,
                    );
                    handleSelectChange("teacher_id", value);
                    handleSelectChange("teacher_name", teacher?.name || "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  name="contact_number"
                  placeholder="Enter contact number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollment_date">Enrollment Date</Label>
                <Input
                  id="enrollment_date"
                  name="enrollment_date"
                  type="date"
                  value={formData.enrollment_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Enter any additional notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStudent} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student's information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-class_name">Class</Label>
                <Input
                  id="edit-class_name"
                  name="class_name"
                  placeholder="Enter class name"
                  value={formData.class_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-grade_level">Grade Level</Label>
                <Select
                  value={formData.grade_level}
                  onValueChange={(value) =>
                    handleSelectChange("grade_level", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade 1">Grade 1</SelectItem>
                    <SelectItem value="Grade 2">Grade 2</SelectItem>
                    <SelectItem value="Grade 3">Grade 3</SelectItem>
                    <SelectItem value="Grade 4">Grade 4</SelectItem>
                    <SelectItem value="Grade 5">Grade 5</SelectItem>
                    <SelectItem value="Grade 6">Grade 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date_of_birth">Date of Birth</Label>
                <Input
                  id="edit-date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-parent_name">Parent/Guardian Name</Label>
                <Input
                  id="edit-parent_name"
                  name="parent_name"
                  placeholder="Enter parent/guardian name"
                  value={formData.parent_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-teacher_id">Assigned Teacher</Label>
                <Select
                  value={formData.teacher_id}
                  onValueChange={(value) => {
                    const teacher = availableTeachers.find(
                      (t) => t.id === value,
                    );
                    handleSelectChange("teacher_id", value);
                    handleSelectChange("teacher_name", teacher?.name || "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact_number">Contact Number</Label>
                <Input
                  id="edit-contact_number"
                  name="contact_number"
                  placeholder="Enter contact number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email (Optional)</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-enrollment_date">Enrollment Date</Label>
                <Input
                  id="edit-enrollment_date"
                  name="enrollment_date"
                  type="date"
                  value={formData.enrollment_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                name="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                placeholder="Enter any additional notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditStudent} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;
