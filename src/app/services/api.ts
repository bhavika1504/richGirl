import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Clear auth on 401 but stay on current page
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userName');
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);
axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  // Only attach Authorization for our own API calls
  if (token && config.url && config.url.startsWith(apiBase)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Get current user ID dynamically
const getCurrentUserId = () => {
  return sessionStorage.getItem('userId');
};
const ensureAuth = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
};

export const api = {
  // Setup mock user for legacy support
  setupMockUser: async () => {
    return null; // Mocking removed for security
  },

  login: async (email?: string, password?: string) => {
    const response = await axios.post(`${API_BASE_URL}/users/login`, { email, password });

    if (response.data.token && response.data.user) {
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      sessionStorage.setItem('userId', response.data.user.id || response.data.user._id);
      sessionStorage.setItem('userName', response.data.user.name);

      // Merge guest cart after login
      await api.mergeCart();
    }
    return response.data;
  },

  getConfig: async () => {
    const response = await axios.get(`${API_BASE_URL}/config`);
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

  getProducts: async (category?: string, type?: string) => {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      params: { category, type }
    });
    return Array.isArray(response.data) ? response.data : [];
  },

  getProductById: async (id: string | number) => {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return Array.isArray(response.data) ? response.data : [];
  },

  getCart: async () => {
    const token = sessionStorage.getItem('token');
    const userId = getCurrentUserId();

    if (!token || !userId) {
      const guestCart = localStorage.getItem('guestCart');
      return guestCart ? JSON.parse(guestCart) : [];
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
      return Array.isArray(response.data.items) ? response.data.items : [];
    } catch (err) {
      console.error('Failed to get cart:', err);
      const guestCart = localStorage.getItem('guestCart');
      return guestCart ? JSON.parse(guestCart) : [];
    }
  },

  addToCart: async (item: any) => {
    const token = sessionStorage.getItem('token');
    const userId = getCurrentUserId();

    if (!token || !userId) {
      // Guest logic
      const guestCartJson = localStorage.getItem('guestCart');
      const guestCart = guestCartJson ? JSON.parse(guestCartJson) : [];

      const existingIndex = guestCart.findIndex((i: any) =>
        i.productId === item.productId && i.size === item.size && i.color === item.color
      );

      if (existingIndex > -1) {
        guestCart[existingIndex].quantity += item.quantity;
      } else {
        guestCart.push({ ...item, id: item.productId }); // Map id for UI consistency
      }

      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      return { items: guestCart };
    }

    const response = await axios.post(`${API_BASE_URL}/cart`, {
      userId,
      ...item
    });
    return response.data;
  },

  updateCartQuantity: async (productId: string, size: string, color: string, quantity: number) => {
    const token = localStorage.getItem('token');
    const userId = getCurrentUserId();

    if (!token || !userId) {
      const guestCartJson = localStorage.getItem('guestCart');
      if (!guestCartJson) return;
      const guestCart = JSON.parse(guestCartJson);

      const idx = guestCart.findIndex((i: any) =>
        i.productId === productId && i.size === size && i.color === color
      );

      if (idx > -1) {
        guestCart[idx].quantity = quantity;
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
      }
      return { items: guestCart };
    }

    const response = await axios.put(`${API_BASE_URL}/cart/${userId}/${productId}`, {
      quantity,
      size,
      color
    });
    return response.data;
  },

  removeFromCart: async (productId: string, size: string, color: string) => {
    const token = localStorage.getItem('token');
    const userId = getCurrentUserId();

    if (!token || !userId) {
      const guestCartJson = localStorage.getItem('guestCart');
      if (!guestCartJson) return;
      const guestCart = JSON.parse(guestCartJson);

      const filtered = guestCart.filter((i: any) =>
        !(i.productId === productId && i.size === size && i.color === color)
      );

      localStorage.setItem('guestCart', JSON.stringify(filtered));
      return { items: filtered };
    }

    const response = await axios.delete(`${API_BASE_URL}/cart/${userId}/${productId}`, {
      params: { size, color }
    });
    return response.data;
  },

  mergeCart: async () => {
    const token = sessionStorage.getItem('token');
    const userId = getCurrentUserId();
    const guestCartJson = localStorage.getItem('guestCart');

    if (!token || !userId || !guestCartJson) return;

    try {
      const guestCart = JSON.parse(guestCartJson);
      if (guestCart.length === 0) return;

      await axios.post(`${API_BASE_URL}/cart/merge`, {
        userId,
        items: guestCart
      });
      localStorage.removeItem('guestCart');
    } catch (err) {
      console.error('Failed to merge cart:', err);
    }
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
  // Admin guard removed – token handled by interceptor; 401 handled globally
  getAdminStats: async () => {
    await ensureAuth();
    const response = await axios.get(`${API_BASE_URL}/admin/stats`);
    return response.data;
  },

  getAllOrders: async () => {
    await ensureAuth();
    const response = await axios.get(`${API_BASE_URL}/admin/orders`);
    return Array.isArray(response.data) ? response.data : [];
  },

  getAllUsers: async () => {
    await ensureAuth();
    const response = await axios.get(`${API_BASE_URL}/admin/users`);
    return Array.isArray(response.data) ? response.data : [];
  },

  createProduct: async (productData: any) => {
    await ensureAuth();
    const response = await axios.post(`${API_BASE_URL}/products`, productData);
    return response.data;
  },

  updateProduct: async (productId: string, productData: any) => {
    await ensureAuth();
    const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId: string) => {
    await ensureAuth();
    const response = await axios.delete(`${API_BASE_URL}/products/${productId}`);
    return response.data;
  },

  updateAdminOrder: async (orderId: string, orderData: any) => {
    const response = await axios.put(`${API_BASE_URL}/admin/orders/${orderId}`, orderData);
    return response.data;
  },

  trackOrder: async (orderId: string) => {
    const response = await axios.get(`${API_BASE_URL}/orders/track/${orderId}`);
    return response.data;
  },

  generateDescription: async (imageUrl: string) => {
    const response = await axios.post(`${API_BASE_URL}/admin/generate-description`, { image: imageUrl });
    return response.data;
  },

  // --- Addresses ---
  getAddresses: async () => {
    const response = await axios.get(`${API_BASE_URL}/users/addresses`);
    return response.data;
  },

  addAddress: async (address: any) => {
    const response = await axios.post(`${API_BASE_URL}/users/addresses`, { address });
    return response.data;
  },

  deleteAddress: async (addressId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/users/addresses/${addressId}`);
    return response.data;
  },

  // --- Payment ---
  createRazorpayOrder: async (amount: number) => {
    const response = await axios.post(`${API_BASE_URL}/payment/create-order`, { amount });
    return response.data;
  },

  verifyRazorpayPayment: async (paymentData: any) => {
    const response = await axios.post(`${API_BASE_URL}/payment/verify`, paymentData);
    return response.data;
  }
};
