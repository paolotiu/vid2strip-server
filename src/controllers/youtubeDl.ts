import { RequestHandler } from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";
import createHttpError from "http-errors";
import progress from "progress-stream";
import { emitFileCountStatus, setDirFileCountInterval } from "util/setDirFileCountInterval";
import { createCanvasLines } from "util/createCanvasLines";
import { extractVideoFrames } from "util/extractVideoFrames";
import { getColorFromFiles } from "util/getMultipleColors";
import { sortFiles } from "util/sortFiles";
import ytdl from "ytdl-core";
import { getSocket } from "util/getSocket";

export const youtube: RequestHandler = async (req, res, next) => {
  const { url, socketId } = req.body as { socketId: string; url: string };

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

  // File path
  const id = uuid();
  const VID_DIR = "./tmp";
  const VID_FILE = "./tmp/" + id;
  const FRAMES_DIR = "./frames/" + id;

  // Create dir to populate
  fs.mkdirSync(FRAMES_DIR);

  // Validate Url
  if (!ytdl.validateURL(url)) return next(createHttpError(400, "Not a valid url"));
  const info = await ytdl.getInfo(url);
  if (info.videoDetails.isLiveContent) return next(createHttpError(400, "Live videos not allowed"));

  console.log("Downloading video");

  // Download yt vid
  const readStream = ytdl(url, {
    filter: "videoonly",
    quality: "lowest",
  });
  // Progress-stream setup
  const str = progress({
    time: 1000 /* every 1s */,
  });

  // Youtube DL Progress
  str.on("progress", function (progress) {
    emitToClient("status", {
      message: "Downloading",
    });
  });

  // Readstream to monitor the file
  const stream = readStream.pipe(str).pipe(fs.createWriteStream(VID_FILE));

  stream.on("finish", async () => {
    console.log("Downlaod finished");

    // Create dir file count listener
    const clearDirInvteral = await setDirFileCountInterval(
      FRAMES_DIR,
      emitFileCountStatus(emitToClient),
      1000
    );

    try {
      // Extract video frames
      await extractVideoFrames(VID_FILE, FRAMES_DIR, { isYoutube: true });

      // Manually emit that frame extraction is done
      emitFileCountStatus(emitToClient)(1000);

      // Clear listener after extraction
      clearDirInvteral();

      // Get the files then sort
      const files = fs.readdirSync(FRAMES_DIR);
      const sorted = sortFiles(files, FRAMES_DIR);

      // Returns an array of tuples which are [<red>, <green>, <blue>]
      const colors = await getColorFromFiles(
        sorted.map((file) => FRAMES_DIR + "/" + file),
        emitToClient
      );

      // Creates canvas with colored lines
      const canvas = createCanvasLines(colors);

      // Emit finish event
      emitToClient("status", {
        event: "finish",
      });
      // Return dataURL to client
      res.json({ image: canvas.toDataURL("image/jpeg") });
    } catch (error) {
      // Cleanup vid and photos
      fs.unlinkSync(req.file.path);
      fs.rmdirSync(FRAMES_DIR, { recursive: true });

      // Clear listener on error
      clearDirInvteral();

      return next(createHttpError(400, error.message));
    }
  });
};
