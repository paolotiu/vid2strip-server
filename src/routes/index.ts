import { receiveFile } from "controllers/multerTest";
import { youtube } from "controllers/youtubeDl";
import express from "express";
const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("Hello World");
});
router.get("/yt", youtube);
router.post("/vid", receiveFile);

export default router;
