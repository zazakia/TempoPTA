import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Link,
  Users,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
  DialogTrigger,
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
import { useToast } from "@/components/ui/use-toast";
import { supabaseHelpers } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type Parent = Database["public"]["Tables"]["parents"]["Row"] & {
  students?: Database["public"]["Tables"]["students"]["Row"][];
};

type Student = Database["public"]["Tables"]["students"]["Row"];

type ParentInsert = Database["public"]["Tables"]["parents"]["Insert"];
type ParentUpdate = Database["public"]["Tables"]["parents"]["Update"];
type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];

const ParentManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLinkStudentDialogOpen, setIsLinkStudentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State for data
  const [parents, setParents] = useState<Parent[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [parentsData, studentsData] = await Promise.all([
        supabaseHelpers.getParents(),
        supabaseHelpers.getStudents(),
      ]);

      setParents(parentsData);
      // Filter students that don't have a parent assigned
      setAvailableStudents(
        studentsData.filter((student) => !student.parent_id),
      );
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load parent data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter parents based on search query and active tab
  const filteredParents = parents.filter((parent) => {
    const matchesSearch =
      parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "paid") return matchesSearch && parent.payment_status;
    if (activeTab === "unpaid") return matchesSearch && !parent.payment_status;

    return matchesSearch;
  });

  // Form state for adding/editing parent
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    email: "",
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen && !isEditDialogOpen) {
      setFormData({
        name: "",
        contact_number: "",
        email: "",
      });
    }
  }, [isAddDialogOpen, isEditDialogOpen]);

  // Load form data when editing
  useEffect(() => {
    if (isEditDialogOpen && selectedParent) {
      setFormData({
        name: selectedParent.name,
        contact_number: selectedParent.contact_number,
        email: selectedParent.email,
      });
    }
  }, [isEditDialogOpen, selectedParent]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new parent
  const handleAddParent = async () => {
    if (!formData.name || !formData.contact_number || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const newParentData: ParentInsert = {
        name: formData.name,
        contact_number: formData.contact_number,
        email: formData.email,
        payment_status: false,
      };

      const newParent = await supabaseHelpers.createParent(newParentData);
      setParents([...parents, { ...newParent, students: [] }]);
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Parent added successfully.",
      });
    } catch (error) {
      console.error("Error adding parent:", error);
      toast({
        title: "Error",
        description: "Failed to add parent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle editing a parent
  const handleEditParent = async () => {
    if (!selectedParent) return;

    if (!formData.name || !formData.contact_number || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const updates: ParentUpdate = {
        name: formData.name,
        contact_number: formData.contact_number,
        email: formData.email,
      };

      const updatedParent = await supabaseHelpers.updateParent(
        selectedParent.id,
        updates,
      );

      const updatedParents = parents.map((parent) => {
        if (parent.id === selectedParent.id) {
          return { ...updatedParent, students: parent.students };
        }
        return parent;
      });

      setParents(updatedParents);
      setSelectedParent({
        ...updatedParent,
        students: selectedParent.students,
      });
      setIsEditDialogOpen(false);

      toast({
        title: "Success",
        description: "Parent updated successfully.",
      });
    } catch (error) {
      console.error("Error updating parent:", error);
      toast({
        title: "Error",
        description: "Failed to update parent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting a parent
  const handleDeleteParent = async (parentId: string) => {
    try {
      setSubmitting(true);
      await supabaseHelpers.deleteParent(parentId);

      const updatedParents = parents.filter((parent) => parent.id !== parentId);
      setParents(updatedParents);

      if (selectedParent?.id === parentId) {
        setSelectedParent(null);
      }

      toast({
        title: "Success",
        description: "Parent deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting parent:", error);
      toast({
        title: "Error",
        description: "Failed to delete parent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle linking a student to a parent
  const handleLinkStudent = async (studentId: string) => {
    if (!selectedParent) return;

    // Find the student in available students
    const studentToLink = availableStudents.find(
      (student) => student.id === studentId,
    );
    if (!studentToLink) return;

    try {
      setSubmitting(true);
      // Update student to link to parent
      const studentUpdate: StudentUpdate = {
        parent_id: selectedParent.id,
      };

      await supabaseHelpers.updateStudent(studentId, studentUpdate);

      // Remove from available students
      setAvailableStudents(
        availableStudents.filter((student) => student.id !== studentId),
      );

      // Add to parent's students
      const updatedStudentToLink = {
        ...studentToLink,
        parent_id: selectedParent.id,
      };
      const updatedParents = parents.map((parent) => {
        if (parent.id === selectedParent.id) {
          return {
            ...parent,
            students: [...(parent.students || []), updatedStudentToLink],
          };
        }
        return parent;
      });

      setParents(updatedParents);
      setSelectedParent(
        updatedParents.find((p) => p.id === selectedParent.id) || null,
      );

      toast({
        title: "Success",
        description: "Student linked to parent successfully.",
      });
    } catch (error) {
      console.error("Error linking student:", error);
      toast({
        title: "Error",
        description: "Failed to link student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle unlinking a student from a parent
  const handleUnlinkStudent = async (studentId: string) => {
    if (!selectedParent) return;

    // Find the student in parent's students
    const studentToUnlink = selectedParent.students?.find(
      (student) => student.id === studentId,
    );
    if (!studentToUnlink) return;

    try {
      setSubmitting(true);
      // Update student to remove parent link
      const studentUpdate: StudentUpdate = {
        parent_id: null,
      };

      await supabaseHelpers.updateStudent(studentId, studentUpdate);

      // Add to available students
      const updatedStudentToUnlink = { ...studentToUnlink, parent_id: null };
      setAvailableStudents([...availableStudents, updatedStudentToUnlink]);

      // Remove from parent's students
      const updatedParents = parents.map((parent) => {
        if (parent.id === selectedParent.id) {
          return {
            ...parent,
            students: (parent.students || []).filter(
              (student) => student.id !== studentId,
            ),
          };
        }
        return parent;
      });

      setParents(updatedParents);
      setSelectedParent(
        updatedParents.find((p) => p.id === selectedParent.id) || null,
      );

      toast({
        title: "Success",
        description: "Student unlinked from parent successfully.",
      });
    } catch (error) {
      console.error("Error unlinking student:", error);
      toast({
        title: "Error",
        description: "Failed to unlink student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Parent Management
          </h1>
          <p className="text-muted-foreground">
            Manage parents and link students to their records
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Parent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Parent list */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Parents</CardTitle>
              <CardDescription>
                Search and select parents to manage
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search parents..."
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="paid">Paid</TabsTrigger>
                  <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading parents...</span>
                  </div>
                ) : filteredParents.length > 0 ? (
                  filteredParents.map((parent) => (
                    <motion.div
                      key={parent.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${selectedParent?.id === parent.id ? "bg-accent" : "hover:bg-accent/50"}`}
                        onClick={() => setSelectedParent(parent)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {parent.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{parent.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {parent.students?.length || 0} student(s)
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            parent.payment_status ? "default" : "outline"
                          }
                        >
                          {parent.payment_status ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No parents found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Parent details and students */}
        <div className="md:col-span-2">
          {selectedParent ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{selectedParent.name}</CardTitle>
                  <CardDescription>
                    Parent details and linked students
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
                    onClick={() => handleDeleteParent(selectedParent.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Contact Number
                      </p>
                      <p>{selectedParent.contact_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email
                      </p>
                      <p>{selectedParent.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Payment Status
                      </p>
                      <Badge
                        variant={
                          selectedParent.payment_status ? "default" : "outline"
                        }
                      >
                        {selectedParent.payment_status ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Payment Date
                      </p>
                      <p>
                        {selectedParent.payment_date
                          ? new Date(
                              selectedParent.payment_date,
                            ).toLocaleDateString()
                          : "Not paid yet"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">Linked Students</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsLinkStudentDialogOpen(true)}
                      >
                        <Link className="h-4 w-4 mr-1" /> Link Student
                      </Button>
                    </div>

                    {selectedParent.students &&
                    selectedParent.students.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedParent.students?.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>{student.class_name}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    student.payment_status
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {student.payment_status ? "Paid" : "Unpaid"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleUnlinkStudent(student.id)
                                  }
                                  disabled={submitting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 border rounded-md">
                        <Users className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">
                          No students linked to this parent
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setIsLinkStudentDialogOpen(true)}
                        >
                          <Link className="h-4 w-4 mr-1" /> Link Student
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full border rounded-lg p-8">
              <div className="text-center">
                <ChevronDown className="h-10 w-10 mx-auto text-muted-foreground animate-bounce" />
                <h3 className="mt-4 text-lg font-medium">Select a Parent</h3>
                <p className="text-muted-foreground">
                  Choose a parent from the list to view and manage details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Parent Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Parent</DialogTitle>
            <DialogDescription>
              Enter the details of the new parent/guardian.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact_number" className="text-sm font-medium">
                Contact Number
              </label>
              <Input
                id="contact_number"
                name="contact_number"
                placeholder="Enter contact number"
                value={formData.contact_number}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAddParent} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Parent"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Parent Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Parent</DialogTitle>
            <DialogDescription>
              Update the details of the parent/guardian.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="edit-contact_number"
                className="text-sm font-medium"
              >
                Contact Number
              </label>
              <Input
                id="edit-contact_number"
                name="contact_number"
                placeholder="Enter contact number"
                value={formData.contact_number}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEditParent} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Student Dialog */}
      <Dialog
        open={isLinkStudentDialogOpen}
        onOpenChange={setIsLinkStudentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Student to Parent</DialogTitle>
            <DialogDescription>
              Select a student to link to {selectedParent?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            {availableStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.class_name}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLinkStudent(student.id)}
                          disabled={submitting}
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No available students to link
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLinkStudentDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentManagement;
