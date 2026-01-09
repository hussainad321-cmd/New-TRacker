import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// ============================================
// YARN
// ============================================
export function useYarnBatches() {
  return useQuery({
    queryKey: [api.yarn.list.path],
    queryFn: async () => {
      const res = await fetch(api.yarn.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch yarn batches");
      return api.yarn.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateYarnBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.yarn.create.input>) => {
      // Coerce number fields
      const payload = {
        ...data,
        weightKg: Number(data.weightKg),
      };
      
      const res = await fetch(api.yarn.create.path, {
        method: api.yarn.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create yarn batch");
      }
      return api.yarn.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.yarn.list.path] }),
  });
}

// ============================================
// KNITTING
// ============================================
export function useKnittingJobs() {
  return useQuery({
    queryKey: [api.knitting.list.path],
    queryFn: async () => {
      const res = await fetch(api.knitting.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch knitting jobs");
      return api.knitting.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateKnittingJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.knitting.create.input>) => {
      const payload = {
        ...data,
        yarnBatchId: Number(data.yarnBatchId),
        weightUsed: Number(data.weightUsed),
        fabricProduced: Number(data.fabricProduced),
      };

      const res = await fetch(api.knitting.create.path, {
        method: api.knitting.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create knitting job");
      }
      return api.knitting.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.knitting.list.path] }),
  });
}

// ============================================
// CUTTING
// ============================================
export function useCuttingJobs() {
  return useQuery({
    queryKey: [api.cutting.list.path],
    queryFn: async () => {
      const res = await fetch(api.cutting.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cutting jobs");
      return api.cutting.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCuttingJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.cutting.create.input>) => {
      const payload = {
        ...data,
        knittingJobId: Number(data.knittingJobId),
        quantityPieces: Number(data.quantityPieces),
        wasteKg: Number(data.wasteKg || 0),
      };

      const res = await fetch(api.cutting.create.path, {
        method: api.cutting.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create cutting job");
      return api.cutting.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cutting.list.path] }),
  });
}

// ============================================
// STITCHING
// ============================================
export function useStitchingJobs() {
  return useQuery({
    queryKey: [api.stitching.list.path],
    queryFn: async () => {
      const res = await fetch(api.stitching.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stitching jobs");
      return api.stitching.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStitchingJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.stitching.create.input>) => {
      const payload = {
        ...data,
        cuttingJobId: Number(data.cuttingJobId),
        quantityStitched: Number(data.quantityStitched),
        rejectedCount: Number(data.rejectedCount || 0),
      };

      const res = await fetch(api.stitching.create.path, {
        method: api.stitching.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create stitching job");
      return api.stitching.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.stitching.list.path] }),
  });
}

// ============================================
// PRESSING
// ============================================
export function usePressingJobs() {
  return useQuery({
    queryKey: [api.pressing.list.path],
    queryFn: async () => {
      const res = await fetch(api.pressing.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pressing jobs");
      return api.pressing.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePressingJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.pressing.create.input>) => {
      const payload = {
        ...data,
        stitchingJobId: Number(data.stitchingJobId),
        quantityPressed: Number(data.quantityPressed),
      };

      const res = await fetch(api.pressing.create.path, {
        method: api.pressing.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create pressing job");
      return api.pressing.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.pressing.list.path] }),
  });
}

// ============================================
// PACKING
// ============================================
export function usePackingJobs() {
  return useQuery({
    queryKey: [api.packing.list.path],
    queryFn: async () => {
      const res = await fetch(api.packing.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch packing jobs");
      return api.packing.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePackingJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.packing.create.input>) => {
      const payload = {
        ...data,
        pressingJobId: Number(data.pressingJobId),
        boxCount: Number(data.boxCount),
        quantityPacked: Number(data.quantityPacked),
      };

      const res = await fetch(api.packing.create.path, {
        method: api.packing.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create packing job");
      return api.packing.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.packing.list.path] }),
  });
}

// ============================================
// DASHBOARD
// ============================================
export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.dashboard.stats.responses[200].parse(await res.json());
    },
  });
}
