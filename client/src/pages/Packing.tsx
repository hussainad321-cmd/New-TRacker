import { usePackingJobs, useCreatePackingJob, usePressingJobs } from "@/hooks/use-manufacturing";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DataTable } from "@/components/DataTable";
import { DialogForm } from "@/components/ui/dialog-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPackingJobSchema } from "@shared/schema";
import { format } from "date-fns";

export default function Packing() {
  const { data: jobs = [], isLoading } = usePackingJobs();
  const { data: pressingJobs = [] } = usePressingJobs();
  const createMutation = useCreatePackingJob();

  const form = useForm({
    resolver: zodResolver(insertPackingJobSchema),
    defaultValues: {
      pressingJobId: 0,
      size: "M",
      boxCount: 0,
      quantityPacked: 0,
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
        <Header title="Final Packing" />
        
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <DialogForm 
              title="Record Packing"
              trigger={
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4" /> Record Packing
                </Button>
              }
            >
              {(close) => (
                <form onSubmit={form.handleSubmit((d) => onSubmit(d, close))} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source Pressed Batch</label>
                    <Controller
                      control={form.control}
                      name="pressingJobId"
                      render={({ field }) => (
                        <Select onValueChange={(val) => field.onChange(Number(val))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Pressed Batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {pressingJobs.map(job => (
                              <SelectItem key={job.id} value={String(job.id)}>
                                Batch #{job.id} ({job.quantityPressed} pcs)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Size</label>
                    <Select onValueChange={(val) => form.setValue("size", val)} defaultValue="M">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {["S", "M", "L", "XL", "XXL"].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Box Count</label>
                      <Input type="number" {...form.register("boxCount", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Total Garments</label>
                      <Input type="number" {...form.register("quantityPacked", { valueAsNumber: true })} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Recording..." : "Save Record"}
                  </Button>
                </form>
              )}
            </DialogForm>
          </div>

          <DataTable 
            isLoading={isLoading}
            data={jobs}
            columns={[
              { header: "ID", accessor: "id", className: "w-16" },
              { header: "Size", accessor: "size" },
              { header: "Source Batch", accessor: (row) => `Pressing #${row.pressingJobId}` },
              { header: "Boxes", accessor: (row) => <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{row.boxCount} boxes</span> },
              { header: "Total Packed", accessor: (row) => <span className="font-bold text-blue-600">{row.quantityPacked} pcs</span> },
              { header: "Date", accessor: (row) => row.completedAt ? format(new Date(row.completedAt), 'MMM dd, HH:mm') : '-' },
            ]}
          />
        </div>
      </main>
    </div>
  );
}
