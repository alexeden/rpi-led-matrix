import { LedMatrix } from '../src';
import * as color from 'color';
import { matrixOptions, runtimeOptions } from './_config';

const rainbow64 = Array.from(Array(384))
  .map((_, i, { length }) => Math.floor((360 * i) / length))
  .map(hue => color.hsl(hue, 100, 50).rgb().array());

class Pulser {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly f: number
  ) {}

  nextColor(t: number): number {
    const brightness = Math.max(0, Math.sin((this.f * t) / 1000));
    const [r, g, b] = rainbow64[Math.round(this.x + this.y + t / 100) % 384];
    return (
      ((brightness * r) << 16) | ((brightness * g) << 8) | (brightness * b)
    );
  }
}

(() => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);
    const pulsers: Pulser[] = [];

    for (let x = 0; x < matrix.width(); x++) {
      for (let y = 0; y < matrix.height(); y++) {
        pulsers.push(
          new Pulser(x, matrix.height() - y, ((y + 3) / 2) * Math.random())
        );
      }
    }

    matrix.afterSync((mat, dt, t) => {
      pulsers.map(pulser => {
        matrix.fgColor(pulser.nextColor(t)).setPixel(pulser.x, pulser.y);
      });
      setTimeout(() => matrix.sync(), 0);
    });

    matrix.sync();
  } catch (error) {
    console.error(error);
  }
})();
