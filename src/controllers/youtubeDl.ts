import { RequestHandler } from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";
import createHttpError from "http-errors";
import progress from "progress-stream";
import { setDirFileCountInterval } from "util/setDirFileCountInterval";
import { createCanvasLines } from "util/createCanvasLines";
import { extractVideoFrames } from "util/extractVideoFrames";
import { getColorFromFiles } from "util/getMultipleColors";
import { sortFiles } from "util/sortFiles";
import ytdl from "ytdl-core";

export const youtube: RequestHandler = async (req, res, next) => {
  const { url } = req.body;

  // File path
  const id = uuid();
  const VID_DIR = "./tmp/yt/" + id;
  const FRAMES_DIR = "./frames/yt/" + id;

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
  str.on("progress", function (progress) {
    console.log(progress);
  });

  // Readstream to monitor the file
  const stream = readStream.pipe(fs.createWriteStream(VID_DIR));

  stream.on("finish", async () => {
    const clearDirInvteral = setDirFileCountInterval(FRAMES_DIR, 1000);

    await extractVideoFrames(VID_DIR, FRAMES_DIR);

    clearDirInvteral();
    // Get the files then sort
    const files = fs.readdirSync(FRAMES_DIR);
    const sorted = sortFiles(files, FRAMES_DIR);

    // Returns an array of tuples which are [<red>, <green>, <blue>]
    const colors = await getColorFromFiles(sorted.map((file) => FRAMES_DIR + "/" + file));

    const canvas = createCanvasLines(colors);
    res.json({ url: canvas.toDataURL("image/jpeg") });
  });
};
