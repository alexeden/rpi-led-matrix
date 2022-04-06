import * as color from 'color';
import { LedMatrix, Point } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const rainbow64 = Array.from(Array(64))
  .map((_, i, { length }) => Math.floor((360 * i) / length))
  .map(hue => color.hsl(hue, 100, 50).rgbNumber());

const rainbow = (i: number) =>
  rainbow64[Math.min(rainbow64.length - 1, Math.max(i % 64, 0))];

(() => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions)
      .fgColor(0x0000ff) // set the active color to blue
      .bgColor(0xff0000);

    const n = 30;
    const spacing = (Math.PI * 2) / n;
    const r = 32;

    matrix.afterSync((mat, dt, t) => {
      const secs = t / 1000;
      const evenR = 2.5 * r * Math.cos(2 * secs) + 10;
      const oddR = r * (1 - (Math.sin(2 * secs) + 1)) + 10;
      const ps: Point[] = [...Array(n).keys()]
        .map(i => i * spacing + (Math.sin(5 * secs) + 2) + secs)
        .map((angle, i) => {
          const radius = i % 2 === 0 ? evenR : oddR;
          const theta =
            i % 2 === 0 ? Math.cos(secs) / 2 + angle : Math.sin(secs) + angle;
          return [radius * Math.cos(theta), radius * Math.sin(theta)];
        })
        .map(([x, y]) => [x + 64, y + 96]);

      matrix
        .clear() // clear the display
        .fgColor(rainbow(Math.floor(64 * ((t % 1000) / 1000))))
        .unstable_drawPolygon({ ps });

      setTimeout(() => matrix.sync(), 0);
    });

    matrix.sync();
  } catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
