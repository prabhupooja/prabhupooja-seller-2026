import { create } from "zustand";
import api from "../Axios/api";

const useProductStore = create((set) => ({
    productList: [],
    productDetail: null,
    isLoading: false,

    getAllProducts: async (userId, limit, page, searchQ) => {

        set({ error: null, isLoading: true });
        try {
            const token = localStorage.getItem("authToken");

            const response = await api.get(`/products/getByMerchantId/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    page: page,
                    limit: limit,
                    search: searchQ.toLowerCase(),
                },
            });
            set({ productList: response.data });
            return response;
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch products",
            });
        } finally {
            set({ isLoading: false });
        }
    },

    getProductDetail: async (productId) => {
        set({ error: null, isLoading: true });

        try {

            const response = await api.get(`/products/get/${productId}`);

            if (response.data.success) {
                console.log(response?.data?.data[0])
                set({ productDetail: response?.data?.data[0] });
            } else {
                set({ productDetail: null, error: "No product details found" });
            }
            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to fetch product details",
            });
        } finally {
            set({ isLoading: false });
        }
    },
    createProduct: async (payload) => {
        try {
            const token = localStorage.getItem("authToken");

            if (!token) {
                throw new Error("No token found. User might not be logged in.");
            }

            const response = await api.post("/products/createByMerchant", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (err) {
            console.error("Create Product Error:", err);
            throw err;
        }
    },
    createProductCoupon: async (payload) => {
        try {
            const token = localStorage.getItem("authToken");

            if (!token) {
                throw new Error("No token found. User might not be logged in.");
            }

            const response = await api.post("/coupon/createSeller", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response;
        } catch (err) {
            console.error("Create Product Coupon Error:", err);
            throw err;
        }
    },
    editProduct: async (productId, payload) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await api.put(`/products/updateByMerchant/${productId}`, payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
            return response;
        } catch (err) {
            console.error("Edit Product Error:", err);
            throw err;
        }
    },
    deleteProduct: async (productId) => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await api.delete(`/products/deleteByMerchant/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response;
        } catch (err) {
            console.error("Error deleting product:", err);
            throw err;
        }
    },

    getProductCouponByMerchatId: async (merchantId) => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await api.get(`/coupon/get/${merchantId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error("Error fetching coupon:", error);
            throw error;
        }
    },
    updateProductCoupon: async (coupanId, payload) => {
        try {
            const token = localStorage.getItem("authToken");

            if (!token) {
                throw new Error("No token found. User might not be logged in.");
            }

            const response = await api.put(`/coupon/updateCoupanSeller/${coupanId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response;
        } catch (err) {
            console.error("Update Coupon Error:", err);
            throw err;
        }
    },
    deleteProductCoupon: async (coupanId) => {
        try {
            const token = localStorage.getItem("authToken");

            if (!token) {
                throw new Error("No token found. User might not be logged in.");
            }

            const response = await api.delete(`/coupon/deleteCoupanSeller/${coupanId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response;
        } catch (err) {
            console.error("Delete Coupon Error:", err);
            throw err;
        }
    },

    productActive: async (productId) => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await api.put(`/products/productActive/${productId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error("Product Active Toggle Error:", error);
            throw error;
        }
    },

}));
export default useProductStore;