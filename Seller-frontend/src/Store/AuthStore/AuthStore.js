import { create } from 'zustand';
import api from "../Axios/api.js";

const useAuthStore = create((set) => ({
  user: null,
  error: null,
  isLoggin: false,
  isLoading: false,
  isVerified: null,
  isCompleted: 0,


  setIsLoggin: (value) => set({ isLoggin: value }),
  setIsVerified: (value) => set({ isVerified: value }),
  setIsCompleted: (value) => set({ isCompleted: value }),


  login: async (payload) => {
    set({ error: null, isLoading: true });
    try {
      const response = await api.post('/seller/login', payload);
      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      set({
        error: errorMsg,
        isLoggin: false,
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  userOTP: async (payload) => {
    set({ error: null, isLoading: true });
    try {
      const response = await api.post('/seller/verifyOtp', payload);
      const token = response.data?.token;
      if (token) {
        localStorage.setItem('authToken', token);
      }
      const sellerData = response.data?.seller || response.data?.user || response.data?.data || response.data;
      set({ user: sellerData, isLoggin: true });
      return response;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'OTP verification failed',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (payload) => {
    set({ error: null, isLoading: true });
    try {
      const response = await api.post('/seller/create-seller', payload);
      return response;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Registration failed',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  userGet: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return null;
    }
    set({ isLoading: true });
    try {
      const response = await api.get('/seller/getSellerbyToken', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response?.data) {
        const sellerData = response.data?.seller || response.data?.user || response.data?.data || response.data;
        set({ user: sellerData, isLoggin: true });
        return sellerData;
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem("authToken");
      set({ user: null, isLoggin: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  profileData: async (userID, payload) => {
    set({ error: null, isLoading: true });
    try {
      const token = localStorage.getItem("authToken");
      let bodyData = payload;
      if (!(payload instanceof FormData)) {
        bodyData = new FormData();
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== null && payload[key] !== undefined) {
            bodyData.append(key, payload[key]);
          }
        });
      }

      const response = await api.put(`/seller/update-seller/${userID}`, bodyData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },


  logout: () => {
    localStorage.removeItem("authToken");
    set({ user: null, error: null, isLoggin: false });
  },
  updateUser: async (userId, payload) => {
    try {
      console.log(userId, payload)
      const token = localStorage.getItem("authToken");
      const response = await api.put(`/seller/update-profile/${userId}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
      return response
    } catch (error) {
      console.log(error);
      throw error
    }
  },
 
  ticketGet: async (page, limit,searchQ) => {
    try {
      const response = await api.get('/seller/getSellerTicket', {
        params: {
          page,
          limit,
          search:searchQ
        }
      });

      return response;
    } catch (error) {
      console.error('Error fetching tickets:', error.response?.data || error.message);
      throw error;
    }
  }


}))

export default useAuthStore;
