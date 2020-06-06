import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

class Pulser {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly f: number
  ) { }

  nextColor(t: number): number {
    /** You could easily work position-dependent logic into this expression */
    const brightness = 0xFF & Math.max(0, (255 * (Math.sin(this.f * t / 1000))));

    return (brightness << 16) | (brightness << 8) | brightness;
  }
}

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);

    const pulsers: Pulser[] = [];

    for (let x = 0; x < matrix.width(); x++) {
      for (let y = 0; y < matrix.height(); y++) {
        pulsers.push(new Pulser(x, y, 5 * Math.random()));
      }
    }

    matrix.afterSync((mat, dt, t) => {
      pulsers.map(pulser => {
        matrix.fgColor(pulser.nextColor(t)).setPixel(pulser.x, pulser.y);
      });
      setTimeout(() => matrix.sync(), 0);
    });

    matrix.sync();
  }
  catch (error) {
    console.error(error);
  }
})();
