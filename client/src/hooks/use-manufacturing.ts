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
    mutationFn: async (data: any) => {
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
    mutationFn: async (data: any) => {
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
// DYEING
// ============================================
export function useDyeingJobs() {
  return useQuery({
    queryKey: [api.dyeing.list.path],
    queryFn: async () => {
      const res = await fetch(api.dyeing.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dyeing jobs");
      return api.dyeing.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDyeingJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        knittingJobId: Number(data.knittingJobId),
        weightKgDyed: Number(data.weightKgDyed),
        rollsPerBatch: Number(data.rollsPerBatch),
      };

      const res = await fetch(api.dyeing.create.path, {
        method: api.dyeing.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create dyeing job");
      }
      return api.dyeing.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.dyeing.list.path] }),
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
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        dyeingJobId: Number(data.dyeingJobId),
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
    mutationFn: async (data: any) => {
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
    mutationFn: async (data: any) => {
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
    mutationFn: async (data: any) => {
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
// CONTAINER
// ============================================
export function useContainers() {
  return useQuery({
    queryKey: [api.container.list.path],
    queryFn: async () => {
      const res = await fetch(api.container.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch containers");
      return api.container.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateContainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        packingJobId: Number(data.packingJobId),
        numberofBales: Number(data.numberofBales),
        quantityPerBale: Number(data.quantityPerBale),
      };

      const res = await fetch(api.container.create.path, {
        method: api.container.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create container");
      return api.container.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.container.list.path] }),
  });
}

// ============================================
// RAW MATERIAL PURCHASES
// ============================================
export function useRawMaterialPurchases() {
  return useQuery({
    queryKey: [api.rawMaterialPurchase.list.path],
    queryFn: async () => {
      const res = await fetch(api.rawMaterialPurchase.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch raw material purchases");
      return api.rawMaterialPurchase.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateRawMaterialPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        quantity: Number(data.quantity),
        costPerUnit: Number(data.costPerUnit),
        totalCost: Number(data.totalCost),
      };

      const res = await fetch(api.rawMaterialPurchase.create.path, {
        method: api.rawMaterialPurchase.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create raw material purchase");
      return api.rawMaterialPurchase.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.rawMaterialPurchase.list.path] }),
  });
}

// ============================================
// FACTORY COSTS
// ============================================
export function useFactoryCosts() {
  return useQuery({
    queryKey: [api.factoryCost.list.path],
    queryFn: async () => {
      const res = await fetch(api.factoryCost.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch factory costs");
      return api.factoryCost.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateFactoryCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        amount: Number(data.amount),
      };

      const res = await fetch(api.factoryCost.create.path, {
        method: api.factoryCost.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create factory cost");
      return api.factoryCost.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.factoryCost.list.path] }),
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
