// src/store/orderStore.ts
import { create } from 'zustand';
import { orderService } from '../services/orderService';
import { type Order, type OrderStore, type Service } from '../types/order';

const initialCreateOrderState: OrderStore['createOrder'] = {
    step: 1,
    selectedCustomer: null,
    newCustomer: {
        name: '',
        phone: '',
        address: '',
        type: 'regular',
        deposit: 0,
    },
    selectedServices: [],
    serviceQuantities: {},
    serviceWeights: {},
    serviceNotes: {},
    orderNotes: '',
    paymentMethod: 'cash',
    estimatedCompletion: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16),
    subtotal: 0,
    total: 0,
    totalWeight: 0,
    totalItems: 0,
};

// Helper function untuk mencari service berdasarkan ID
const findServiceById = (services: Service[] | Record<string, Service[]>, id: number): Service | undefined => {
    // Jika services adalah array
    if (Array.isArray(services)) {
        return services.find(s => s.id === id);
    }
    
    // Jika services adalah object yang dikelompokkan
    if (typeof services === 'object' && services !== null) {
        // Cari di semua kategori
        for (const category in services) {
            const categoryServices = services[category];
            if (Array.isArray(categoryServices)) {
                const found = categoryServices.find(s => s.id === id);
                if (found) return found;
            }
        }
    }
    
    return undefined;
};

// Helper function untuk mendapatkan semua services dalam bentuk array
const getAllServices = (services: Service[] | Record<string, Service[]>): Service[] => {
    // Jika services adalah array
    if (Array.isArray(services)) {
        return services;
    }
    
    // Jika services adalah object yang dikelompokkan
    if (typeof services === 'object' && services !== null) {
        const allServices: Service[] = [];
        Object.values(services).forEach(categoryServices => {
            if (Array.isArray(categoryServices)) {
                allServices.push(...categoryServices);
            }
        });
        return allServices;
    }
    
    return [];
};

export const useOrderStore = create<OrderStore>((set, get) => ({
    // State
    orders: [],
    currentOrder: null,
    stats: {
        total: 0,
        revenue: 0,
        completed: 0,
    },
    customers: [],
    services: [],
    loading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        perPage: 15,
        total: 0,
    },
    filters: {
        search: '',
        status: '',
        dateFilter: 'today',
    },

    createOrder: { ...initialCreateOrderState },

    // Actions
    setFilters: (filters) => {
        set(state => ({
            filters: { ...state.filters, ...filters },
            pagination: { ...state.pagination, currentPage: 1 },
        }));
        get().fetchOrders();
    },

    setPage: (page) => {
        set(state => ({
            pagination: { ...state.pagination, currentPage: page }
        }));
        get().fetchOrders();
    },

    // API Actions
    fetchOrders: async () => {
        const { filters, pagination } = get();
        set({ loading: true, error: null });
        
        try {
            const response = await orderService.getOrders({
                search: filters.search,
                status: filters.status || undefined,
                dateFilter: filters.dateFilter,
                page: pagination.currentPage,
                perPage: pagination.perPage,
            });
            
            set({
                orders: response.data,
                pagination: {
                    ...pagination,
                    total: response.total,
                    totalPages: Math.ceil(response.total / pagination.perPage),
                },
                loading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengambil data order',
                loading: false,
            });
        }
    },

    fetchOrder: async (id: number) => {
        set({ loading: true, error: null });
        
        try {
            const order = await orderService.getOrder(id);
            set({ currentOrder: order, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengambil detail order',
                loading: false,
            });
        }
    },

    fetchStats: async () => {
        const { filters } = get();
        
        try {
            const stats = await orderService.getOrderStats(filters.dateFilter);
            set({ stats });
        } catch (error: any) {
            console.error('Error fetching stats:', error);
        }
    },

    fetchCustomers: async (search = '') => {
        try {
            const customers = await orderService.searchCustomers(search);
            set({ customers });
        } catch (error: any) {
            console.error('Error fetching customers:', error);
        }
    },

    fetchServices: async () => {
        try {
            const services = await orderService.getServices();
            
            // Log untuk debugging
            console.log('Services from API:', services);
            console.log('Is array?', Array.isArray(services));
            
            set({ services });
        } catch (error: any) {
            console.error('Error fetching services:', error);
        }
    },

    // Helper functions yang bisa dipanggil dari komponen
    findServiceById: (id: number) => {
        const { services } = get();
        return findServiceById(services, id);
    },

    getAllServices: () => {
        const { services } = get();
        return getAllServices(services);
    },

    // Order Actions
    createNewOrder: async (data): Promise<Order> => {
        set({ loading: true, error: null });
        
        try {
            const newOrder = await orderService.createOrder(data);
            await get().fetchOrders();
            await get().fetchStats();
            get().resetCreateOrder();
            set({ loading: false });
            return newOrder;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal membuat order',
                loading: false,
            });
            throw error;
        }
    },

    updateOrderStatus: async (id: number, status) => {
        set({ loading: true, error: null });
        
        try {
            await orderService.updateOrderStatus(id, status);
            await get().fetchOrders();
            await get().fetchStats();
            
            // Update current order if it's the same
            const { currentOrder } = get();
            if (currentOrder && currentOrder.id === id) {
                await get().fetchOrder(id);
            }
            
            set({ loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengupdate status order',
                loading: false,
            });
            throw error;
        }
    },

    updatePaymentStatus: async (id: number, paymentStatus) => {
        set({ loading: true, error: null });
        
        try {
            await orderService.updatePaymentStatus(id, paymentStatus);
            await get().fetchOrders();
            
            // Update current order if it's the same
            const { currentOrder } = get();
            if (currentOrder && currentOrder.id === id) {
                await get().fetchOrder(id);
            }
            
            set({ loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengupdate status pembayaran',
                loading: false,
            });
            throw error;
        }
    },

    deleteOrder: async (id: number) => {
        if (!window.confirm('Yakin ingin menghapus order ini?')) return;
        
        set({ loading: true, error: null });
        
        try {
            await orderService.deleteOrder(id);
            await get().fetchOrders();
            await get().fetchStats();
            set({ loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menghapus order',
                loading: false,
            });
        }
    },

    // Create Order Actions
    setCreateStep: (step) => {
        set(state => ({
            createOrder: { ...state.createOrder, step }
        }));
    },

    selectCustomer: (customer) => {
        set(state => ({
            createOrder: { 
                ...state.createOrder, 
                selectedCustomer: customer,
                newCustomer: customer ? state.createOrder.newCustomer : initialCreateOrderState.newCustomer
            }
        }));
        get().calculateTotals();
    },

    setNewCustomer: (data) => {
        set(state => ({
            createOrder: { 
                ...state.createOrder, 
                newCustomer: { ...state.createOrder.newCustomer, ...data }
            }
        }));
    },

    toggleService: (serviceId) => {
        set(state => {
            const createOrder = { ...state.createOrder };
            const serviceIndex = createOrder.selectedServices.indexOf(serviceId);
            
            // Gunakan helper function untuk mencari service
            const service = findServiceById(state.services, serviceId);
            
            if (serviceIndex === -1) {
                // Add service
                createOrder.selectedServices.push(serviceId);
                createOrder.serviceQuantities[serviceId] = 1;
                
                if (service?.is_weight_based) {
                    createOrder.serviceWeights[serviceId] = 1.0;
                }
                
                createOrder.serviceNotes[serviceId] = '';
            } else {
                // Remove service
                createOrder.selectedServices.splice(serviceIndex, 1);
                delete createOrder.serviceQuantities[serviceId];
                delete createOrder.serviceWeights[serviceId];
                delete createOrder.serviceNotes[serviceId];
            }
            
            return { createOrder };
        });
        
        get().calculateTotals();
    },

    updateServiceQuantity: (serviceId, quantity) => {
        set(state => ({
            createOrder: { 
                ...state.createOrder, 
                serviceQuantities: { 
                    ...state.createOrder.serviceQuantities, 
                    [serviceId]: Math.max(1, Math.min(100, quantity)) 
                }
            }
        }));
        get().calculateTotals();
    },

    updateServiceWeight: (serviceId, weight) => {
        set(state => ({
            createOrder: { 
                ...state.createOrder, 
                serviceWeights: { 
                    ...state.createOrder.serviceWeights, 
                    [serviceId]: Math.max(0.1, Math.min(50, weight)) 
                }
            }
        }));
        get().calculateTotals();
    },

    updateServiceNote: (serviceId, note) => {
        set(state => ({
            createOrder: { 
                ...state.createOrder, 
                serviceNotes: { 
                    ...state.createOrder.serviceNotes, 
                    [serviceId]: note 
                }
            }
        }));
    },

    setOrderNotes: (notes) => {
        set(state => ({
            createOrder: { ...state.createOrder, orderNotes: notes }
        }));
    },

    setPaymentMethod: (method) => {
        set(state => ({
            createOrder: { ...state.createOrder, paymentMethod: method }
        }));
    },

    setEstimatedCompletion: (date) => {
        set(state => ({
            createOrder: { ...state.createOrder, estimatedCompletion: date }
        }));
    },

    calculateTotals: () => {
        const { createOrder, services } = get();
        const isMember = createOrder.selectedCustomer?.type === 'member';
        
        let subtotal = 0;
        let totalWeight = 0;
        let totalItems = 0;
        
        createOrder.selectedServices.forEach(serviceId => {
            // Gunakan helper function untuk mencari service
            const service = findServiceById(services, serviceId);
            if (!service) return;
            
            const price = isMember && service.member_price ? service.member_price : service.price;
            const quantity = createOrder.serviceQuantities[serviceId] || 1;
            
            if (service.is_weight_based) {
                const weight = createOrder.serviceWeights[serviceId] || 1.0;
                subtotal += price * weight;
                totalWeight += weight;
                totalItems += quantity;
            } else {
                subtotal += price * quantity;
                totalItems += quantity;
            }
        });
        
        set(state => ({
            createOrder: {
                ...state.createOrder,
                subtotal,
                total: subtotal,
                totalWeight,
                totalItems,
            }
        }));
    },

    resetCreateOrder: () => {
        set({ createOrder: { ...initialCreateOrderState } });
    },

    validateStep: (step) => {
        const { createOrder } = get();
        
        switch (step) {
            case 1: // Customer step
                return !!createOrder.selectedCustomer || 
                       (!!createOrder.newCustomer.name && createOrder.newCustomer.name.length >= 2);
            
            case 2: // Services step
                return createOrder.selectedServices.length > 0;
            
            case 3: // Review step
                return true; // Always valid
            
            case 4: // Payment step
                return true; // Always valid
            
            default:
                return false;
        }
    },

    proceedToNextStep: () => {
        const { createOrder } = get();
        
        if (!get().validateStep(createOrder.step)) {
            set({ error: 'Harap lengkapi data terlebih dahulu' });
            return;
        }
        
        if (createOrder.step < 4) {
            get().setCreateStep(createOrder.step + 1);
        }
    },

    goToPrevStep: () => {
        const { createOrder } = get();
        
        if (createOrder.step > 1) {
            get().setCreateStep(createOrder.step - 1);
        }
    },
}));