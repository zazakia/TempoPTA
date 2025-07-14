import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Upload, Calendar, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const paymentSchema = z.object({
  parentId: z.string().min(1, { message: "Parent is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
  paymentDate: z.date(),
  receiptFile: z.any().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentRecordingFormProps {
  onSubmit?: (data: PaymentFormValues) => void;
}

const PaymentRecordingForm = ({
  onSubmit = () => {},
}: PaymentRecordingFormProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock parent data - would come from API in real implementation
  const mockParents = [
    {
      id: "1",
      name: "John Doe",
      students: ["Alice Doe (Grade 3)", "Bob Doe (Grade 5)"],
    },
    { id: "2", name: "Jane Smith", students: ["Charlie Smith (Grade 1)"] },
    {
      id: "3",
      name: "Robert Johnson",
      students: ["David Johnson (Grade 2)", "Emma Johnson (Grade 4)"],
    },
  ];

  const filteredParents = mockParents.filter((parent) =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "250",
      paymentMethod: "cash",
      paymentDate: new Date(),
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setValue("receiptFile", e.target.files[0]);
    }
  };

  const handleFormSubmit = (data: PaymentFormValues) => {
    // In a real implementation, this would send data to the server
    // and handle the response
    console.log("Form submitted:", data);

    // Find the parent and update payment status for all linked students
    const selectedParent = mockParents.find((p) => p.id === data.parentId);
    if (selectedParent) {
      // In a real implementation, this would update the database
      // Update all students linked to this parent
      console.log(
        `Updating payment status for students: ${selectedParent.students.join(", ")}`,
      );

      // Here you would typically make an API call to update all linked students
      // Example: updateStudentPaymentStatus(selectedParent.studentIds, true, data.paymentDate)
    }

    onSubmit(data);

    // Reset form after submission
    reset();
    setSelectedFile(null);
    setSearchTerm("");
  };

  const selectParent = (parentId: string, parentName: string) => {
    setValue("parentId", parentId);
    setSearchTerm(parentName);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
        <CardDescription>
          Record a parent's PTA payment and automatically update all linked
          students.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parent">Parent/Guardian</Label>
            <div className="relative">
              <Input
                id="parent"
                placeholder="Search for parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input type="hidden" {...register("parentId")} />
            </div>
            {errors.parentId && (
              <p className="text-sm text-red-500">{errors.parentId.message}</p>
            )}

            {searchTerm && filteredParents.length > 0 && (
              <div className="mt-1 border rounded-md shadow-sm bg-white max-h-60 overflow-auto">
                {filteredParents.map((parent) => (
                  <div
                    key={parent.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectParent(parent.id, parent.name)}
                  >
                    <div className="font-medium">{parent.name}</div>
                    <div className="text-xs text-gray-500">
                      {parent.students.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (PHP)</Label>
              <Input id="amount" {...register("amount")} />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                onValueChange={(value) => setValue("paymentMethod", value)}
                defaultValue="cash"
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      setDate(newDate);
                      setValue("paymentDate", newDate);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Upload Receipt (Optional)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById("receipt")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {selectedFile ? selectedFile.name : "Select file"}
              </Button>
            </div>
            <input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <Button type="submit" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Payment will be saved locally when offline</p>
      </CardFooter>
    </Card>
  );
};

export default PaymentRecordingForm;
