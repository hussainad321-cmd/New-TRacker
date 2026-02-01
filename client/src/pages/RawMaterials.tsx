import { useRawMaterialPurchases, useCreateRawMaterialPurchase } from "@/hooks/use-manufacturing";
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
import { insertRawMaterialPurchaseSchema } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { filterBySearchQuery } from "@/lib/search-utils";
import { useMemo } from "react";

export default function RawMaterials() {
  const { data: purchases = [], isLoading } = useRawMaterialPurchases();
  const createMutation = useCreateRawMaterialPurchase();
  const { toast } = useToast();
  const { searchQuery } = useSearch();

  const filteredPurchases = useMemo(() => {
    return filterBySearchQuery(purchases, searchQuery, ['vendorName', 'materialType', 'unit']);
  }, [purchases, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/raw-material/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/raw-material"] });
      toast({ title: "Success", description: "Purchase deleted successfully" });
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
    resolver: zodResolver(insertRawMaterialPurchaseSchema),
    defaultValues: {
      vendorName: "",
      materialType: "",
      quantity: 0,
      unit: "kg",
      costPerUnit: 0,
      totalCost: 0,
      paymentStatus: "pending",
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: "",
    }
  });

  const onSubmit = (data: any, close: () => void) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        close();
        toast({ title: "Success", description: "Purchase recorded successfully" });
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-background font-body text-foreground">
      <Sidebar />
      <main className="flex-1 transition-all duration-300">
        <Header title="Raw Material Purchases" />
        
        <div className="p-8 w-full max-w-7xl mx-auto flex flex-col items-center">
          <div className="w-full">
            <div className="flex justify-end mb-6">
              <DialogForm 
                title="Add Raw Material Purchase"
                trigger={
                  <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25">
                    <Plus className="w-4 h-4" /> Add Purchase
                  </Button>
                }
              >
                {(close) => (
                  <form onSubmit={form.handleSubmit((d) => onSubmit(d, close))} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vendor Name</label>
                      <Input {...form.register("vendorName")} placeholder="Supplier name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Material Type</label>
                      <Input {...form.register("materialType")} placeholder="e.g. Cotton Yarn, Dyes, Buttons" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quantity</label>
                        <Input type="number" step="0.01" {...form.register("quantity", { valueAsNumber: true })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Unit</label>
                        <Select onValueChange={(val) => form.setValue("unit", val)} defaultValue="kg">
                          <SelectTrigger>
                            <SelectValue placeholder="Select Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {["kg", "liters", "meters", "pieces", "boxes"].map(u => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cost per Unit (Rs.)</label>
                        <Input type="number" step="0.01" {...form.register("costPerUnit", { valueAsNumber: true })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Total Cost (Rs.)</label>
                        <Input type="number" step="0.01" {...form.register("totalCost", { valueAsNumber: true })} />
                      </div>
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
                      <label className="text-sm font-medium">Purchase Date</label>
                      <Input type="date" {...form.register("purchaseDate")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notes</label>
                      <Input {...form.register("notes")} placeholder="Optional notes" />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Saving..." : "Save Purchase"}
                    </Button>
                  </form>
                )}
              </DialogForm>
            </div>

            <DataTable 
              isLoading={isLoading}
              data={filteredPurchases}
              columns={[
                { header: "ID", accessor: "id", className: "w-16" },
                { header: "Vendor", accessor: "vendorName", className: "font-medium" },
                { header: "Material", accessor: "materialType" },
                { header: "Quantity", accessor: (row) => `${row.quantity} ${row.unit}` },
                { header: "Cost per Unit", accessor: (row) => `Rs. ${row.costPerUnit.toLocaleString('en-PK', { maximumFractionDigits: 2 })}` },
                { header: "Total Cost", accessor: (row) => <span className="font-semibold">Rs. {row.totalCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span> },
                { header: "Status", accessor: (row) => (
                  <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wider ${row.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {row.paymentStatus}
                  </span>
                )},
                { header: "Date", accessor: (row) => row.purchaseDate ? format(new Date(row.purchaseDate), 'MMM dd, yyyy') : '-' },
                { 
                  header: "Actions", 
                  accessor: (row) => (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm("Delete this purchase?")) {
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
