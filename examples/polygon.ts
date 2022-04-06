import { LedMatrix, Point } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

(() => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions)
      .fgColor(0x0000ff) // set the active color to blue
      .bgColor(0xff0000);

    const n = 10;
    const spacing = (Math.PI * 2) / n;
    const r = 32;

    matrix.afterSync((mat, dt, t) => {
      const secs = t / 1000;
      const evenR = r * Math.sin(2 * secs) + 4;
      const oddR = r * Math.cos(2 * secs) + 4;
      const ps: Point[] = [...Array(n).keys()]
        .map(i => i * spacing + (Math.sin(5 * secs) + 2) + secs)
        .map((theta, i) => {
          const radius = i % 2 === 0 ? evenR : oddR;
          return [radius * Math.cos(theta), radius * Math.sin(theta)];
        })
        .map(([x, y]) => [x + 64, y + 32]);

      matrix
        .clear() // clear the display
        .unstable_drawPolygon({ ps });

      setTimeout(() => matrix.sync(), 0);
    });

    matrix.sync();
  } catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
