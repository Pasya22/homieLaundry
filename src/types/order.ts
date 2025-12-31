import type { Customer } from "./customer";

export interface Service {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    member_price?: number | null;
    duration: string;
    category: string;
    is_weight_based: boolean;
    min_weight?: number;
    max_weight?: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

// Custom Item untuk detail barang
export interface CustomItem {
    id: string;
    name: string;
    quantity: number;
}

export interface OrderItem {
    id: number;
    order_id: number;
    service_id: number;
    quantity: number;
    weight: number | null;
    unit_price: number;
    subtotal: number;
    notes: string | null;
    custom_items?: CustomItem[];
    created_at?: string;
    updated_at?: string;
    service: Service;
}

export interface Order {
    id: number;
    order_number: string;
    customer_id: number;
    customer: Customer;
    order_date: string;
    status: OrderStatus;
    payment_status: 'pending' | 'paid' | 'partial' | 'cancelled';
    payment_method: 'cash' | 'transfer' | 'card' | 'deposit'; // ✅ Tambah deposit
    total_amount: number;
    amount_paid: number;
    amount_due: number;
    weight: number | null;
    total_items: number;
    notes: string | null;
    estimated_completion: string | null;
    completed_at: string | null;
    deposit_used?: number; // ✅ Tambah untuk tracking
    created_at: string;
    updated_at: string;
    order_items: OrderItem[];
}

export type OrderStatus = 'request' | 'washing' | 'drying' | 'ironing' | 'ready' | 'completed' | 'cancelled';

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
        custom_items?: CustomItem[];
    }>;
    order_notes: string;
    payment_method: 'cash' | 'transfer' | 'deposit'; // ✅ Fixed: Include deposit
    payment_confirmation: 'now' | 'later';
    payment_proof?: File;
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
    services: Service[] | Record<string, Service[]>;
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
        serviceCustomItems: Record<number, CustomItem[]>;
        orderNotes: string;
        payment_method: 'cash' | 'transfer' | 'deposit'; // ✅ Fixed: Include deposit
        paymentConfirmation: 'now' | 'later';
        payment_proof: File | null;
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
    updatePaymentStatus: (id: number, paymentStatus: 'paid' | 'pending', payment_proof:File) => Promise<void>;
    deleteOrder: (id: number) => Promise<void>;

    // Create Order Actions
    setCreateStep: (step: number) => void;
    selectCustomer: (customer: Customer | null) => void;
    setNewCustomer: (data: Partial<OrderStore['createOrder']['newCustomer']>) => void;
    toggleService: (serviceId: number) => void;
    updateServiceQuantity: (serviceId: number, quantity: number) => void;
    updateServiceWeight: (serviceId: number, weight: number) => void;
    updateServiceNote: (serviceId: number, note: string) => void;

    // Custom Items Actions
    addCustomItem: (serviceId: number) => void;
    removeCustomItem: (serviceId: number, itemId: string) => void;
    updateCustomItem: (serviceId: number, itemId: string, updates: Partial<CustomItem>) => void;

    setOrderNotes: (notes: string) => void;
    setPaymentMethod: (method: 'cash' | 'transfer' | 'deposit') => void; // ✅ Fixed
    setEstimatedCompletion: (date: string) => void;
    calculateTotals: () => void;
    resetCreateOrder: () => void;
    validateStep: (step: number) => boolean;
    validateServiceWeights: () => {
        valid: boolean;
        message?: string;
        serviceId?: number;
    };
    proceedToNextStep: () => void;
    goToPrevStep: () => void;
    setPaymentConfirmation: (confirmation: 'now' | 'later') => void;
    setPaymentProof: (file: File | null) => void;
}

const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    const todayStr = now.toISOString().split('T')[0];
    const dateStr = date.toISOString().split('T')[0];

    if (dateStr === todayStr) {
        if (diffMin < 1) return 'Baru saja';
        if (diffMin < 60) return `${diffMin} menit lalu`;
        if (diffHour < 2) return '1 jam lalu';
        if (diffHour <= 6) return `${diffHour} jam lalu`;
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (dateStr === yesterdayStr) return 'Kemarin';

    const dayBeforeYesterday = new Date(now);
    dayBeforeYesterday.setDate(now.getDate() - 2);
    const dayBeforeYesterdayStr = dayBeforeYesterday.toISOString().split('T')[0];
    if (dateStr === dayBeforeYesterdayStr) return 'Lusa';

    if (diffDay <= 6) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[date.getDay()];
    }

    if (diffDay <= 30) {
        return `${diffDay} hari lalu`;
    }

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};

const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const now = new Date();

    if (date > now) {
        const diffMs = date.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 24) {
            if (diffHours < 1) return 'Kurang dari 1 jam';
            if (diffHours === 1) return '1 jam lagi';
            return `${diffHours} jam lagi`;
        }

        if (diffDays <= 7) {
            if (diffDays === 1) return 'Besok';
            if (diffDays === 2) return 'Lusa';
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            return days[date.getDay()];
        }

        return date.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatDateOnly = (dateString: string) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const now = new Date();

    const todayStr = now.toISOString().split('T')[0];
    const dateStr = date.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Hari ini';

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (dateStr === tomorrowStr) return 'Besok';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (dateStr === yesterdayStr) return 'Kemarin';

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};

export const parseCustomItems = (customItems: any): CustomItem[] => {
    if (Array.isArray(customItems)) {
        return customItems;
    }

    if (typeof customItems === 'string') {
        try {
            const parsed = JSON.parse(customItems);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Error parsing custom_items:', e);
            return [];
        }
    }

    return [];
};

export const calculateTotalCustomItems = (customItems: any): number => {
    const items = parseCustomItems(customItems);
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
};

export const normalizeOrderItems = (orderItems: OrderItem[]): OrderItem[] => {
    return orderItems.map(item => ({
        ...item,
        custom_items: parseCustomItems(item.custom_items)
    }));
};

export const normalizeOrder = (order: Order): Order => {
    return {
        ...order,
        order_items: normalizeOrderItems(order.order_items)
    };
};

export const hasCustomItems = (orderItem: OrderItem): boolean => {
    const items = parseCustomItems(orderItem.custom_items);
    return items.length > 0;
};

export const getCustomItemsList = (orderItem: OrderItem): Array<{ name: string; quantity: number }> => {
    const items = parseCustomItems(orderItem.custom_items);
    return items.map(item => ({
        name: item.name || 'Barang',
        quantity: item.quantity || 0
    }));
};

export { formatRelativeTime, formatDateTime, formatDateOnly };