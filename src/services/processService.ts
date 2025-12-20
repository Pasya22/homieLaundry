// src/services/processService.ts
import api from './authService';
import { type Order } from '../types/order';

export interface ProcessFilters {
    search?: string;
    status?: string;
    page?: number;
    perPage?: number;
}

export interface ProcessUpdateData {
    status: string;
    notes?: string;
    estimated_completion?: string;
}

export const processService = {
    async getOrders(filters?: ProcessFilters): Promise<{ data: Order[]; total: number }> {
        const response = await api.get('/process', { params: filters });
        return {
            data: response.data.data,
            total: response.data.meta?.total || response.data.data.length
        };
    },

    async updateStatus(id: number, data: ProcessUpdateData): Promise<Order> {
        const response = await api.patch(`/process/${id}/status`, data);
        return response.data.data;
    },

    async quickUpdate(id: number): Promise<Order> {
        const response = await api.patch(`/process/${id}/quick-update`);
        return response.data.data;
    },

    async markAsReady(id: number): Promise<Order> {
        const response = await api.patch(`/process/${id}/mark-ready`);
        return response.data.data;
    },

    async markAsCompleted(id: number): Promise<Order> {
        const response = await api.patch(`/process/${id}/mark-completed`);
        return response.data.data;
    }
};3