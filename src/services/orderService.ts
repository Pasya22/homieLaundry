// src/services/orderService.ts
import axios from 'axios';
import {
    type Order,
    type CreateOrderData,
    type OrderStats,
    type Service,
    type OrderStatus
} from '../types/order';
import type { Customer } from '../types/customer';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Remove all mock data - we'll use real API calls

export const orderService = {
    // Order List
    async getOrders(params?: {
        search?: string;
        status?: OrderStatus;
        dateFilter?: string;
        page?: number;
        perPage?: number;
    }): Promise<{ data: Order[]; total: number }> {
        try {
            const response = await api.get('/orders', { params });
            return {
                data: response.data.data || [],
                total: response.data.meta?.total || response.data.data?.length || 0
            };
        } catch (error: any) {
            console.error('Error fetching orders:', error);

            // Return empty data for development if API is not ready
            if (import.meta.env.DEV) {
                console.warn('API not available, returning empty orders');
                return { data: [], total: 0 };
            }

            throw new Error(error.response?.data?.message || 'Gagal mengambil data order');
        }
    },

    async getOrderStats(dateFilter?: string): Promise<OrderStats> {
        try {
            const response = await api.get('/orders/stats', {
                params: { date_filter: dateFilter }
            });
            return response.data.data || {
                total: 0,
                revenue: 0,
                completed: 0,
            };
        } catch (error: any) {
            console.error('Error fetching order stats:', error);

            // Return default stats for development
            if (import.meta.env.DEV) {
                console.warn('API not available, returning default stats');
                return {
                    total: 0,
                    revenue: 0,
                    completed: 0,
                };
            }

            throw new Error(error.response?.data?.message || 'Gagal mengambil statistik order');
        }
    },

    // Order Detail
    async getOrder(id: number): Promise<Order> {
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching order:', error);
            throw new Error(error.response?.data?.message || 'Gagal mengambil detail order');
        }
    },

    // Create Order
    async createOrder(data: CreateOrderData): Promise<Order> {
        try {
            const formData = new FormData();

            // Append JSON data
            const jsonData = {
                customer_id: data.customer_id,
                customer: data.customer,
                items: data.items,
                order_notes: data.order_notes,
                payment_method: data.payment_method,
                payment_confirmation: data.payment_confirmation,
                estimated_completion: data.estimated_completion,
            };

            formData.append('data', JSON.stringify(jsonData));

            // Append file if exists
            if (data.payment_proof) {
                formData.append('payment_proof', data.payment_proof);
            }

            const response = await api.post('/orders', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.data;
        } catch (error: any) {
            console.error('Error creating order:', error);

            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat().join(', ');
                throw new Error(`Validasi gagal: ${errorMessages}`);
            }

            throw new Error(error.response?.data?.message || 'Gagal membuat order');
        }
    },
    // Update Order Status
    async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
        try {
            const response = await api.patch(`/orders/${id}/status`, { status });
            return response.data.data;
        } catch (error: any) {
            console.error('Error updating order status:', error);
            throw new Error(error.response?.data?.message || 'Gagal mengupdate status order');
        }
    },

    // Update Payment Status
    updatePaymentStatus: async (id: number, paymentStatus: 'paid' | 'pending', paymentProof?: File) => {
        const formData = new FormData();
        formData.append('payment_status', paymentStatus);

        if (paymentProof) {
            formData.append('payment_proof', paymentProof);
        }

        const response = await api.post(`/orders/${id}/payment-status`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    // Get payment proof URL
    getPaymentProof: async (id: number) => {
        const response = await api.get(`/orders/${id}/payment-proof`);
        return response.data.data;
    },

    // Download payment proof
    downloadPaymentProof: async (id: number) => {
        const response = await api.get(`/orders/${id}/payment-proof/download`, {
            responseType: 'blob',
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payment_proof_${id}.jpg`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
    // Delete Order
    async deleteOrder(id: number): Promise<void> {
        try {
            await api.delete(`/orders/${id}`);
        } catch (error: any) {
            console.error('Error deleting order:', error);
            throw new Error(error.response?.data?.message || 'Gagal menghapus order');
        }
    },

    // Customer Search
    async searchCustomers(search: string): Promise<Customer[]> {
        try {
            const response = await api.get('/orders/search', {
                params: { q: search }
            });
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error searching customers:', error);

            // Return empty array for development
            if (import.meta.env.DEV) {
                console.warn('Customer search API not available, returning empty array');
                return [];
            }

            throw new Error(error.response?.data?.message || 'Gagal mencari pelanggan');
        }
    },

    // Get Services
    async getServices(): Promise<Service[]> {
        try {
            const response = await api.get('/services');
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching services:', error);

            // Return default services for development

            throw new Error(error.response?.data?.message || 'Gagal mengambil data layanan');
        }
    },

    // Get Customer by ID
    async getCustomer(id: number): Promise<Customer> {
        try {
            const response = await api.get(`/customers/${id}`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching customer:', error);
            throw new Error(error.response?.data?.message || 'Gagal mengambil data pelanggan');
        }
    },

    // Create Customer
    async createCustomer(data: {
        name: string;
        phone: string;
        address: string;
        type: 'regular' | 'member';
        deposit?: number;
    }): Promise<Customer> {
        try {
            const response = await api.post('/customers', data);
            return response.data.data;
        } catch (error: any) {
            console.error('Error creating customer:', error);
            throw new Error(error.response?.data?.message || 'Gagal membuat pelanggan baru');
        }
    },

    // Get order by status
    async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
        try {
            const response = await api.get('/orders', { params: { status } });
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching orders by status:', error);
            throw error;
        }
    },

    // Get today's orders
    async getTodayOrders(): Promise<Order[]> {
        try {
            const response = await api.get('/orders/today');
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching today\'s orders:', error);
            throw error;
        }
    },
};