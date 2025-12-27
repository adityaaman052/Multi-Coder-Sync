import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (socket) {
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_API_URL, {
    autoConnect: false,
  });

  return socket;
};
