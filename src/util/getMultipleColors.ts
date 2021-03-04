import { eachLimit } from "async/";
import { getAverageColor } from "fast-average-color-node";
import { Emitter } from "./getSocket";

export const getColorFromFiles = async (filepaths: string[], emitter?: Emitter) => {
  const colors: IFastAverageColorRgba[] = [];
  await eachLimit(filepaths, 20, async (file, cb) => {
    // Inside setTimeout to allow other requests to come in.
    setTimeout(async () => {
      const color = await getAverageColor(file);

      colors.push(color.value);
      if (emitter) {
        emitter("status", {
          event: "color",
          value: Math.min(Math.floor((colors.length / 1000) * 100), 100),
        });
      }
      cb();
    }, 0);
  });

  return colors;
};
