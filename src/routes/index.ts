import { receiveFile } from "controllers/multerTest";
import { youtube } from "controllers/youtubeDl";
import express from "express";
import createHttpError from "http-errors";
import { Server } from "socket.io";
const router = express.Router();

router.post("/", (req, res, next) => {
  const { socketId } = req.body;
  if (!socketId) {
    return next(createHttpError(400, " socketId needed"));
  }
  const io = req.app.get("io") as Server;
  const sockets = req.app.get("sockets") as { [key: string]: string };
  io.to(sockets[socketId]).emit("pong");
  console.log(req.app.get("sockets"));
  res.json("hey");
});
router.post("/yt", youtube);
router.post("/vid", receiveFile);

export default router;
