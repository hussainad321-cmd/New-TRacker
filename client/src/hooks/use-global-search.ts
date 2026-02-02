import { useCallback, useEffect } from 'react';
import { useSearch, SearchResult } from './use-search';
import {
  useYarnBatches,
  useFactoryCosts,
  useContainers,
  useKnittingJobs,
  useDyeingJobs,
  useCuttingJobs,
  useStitchingJobs,
  usePressingJobs,
  usePackingJobs,
  useRawMaterialPurchases,
} from './use-manufacturing';

export function useGlobalSearch() {
  const { searchQuery, setSearchResults, isSearching, setIsSearching } = useSearch();
  
  // Fetch all data
  const { data: yarnBatches = [] } = useYarnBatches();
  const { data: factoryCosts = [] } = useFactoryCosts();
  const { data: containers = [] } = useContainers();
  const { data: knittingJobs = [] } = useKnittingJobs();
  const { data: dyeingJobs = [] } = useDyeingJobs();
  const { data: cuttingJobs = [] } = useCuttingJobs();
  const { data: stitchingJobs = [] } = useStitchingJobs();
  const { data: pressingJobs = [] } = usePressingJobs();
  const { data: packingJobs = [] } = usePackingJobs();
  const { data: materialPurchases = [] } = useRawMaterialPurchases();

  const performSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search Yarn Inventory
    yarnBatches.forEach((batch: any) => {
      if (
        batch.batchCode?.toLowerCase().includes(query) ||
        batch.color?.toLowerCase().includes(query) ||
        batch.supplier?.toLowerCase().includes(query)
      ) {
        results.push({
          id: `yarn-${batch.id}`,
          title: batch.batchCode,
          description: `${batch.color} - ${batch.weightKg}kg from ${batch.supplier}`,
          category: 'Yarn Inventory',
          link: '/yarn-inventory',
          data: batch,
        });
      }
    });

    // Search Factory Costs
    factoryCosts.forEach((cost: any) => {
      if (
        cost.description?.toLowerCase().includes(query) ||
        cost.costType?.toLowerCase().includes(query) ||
        String(cost.amount).includes(query)
      ) {
        results.push({
          id: `cost-${cost.id}`,
          title: cost.description,
          description: `${cost.costType} - $${cost.amount} (${cost.status})`,
          category: 'Factory Costs',
          link: '/factory-costs',
          data: cost,
        });
      }
    });

    // Search Raw Materials
    materialPurchases.forEach((material: any) => {
      if (
        material.materialType?.toLowerCase().includes(query) ||
        material.vendor?.toLowerCase().includes(query) ||
        String(material.totalCost).includes(query)
      ) {
        results.push({
          id: `material-${material.id}`,
          title: material.materialType,
          description: `${material.quantity} units from ${material.vendor} - $${material.totalCost}`,
          category: 'Raw Materials',
          link: '/raw-materials',
          data: material,
        });
      }
    });

    // Search Containers
    containers.forEach((container: any) => {
      if (
        container.containerCode?.toLowerCase().includes(query) ||
        container.location?.toLowerCase().includes(query) ||
        String(container.quantity).includes(query)
      ) {
        results.push({
          id: `container-${container.id}`,
          title: container.containerCode,
          description: `${container.quantity} units at ${container.location}`,
          category: 'Containers',
          link: '/container',
          data: container,
        });
      }
    });

    // Search Knitting
    knittingJobs.forEach((log: any) => {
      if (
        log.machineId?.toLowerCase().includes(query) ||
        log.fabricType?.toLowerCase().includes(query) ||
        String(log.fabricProduced).includes(query)
      ) {
        results.push({
          id: `knitting-${log.id}`,
          title: `Machine ${log.machineId}`,
          description: `${log.fabricType} - ${log.fabricProduced}kg produced`,
          category: 'Knitting',
          link: '/knitting',
          data: log,
        });
      }
    });

    // Search Dyeing
    dyeingJobs.forEach((log: any) => {
      if (
        log.color?.toLowerCase().includes(query) ||
        log.fabricId?.toLowerCase().includes(query) ||
        String(log.weightProcessed).includes(query)
      ) {
        results.push({
          id: `dyeing-${log.id}`,
          title: log.color,
          description: `${log.fabricId} - ${log.weightProcessed}kg dyed`,
          category: 'Dyeing',
          link: '/dyeing',
          data: log,
        });
      }
    });

    // Search Cutting
    cuttingJobs.forEach((log: any) => {
      if (
        log.lineId?.toLowerCase().includes(query) ||
        log.garmentType?.toLowerCase().includes(query) ||
        String(log.piecesProduced).includes(query)
      ) {
        results.push({
          id: `cutting-${log.id}`,
          title: `Line ${log.lineId}`,
          description: `${log.garmentType} - ${log.piecesProduced} pieces`,
          category: 'Cutting',
          link: '/cutting',
          data: log,
        });
      }
    });

    // Search Stitching
    stitchingJobs.forEach((log: any) => {
      if (
        log.lineId?.toLowerCase().includes(query) ||
        log.garmentType?.toLowerCase().includes(query) ||
        String(log.piecesCompleted).includes(query)
      ) {
        results.push({
          id: `stitching-${log.id}`,
          title: `Line ${log.lineId}`,
          description: `${log.garmentType} - ${log.piecesCompleted} pieces completed`,
          category: 'Stitching',
          link: '/stitching',
          data: log,
        });
      }
    });

    // Search Pressing
    pressingJobs.forEach((log: any) => {
      if (
        log.machineId?.toLowerCase().includes(query) ||
        log.garmentType?.toLowerCase().includes(query) ||
        String(log.piecesProcessed).includes(query)
      ) {
        results.push({
          id: `pressing-${log.id}`,
          title: `Machine ${log.machineId}`,
          description: `${log.garmentType} - ${log.piecesProcessed} pieces pressed`,
          category: 'Pressing',
          link: '/pressing',
          data: log,
        });
      }
    });

    // Search Packing
    packingJobs.forEach((log: any) => {
      if (
        log.orderId?.toLowerCase().includes(query) ||
        log.batchCode?.toLowerCase().includes(query) ||
        String(log.boxesCreated).includes(query)
      ) {
        results.push({
          id: `packing-${log.id}`,
          title: log.orderId,
          description: `${log.batchCode} - ${log.boxesCreated} boxes created`,
          category: 'Packing',
          link: '/packing',
          data: log,
        });
      }
    });

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
    setIsSearching(false);
  }, [
    searchQuery,
    setSearchResults,
    setIsSearching,
    yarnBatches,
    factoryCosts,
    containers,
    knittingJobs,
    dyeingJobs,
    cuttingJobs,
    stitchingJobs,
    pressingJobs,
    packingJobs,
    materialPurchases,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [performSearch]);
}
