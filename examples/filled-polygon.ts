import { LedMatrix, Point } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions)
      .fgColor(0x0000ff) // set the active color to blue
      .bgColor(0xff0000);

    const n = 10;
    const spacing = (Math.PI * 2) / n;
    const r = 30;
    const evenR = r;
    const oddR = r / 2;
    const ps: Point[] = [...Array(n).keys()]
      .map(i => i * spacing - Math.PI / 2)
      .map((theta, i) => {
        const radius = i % 2 === 0 ? evenR : oddR;
        return [radius * Math.cos(theta), radius * Math.sin(theta)];
      });

    const left: Point[] = ps.map(([x, y]) => [x + 32, y + 32 + 64]);
    const right: Point[] = ps.map(([x, y]) => [x + 32 + 64, y + 32 + 64]);

    matrix
      .clear() // clear the display
      .unstable_drawPolygon({ ps: left, fill: true })
      .unstable_drawPolygon({ ps: right })
      .sync();
    await wait(999999999);
  } catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
