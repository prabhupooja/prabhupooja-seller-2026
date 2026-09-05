import { create } from "zustand";
import api from "../Axios/api";

const useCustomerStore = create((set) => ({
    customerlist: null,
    isLoading: false,
    orders: [],
    cancelReason: null,

    getAllCustomer: async (userId, limit, page, searchQ) => {

        set({ error: null, isLoading: true });
        try {
            const token = localStorage.getItem("authToken");

            const response = await api.get(`/orders/getCustomer/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: page,
                    limit: limit,
                    search: searchQ
                }

            });

            set({ customerlist: response.data.data });
            return response;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch orders',
            });
        } finally {
            set({ isLoading: false });
        }
    },
    getCustomerDetail: async (userId, page, limit) => {
        try {
            const response = await api.get(`/orders/getCustomerDetail/${userId}`,
                {
                    params: {
                        page: page,
                        limit: limit
                    }
                }
            );
            return response;
        } catch (error) {
            console.log(error);
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    getOrderTracking: async (orderId) => {

        set({ isLoading: true });
        try {
            const response = await api.get(
                `/orders/getOrdersTrackingByUser/${orderId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch order tracking:", error);
        } finally {
            set({ isLoading: false });
        }
    },
    userOrdersFetchByOrderId: async (orderId) => {
        set({ isLoading: true });
        try {
            const response = await api.get(
                `/orders/getbyseller/${orderId}`);

            set({ orders: response.data.products });
            set({ cancelReason: response?.data?.orders?.cancel_reason });
            set({
                isCancelled:
                    response?.data?.orders?.order_status?.toLowerCase() === "cancel",
            });

            return response;
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            set({ isLoading: false });
        }
    },


}));
export default useCustomerStore;