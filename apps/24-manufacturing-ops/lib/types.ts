// Manufacturing Operations types
export interface ProductionOrder {
  id: string;
  productId: string;
  quantity: number;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  startDate: Date;
  dueDate: Date;
  priority: "low" | "medium" | "high" | "critical";
}

export interface WorkStation {
  id: string;
  name: string;
  capacity: number;
  utilization: number;
  status: "idle" | "running" | "maintenance" | "offline";
}

export interface ProductionMetrics {
  totalOrders: number;
  completedOrders: number;
  averageLeadTime: number;
  efficiency: number;
}
