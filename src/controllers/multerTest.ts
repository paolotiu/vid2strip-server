import { upload } from "config/multer";
import fs from "fs";
import { RequestHandler } from "express";
// import extractFrames from "ffmpeg-extract-frames";
import ffmpeg from "ffmpeg";
import { Color, getColorFromURL } from "color-thief-node";
import { sortFiles } from "util/sortFiles";
import { createCanvas } from "canvas";
import createHttpError from "http-errors";

const canvas = createCanvas(1000, 200);
const ctx = canvas.getContext("2d");

export const receiveFile: RequestHandler[] = [
  upload.single("vid"),
  async (req, res, next) => {
    if (!req.file) {
      return next(createHttpError(400, "No file attached"));
    }
    const FRAMES_DIR = "./frames/" + req.file.filename;
    try {
      fs.mkdirSync(FRAMES_DIR);

      const video = await new ffmpeg(req.file.path);
      const metadata = video.metadata;

      console.log("Extracting frames");
      await video.fnExtractFrameToJPG(FRAMES_DIR, {
        frame_rate: 1000 / (metadata.duration?.seconds || 1),
      });
      console.log("Done");
      const files = fs.readdirSync(FRAMES_DIR);
      const sorted = sortFiles(files, FRAMES_DIR);
      console.log("Getting colors");

      // const colors = await Promise.all(
      //   sorted.map(async (file) => {
      //     return await getColorFromURL(FRAMES_DIR + "/" + file);
      //   })
      // );
      const colors = await (async () => {
        const colors: Color[] = [];
        for (const file of sorted) {
          const color = await getColorFromURL(FRAMES_DIR + "/" + file);
          colors.push(color);
        }
        return colors;
      })();
      console.log("Drawing canvas");
      let count = 0;
      ctx.lineWidth = 1;

      console.log("Drawing lines");

      for (const color of colors) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
        ctx.moveTo(count, 0);
        ctx.lineTo(count, 200);
        ctx.stroke();
        ctx.closePath();
        count += 1;
      }

      fs.writeFileSync("./image.png", canvas.toBuffer("image/png"));
      fs.unlinkSync(req.file.path);
      // fs.rmdirSync(FRAMES_DIR, { recursive: true });
      res.json({ colors });
    } catch (error) {
      console.log(error);
      res.json("");
    }
  },
];
