import * as color from 'color';
import { Point, LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const rainbow64 = Array.from(Array(64))
  .map((_, i, { length }) => Math.floor((360 * i) / length))
  .map(hue => color.hsl(hue, 100, 50).rgbNumber());

const rainbow = (i: number) =>
  rainbow64[Math.min(rainbow64.length - 1, Math.max(i % 64, 0))];

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions)
      .shapeOptions({ color: 0x0000ff })
      .mapPixels(pixel => {
        if (pixel.x % 16 === 0) {
          console.log(pixel);
        }
        return { ...pixel, color: rainbow(pixel.x) };
      })
      .clear();

    const n = 10;
    const spacing = (Math.PI * 2) / n;
    const r = 30;
    const ps: Point[] = [...Array(n).keys()]
      .map(i => i * spacing - Math.PI / 2)
      .map((theta, i) => {
        const radius = i % 2 === 0 ? r : r / 2;
        return [radius * Math.cos(theta), radius * Math.sin(theta)];
      });

    const left: Point[] = ps.map(([x, y]) => [x + 32, y + 32 + 64]);
    const right: Point[] = ps.map(([x, y]) => [x + 32 + 64, y + 32 + 64]);

    matrix
      .unstable_drawPolygon({ ps: left, fill: true })
      .unstable_drawPolygon({ ps: right })
      .sync();
    await wait(999999999);
  } catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
