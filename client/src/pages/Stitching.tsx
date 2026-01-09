import { useStitchingJobs, useCreateStitchingJob, useCuttingJobs } from "@/hooks/use-manufacturing";
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
import { insertStitchingJobSchema } from "@shared/schema";
import { format } from "date-fns";

export default function Stitching() {
  const { data: jobs = [], isLoading } = useStitchingJobs();
  const { data: cuttingJobs = [] } = useCuttingJobs();
  const createMutation = useCreateStitchingJob();

  const form = useForm({
    resolver: zodResolver(insertStitchingJobSchema),
    defaultValues: {
      cuttingJobId: 0,
      quantityStitched: 0,
      rejectedCount: 0,
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
        <Header title="Stitching Floor" />
        
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <DialogForm 
              title="Record Stitching Batch"
              trigger={
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4" /> Record Stitching
                </Button>
              }
            >
              {(close) => (
                <form onSubmit={form.handleSubmit((d) => onSubmit(d, close))} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source Cut Batch</label>
                    <Controller
                      control={form.control}
                      name="cuttingJobId"
                      render={({ field }) => (
                        <Select onValueChange={(val) => field.onChange(Number(val))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Cutting Batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {cuttingJobs.map(job => (
                              <SelectItem key={job.id} value={String(job.id)}>
                                Batch #{job.id} - {job.styleCode} ({job.quantityPieces} pcs)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity Stitched</label>
                      <Input type="number" {...form.register("quantityStitched")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rejected (Defects)</label>
                      <Input type="number" {...form.register("rejectedCount")} className="border-red-200 focus:ring-red-200" />
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
              { header: "Source Batch", accessor: (row) => `Cut #${row.cuttingJobId}` },
              { header: "Good Output", accessor: (row) => <span className="font-bold text-green-700">{row.quantityStitched} pcs</span> },
              { header: "Defects", accessor: (row) => <span className={row.rejectedCount ? "text-red-500 font-medium" : "text-muted-foreground"}>{row.rejectedCount} pcs</span> },
              { header: "Efficiency", accessor: (row) => {
                  const total = row.quantityStitched + (row.rejectedCount || 0);
                  const eff = total > 0 ? (row.quantityStitched / total) * 100 : 0;
                  return <span className="text-xs font-mono">{eff.toFixed(1)}%</span>;
                } 
              },
              { header: "Date", accessor: (row) => row.completedAt ? format(new Date(row.completedAt), 'MMM dd, HH:mm') : '-' },
            ]}
          />
        </div>
      </main>
    </div>
  );
}
