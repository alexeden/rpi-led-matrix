import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const nextColor = (f: number, t: number): number => {
  const brightness = 0xFF & Math.max(0, 255 * Math.sin(f * t / 1000));

  return (brightness << 16) | (brightness << 8) | brightness;
};

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);
    const freqs = [...Array(matrix.width() * matrix.height()).keys()].map(i => i / 20);

    matrix.afterSync((mat, dt, t) => {
      matrix.map(([x, y, i]) => {
        return nextColor(freqs[i], t);
      });

      setTimeout(() => matrix.sync(), 0);
    });

    matrix.sync();
  }
  catch (error) {
    console.error(error);
  }
})();
