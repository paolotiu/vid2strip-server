import { receiveFile } from "controllers/multerTest";
import express from "express";
const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("Hello World");
});

router.post("/photo", receiveFile);

export default router;
