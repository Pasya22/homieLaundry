// src/store/dashboardStore.ts
import { create } from 'zustand';
import { type DashboardStore } from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';

export const useDashboardStore = create<DashboardStore>((set, get) => ({
    // State
    stats: {
        todayOrders: 0,
        todayRevenue: 0,
        completedToday: 0,
        inProgress: 0,
    },
    recentOrders: [],
    loading: false,
    error: null,
    refreshInterval: null, // Now using number

    // Actions
    fetchDashboardData: async () => {
        set({ loading: true, error: null });
        
        try {
            const { stats, recentOrders } = await dashboardService.getDashboardData();
            
            set({
                stats,
                recentOrders,
                loading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengambil data dashboard',
                loading: false,
            });
        }
    },

    startPolling: () => {
        const { refreshInterval } = get();
        if (refreshInterval) clearInterval(refreshInterval);

        const intervalId = setInterval(() => {
            get().fetchDashboardData();
        }, 5000); // Poll every 5 seconds

        set({ refreshInterval: intervalId as unknown as number });
    },

    stopPolling: () => {
        const { refreshInterval } = get();
        if (refreshInterval) {
            clearInterval(refreshInterval);
            set({ refreshInterval: null });
        }
    },
}));