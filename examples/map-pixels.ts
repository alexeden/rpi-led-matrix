import * as color from 'color';
import { Point, LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const rainbow64 = Array.from(Array(64))
  .map((_, i, { length }) => Math.floor((360 * i) / length))
  .map(hue => color.hsl(hue, 100, 50).rgbNumber());

const rainbow = (i: number) =>
  rainbow64[Math.min(rainbow64.length - 1, Math.max(i % 64, 0))];

// const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

(async () => {
  try {
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

    new LedMatrix(matrixOptions, runtimeOptions)
      .mapPixels((pixel, _, t) => ({
        ...pixel,
        color: rainbow(pixel.x + Math.ceil(t / 50)),
      }))
      .clear()
      .afterSync(mat => {
        mat
          .unstable_drawPolygon({ ps: left, fill: true })
          .unstable_drawPolygon({ ps: right });

        setTimeout(() => mat.sync(), 0);
      })
      .sync();

    // await wait(999999999);
  } catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
