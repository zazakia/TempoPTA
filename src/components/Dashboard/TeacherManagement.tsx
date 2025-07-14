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
  Briefcase,
  DollarSign,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Teacher, TeacherFormData } from "@/types/teacher";
import { supabaseHelpers } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const TeacherManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Available classes for assignment
  const availableClasses = [
    "Grade 1 - Rose",
    "Grade 1 - Daisy",
    "Grade 2 - Lily",
    "Grade 2 - Tulip",
    "Grade 3 - Sunflower",
    "Grade 3 - Orchid",
    "Grade 4 - Jasmine",
    "Grade 4 - Carnation",
    "Grade 5 - Hibiscus",
    "Grade 5 - Marigold",
    "Grade 6 - Sampaguita",
    "Grade 6 - Bougainvillea",
  ];

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availableStudents, setAvailableStudents] = useState<
    Array<{ id: string; name: string; class_name: string }>
  >([]);

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teachersData, studentsData] = await Promise.all([
        supabaseHelpers.getTeachers(),
        supabaseHelpers.getStudents(),
      ]);

      setTeachers(teachersData);
      setAvailableStudents(
        studentsData.map((s) => ({
          id: s.id,
          name: s.name,
          class_name: s.class_name,
        })),
      );
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

  // Filter teachers based on search query and active tab
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active")
      return matchesSearch && teacher.status === "active";
    if (activeTab === "inactive")
      return matchesSearch && teacher.status === "inactive";
    if (activeTab === "on_leave")
      return matchesSearch && teacher.status === "on_leave";

    return matchesSearch;
  });

  // Form state for adding/editing teacher
  const [formData, setFormData] = useState<TeacherFormData>({
    name: "",
    employee_id: "",
    contact_number: "",
    email: "",
    address: "",
    date_of_birth: "",
    hire_date: "",
    department: "",
    position: "",
    assigned_classes: [],
    status: "active",
    salary: 0,
    notes: "",
    student_ids: [],
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen && !isEditDialogOpen) {
      setFormData({
        name: "",
        employee_id: "",
        contact_number: "",
        email: "",
        address: "",
        date_of_birth: "",
        hire_date: "",
        department: "",
        position: "",
        assigned_classes: [],
        status: "active",
        salary: 0,
        notes: "",
        student_ids: [],
      });
    }
  }, [isAddDialogOpen, isEditDialogOpen]);

  // Load form data when editing
  useEffect(() => {
    if (isEditDialogOpen && selectedTeacher) {
      setFormData({
        name: selectedTeacher.name,
        employee_id: selectedTeacher.employee_id,
        contact_number: selectedTeacher.contact_number,
        email: selectedTeacher.email,
        address: selectedTeacher.address,
        date_of_birth: selectedTeacher.date_of_birth,
        hire_date: selectedTeacher.hire_date,
        department: selectedTeacher.department,
        position: selectedTeacher.position,
        assigned_classes: selectedTeacher.assigned_classes,
        status: selectedTeacher.status,
        salary: selectedTeacher.salary || 0,
        notes: selectedTeacher.notes || "",
        student_ids: [],
      });
    }
  }, [isEditDialogOpen, selectedTeacher]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salary" ? Number(value) : value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle class assignment changes
  const handleClassToggle = (className: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      assigned_classes: checked
        ? [...prev.assigned_classes, className]
        : prev.assigned_classes.filter((c) => c !== className),
    }));
  };

  // Handle student assignment changes
  const handleStudentToggle = (studentId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      student_ids: checked
        ? [...prev.student_ids, studentId]
        : prev.student_ids.filter((id) => id !== studentId),
    }));
  };

  // Handle adding a new teacher
  const handleAddTeacher = async () => {
    try {
      setSubmitting(true);
      const teacherData = {
        name: formData.name,
        employee_id: formData.employee_id,
        contact_number: formData.contact_number,
        email: formData.email,
        address: formData.address,
        date_of_birth: formData.date_of_birth,
        hire_date: formData.hire_date,
        department: formData.department,
        position: formData.position,
        assigned_classes: formData.assigned_classes,
        status: formData.status,
        salary: formData.salary || null,
        notes: formData.notes || null,
      };

      await supabaseHelpers.createTeacher(teacherData);
      await loadData();
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Teacher added successfully.",
      });
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast({
        title: "Error",
        description: "Failed to add teacher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle editing a teacher
  const handleEditTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      setSubmitting(true);
      const updates = {
        name: formData.name,
        employee_id: formData.employee_id,
        contact_number: formData.contact_number,
        email: formData.email,
        address: formData.address,
        date_of_birth: formData.date_of_birth,
        hire_date: formData.hire_date,
        department: formData.department,
        position: formData.position,
        assigned_classes: formData.assigned_classes,
        status: formData.status,
        salary: formData.salary || null,
        notes: formData.notes || null,
      };

      await supabaseHelpers.updateTeacher(selectedTeacher.id, updates);
      await loadData();
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Teacher updated successfully.",
      });
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast({
        title: "Error",
        description: "Failed to update teacher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting a teacher
  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      await supabaseHelpers.deleteTeacher(teacherId);
      await loadData();
      if (selectedTeacher?.id === teacherId) {
        setSelectedTeacher(null);
      }
      toast({
        title: "Success",
        description: "Teacher deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast({
        title: "Error",
        description: "Failed to delete teacher. Please try again.",
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
      case "on_leave":
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
            Teacher Management
          </h1>
          <p className="text-muted-foreground">
            Manage teacher records and class assignments
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Teacher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Teacher list */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Teachers</CardTitle>
              <CardDescription>
                Search and select teachers to manage
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
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
                  <TabsTrigger value="on_leave">On Leave</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading teachers...</span>
                  </div>
                ) : filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <motion.div
                      key={teacher.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                          selectedTeacher?.id === teacher.id
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => setSelectedTeacher(teacher)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {teacher.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{teacher.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {teacher.employee_id} • {teacher.position}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(teacher.status)}>
                          {teacher.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No teachers found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Teacher details */}
        <div className="md:col-span-2">
          {selectedTeacher ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{selectedTeacher.name}</CardTitle>
                  <CardDescription>
                    Teacher details and class assignments
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
                    onClick={() => handleDeleteTeacher(selectedTeacher.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Employee ID
                        </p>
                        <p>{selectedTeacher.employee_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Position
                        </p>
                        <p>{selectedTeacher.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Contact Number
                        </p>
                        <p>{selectedTeacher.contact_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Email
                        </p>
                        <p>{selectedTeacher.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Address
                        </p>
                        <p>{selectedTeacher.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Date of Birth
                        </p>
                        <p>{selectedTeacher.date_of_birth}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Hire Date
                      </p>
                      <p>{selectedTeacher.hire_date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Department
                      </p>
                      <p>{selectedTeacher.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Status
                      </p>
                      <Badge
                        variant={getStatusBadgeVariant(selectedTeacher.status)}
                      >
                        {selectedTeacher.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  {selectedTeacher.salary && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Salary
                        </p>
                        <p>₱{selectedTeacher.salary.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Assigned Classes
                    </h3>
                    {selectedTeacher.assigned_classes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedTeacher.assigned_classes.map((className) => (
                          <Badge key={className} variant="secondary">
                            {className}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No classes assigned
                      </p>
                    )}
                  </div>

                  {availableStudents.filter(
                    (s: any) => s.teacher_id === selectedTeacher.id,
                  ).length > 0 ? (
                    <div className="space-y-2">
                      {availableStudents
                        .filter((s: any) => s.teacher_id === selectedTeacher.id)
                        .map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {student.class_name}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No students assigned
                    </p>
                  )}

                  {selectedTeacher.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Notes
                      </p>
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {selectedTeacher.notes}
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
                <h3 className="mt-4 text-lg font-medium">Select a Teacher</h3>
                <p className="text-muted-foreground">
                  Choose a teacher from the list to view and manage details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Teacher Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>
              Enter the details of the new teacher.
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
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  name="employee_id"
                  placeholder="Enter employee ID"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                />
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
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="hire_date">Hire Date</Label>
                <Input
                  id="hire_date"
                  name="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleSelectChange("department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Elementary">Elementary</SelectItem>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="Administration">
                      Administration
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) =>
                    handleSelectChange("position", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Senior Teacher">
                      Senior Teacher
                    </SelectItem>
                    <SelectItem value="Head Teacher">Head Teacher</SelectItem>
                    <SelectItem value="Principal">Principal</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary (Optional)</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  placeholder="Enter salary amount"
                  value={formData.salary || ""}
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
              <Label>Assigned Classes</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableClasses.map((className) => (
                  <div key={className} className="flex items-center space-x-2">
                    <Checkbox
                      id={className}
                      checked={formData.assigned_classes.includes(className)}
                      onCheckedChange={(checked) =>
                        handleClassToggle(className, checked as boolean)
                      }
                    />
                    <Label htmlFor={className} className="text-sm">
                      {className}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned Students</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableStudents.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={formData.student_ids.includes(student.id)}
                      onCheckedChange={(checked) =>
                        handleStudentToggle(student.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={student.id} className="text-sm">
                      {student.name} ({student.class_name})
                    </Label>
                  </div>
                ))}
              </div>
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
            <Button onClick={handleAddTeacher} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update the teacher's information.
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
                <Label htmlFor="edit-employee_id">Employee ID</Label>
                <Input
                  id="edit-employee_id"
                  name="employee_id"
                  placeholder="Enter employee ID"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                />
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
                <Label htmlFor="edit-email">Email</Label>
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
                <Label htmlFor="edit-hire_date">Hire Date</Label>
                <Input
                  id="edit-hire_date"
                  name="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleSelectChange("department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Elementary">Elementary</SelectItem>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="Administration">
                      Administration
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-position">Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) =>
                    handleSelectChange("position", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Senior Teacher">
                      Senior Teacher
                    </SelectItem>
                    <SelectItem value="Head Teacher">Head Teacher</SelectItem>
                    <SelectItem value="Principal">Principal</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-salary">Salary (Optional)</Label>
                <Input
                  id="edit-salary"
                  name="salary"
                  type="number"
                  placeholder="Enter salary amount"
                  value={formData.salary || ""}
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
              <Label>Assigned Classes</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableClasses.map((className) => (
                  <div key={className} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${className}`}
                      checked={formData.assigned_classes.includes(className)}
                      onCheckedChange={(checked) =>
                        handleClassToggle(className, checked as boolean)
                      }
                    />
                    <Label htmlFor={`edit-${className}`} className="text-sm">
                      {className}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned Students</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableStudents.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${student.id}`}
                      checked={formData.student_ids.includes(student.id)}
                      onCheckedChange={(checked) =>
                        handleStudentToggle(student.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`edit-${student.id}`} className="text-sm">
                      {student.name} ({student.class_name})
                    </Label>
                  </div>
                ))}
              </div>
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
            <Button onClick={handleEditTeacher} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherManagement;
