// src/services/customerService.ts
import axios from 'axios';
import { type Customer, type CustomerFormData, type PaginatedResponse } from '../types/customer';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hlb.railway.internal/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // withCredentials: true,
});

// api.interceptors.response.use(
//     response => response,
//     error => {
//         if (error.response?.status === 401) {
//             // Handle unauthorized
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

export const customerService = {
    async getCustomers(page = 1, perPage = 10, search = ''): Promise<PaginatedResponse<Customer>> {
        const response = await api.get('/customers', {
            params: { page, per_page: perPage, search }
        });
        return response.data;
    },

    async getCustomer(id: number): Promise<Customer> {
        const response = await api.get(`/customers/${id}`);
        return response.data.data;
    },

    async createCustomer(data: CustomerFormData): Promise<Customer> {
        const response = await api.post('/customers', data);
        return response.data.data;
    },

    async updateCustomer(id: number, data: CustomerFormData): Promise<Customer> {
        const response = await api.put(`/customers/${id}`, data);
        return response.data.data;
    },

    async deleteCustomer(id: number): Promise<void> {
        await api.delete(`/customers/${id}`);
    }
};