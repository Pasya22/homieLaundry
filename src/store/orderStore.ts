// src/store/orderStore.ts
import { create } from 'zustand';
import { orderService } from '../services/orderService';
import { type Order, type OrderStore, type Service, type CustomItem } from '../types/order';

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
    serviceCustomItems: {},
    orderNotes: '',
    payment_method: 'cash',
    paymentConfirmation: 'later',
    payment_proof: null,
    estimatedCompletion: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16),
    subtotal: 0,
    total: 0,
    totalWeight: 0,
    totalItems: 0,
};

const findServiceById = (services: Service[] | Record<string, Service[]>, id: number): Service | undefined => {
    if (Array.isArray(services)) {
        return services.find(s => s.id === id);
    }

    if (typeof services === 'object' && services !== null) {
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

const getAllServices = (services: Service[] | Record<string, Service[]>): Service[] => {
    if (Array.isArray(services)) {
        return services;
    }

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
            console.log('Services from API:', services);
            set({ services });
        } catch (error: any) {
            console.error('Error fetching services:', error);
        }
    },

    findServiceById: (id: number) => {
        const { services } = get();
        return findServiceById(services, id);
    },

    getAllServices: () => {
        const { services } = get();
        return getAllServices(services);
    },

    createNewOrder: async (data): Promise<Order> => {
        set({ loading: true, error: null });

        try {
            const newOrder = await orderService.createOrder(data);

            // ✅ FORCE RESET - Pastikan state benar-benar bersih setelah sukses
            set({
                createOrder: {
                    ...initialCreateOrderState,
                    estimatedCompletion: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16)
                },
                loading: false
            });

            // Refresh data
            await get().fetchOrders();
            await get().fetchStats();

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

    updatePaymentStatus: async (id: number, paymentStatus: 'paid' | 'pending', paymentProof?: File) => {
        set({ loading: true, error: null });

        try {
            await orderService.updatePaymentStatus(id, paymentStatus, paymentProof);
            await get().fetchOrders();

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
            const service = findServiceById(state.services, serviceId);

            if (serviceIndex === -1) {
                createOrder.selectedServices.push(serviceId);
                createOrder.serviceQuantities[serviceId] = 1;
                createOrder.serviceWeights[serviceId] = service?.is_weight_based ? 1.0 : 0;
                createOrder.serviceNotes[serviceId] = '';
                createOrder.serviceCustomItems[serviceId] = [];
            } else {
                createOrder.selectedServices.splice(serviceIndex, 1);
                delete createOrder.serviceQuantities[serviceId];
                delete createOrder.serviceWeights[serviceId];
                delete createOrder.serviceNotes[serviceId];
                delete createOrder.serviceCustomItems[serviceId];
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
        const { services } = get();
        const service = findServiceById(services, serviceId);

        const minWeight = service?.is_weight_based ? 0.1 : 0;
        const maxWeight = service?.is_weight_based ? 50 : 100;
        const clampedWeight = Math.max(minWeight, Math.min(maxWeight, weight));

        set(state => ({
            createOrder: {
                ...state.createOrder,
                serviceWeights: {
                    ...state.createOrder.serviceWeights,
                    [serviceId]: clampedWeight
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

    addCustomItem: (serviceId: number) => {
        set(state => {
            const customItems = state.createOrder.serviceCustomItems[serviceId] || [];
            const newItem: CustomItem = {
                id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: '',
                quantity: 1
            };

            return {
                createOrder: {
                    ...state.createOrder,
                    serviceCustomItems: {
                        ...state.createOrder.serviceCustomItems,
                        [serviceId]: [...customItems, newItem]
                    }
                }
            };
        });
    },

    removeCustomItem: (serviceId: number, itemId: string) => {
        set(state => {
            const customItems = state.createOrder.serviceCustomItems[serviceId] || [];
            const filtered = customItems.filter(item => item.id !== itemId);

            return {
                createOrder: {
                    ...state.createOrder,
                    serviceCustomItems: {
                        ...state.createOrder.serviceCustomItems,
                        [serviceId]: filtered
                    }
                }
            };
        });
        get().calculateTotals();
    },

    updateCustomItem: (serviceId: number, itemId: string, updates: Partial<CustomItem>) => {
        set(state => {
            const customItems = state.createOrder.serviceCustomItems[serviceId] || [];
            const updated = customItems.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
            );

            return {
                createOrder: {
                    ...state.createOrder,
                    serviceCustomItems: {
                        ...state.createOrder.serviceCustomItems,
                        [serviceId]: updated
                    }
                }
            };
        });
        get().calculateTotals();
    },

    setOrderNotes: (notes) => {
        set(state => ({
            createOrder: { ...state.createOrder, orderNotes: notes }
        }));
    },

    setPaymentMethod: (method) => {
        const { createOrder } = get();

        // ✅ Validasi untuk deposit
        if (method === 'deposit') {
            const customer = createOrder.selectedCustomer;
            if (!customer || customer.type !== 'member') {
                set({ error: 'Pembayaran deposit hanya untuk member' });
                return;
            }

            if (customer.balance < createOrder.total) {
                set({
                    error: `Saldo tidak cukup! Saldo: ${customer.balance.toLocaleString('id-ID')}, Total: ${createOrder.total.toLocaleString('id-ID')}`
                });
                return;
            }
        }

        // ✅ PERBAIKAN UTAMA: Ganti paymentMethod jadi payment_method
        set(state => ({
            createOrder: {
                ...state.createOrder,
                payment_method: method,  // ✅ BENAR - snake_case
                // Auto set confirmation untuk deposit (langsung lunas)
                paymentConfirmation: method === 'deposit' ? 'now' : state.createOrder.paymentConfirmation,
                // Clear payment proof jika deposit (tidak perlu bukti)
                paymentProof: method === 'deposit' ? null : state.createOrder.payment_proof
            },
            error: null
        }));
    },

    // JUGA PERBAIKI setPaymentConfirmation:
    setPaymentConfirmation: (confirmation) => {
        set(state => ({
            createOrder: {
                ...state.createOrder,
                paymentConfirmation: confirmation,  // ✅ Sudah benar
                // Clear payment proof jika pilih bayar nanti
                payment_proof: confirmation === 'later' ? null : state.createOrder.payment_proof
            }
        }));
    },
    setPaymentProof: (file) => {
        set(state => ({
            createOrder: { ...state.createOrder, payment_proof: file }
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
            const service = findServiceById(services, serviceId);
            if (!service) return;

            const price = isMember && service.member_price ? service.member_price : service.price;
            const quantity = createOrder.serviceQuantities[serviceId] || 1;
            const weight = createOrder.serviceWeights[serviceId] || 0;
            const customItems = createOrder.serviceCustomItems[serviceId] || [];

            const customItemsTotal = customItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
            totalItems += customItemsTotal;

            if (service.is_weight_based) {
                subtotal += price * weight;
                totalWeight += weight;
            } else {
                subtotal += price * quantity;
            }
        });

        set(state => ({
            createOrder: {
                ...state.createOrder,
                subtotal,
                total: subtotal,
                totalWeight: parseFloat(totalWeight.toFixed(1)),
                totalItems,
            }
        }));
    },

    validateServiceWeights: () => {
        const { createOrder, services } = get();

        for (const serviceId of createOrder.selectedServices) {
            const service = findServiceById(services, serviceId);
            if (!service) continue;

            if (service.is_weight_based) {
                const weight = createOrder.serviceWeights[serviceId] || 0;
                const minWeight = service.min_weight || 1.0;

                if (weight < minWeight) {
                    return {
                        valid: false,
                        message: `Layanan "${service.name}" membutuhkan minimal ${minWeight} kg`,
                        serviceId
                    };
                }
            }
        }

        return { valid: true };
    },

    resetCreateOrder: () => {
        console.log('🔄 Resetting create order state...');
        set({
            createOrder: {
                ...initialCreateOrderState,
                estimatedCompletion: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16)
            }
        });
    },

    validateStep: (step) => {
        const { createOrder } = get();

        switch (step) {
            case 1:
                return !!createOrder.selectedCustomer ||
                    (!!createOrder.newCustomer.name && createOrder.newCustomer.name.length >= 2);

            case 2:
                if (createOrder.selectedServices.length === 0) {
                    return false;
                }

                const weightValidation = get().validateServiceWeights();
                if (!weightValidation.valid) {
                    set({ error: weightValidation.message });
                    return false;
                }

                return true;

            case 3:
                return true;

            case 4:
                // ✅ Validasi deposit
                if (createOrder.payment_method === 'deposit') {
                    const customer = createOrder.selectedCustomer;
                    if (!customer || customer.type !== 'member') {
                        set({ error: 'Pembayaran deposit hanya untuk member' });
                        return false;
                    }
                    if (customer.balance < createOrder.total) {
                        set({ error: 'Saldo deposit tidak mencukupi' });
                        return false;
                    }
                }
                return true;

            default:
                return false;
        }
    },

    proceedToNextStep: () => {
        const { createOrder, error } = get();

        if (!get().validateStep(createOrder.step)) {
            if (!error) {
                set({ error: 'Harap lengkapi data terlebih dahulu' });
            }
            return;
        }

        if (error) {
            set({ error: null });
        }

        if (createOrder.step < 4) {
            get().setCreateStep(createOrder.step + 1);
        }
    },

    goToPrevStep: () => {
        const { createOrder } = get();

        if (createOrder.step > 1) {
            get().setCreateStep(createOrder.step - 1);
            set({ error: null }); // Clear error saat mundur
        }
    },
}));