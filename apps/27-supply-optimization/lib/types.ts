// Supply Optimization types
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  leadTime: number;
  cost: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

export interface Supplier {
  id: string;
  name: string;
  leadTime: number;
  reliability: number;
  costPerUnit: number;
  minimumOrder: number;
}

export interface OptimizationSuggestion {
  itemId: string;
  currentStock: number;
  recommendedOrder: number;
  potentialSavings: number;
  priority: "low" | "medium" | "high";
}
