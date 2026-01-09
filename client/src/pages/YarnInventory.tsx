import { useYarnBatches, useCreateYarnBatch } from "@/hooks/use-manufacturing";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DataTable } from "@/components/DataTable";
import { DialogForm } from "@/components/ui/dialog-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertYarnBatchSchema } from "@shared/schema";
import { format } from "date-fns";

export default function YarnInventory() {
  const { data: batches = [], isLoading } = useYarnBatches();
  const createMutation = useCreateYarnBatch();

  const form = useForm({
    resolver: zodResolver(insertYarnBatchSchema),
    defaultValues: {
      batchCode: "",
      color: "",
      weightKg: 0,
      supplier: "",
    }
  });

  const onSubmit = (data: any, close: () => void) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        close();
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-background font-body text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Header title="Yarn Inventory" />
        
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <DialogForm 
              title="Add New Yarn Batch"
              trigger={
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4" /> Add Yarn Batch
                </Button>
              }
            >
              {(close) => (
                <form onSubmit={form.handleSubmit((d) => onSubmit(d, close))} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Batch Code</label>
                    <Input {...form.register("batchCode")} placeholder="e.g. YRN-001" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <Input {...form.register("color")} placeholder="e.g. Navy Blue" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Weight (Kg)</label>
                    <Input type="number" step="0.01" {...form.register("weightKg", { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Supplier</label>
                    <Input {...form.register("supplier")} placeholder="Supplier Name" />
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Batch"}
                  </Button>
                </form>
              )}
            </DialogForm>
          </div>

          <DataTable 
            isLoading={isLoading}
            data={batches}
            columns={[
              { header: "ID", accessor: "id", className: "w-16" },
              { header: "Batch Code", accessor: "batchCode", className: "font-mono font-medium" },
              { header: "Color", accessor: "color" },
              { header: "Weight", accessor: (row) => `${row.weightKg} Kg` },
              { header: "Supplier", accessor: "supplier" },
              { header: "Received", accessor: (row) => row.receivedAt ? format(new Date(row.receivedAt), 'MMM dd, yyyy') : '-' },
            ]}
          />
        </div>
      </main>
    </div>
  );
}
