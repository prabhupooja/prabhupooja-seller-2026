import { create } from 'zustand';
import api from "../Axios/api.js";


const useOrderStore = create((set) => ({

    orderlist:null,
    orderDetail:null,
    isLoading:false,

    getAllOrders: async (userId,limit,page,searchQ) => {
    
        set({ error: null, isLoading: true });
        try {
            const token = localStorage.getItem("authToken"); 
    
            const response = await api.get(`/orders/getbymarchantId/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: page,  
                    limit: limit,
                    search:searchQ.toLowerCase()
            }
            
            });
            set({ orderlist: response.data });

            return response;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch orders',
            });
        } finally {
            set({ isLoading: false });
        }
    },
    getOrderDetail: async (orderId,merchantId) => {
     
        set({ error: null, isLoading: true });
    
        try {
            const token = localStorage.getItem("authToken");
    
            const response = await api.get(`/orders/getOrder/${orderId}/${merchantId}`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
    
            if (response.data.success) {
                set({ orderDetail: response?.data?.orders[0]});
            } else {
                set({ orderDetail: null, error: "No order details found" });
            }
    
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch orders',
            });
        } finally {
            set({ isLoading: false });
        }
    },
       recentOrders:async()=>{
          try {
            const response = await api.get('/orders/recentOrders');
           return response;
        } catch (error) {
          console.log(error);
          throw error
        }
    }

}))


export default useOrderStore;
