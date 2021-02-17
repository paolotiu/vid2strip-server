import { Sockets } from "config/socket";
import { Request } from "express";
import { Server, Socket } from "socket.io";

export type Emitter = (event: string, payload: any) => boolean;
export const getSocket = (req: Request, id: string): Emitter | null => {
  const io = req.app.get("io") as Server;
  const sockets = req.app.get("sockets") as Sockets;
  const socketId = sockets[id];
  console.log(socketId);

  return socketId ? (event: string, payload: any) => io.to(socketId).emit(event, payload) : null;
};
