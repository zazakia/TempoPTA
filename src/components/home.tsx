import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import StatisticsCards from "./Dashboard/StatisticsCards";
import StudentStatusTable from "./Dashboard/StudentStatusTable";
import PaymentRecordingForm from "./Dashboard/PaymentRecordingForm";
import ParentManagement from "./Dashboard/ParentManagement";
import StudentManagement from "./Dashboard/StudentManagement";
import TeacherManagement from "./Dashboard/TeacherManagement";

const Home = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userRole, setUserRole] = useState("treasurer"); // treasurer, administrator, teacher

  useEffect(() => {
    // App initialization
    console.log("TempoPTA app initialized");
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-card border-r">
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-semibold">PTA Payment System</h2>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto py-4 px-3">
          <nav className="flex-1 space-y-1">
            <Button
              variant={activeTab === "dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start text-left font-normal mb-1"
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "payments" ? "secondary" : "ghost"}
              className="w-full justify-start text-left font-normal mb-1"
              onClick={() => setActiveTab("payments")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payments
            </Button>
            <Button
              variant={activeTab === "students" ? "secondary" : "ghost"}
              className="w-full justify-start text-left font-normal mb-1"
              onClick={() => setActiveTab("students")}
            >
              <Users className="mr-2 h-4 w-4" />
              Student Status
            </Button>
            <Button
              variant={activeTab === "parents" ? "secondary" : "ghost"}
              className="w-full justify-start text-left font-normal mb-1"
              onClick={() => setActiveTab("parents")}
            >
              <Users className="mr-2 h-4 w-4" />
              Parent Management
            </Button>
            <Button
              variant={
                activeTab === "student-management" ? "secondary" : "ghost"
              }
              className="w-full justify-start text-left font-normal mb-1"
              onClick={() => setActiveTab("student-management")}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Student Management
            </Button>
            <Button
              variant={
                activeTab === "teacher-management" ? "secondary" : "ghost"
              }
              className="w-full justify-start text-left font-normal mb-1"
              onClick={() => setActiveTab("teacher-management")}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Teacher Management
            </Button>
            <Button
              variant={activeTab === "reports" ? "secondary" : "ghost"}
              className="w-full justify-start text-left font-normal mb-1"
              onClick={() => setActiveTab("reports")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </nav>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=treasurer"
                  alt="User avatar"
                />
                <AvatarFallback>TR</AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <p className="text-sm font-medium">Treasurer</p>
                <p className="text-xs text-muted-foreground">
                  treasurer@school.edu
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="md:hidden">
              <h2 className="text-lg font-semibold">PTA Payment System</h2>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="md:hidden flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=treasurer"
                    alt="User avatar"
                  />
                  <AvatarFallback>TR</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Role selector (for demo purposes) */}
          <div className="mb-6 flex items-center">
            <span className="mr-2 text-sm font-medium">View as:</span>
            <select
              className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
            >
              <option value="treasurer">Treasurer</option>
              <option value="administrator">Administrator</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* Dashboard tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <StatisticsCards userRole={userRole} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                    <CardDescription>
                      Latest payment transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">Parent {i}</p>
                            <p className="text-sm text-muted-foreground">
                              Today at {10 + i}:00 AM
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₱250.00</p>
                            <p className="text-xs text-emerald-500">Paid</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Collection Progress</CardTitle>
                    <CardDescription>
                      Payment collection by class
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["Grade 1", "Grade 2", "Grade 3", "Grade 4"].map(
                        (grade, i) => (
                          <div key={grade} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{grade}</p>
                              <p className="text-sm text-muted-foreground">
                                {60 + i * 10}%
                              </p>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${60 + i * 10}%` }}
                              />
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Record Payments tab */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold tracking-tight">
                Record Payments
              </h1>
              <PaymentRecordingForm />
            </div>
          )}

          {/* Student Status tab */}
          {activeTab === "students" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold tracking-tight">
                Student Payment Status
              </h1>
              <StudentStatusTable userRole={userRole} />
            </div>
          )}

          {/* Parent Management tab */}
          {activeTab === "parents" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold tracking-tight">
                Parent Management
              </h1>
              <ParentManagement />
            </div>
          )}

          {/* Student Management tab */}
          {activeTab === "student-management" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold tracking-tight">
                Student Management
              </h1>
              <StudentManagement />
            </div>
          )}

          {/* Teacher Management tab */}
          {activeTab === "teacher-management" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold tracking-tight">
                Teacher Management
              </h1>
              <TeacherManagement />
            </div>
          )}

          {/* Reports tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold tracking-tight">
                Financial Reports
              </h1>
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>
                    Generate and download financial reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">Collection Summary</p>
                        <p className="text-sm text-muted-foreground">
                          Total collections by date range
                        </p>
                      </div>
                      <Button>Generate</Button>
                    </div>
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">Class Payment Status</p>
                        <p className="text-sm text-muted-foreground">
                          Payment status by class
                        </p>
                      </div>
                      <Button>Generate</Button>
                    </div>
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">Expense Report</p>
                        <p className="text-sm text-muted-foreground">
                          Detailed expense breakdown
                        </p>
                      </div>
                      <Button>Generate</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Financial Summary</p>
                        <p className="text-sm text-muted-foreground">
                          Income vs expenses overview
                        </p>
                      </div>
                      <Button>Generate</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
