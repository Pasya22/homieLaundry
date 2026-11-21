// src/store/dashboardStore.ts
import { create } from 'zustand';
import { type DashboardStore } from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';

const CACHE_DURATION_MS = 60 * 1000; // Cache 1 menit

export const useDashboardStore = create<DashboardStore>((set, get) => ({
    stats: {
        todayOrders: 0,
        todayRevenue: 0,
        completedToday: 0,
        inProgress: 0,
    },
    recentOrders: [],
    loading: false,
    error: null,
    lastFetched: null,

    fetchDashboardData: async (force = false) => {
        const { loading, lastFetched } = get();
        if (loading) return;

        if (!force && lastFetched && Date.now() - lastFetched < CACHE_DURATION_MS) {
            return;
        }

        set({ loading: true, error: null });

        try {
            const { stats, recentOrders } = await dashboardService.getDashboardData();

            set({
                stats,
                recentOrders,
                loading: false,
                lastFetched: Date.now(),
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengambil data dashboard',
                loading: false,
            });
        }
    },
}));