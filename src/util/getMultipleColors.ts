import { Color, getColorFromURL } from "color-thief-node";

export const getColorFromFiles = async (filepaths: string[]) => {
  // TODO: find a more efficient way to implment this.
  // The Promise.all() trick overloads the memory so no-go on that.

  const colors: Color[] = [];
  for (const file of filepaths) {
    const color = await getColorFromURL(file);
    colors.push(color);
  }
  return colors;
};
