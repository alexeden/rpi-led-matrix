import { LedMatrix, Point } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions)
      .fgColor(0x0000ff) // set the active color to blue
      .bgColor(0xff0000);

    // const n = 10;
    // const spacing = (Math.PI * 2) / n;
    // const r = 32;
    // const evenR = r;
    // const oddR = r / 2;
    // const ps: Point[] = [...Array(n).keys()]
    //   .map(i => i * spacing - Math.PI / 2)
    //   .map((theta, i) => {
    //     const radius = i % 2 === 0 ? evenR : oddR;
    //     return [radius * Math.cos(theta), radius * Math.sin(theta)];
    //   })
    //   .map(([x, y]) => [x + 64, y + 32 + 64]);

    const ps: Point[] = [
      [12, 12],
      [12, 18],
      [18, 22],
      [30, 12],
      [30, 18],
      [24, 12],
    ];
    matrix
      .clear() // clear the display
      .unstable_drawPolygon({ ps, stroke: 0xff0000, fill: 0x000099 })
      .sync();
    await wait(999999999);
  } catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
