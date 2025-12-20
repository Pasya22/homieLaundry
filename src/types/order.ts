// src/types/order.ts
export interface Customer {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    type: 'regular' | 'member';
    balance: number;
    member_since: string | null;
    member_expiry: string | null;
    member_status: 'active' | 'inactive';
}

export interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    member_price: number | null;
    category: string;
    duration: string;
    is_weight_based: boolean;
    is_active: boolean;
    size?: string;
}

export interface OrderItem {
    id: number;
    service_id: number;
    quantity: number;
    weight: number | null;
    unit_price: number;
    subtotal: number;
    notes: string;
    service: Service;
}

export interface Order {
    id: number;
    order_number: string;
    customer_id: number;
    customer: Customer;
    order_date: string;
    status: OrderStatus;
    payment_status: 'pending' | 'paid';
    payment_method: 'cash' | 'transfer';
    total_amount: number;
    weight: number | null;
    total_items: number;
    notes: string;
    estimated_completion: string | null;
    created_at: string;
    order_items: OrderItem[];
}

export type OrderStatus = 'request' | 'washing' | 'drying' | 'ironing' | 'ready' | 'completed';

export interface CreateOrderData {
    customer_id?: number;
    customer?: {
        name: string;
        phone: string;
        address: string;
        type: 'regular' | 'member';
        deposit: number;
    };
    items: Array<{
        service_id: number;
        quantity: number;
        weight?: number;
        notes: string;
    }>;
    order_notes: string;
    payment_method: 'cash' | 'transfer';
    estimated_completion: string;
}

export interface OrderStats {
    total: number;
    revenue: number;
    completed: number;
}

export interface StatusStep {
    label: string;
    icon: string;
    color: string;
}

export interface StatusHistory {
    status: OrderStatus;
    label: string;
    description: string;
    timestamp: string;
    user: string;
}

export interface OrderStore {
    // State
    orders: Order[];
    currentOrder: Order | null;
    stats: OrderStats;
    customers: Customer[];
    services: Service[] | Record<string, Service[]>; // Update tipe ini
    loading: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        perPage: number;
        total: number;
    };
    filters: {
        search: string;
        status: OrderStatus | '';
        dateFilter: string;
    };

    // Create Order State
    createOrder: {
        step: number;
        selectedCustomer: Customer | null;
        newCustomer: {
            name: string;
            phone: string;
            address: string;
            type: 'regular' | 'member';
            deposit: number;
        };
        selectedServices: number[];
        serviceQuantities: Record<number, number>;
        serviceWeights: Record<number, number>;
        serviceNotes: Record<number, string>;
        orderNotes: string;
        paymentMethod: 'cash' | 'transfer';
        estimatedCompletion: string;
        subtotal: number;
        total: number;
        totalWeight: number;
        totalItems: number;
    };

    // Actions
    setFilters: (filters: Partial<OrderStore['filters']>) => void;
    setPage: (page: number) => void;

    // API Actions
    fetchOrders: () => Promise<void>;
    fetchOrder: (id: number) => Promise<void>;
    fetchStats: () => Promise<void>;
    fetchCustomers: (search?: string) => Promise<void>;
    fetchServices: () => Promise<void>;

    
    // Order Actions
    createNewOrder: (data: CreateOrderData) => Promise<Order>;
    updateOrderStatus: (id: number, status: OrderStatus) => Promise<void>;
    updatePaymentStatus: (id: number, paymentStatus: 'paid' | 'pending') => Promise<void>;
    deleteOrder: (id: number) => Promise<void>;

    // Create Order Actions
    setCreateStep: (step: number) => void;
    selectCustomer: (customer: Customer | null) => void;
    setNewCustomer: (data: Partial<OrderStore['createOrder']['newCustomer']>) => void;
    toggleService: (serviceId: number) => void;
    updateServiceQuantity: (serviceId: number, quantity: number) => void;
    updateServiceWeight: (serviceId: number, weight: number) => void;
    updateServiceNote: (serviceId: number, note: string) => void;
    setOrderNotes: (notes: string) => void;
    setPaymentMethod: (method: 'cash' | 'transfer') => void;
    setEstimatedCompletion: (date: string) => void;
    calculateTotals: () => void;
    resetCreateOrder: () => void;
    validateStep: (step: number) => boolean;
    proceedToNextStep: () => void;
    goToPrevStep: () => void;
}