import { upload } from "config/multer";
import fs from "fs";
import { RequestHandler } from "express";
import { sortFiles } from "util/sortFiles";
import createHttpError from "http-errors";
import { getColorFromFiles } from "util/getMultipleColors";
import { extractVideoFrames } from "util/extractVideoFrames";
import { createCanvasLines } from "util/createCanvasLines";
import { getSocket } from "util/getSocket";
import { setDirFileCountInterval, emitFileCountStatus } from "util/setDirFileCountInterval";

export const receiveFile: RequestHandler[] = [
  upload.single("vid"),
  async (req, res, next) => {
    const { socketId } = req.body as { socketId: string };

    // Check if socketId exists
    if (!socketId) {
      return next(createHttpError(400, "Socket ID needed"));
    }

    // Get client socket
    const emitToClient = getSocket(req, socketId);

    // Validation check
    if (!emitToClient) {
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

      emitToClient("status", "Extracting Frames");

      // Watch dir callback
      const clearDirInvteral = await setDirFileCountInterval(
        FRAMES_DIR,
        emitFileCountStatus(emitToClient),
        1000
      );

      // Extract video frames
      // Input Path = file path
      // Output Path = ./frames/<filename>
      await extractVideoFrames(req.file.path, FRAMES_DIR).catch(async (e) => {
        // Retry without size option
        console.log("errorrr");
        await extractVideoFrames(req.file.path, FRAMES_DIR).catch((e) => {
          // For any ffmpeg errors
          clearDirInvteral();
          emitToClient("status", { event: "Error", message: "Error in extracting frames" });
          throw new Error(e.message);
        });
      });

      // Manually emit that frame extraction is done
      emitFileCountStatus(emitToClient)(1000);

      // Stop updateing file count
      clearDirInvteral();

      // Get the files then sort
      const files = fs.readdirSync(FRAMES_DIR);
      const sorted = sortFiles(files, FRAMES_DIR);

      emitToClient("status", "Collecting colors...");
      console.log("Getting colors");

      // Returns an array of tuples which are [<red>, <green>, <blue>]
      const colors = await getColorFromFiles(
        sorted.map((file) => FRAMES_DIR + "/" + file),
        emitToClient
      );

      emitToClient("status", "Generating photo");
      console.log("Creating Photo");

      // Create canvas with lines
      const canvas = createCanvasLines(colors);

      // Cleanup vid and photos
      fs.unlinkSync(req.file.path);
      fs.rmdirSync(FRAMES_DIR, { recursive: true });

      // Emit finish event
      emitToClient("status", {
        event: "finish",
      });

      // Return data url of image
      res.json({ image: canvas.toDataURL("image/jpeg") });
    } catch (error) {
      // TODO: Better error handling
      res.json(error.message);
    }
  },
];
