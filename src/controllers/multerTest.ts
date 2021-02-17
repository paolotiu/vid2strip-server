import { upload } from "config/multer";
import fs from "fs";
import { RequestHandler } from "express";
import { sortFiles } from "util/sortFiles";
import createHttpError from "http-errors";
import { getColorFromFiles } from "util/getMultipleColors";
import { extractVideoFrames } from "util/extractVideoFrames";
import { createCanvasLines } from "util/createCanvasLines";
import { getSocket } from "util/getSocket";
import { setDirFileCountInterval } from "util/setDirFileCountInterval";

export const receiveFile: RequestHandler[] = [
  upload.single("vid"),
  async (req, res, next) => {
    const { socketId } = req.body as { socketId: string };

    // Check if socketId exists
    if (!socketId) {
      return next(createHttpError(400, "Socket ID needed"));
    }

    // Get client socket
    const socket = getSocket(req, socketId);

    // Validation check
    if (!socket) {
      return next(createHttpError(400, "No socket with that id"));
    }
    if (!req.file) {
      return next(createHttpError(400, "No file attached"));
    }

    // Output directory of ffmpeg
    const FRAMES_DIR = "./frames/" + req.file.filename;
    try {
      // Make directory for video frames to go to
      fs.mkdirSync(FRAMES_DIR);

      // Extract video frames
      // Input Path = file path
      // Output Path = ./frames/<filename>
      socket.emit("status", "Extracting Frames");

      // Watch dir callback
      const clear = await setDirFileCountInterval(
        FRAMES_DIR,
        (files) => {
          socket.emit("status", files.length + "%");
        },
        1000
      );
      await extractVideoFrames(req.file.path, FRAMES_DIR);
      clear();

      // Get the files then sort
      const files = fs.readdirSync(FRAMES_DIR);
      const sorted = sortFiles(files, FRAMES_DIR);

      console.log("Getting colors");

      // Returns an array of tuples which are [<red>, <green>, <blue>]
      const colors = await getColorFromFiles(sorted.map((file) => FRAMES_DIR + "/" + file));

      console.log("Creating Photo");

      // Create canvas with lines
      const canvas = createCanvasLines(colors);

      // Cleanup vid and photos
      fs.unlinkSync(req.file.path);
      fs.rmdirSync(FRAMES_DIR, { recursive: true });

      // Return data url of image
      res.json({ image: canvas.toDataURL("image/jpeg") });
    } catch (error) {
      // TODO: Better error handling
      console.log(error);
      res.json("");
    }
  },
];
