import http from "http";
import { Express } from "express";
import { Server, Socket } from "socket.io";
let io: Server;

let message = "";
export type Sockets = { [key: string]: string };
const sockets: Sockets = {};

export const setupSocket = (http: http.Server, app: Express) => {
  io = new Server(http, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("Connected: " + socket.id);

    // Pass the id to client for future use
    socket.on("connectInit", (id) => {
      // Update sockets dict
      sockets[id] = socket.id;
      app.set("sockets", sockets);
    });

    // Clear id on disconnect
    socket.on("disconnect", () => {
      deleteByVal(socket.id, sockets);
      console.log("Disconnected: " + socket.id);
      app.set("sockets", sockets);
    });

    socket.on("hey", () => {
      console.log("HEYYY");
    });

    socket.on("fire", () => {
      let count = 0;
      const interval = setInterval(() => {
        socket.emit("fire", count);
        count++;
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
      }, 10000);
    });
  });

  app.set("io", io);
  return io;
};

function deleteByVal(val: string, obj: Sockets) {
  for (const key in obj) {
    if (obj[key] == val) delete obj[key];
  }
}
export { io };
