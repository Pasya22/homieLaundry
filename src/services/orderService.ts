// src/services/orderService.ts
import axios from 'axios';
import { 
    type Order, 
    type CreateOrderData, 
    type OrderStats, 
    type Customer, 
    type Service,
    type OrderStatus 
} from '../types/order';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hlb-production.up.railway.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Mock data untuk development
const mockCustomers: Customer[] = [
    {
        id: 1,
        name: 'Budi Santoso',
        phone: '08123456789',
        address: 'Jl. Merdeka No. 123, Jakarta',
        type: 'member',
        balance: 50000,
        member_since: '2024-01-15',
        member_expiry: '2025-01-15',
        member_status: 'active',
    },
    {
        id: 2,
        name: 'Siti Nurhaliza',
        phone: '08129876543',
        address: 'Jl. Sudirman No. 456, Bandung',
        type: 'regular',
        balance: 0,
        member_since: null,
        member_expiry: null,
        member_status: 'inactive',
    },
];

const mockServices: Service[] = [
    {
        id: 1,
        name: 'Cuci Setrika Reguler',
        description: 'Cuci dan setrika pakaian',
        price: 7000,
        member_price: 6000,
        category: 'Cuci Setrika',
        duration: '24 jam',
        is_weight_based: true,
        is_active: true,
    },
    {
        id: 2,
        name: 'Cuci Kering',
        description: 'Cuci saja tanpa setrika',
        price: 5000,
        member_price: 4500,
        category: 'Cuci Kering',
        duration: '24 jam',
        is_weight_based: true,
        is_active: true,
    },
    {
        id: 3,
        name: 'Setrika Saja',
        description: 'Setrika pakaian yang sudah kering',
        price: 4000,
        member_price: 3500,
        category: 'Setrika',
        duration: '12 jam',
        is_weight_based: true,
        is_active: true,
    },
    {
        id: 4,
        name: 'Dry Cleaning Jas',
        description: 'Dry cleaning khusus jas',
        price: 30000,
        member_price: 25000,
        category: 'Khusus',
        duration: '48 jam',
        is_weight_based: false,
        is_active: true,
        size: 'Satuan',
    },
];

export const orderService = {
    // Order List
    async getOrders(params?: {
        search?: string;
        status?: OrderStatus;
        dateFilter?: string;
        page?: number;
        perPage?: number;
    }): Promise<{ data: Order[]; total: number }> {
        if (import.meta.env.DEV && !API_BASE_URL.includes('localhost:8000')) {
            console.log('Using mock orders data');
            // Generate mock orders
            const mockOrders: Order[] = Array.from({ length: 10 }, (_, i) => ({
                id: i + 1,
                order_number: `HL-2024${String(i + 1).padStart(3, '0')}`,
                customer_id: (i % 2) + 1,
                customer: mockCustomers[i % 2],
                order_date: new Date().toISOString(),
                status: ['request', 'washing', 'drying', 'ironing', 'ready', 'completed'][i % 6] as OrderStatus,
                payment_status: i % 3 === 0 ? 'paid' : 'pending',
                payment_method: i % 2 === 0 ? 'cash' : 'transfer',
                total_amount: 50000 + (i * 15000),
                weight: i % 3 === 0 ? 2.5 : null,
                total_items: 3 + i,
                notes: i % 2 === 0 ? 'Catatan khusus untuk order ini' : '',
                estimated_completion: new Date(Date.now() + 86400000).toISOString(),
                created_at: new Date().toISOString(),
                order_items: mockServices.slice(0, 2).map(service => ({
                    id: service.id + i * 10,
                    service_id: service.id,
                    quantity: i % 3 === 0 ? 2 : 1,
                    weight: service.is_weight_based ? 1.5 : null,
                    unit_price: service.price,
                    subtotal: service.price * (service.is_weight_based ? 1.5 : 1),
                    notes: '',
                    service
                }))
            }));
            
            return { 
                data: mockOrders.filter(order => {
                    if (params?.status && order.status !== params.status) return false;
                    if (params?.search && !order.order_number.includes(params.search)) return false;
                    return true;
                }),
                total: 10 
            };
        }
        
        try {
            const response = await api.get('/orders', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    async getOrderStats(dateFilter?: string): Promise<OrderStats> {
        if (import.meta.env.DEV && !API_BASE_URL.includes('localhost:8000')) {
            console.log('Using mock order stats');
            return {
                total: 15,
                revenue: 750000,
                completed: 8,
            };
        }
        
        try {
            const response = await api.get('/orders/stats', { params: { date_filter: dateFilter } });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching order stats:', error);
            throw error;
        }
    },

    // Order Detail
    async getOrder(id: number): Promise<Order> {
        if (import.meta.env.DEV && !API_BASE_URL.includes('localhost:8000')) {
            console.log('Using mock order detail');
            const mockOrder: Order = {
                id,
                order_number: `HL-2024${String(id).padStart(3, '0')}`,
                customer_id: id % 2 + 1,
                customer: mockCustomers[id % 2],
                order_date: new Date().toISOString(),
                status: 'washing',
                payment_status: 'pending',
                payment_method: 'cash',
                total_amount: 85000,
                weight: 3.5,
                total_items: 5,
                notes: 'Mohon di setrika dengan baik',
                estimated_completion: new Date(Date.now() + 172800000).toISOString(),
                created_at: new Date().toISOString(),
                order_items: mockServices.map(service => ({
                    id: service.id + id * 10,
                    service_id: service.id,
                    quantity: 2,
                    weight: service.is_weight_based ? 1.5 : null,
                    unit_price: service.price,
                    subtotal: service.price * (service.is_weight_based ? 1.5 : 2),
                    notes: service.id === 4 ? 'Jas hitam' : '',
                    service
                }))
            };
            return mockOrder;
        }
        
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    },

    // Create Order
    async createOrder(data: CreateOrderData): Promise<Order> {
        if (import.meta.env.DEV && !API_BASE_URL.includes('localhost:8000')) {
            console.log('Creating mock order:', data);
            const newOrder: Order = {
                id: Math.floor(Math.random() * 1000) + 100,
                order_number: `HL-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`,
                customer_id: data.customer_id || 1,
                customer: data.customer ? {
                    id: 0,
                    name: data.customer.name,
                    phone: data.customer.phone,
                    address: data.customer.address,
                    type: data.customer.type,
                    balance: data.customer.deposit,
                    member_since: new Date().toISOString(),
                    member_expiry: new Date(Date.now() + 31536000000).toISOString(),
                    member_status: data.customer.type === 'member' ? 'active' : 'inactive',
                } : mockCustomers[0],
                order_date: new Date().toISOString(),
                status: 'request',
                payment_status: data.payment_method === 'cash' ? 'paid' : 'pending',
                payment_method: data.payment_method,
                total_amount: data.items.reduce((total, item) => {
                    const service = mockServices.find(s => s.id === item.service_id);
                    if (!service) return total;
                    if (service.is_weight_based) {
                        return total + (service.price * (item.weight || 1));
                    }
                    return total + (service.price * item.quantity);
                }, 0),
                weight: data.items.reduce((total, item) => {
                    const service = mockServices.find(s => s.id === item.service_id);
                    if (!service || !service.is_weight_based) return total;
                    return total + (item.weight || 1);
                }, 0),
                total_items: data.items.reduce((total, item) => total + item.quantity, 0),
                notes: data.order_notes,
                estimated_completion: data.estimated_completion,
                created_at: new Date().toISOString(),
                order_items: data.items.map(item => {
                    const service = mockServices.find(s => s.id === item.service_id)!;
                    return {
                        id: service.id + Math.floor(Math.random() * 1000),
                        service_id: service.id,
                        quantity: item.quantity,
                        weight: service.is_weight_based ? item.weight || 1 : null,
                        unit_price: service.price,
                        subtotal: service.is_weight_based ? service.price * (item.weight || 1) : service.price * item.quantity,
                        notes: item.notes,
                        service
                    };
                })
            };
            return newOrder;
        }
        
        try {
            const response = await api.post('/orders', data);
            return response.data.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    // Update Order Status
    async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
        if (import.meta.env.DEV && !API_BASE_URL.includes('localhost:8000')) {
            console.log('Updating mock order status:', { id, status });
            const order = await this.getOrder(id);
            return { ...order, status };
        }
        
        try {
            const response = await api.patch(`/orders/${id}/status`, { status });
            return response.data.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    },

    // Update Payment Status
    async updatePaymentStatus(id: number, paymentStatus: 'paid' | 'pending'): Promise<Order> {
        if (import.meta.env.DEV && !API_BASE_URL.includes('localhost:8000')) {
            console.log('Updating mock payment status:', { id, paymentStatus });
            const order = await this.getOrder(id);
            return { ...order, payment_status: paymentStatus };
        }
        
        try {
            const response = await api.patch(`/orders/${id}/payment`, { payment_status: paymentStatus });
            return response.data.data;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    },

    // Delete Order
    async deleteOrder(id: number): Promise<void> {
        if (import.meta.env.DEV && !API_BASE_URL.includes('localhost:8000')) {
            console.log('Deleting mock order:', id);
            return;
        }
        
        try {
            await api.delete(`/orders/${id}`);
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    },

    // Customer Search
    async searchCustomers(search: string): Promise<Customer[]> {
        if (import.meta.env.DEV && !API_BASE_URL.includes('localhost:8000')) {
            console.log('Searching mock customers:', search);
            return mockCustomers.filter(customer => 
                customer.name.toLowerCase().includes(search.toLowerCase()) ||
                customer.phone?.includes(search)
            );
        }
        
        try {
            const response = await api.get('/customers/search', { params: { search } });
            return response.data.data;
        } catch (error) {
            console.error('Error searching customers:', error);
            throw error;
        }
    },

    // Get Services
    async getServices(): Promise<Service[]> {
        if (import.meta.env.DEV && !API_BASE_URL.includes('localhost:8000')) {
            console.log('Using mock services');
            return mockServices;
        }
        
        try {
            const response = await api.get('/services');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching services:', error);
            throw error;
        }
    },
}