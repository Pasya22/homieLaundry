// src/services/authService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post('/auth/login', credentials);
        if (response.data.success) {
            localStorage.setItem('auth_token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        if (response.data.success) {
            localStorage.setItem('auth_token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    },

    async me(): Promise<User> {
        const response = await api.get('/auth/me');
        return response.data.data;
    },

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    getUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
};

export default api;