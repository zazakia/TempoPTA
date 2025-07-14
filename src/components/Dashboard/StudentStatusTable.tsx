import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Student {
  id: string;
  name: string;
  class: string;
  parentName: string;
  paymentStatus: boolean;
  paymentDate: string | null;
}

interface StudentStatusTableProps {
  students?: Student[];
  classes?: string[];
  userRole?: string;
}

const StudentStatusTable = ({
  students = [
    {
      id: "1",
      name: "John Doe",
      class: "Grade 1-A",
      parentName: "Jane Doe",
      paymentStatus: true,
      paymentDate: "2023-07-15",
    },
    {
      id: "2",
      name: "Sarah Smith",
      class: "Grade 2-B",
      parentName: "Mike Smith",
      paymentStatus: false,
      paymentDate: null,
    },
    {
      id: "3",
      name: "Michael Johnson",
      class: "Grade 1-A",
      parentName: "Lisa Johnson",
      paymentStatus: true,
      paymentDate: "2023-07-10",
    },
    {
      id: "4",
      name: "Emily Brown",
      class: "Grade 3-C",
      parentName: "Robert Brown",
      paymentStatus: false,
      paymentDate: null,
    },
    {
      id: "5",
      name: "David Wilson",
      class: "Grade 2-B",
      parentName: "Patricia Wilson",
      paymentStatus: true,
      paymentDate: "2023-07-12",
    },
    {
      id: "6",
      name: "Jessica Taylor",
      class: "Grade 3-C",
      parentName: "Thomas Taylor",
      paymentStatus: false,
      paymentDate: null,
    },
    {
      id: "7",
      name: "Daniel Martinez",
      class: "Grade 1-A",
      parentName: "Maria Martinez",
      paymentStatus: true,
      paymentDate: "2023-07-14",
    },
    {
      id: "8",
      name: "Sophia Anderson",
      class: "Grade 2-B",
      parentName: "James Anderson",
      paymentStatus: false,
      paymentDate: null,
    },
    {
      id: "9",
      name: "Matthew Thomas",
      class: "Grade 3-C",
      parentName: "Jennifer Thomas",
      paymentStatus: true,
      paymentDate: "2023-07-11",
    },
    {
      id: "10",
      name: "Olivia Garcia",
      class: "Grade 1-A",
      parentName: "Carlos Garcia",
      paymentStatus: false,
      paymentDate: null,
    },
  ],
  classes = ["All Classes", "Grade 1-A", "Grade 2-B", "Grade 3-C"],
  userRole = "treasurer",
}: StudentStatusTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Student>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const itemsPerPage = 5;

  // Filter students based on search term and selected class
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      selectedClass === "All Classes" || student.class === selectedClass;

    return matchesSearch && matchesClass;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortField === "paymentStatus") {
      return sortDirection === "asc"
        ? Number(a.paymentStatus) - Number(b.paymentStatus)
        : Number(b.paymentStatus) - Number(a.paymentStatus);
    }

    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate students
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle sort
  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Export data as CSV
  const exportToCSV = () => {
    const headers = [
      "Name",
      "Class",
      "Parent Name",
      "Payment Status",
      "Payment Date",
    ];
    const csvData = filteredStudents.map((student) => [
      student.name,
      student.class,
      student.parentName,
      student.paymentStatus ? "Paid" : "Unpaid",
      student.paymentDate || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_payment_status.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">
          Student Payment Status
        </CardTitle>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search students or parents..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Student Name
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("class")}
                >
                  <div className="flex items-center gap-1">
                    Class
                    {sortField === "class" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("parentName")}
                >
                  <div className="flex items-center gap-1">
                    Parent/Guardian
                    {sortField === "parentName" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("paymentStatus")}
                >
                  <div className="flex items-center gap-1">
                    Payment Status
                    {sortField === "paymentStatus" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Payment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.parentName}</TableCell>
                    <TableCell>
                      {student.paymentStatus ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1 w-fit">
                          <Check className="h-3 w-3" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-red-800 border-red-300 flex items-center gap-1 w-fit"
                        >
                          <X className="h-3 w-3" />
                          Unpaid
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{student.paymentDate || "—"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500"
                  >
                    No students found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className="text-sm text-gray-500 mt-4 text-center">
          Showing {paginatedStudents.length} of {filteredStudents.length}{" "}
          students
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentStatusTable;
