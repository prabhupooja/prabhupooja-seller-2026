import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://api.prabhupooja.com";

export const socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    autoConnect: false,
});

