// src/types/customer.ts
export interface Customer {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    type: 'regular' | 'member';
    deposit: number;
    balance: number;
    member_since: string | null;
    member_expiry: string | null;
    created_at: string;
    created_at_formatted: string;
    can_delete: boolean;
    member_status: 'active' | 'inactive';
}

export interface CustomerFormData {
    name: string;
    phone: string;
    address: string;
    type: 'regular' | 'member';
    deposit: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface CustomerStore {
    customers: Customer[];
    loading: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        perPage: number;
        total: number;
        from: number;
        to: number;
    };
    search: string;
    modal: {
        isOpen: boolean;
        isEditing: boolean;
        selectedCustomer: Customer | null;
    };
    form: CustomerFormData;

    setSearch: (search: string) => void;
    setForm: (form: Partial<CustomerFormData>) => void;
    resetForm: () => void;
    openModal: (isEditing?: boolean, customer?: Customer | null) => void;
    closeModal: () => void;
    fetchCustomers: () => Promise<void>;
    createCustomer: () => Promise<void>;
    updateCustomer: () => Promise<void>;
    deleteCustomer: (id: number) => Promise<void>;
    setPage: (page: number) => void;
}