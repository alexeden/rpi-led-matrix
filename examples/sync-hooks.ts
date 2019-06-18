import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const Colors = {
  Aquamarine: 0x7FFFD4,
  Black: 0x000000,
  Blue: 0x0000FF,
  Cyan: 0x00FFFF,
  Green: 0x00FF00,
  Magenta: 0xFF00FF,
  Purple: 0x800080,
  Red: 0xFF0000,
  White: 0xFFFFFF,
  Yellow: 0xFFFF00,
};


(async () => {
  try {


    const matrix = new LedMatrix(matrixOptions, runtimeOptions)
      .luminanceCorrect(true)
      .fgColor(Colors.Magenta);

    matrix.afterSync((mat, dt, t) => {
      matrix.brightness(Math.floor(50 * (Math.sin(t / 500) + 1))).fill();
      setTimeout(() => matrix.sync(), 0);
    });

    matrix.sync();

  }
  catch (error) {
    console.error(error);
  }
})();
