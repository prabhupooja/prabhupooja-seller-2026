import { create } from "zustand";
import { socket } from "../../utils/socket";
import api from "../Axios/api.js";

const useNotificationStore = create((set) => ({
  notifications: [],

  connectSocket: (seller_id) => {
    if (!socket.connected) {
      socket.connect();
      console.log("WebSocket connecting...");
    }

    socket.off(`notification_${seller_id}`);

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    socket.on(`notification_${seller_id}`, (data) => {
      console.log(` Notification Received:`, data);
      set((state) => ({
        notifications: [data, ...state.notifications],
      }));

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("New Notification", {
          body: data.message || "You have a new notification!",
          icon: "https://www.sallerpanel.prabhupooja.com/static/media/logo.adbdbb38bb9b5cdd972c.png",
        });
      }

    });

    socket.on("disconnect", () => console.log("WebSocket disconnected"));
    socket.on("error", (error) => console.error("WebSocket error:", error));
  },


  getAllNotifications: async (sellerId, limit, page, filter) => {
    console.log(filter, limit, page)
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token provided.");
      return;
    }

    set({ isLoading: true });

    try {
      const response = await api.get(`notifications/get/${sellerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: page,
          limit: limit,
          filter: filter.toLowerCase(),
        },
      });


      if (response?.data.success) {
        set({ notifications: response.data.notifications });
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },


  disconnectSocket: () => {
    socket.disconnect();
  },

}));

export default useNotificationStore;
