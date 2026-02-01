import { useFactoryCosts, useCreateFactoryCost } from "@/hooks/use-manufacturing";
import { useSearch } from "@/hooks/use-search";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DataTable } from "@/components/DataTable";
import { DialogForm } from "@/components/ui/dialog-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFactoryCostSchema } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { filterBySearchQuery } from "@/lib/search-utils";
import { useMemo } from "react";

export default function FactoryCosts() {
  const { data: costs = [], isLoading } = useFactoryCosts();
  const createMutation = useCreateFactoryCost();
  const { toast } = useToast();
  const { searchQuery } = useSearch();

  const filteredCosts = useMemo(() => {
    return filterBySearchQuery(costs, searchQuery, ['category', 'description']);
  }, [costs, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/factory-cost/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/factory-cost"] });
      toast({ title: "Success", description: "Cost deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertFactoryCostSchema),
    defaultValues: {
      category: "utilities",
      description: "",
      amount: 0,
      paymentStatus: "pending",
      dueDate: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit = (data: any, close: () => void) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        close();
        toast({ title: "Success", description: "Cost recorded successfully" });
      }
    });
  };

  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const unpaidCosts = filteredCosts.filter(c => c.paymentStatus === 'pending').reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <div className="flex min-h-screen bg-background font-body text-foreground">
      <Sidebar />
      <main className="flex-1 transition-all duration-300">
        <Header title="Factory Costs & Bills" />
        
        <div className="p-8 w-full max-w-7xl mx-auto flex flex-col items-center">
          <div className="w-full">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Costs</p>
                <p className="text-2xl font-bold">Rs. {totalCosts.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Unpaid Bills</p>
                <p className="text-2xl font-bold text-red-600">Rs. {unpaidCosts.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <DialogForm 
                title="Add Factory Cost"
                trigger={
                  <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25">
                    <Plus className="w-4 h-4" /> Add Cost
                  </Button>
                }
              >
                {(close) => (
                  <form onSubmit={form.handleSubmit((d) => onSubmit(d, close))} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select onValueChange={(val) => form.setValue("category", val)} defaultValue="utilities">
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utilities">Utilities (Electricity, Water)</SelectItem>
                          <SelectItem value="wages">Wages & Salaries</SelectItem>
                          <SelectItem value="maintenance">Maintenance & Repairs</SelectItem>
                          <SelectItem value="rent">Rent</SelectItem>
                          <SelectItem value="transport">Transport & Logistics</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input {...form.register("description")} placeholder="e.g. Monthly electricity bill, salary payment" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount (Rs.)</label>
                      <Input type="number" step="0.01" {...form.register("amount", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Status</label>
                      <Select onValueChange={(val) => form.setValue("paymentStatus", val)} defaultValue="pending">
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Due Date</label>
                      <Input type="date" {...form.register("dueDate")} />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Saving..." : "Save Cost"}
                    </Button>
                  </form>
                )}
              </DialogForm>
            </div>

            <DataTable 
              isLoading={isLoading}
              data={filteredCosts}
              columns={[
                { header: "ID", accessor: "id", className: "w-16" },
                { header: "Category", accessor: "category", className: "font-medium" },
                { header: "Description", accessor: "description" },
                { header: "Amount", accessor: (row) => <span className="font-semibold">Rs. {row.amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span> },
                { header: "Status", accessor: (row) => (
                  <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wider ${row.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.paymentStatus}
                  </span>
                )},
                { header: "Due Date", accessor: (row) => row.dueDate ? format(new Date(row.dueDate), 'MMM dd, yyyy') : '-' },
                { 
                  header: "Actions", 
                  accessor: (row) => (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm("Delete this cost?")) {
                          deleteMutation.mutate(row.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  ),
                  className: "w-16"
                }
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
