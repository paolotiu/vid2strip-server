declare module "color-thief-node" {
  type Color = [number, number, number, number] | [number, number, number];
  const getColorFromURL: (path: string) => Promise<Color>;
  export const getColorFromURL;
}
