import { useContainers, useCreateContainer, usePackingJobs } from "@/hooks/use-manufacturing";
import { useSearch } from "@/hooks/use-search";
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
import { insertContainerSchema } from "@shared/schema";
import { format } from "date-fns";
import { filterBySearchQuery } from "@/lib/search-utils";
import { useMemo } from "react";

export default function Container() {
  const { data: containers = [], isLoading } = useContainers();
  const { data: packingJobs = [] } = usePackingJobs();
  const createMutation = useCreateContainer();
  const { searchQuery } = useSearch();

  const filteredContainers = useMemo(() => {
    return filterBySearchQuery(containers, searchQuery, ['containerType', 'containerNumber']);
  }, [containers, searchQuery]);

  const form = useForm({
    resolver: zodResolver(insertContainerSchema),
    defaultValues: {
      packingJobId: 0,
      numberofBales: 0,
      quantityPerBale: 0,
      containerType: "",
      containerNumber: "",
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
        <Header title="Container Management" />
        
        <div className="p-8 w-full max-w-7xl mx-auto flex flex-col items-center">
          <div className="w-full">
          <div className="flex justify-end mb-6">
            <DialogForm 
              title="Add Container"
              trigger={
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4" /> Record Container
                </Button>
              }
            >
              {(close) => (
                <form onSubmit={form.handleSubmit((d) => onSubmit(d, close))} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source (Packing Job)</label>
                    <Controller
                      control={form.control}
                      name="packingJobId"
                      render={({ field }: any) => (
                        <Select onValueChange={(val) => field.onChange(Number(val))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Packing Job" />
                          </SelectTrigger>
                          <SelectContent>
                            {packingJobs.map(job => (
                              <SelectItem key={job.id} value={String(job.id)}>
                                Job #{job.id} - Size {job.size} ({job.quantityPacked} units)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Number of Bales</label>
                      <Input type="number" step="1" {...form.register("numberofBales", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity Per Bale (Kg)</label>
                      <Input type="number" step="0.1" {...form.register("quantityPerBale", { valueAsNumber: true })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Container Type</label>
                      <Input {...form.register("containerType")} placeholder="e.g. 20ft FCL, 40ft FCL" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Container Number</label>
                      <Input {...form.register("containerNumber")} placeholder="e.g. CONT-001" />
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
            data={filteredContainers}
            columns={[
              { header: "Container ID", accessor: "id", className: "w-16" },
              { header: "Packing Job", accessor: "packingJobId" },
              { header: "Number of Bales", accessor: "numberofBales" },
              { header: "Qty Per Bale (kg)", accessor: (row) => `${row.quantityPerBale} kg` },
              { header: "Total Weight", accessor: (row) => `${(row.numberofBales * row.quantityPerBale).toFixed(2)} kg` },
              { header: "Container Type", accessor: "containerType" },
              { header: "Container #", accessor: (row) => row.containerNumber || "-" },
              { header: "Date", accessor: (row) => row.completedAt ? format(new Date(row.completedAt), 'MMM dd, HH:mm') : '-' },
            ]}
          />
          </div>
        </div>
      </main>
    </div>
  );
}
