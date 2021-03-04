import { eachLimit } from "async/";
import { getAverageColor } from "fast-average-color-node";
export const getColorFromFiles = async (filepaths: string[]) => {
  const colors: IFastAverageColorRgba[] = [];
  await eachLimit(filepaths, 20, async (file, cb) => {
    // Inside setTimeout to allow other requests to come in.
    setTimeout(async () => {
      const color = await getAverageColor(file);

      colors.push(color.value);

      cb();
    }, 0);
  });

  return colors;
};
