import { z } from 'zod';
import { 
  insertYarnBatchSchema, 
  insertKnittingJobSchema, 
  insertDyeingJobSchema,
  insertCuttingJobSchema, 
  insertStitchingJobSchema, 
  insertPressingJobSchema, 
  insertPackingJobSchema,
  insertContainerSchema,
  insertRawMaterialPurchaseSchema,
  insertFactoryCostSchema,
  yarnBatches,
  knittingJobs,
  dyeingJobs,
  cuttingJobs,
  stitchingJobs,
  pressingJobs,
  packingJobs,
  containers,
  rawMaterialPurchases,
  factoryCosts
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  yarn: {
    list: {
      method: 'GET' as const,
      path: '/api/yarn',
      responses: {
        200: z.array(z.custom<typeof yarnBatches.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/yarn',
      input: insertYarnBatchSchema,
      responses: {
        201: z.custom<typeof yarnBatches.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/yarn/:id',
      responses: {
        200: z.custom<typeof yarnBatches.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  knitting: {
    list: {
      method: 'GET' as const,
      path: '/api/knitting',
      responses: {
        200: z.array(z.custom<typeof knittingJobs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/knitting',
      input: insertKnittingJobSchema,
      responses: {
        201: z.custom<typeof knittingJobs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  dyeing: {
    list: {
      method: 'GET' as const,
      path: '/api/dyeing',
      responses: {
        200: z.array(z.custom<typeof dyeingJobs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/dyeing',
      input: insertDyeingJobSchema,
      responses: {
        201: z.custom<typeof dyeingJobs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  cutting: {
    list: {
      method: 'GET' as const,
      path: '/api/cutting',
      responses: {
        200: z.array(z.custom<typeof cuttingJobs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cutting',
      input: insertCuttingJobSchema,
      responses: {
        201: z.custom<typeof cuttingJobs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  stitching: {
    list: {
      method: 'GET' as const,
      path: '/api/stitching',
      responses: {
        200: z.array(z.custom<typeof stitchingJobs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/stitching',
      input: insertStitchingJobSchema,
      responses: {
        201: z.custom<typeof stitchingJobs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  pressing: {
    list: {
      method: 'GET' as const,
      path: '/api/pressing',
      responses: {
        200: z.array(z.custom<typeof pressingJobs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/pressing',
      input: insertPressingJobSchema,
      responses: {
        201: z.custom<typeof pressingJobs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  packing: {
    list: {
      method: 'GET' as const,
      path: '/api/packing',
      responses: {
        200: z.array(z.custom<typeof packingJobs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/packing',
      input: insertPackingJobSchema,
      responses: {
        201: z.custom<typeof packingJobs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  container: {
    list: {
      method: 'GET' as const,
      path: '/api/container',
      responses: {
        200: z.array(z.custom<typeof containers.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/container',
      input: insertContainerSchema,
      responses: {
        201: z.custom<typeof containers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats',
      responses: {
        200: z.object({
          totalYarnKg: z.number(),
          totalFabricKg: z.number(),
          totalCutPieces: z.number(),
          totalStitchedPieces: z.number(),
          totalPackedPieces: z.number(),
        }),
      },
    }
  },
  rawMaterialPurchase: {
    list: {
      method: 'GET' as const,
      path: '/api/raw-material',
      responses: {
        200: z.array(z.custom<typeof rawMaterialPurchases.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/raw-material',
      input: insertRawMaterialPurchaseSchema,
      responses: {
        201: z.custom<typeof rawMaterialPurchases.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  factoryCost: {
    list: {
      method: 'GET' as const,
      path: '/api/factory-cost',
      responses: {
        200: z.array(z.custom<typeof factoryCosts.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/factory-cost',
      input: insertFactoryCostSchema,
      responses: {
        201: z.custom<typeof factoryCosts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
