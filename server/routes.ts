import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Yarn
  app.get(api.yarn.list.path, async (req, res) => {
    const data = await storage.getYarnBatches();
    res.json(data);
  });

  app.post(api.yarn.create.path, async (req, res) => {
    try {
      const input = api.yarn.create.input.parse(req.body);
      const result = await storage.createYarnBatch(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.yarn.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const result = await storage.getYarnBatch(id);
    if (!result) return res.status(404).json({ message: "Yarn batch not found" });
    res.json(result);
  });

  app.delete("/api/yarn/:id", async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteYarnBatch(id);
    res.sendStatus(204);
  });

  // Knitting
  app.get(api.knitting.list.path, async (req, res) => {
    const data = await storage.getKnittingJobs();
    res.json(data);
  });

  app.post(api.knitting.create.path, async (req, res) => {
    try {
      const input = api.knitting.create.input.parse(req.body);
      const result = await storage.createKnittingJob(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Cutting
  app.get(api.cutting.list.path, async (req, res) => {
    const data = await storage.getCuttingJobs();
    res.json(data);
  });

  app.post(api.cutting.create.path, async (req, res) => {
    try {
      const input = api.cutting.create.input.parse(req.body);
      const result = await storage.createCuttingJob(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Stitching
  app.get(api.stitching.list.path, async (req, res) => {
    const data = await storage.getStitchingJobs();
    res.json(data);
  });

  app.post(api.stitching.create.path, async (req, res) => {
    try {
      const input = api.stitching.create.input.parse(req.body);
      const result = await storage.createStitchingJob(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Pressing
  app.get(api.pressing.list.path, async (req, res) => {
    const data = await storage.getPressingJobs();
    res.json(data);
  });

  app.post(api.pressing.create.path, async (req, res) => {
    try {
      const input = api.pressing.create.input.parse(req.body);
      const result = await storage.createPressingJob(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Packing
  app.get(api.packing.list.path, async (req, res) => {
    const data = await storage.getPackingJobs();
    res.json(data);
  });

  app.post(api.packing.create.path, async (req, res) => {
    try {
      const input = api.packing.create.input.parse(req.body);
      const result = await storage.createPackingJob(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Dashboard
  app.get(api.dashboard.stats.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Seed Data
  const existingYarn = await storage.getYarnBatches();
  if (existingYarn.length === 0) {
    const yarn1 = await storage.createYarnBatch({
      batchCode: "YRN-001",
      color: "Blue",
      weightKg: 500,
      supplier: "Textile Co",
    });
    await storage.createYarnBatch({
      batchCode: "YRN-002",
      color: "Red",
      weightKg: 300,
      supplier: "Yarn Masters",
    });
    await storage.createKnittingJob({
      yarnBatchId: yarn1.id,
      fabricType: "Jersey",
      weightUsed: 100,
      fabricProduced: 95,
      status: "completed",
    });
  }

  return httpServer;
}
