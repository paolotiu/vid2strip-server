import { Sockets } from "config/socket";
import { Request } from "express";
import { Server } from "socket.io";

export const getSocket = (req: Request, id: string) => {
  const io = req.app.get("io") as Server;
  const sockets = req.app.get("sockets") as Sockets;

  return sockets[id] ? io.to(sockets[id]) : null;
};
