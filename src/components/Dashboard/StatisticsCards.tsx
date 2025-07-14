import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  UsersIcon,
  SchoolIcon,
  ReceiptIcon,
} from "lucide-react";

interface StatisticsCardsProps {
  totalCollected?: number;
  targetAmount?: number;
  percentagePaid?: number;
  totalStudents?: number;
  classSummary?: {
    className: string;
    percentagePaid: number;
  }[];
  recentPayments?: {
    parentName: string;
    amount: number;
    date: string;
  }[];
}

const StatisticsCards = ({
  totalCollected = 25000,
  targetAmount = 50000,
  percentagePaid = 65,
  totalStudents = 200,
  classSummary = [
    { className: "Grade 1", percentagePaid: 75 },
    { className: "Grade 2", percentagePaid: 60 },
    { className: "Grade 3", percentagePaid: 45 },
    { className: "Grade 4", percentagePaid: 80 },
  ],
  recentPayments = [
    { parentName: "John Doe", amount: 250, date: "2023-07-10" },
    { parentName: "Jane Smith", amount: 250, date: "2023-07-09" },
    { parentName: "Robert Johnson", amount: 250, date: "2023-07-08" },
  ],
}: StatisticsCardsProps) => {
  const percentageCollected = Math.round((totalCollected / targetAmount) * 100);
  const studentsPaid = Math.round((percentagePaid / 100) * totalStudents);

  // Find the class with highest and lowest payment percentage
  const highestClass = [...classSummary].sort(
    (a, b) => b.percentagePaid - a.percentagePaid,
  )[0];
  const lowestClass = [...classSummary].sort(
    (a, b) => a.percentagePaid - b.percentagePaid,
  )[0];

  return (
    <div className="w-full bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collections Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Collections
                </p>
                <h3 className="text-2xl font-bold mt-2">
                  ₱{totalCollected.toLocaleString()}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Target: ₱{targetAmount.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ReceiptIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={percentageCollected} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {percentageCollected}% of target collected
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Students Paid Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Students Paid
                </p>
                <h3 className="text-2xl font-bold mt-2">
                  {studentsPaid}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    of {totalStudents}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {percentagePaid}% completion
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={percentagePaid} className="h-2" />
              <div className="flex justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {studentsPaid} paid
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalStudents - studentsPaid} unpaid
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collections by Class Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Collections by Class
                </p>
                <h3 className="text-2xl font-bold mt-2">
                  {highestClass?.className}
                </h3>
                <div className="flex items-center mt-1">
                  <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
                  <p className="text-xs text-green-500">
                    {highestClass?.percentagePaid}% paid
                  </p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <SchoolIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-medium">{lowestClass?.className}</p>
                <div className="flex items-center">
                  <ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" />
                  <p className="text-xs text-red-500">
                    {lowestClass?.percentagePaid}% paid
                  </p>
                </div>
              </div>
              <Progress value={lowestClass?.percentagePaid} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Recent Payments
                </p>
                <h3 className="text-2xl font-bold mt-2">
                  {recentPayments.length}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  in the last 7 days
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUpIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {recentPayments.slice(0, 2).map((payment, index) => (
                <div key={index} className="flex justify-between items-center">
                  <p className="text-xs truncate max-w-[120px]">
                    {payment.parentName}
                  </p>
                  <div className="flex items-center">
                    <p className="text-xs font-medium">₱{payment.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsCards;
