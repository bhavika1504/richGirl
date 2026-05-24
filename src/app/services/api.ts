import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Add Axios Request Interceptor to automatically add JWT token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get current user ID dynamically
const getCurrentUserId = () => {
  return localStorage.getItem('userId');
};

export const api = {
  // Setup mock user for legacy support
  setupMockUser: async () => {
    let userId = getCurrentUserId();
    if (!userId) {
      try {
        const response = await axios.post(`${API_BASE_URL}/users/login`, {
          email: 'customer@example.com',
          password: 'mockpassword123'
        });
        userId = response.data.user?.id || response.data.id;
        if (userId) {
          localStorage.setItem('userId', userId);
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }
        }
      } catch (err) {
        console.error('Failed to setup mock user:', err);
      }
    }
    return userId;
  },

  login: async (email?: string, password?: string) => {
    const response = await axios.post(`${API_BASE_URL}/users/login`, { email, password });
    const userId = response.data.user?.id || response.data.id;
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', response.data.user?.name || response.data.name || '');
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  register: async (name: string, email: string, phone: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/users/register`, { name, email, phone, password });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await axios.get(`${API_BASE_URL}/users/verify`, {
      params: { token }
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axios.post(`${API_BASE_URL}/users/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await axios.post(`${API_BASE_URL}/users/reset-password`, { token, newPassword });
    return response.data;
  },

  getProducts: async (category?: string) => {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      params: { category }
    });
    return response.data;
  },
  
  getProductById: async (id: string | number) => {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  },

  getCart: async () => {
    let userId = getCurrentUserId();
    if (!userId) {
      userId = await api.setupMockUser();
    }
    if (!userId) return [];
    const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
    return response.data.items || [];
  },

  addToCart: async (item: any) => {
    let userId = getCurrentUserId();
    if (!userId) {
      userId = await api.setupMockUser();
    }
    const response = await axios.post(`${API_BASE_URL}/cart`, {
      userId,
      ...item
    });
    return response.data;
  },

  updateCartQuantity: async (productId: string, size: string, color: string, quantity: number) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    const response = await axios.put(`${API_BASE_URL}/cart/${userId}/${productId}`, {
      quantity,
      size,
      color
    });
    return response.data;
  },

  removeFromCart: async (productId: string, size: string, color: string) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    const response = await axios.delete(`${API_BASE_URL}/cart/${userId}/${productId}`, {
      params: { size, color }
    });
    return response.data;
  },

  placeOrder: async (orderData: any) => {
    let userId = getCurrentUserId();
    if (!userId) {
      userId = await api.setupMockUser();
    }
    const response = await axios.post(`${API_BASE_URL}/orders`, {
      userId,
      ...orderData
    });
    return response.data;
  },

  // --- Admin ---
  getAdminStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/admin/stats`);
    return response.data;
  },

  getAllOrders: async () => {
    const response = await axios.get(`${API_BASE_URL}/admin/orders`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/admin/users`);
    return response.data;
  },

  getConfig: async () => {
    const response = await axios.get(`${API_BASE_URL}/config`);
    return response.data;
  },

  createProduct: async (productData: any) => {
    const response = await axios.post(`${API_BASE_URL}/products`, productData);
    return response.data;
  },

  updateAdminOrder: async (orderId: string, orderData: any) => {
    const response = await axios.put(`${API_BASE_URL}/admin/orders/${orderId}`, orderData);
    return response.data;
  },

  trackOrder: async (orderId: string) => {
    const response = await axios.get(`${API_BASE_URL}/orders/track/${orderId}`);
    return response.data;
  }
};
