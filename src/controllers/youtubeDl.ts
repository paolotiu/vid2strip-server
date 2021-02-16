import { RequestHandler } from "express";
import fs from "fs";
import createHttpError from "http-errors";
import progress from "progress-stream";
import { createCanvasLines } from "util/createCanvasLines";
import { extractVideoFrames } from "util/extractVideoFrames";
import { getColorFromFiles } from "util/getMultipleColors";
import { sortFiles } from "util/sortFiles";
import ytdl from "ytdl-core";
export const youtube: RequestHandler = async (req, res, next) => {
  const { url } = req.body;

  if (!ytdl.validateURL(url))
    return next(createHttpError(400, "Not a valid url"));
  const info = await ytdl.getInfo(url);
  if (info.videoDetails.isLiveContent)
    return next(createHttpError(400, "Live videos not allowed"));
  const FRAMES_DIR = "./frames/" + "vid";

  console.log("Downloading video");
  const readStream = ytdl(url, {
    filter: "videoonly",
    quality: "lowest",
  });
  const str = progress({
    time: 1000 /* ms */,
  });
  str.on("progress", function (progress) {
    console.log(progress);
  });
  const stream = readStream.pipe(fs.createWriteStream("./tmp/vid"));

  stream.on("finish", async () => {
    const readDirFileCount = () => {
      fs.readdir("./frames/vid", (err, files) => {
        if (err) return next(err);
        console.log(files.length);
      });
    };

    const interval = setInterval(readDirFileCount, 1000);
    await extractVideoFrames("./tmp/vid", FRAMES_DIR);
    clearInterval(interval);
    // Get the files then sort
    const files = fs.readdirSync(FRAMES_DIR);
    const sorted = sortFiles(files, FRAMES_DIR);

    // Returns an array of tuples which are [<red>, <green>, <blue>]
    const colors = await getColorFromFiles(
      sorted.map((file) => FRAMES_DIR + "/" + file)
    );

    const canvas = createCanvasLines(colors);
    res.json({ url: canvas.toDataURL("image/jpeg") });
  });
};
