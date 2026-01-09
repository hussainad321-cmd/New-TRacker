import { useKnittingJobs, useCreateKnittingJob, useYarnBatches } from "@/hooks/use-manufacturing";
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
import { insertKnittingJobSchema } from "@shared/schema";
import { format } from "date-fns";

export default function Knitting() {
  const { data: jobs = [], isLoading } = useKnittingJobs();
  const { data: yarnBatches = [] } = useYarnBatches();
  const createMutation = useCreateKnittingJob();

  const form = useForm({
    resolver: zodResolver(insertKnittingJobSchema),
    defaultValues: {
      yarnBatchId: 0,
      fabricType: "",
      size: "Mixed",
      weightUsed: 0,
      fabricProduced: 0,
      status: "completed",
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
        <Header title="Knitting Production" />
        
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <DialogForm 
              title="Record Knitting Job"
              trigger={
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4" /> Record Job
                </Button>
              }
            >
              {(close) => (
                <form onSubmit={form.handleSubmit((d) => onSubmit(d, close))} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Yarn Batch</label>
                    <Controller
                      control={form.control}
                      name="yarnBatchId"
                      render={({ field }) => (
                        <Select onValueChange={(val) => field.onChange(Number(val))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Yarn Batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {yarnBatches.map(batch => (
                              <SelectItem key={batch.id} value={String(batch.id)}>
                                {batch.batchCode} - {batch.color} ({batch.weightKg}kg)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fabric Type</label>
                    <Input {...form.register("fabricType")} placeholder="e.g. Single Jersey" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Size</label>
                    <Select onValueChange={(val) => form.setValue("size", val)} defaultValue="Mixed">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {["S", "M", "L", "XL", "XXL", "Mixed"].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Yarn Used (Kg)</label>
                      <Input type="number" step="0.01" {...form.register("weightUsed")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fabric Produced (Kg)</label>
                      <Input type="number" step="0.01" {...form.register("fabricProduced")} />
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
              { header: "Job ID", accessor: "id", className: "w-16" },
              { header: "Fabric Type", accessor: "fabricType", className: "font-medium" },
              { header: "Size", accessor: "size" },
              { header: "Yarn Used", accessor: (row) => `${row.weightUsed} Kg` },
              { header: "Fabric Output", accessor: (row) => <span className="text-green-600 font-semibold">{row.fabricProduced} Kg</span> },
              { header: "Status", accessor: (row) => (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs uppercase font-bold tracking-wider">
                  {row.status}
                </span>
              )},
              { header: "Date", accessor: (row) => row.completedAt ? format(new Date(row.completedAt), 'MMM dd, HH:mm') : '-' },
            ]}
          />
        </div>
      </main>
    </div>
  );
}
