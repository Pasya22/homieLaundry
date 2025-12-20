import api from './authService';

export interface Service {
    id: number;
    name: string;
    description: string | null;
    price: number;
    member_price: number | null;
    category: string;
    duration: string;
    is_weight_based: boolean;
    is_active: boolean;
    size: string | null;
    icon?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ServiceFormData {
    name: string;
    description?: string;
    price: number;
    member_price?: number;
    category: string;
    duration: string;
    is_weight_based: boolean;
    is_active: boolean;
    size?: string;
    icon?: string;
}

export interface ServicesByCategory {
    [category: string]: Service[];
}

export const serviceService = {
    async getServices(activeOnly = false): Promise<ServicesByCategory> {
        const response = await api.get('/services', {
            params: { active_only: activeOnly }
        });
        return response.data.data;
    },

    async getAllServicesFlat(activeOnly = false): Promise<Service[]> {
        const grouped = await this.getServices(activeOnly);
        return Object.values(grouped).flat();
    },

    async createService(data: ServiceFormData): Promise<Service> {
        const response = await api.post('/services', data);
        return response.data.data;
    },

    async updateService(id: number, data: ServiceFormData): Promise<Service> {
        const response = await api.put(`/services/${id}`, data);
        return response.data.data;
    },

    async deleteService(id: number): Promise<void> {
        await api.delete(`/services/${id}`);
    }
};