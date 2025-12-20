// src/services/dashboardService.ts
import axios from 'axios';
import { type DashboardStats, type Order } from '../types/dashboard'; // <- tanpa "type"

const API_BASE_URL = import.meta.env.VITE_API_URL ;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

export const dashboardService = {
    async getStats(): Promise<DashboardStats> {
        const response = await api.get('/dashboard/stats');
        return response.data.data;
    },

    async getRecentOrders(): Promise<Order[]> {
        const response = await api.get('/dashboard/recent-orders');
        return response.data.data;
    },

    async getDashboardData() {
        const [stats, recentOrders] = await Promise.all([
            this.getStats(),
            this.getRecentOrders()
        ]);
        
        return { stats, recentOrders };
    }
};