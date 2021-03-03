import { Color } from "color-thief-node";
import { createCanvas } from "canvas";

export const createCanvasLines = (colors: IFastAverageColorRgba[]) => {
  const canvas = createCanvas(1000, 200);
  const ctx = canvas.getContext("2d");
  let count = 0;
  ctx.lineWidth = 1;

  for (const color of colors) {
    ctx.beginPath();

    // Set line color
    ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    // Move to top of the canvas
    // Then draw till bottom of the canvas
    ctx.moveTo(count, 0);
    ctx.lineTo(count, 200);
    // Actually make the line
    ctx.stroke();
    ctx.closePath();
    count += 1;
  }
  return canvas;
};
