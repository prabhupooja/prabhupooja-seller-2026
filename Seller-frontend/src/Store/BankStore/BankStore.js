import { create } from 'zustand';
import api from "../Axios/api.js";

const useBankStore = create((set) => ({

  bank: [],
  isLoading: false,
  error: null,
  transactions: [],

  userBackAdd: async (payload) => {
    // console.log(payload )
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token provided.");
      return;
    }
    set({ isLoading: true });
    try {
      const response = await api.post(`/bankDetail/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error("Error add bankDetail data:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  userBackGet: async (userId) => {
    const token = localStorage.getItem("authToken");
    if (!token || !userId) {
      return;
    }
    set({ isLoading: true });
    try {
      const response = await api.get(`/bankDetail/get/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response?.data?.success && response.data.data) {
        const bankData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
        set({ bank: bankData });
      } else {
        set({ bank: null });
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching bankDetail data:", error);
      set({ bank: null });
    } finally {
      set({ isLoading: false });
    }
  },

  userBackDelete: async (userId) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No token provided.");
      return;
    }

    set({ isLoading: true });

    try {
      const response = await api.delete(`/bankDetail/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response;
    } catch (error) {
      console.error("Error deleting bank detail data:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },


  userBackUpdate: async (userId, payload) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No token provided.");
      return;
    }

    set({ isLoading: true });

    try {
      const response = await api.put(`/bankDetail/update/${userId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (error) {
      console.error("Error updating bank detail:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },


  withdrawalRequest: async (payload) => {

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token provided.");
      return;
    }
    set({ isLoading: true });
    try {
      const response = await api.post(`/bankDetail/withdrawal-request`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response;
    } catch (error) {
      console.error("Error withdrawal amount:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },


  withdrawalRequestGet: async (userId, page, limit, searchQ) => {
    console.log(searchQ.toLowerCase(), "lklklklk")
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token provided.");
      return;
    }
    set({ isLoading: true });
    try {
      const response = await api.get(`bankDetail/get-withdrawal-request/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: page,
          limit: limit,
          search: searchQ.toLowerCase()
        }
      });

      if (response?.data.success) {
        set({ transactions: response.data });
      } else {
        set({ transactions: [] })
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching bankDetail data:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  accountVerify: async (id, amount) => {
    const token = localStorage.getItem("authToken");
    console.log(token, "Token from localStorage");

    if (!token) {
      console.error("No token provided.");
      return;
    }

    set({ isLoading: true });

    try {
      const response = await api.post(
        `/bankDetail/verifyBankAccount/${id}/${amount}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Error verifying bank account:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },



}))


export default useBankStore;