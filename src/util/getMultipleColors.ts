import { eachLimit } from "async/";
import { getAverageColor } from "fast-average-color-node";
export const getColorFromFiles = async (filepaths: string[]) => {
  // TODO: find a more efficient way to implment this.
  // The Promise.all() trick overloads the memory so no-go on that.

  const colors: IFastAverageColorRgba[] = [];
  await eachLimit(filepaths, 20, async (file, cb) => {
    // const color = await getColorFromURL(file);
    setTimeout(async () => {
      const color = await getAverageColor(file);
      // const color: [number, number, number, number] = [0, 0, 0, 0];
      colors.push(color.value);
      console.log(colors.length);
      cb();
    }, 0);
  });

  return colors;
};
