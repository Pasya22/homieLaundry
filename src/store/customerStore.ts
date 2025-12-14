// src/store/customerStore.ts
import { create } from 'zustand';
import { type Customer, type CustomerStore, type CustomerFormData } from '../types/customer';
import { customerService } from '../services/customerService';

const initialFormData: CustomerFormData = {
    name: '',
    phone: '',
    address: '',
    type: 'regular',
    deposit: 0,
};

export const useCustomerStore = create<CustomerStore>((set, get) => ({
    // State
    customers: [],
    loading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        perPage: 10,
        total: 0,
        from: 0,
        to: 0,
    },
    search: '',
    modal: {
        isOpen: false,
        isEditing: false,
        selectedCustomer: null,
    },
    form: { ...initialFormData },

    // Actions
    setSearch: (search: string) => set({
        search,
        pagination: { ...get().pagination, currentPage: 1 }
    }),

    setForm: (form: Partial<CustomerFormData>) =>
        set(state => ({
            form: { ...state.form, ...form }
        })),

    resetForm: () => set({ form: { ...initialFormData } }),

    openModal: (isEditing = false, customer: Customer | null = null) => {
        if (customer && isEditing) {
            set({
                modal: { isOpen: true, isEditing, selectedCustomer: customer },
                form: {
                    name: customer.name,
                    phone: customer.phone || '',
                    address: customer.address || '',
                    type: customer.type,
                    deposit: customer.deposit,
                }
            });
        } else {
            set({
                modal: { isOpen: true, isEditing, selectedCustomer: null },
                form: { ...initialFormData }
            });
        }
    },

    closeModal: () => set({
        modal: { isOpen: false, isEditing: false, selectedCustomer: null },
        form: { ...initialFormData }
    }),

    // API Actions
    fetchCustomers: async () => {
        const { pagination, search } = get();
        set({ loading: true, error: null });

        try {
            const response = await customerService.getCustomers(
                pagination.currentPage,
                pagination.perPage,
                search
            );

            set({
                customers: response.data,
                pagination: {
                    currentPage: response.current_page,
                    totalPages: response.last_page,
                    perPage: response.per_page,
                    total: response.total,
                    from: response.from,
                    to: response.to,
                },
                loading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengambil data customer',
                loading: false,
            });
        }
    },

    createCustomer: async () => {
        const { form } = get();
        set({ loading: true, error: null });

        try {
            await customerService.createCustomer(form);
            await get().fetchCustomers();
            get().closeModal();
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menambah customer',
                loading: false,
            });
            throw error;
        }
    },

    updateCustomer: async () => {
        const { modal, form } = get();
        if (!modal.selectedCustomer) return;

        set({ loading: true, error: null });

        try {
            await customerService.updateCustomer(modal.selectedCustomer.id, form);
            await get().fetchCustomers();
            get().closeModal();
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal mengupdate customer',
                loading: false,
            });
            throw error;
        }
    },

    deleteCustomer: async (id: number) => {
        if (!window.confirm('Yakin ingin menghapus customer ini?')) return;

        set({ loading: true, error: null });

        try {
            await customerService.deleteCustomer(id);
            await get().fetchCustomers();
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Gagal menghapus customer',
                loading: false,
            });
        }
    },

    setPage: (page: number) => {
        set(state => ({
            pagination: { ...state.pagination, currentPage: page }
        }));
        get().fetchCustomers();
    },
}));