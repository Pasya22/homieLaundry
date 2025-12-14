// src/types/dashboard.ts
export interface Order {
    id: number;
    order_number: string;
    customer: {
        id: number;
        name: string;
    };
    status: OrderStatus;
    total_amount: number;
    created_at: string;
}

export type OrderStatus = 'request' | 'washing' | 'drying' | 'ironing' | 'ready' | 'completed';

export interface DashboardStats {
    todayOrders: number;
    todayRevenue: number;
    completedToday: number;
    inProgress: number;
}

export interface DashboardStore {
    stats: DashboardStats;
    recentOrders: Order[];
    loading: boolean;
    error: string | null;
    refreshInterval: number | null; // Changed from NodeJS.Timeout

    // Actions
    fetchDashboardData: () => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
}