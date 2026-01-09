import { useCuttingJobs, useCreateCuttingJob, useKnittingJobs } from "@/hooks/use-manufacturing";
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
import { insertCuttingJobSchema } from "@shared/schema";
import { format } from "date-fns";

export default function Cutting() {
  const { data: jobs = [], isLoading } = useCuttingJobs();
  const { data: knittingJobs = [] } = useKnittingJobs();
  const createMutation = useCreateCuttingJob();

  const form = useForm({
    resolver: zodResolver(insertCuttingJobSchema),
    defaultValues: {
      knittingJobId: 0,
      styleCode: "",
      size: "M",
      quantityPieces: 0,
      wasteKg: 0,
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
      <main className="flex-1 transition-all duration-300">
        <Header title="Cutting Department" />
        
        <div className="p-8 w-full max-w-7xl mx-auto flex flex-col items-center">
          <div className="w-full">
          <div className="flex justify-end mb-6">
            <DialogForm 
              title="Record Cutting Job"
              trigger={
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4" /> Record Cutting
                </Button>
              }
            >
              {(close) => (
                <form onSubmit={form.handleSubmit((d) => onSubmit(d, close))} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source Fabric (Knitting Job)</label>
                    <Controller
                      control={form.control}
                      name="knittingJobId"
                      render={({ field }) => (
                        <Select onValueChange={(val) => field.onChange(Number(val))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Knitting Job" />
                          </SelectTrigger>
                          <SelectContent>
                            {knittingJobs.map(job => (
                              <SelectItem key={job.id} value={String(job.id)}>
                                Job #{job.id} - {job.fabricType} ({job.fabricProduced}kg)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Style Code</label>
                    <Input {...form.register("styleCode")} placeholder="e.g. T-SHIRT-V-01" />
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
                      <label className="text-sm font-medium">Pieces Cut</label>
                      <Input type="number" {...form.register("quantityPieces", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Waste (Kg)</label>
                      <Input type="number" step="0.01" {...form.register("wasteKg", { valueAsNumber: true })} />
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
              { header: "Style Code", accessor: "styleCode", className: "font-mono font-bold text-primary" },
              { header: "Size", accessor: "size" },
              { header: "Source Job", accessor: (row) => `Knitting #${row.knittingJobId}` },
              { header: "Pieces Cut", accessor: (row) => <span className="font-semibold">{row.quantityPieces} pcs</span> },
              { header: "Waste", accessor: (row) => <span className="text-red-500">{row.wasteKg} kg</span> },
              { header: "Date", accessor: (row) => row.completedAt ? format(new Date(row.completedAt), 'MMM dd, HH:mm') : '-' },
            ]}
          />
          </div>
        </div>
      </main>
    </div>
  );
}
