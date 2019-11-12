import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);

    console.log('height: ', matrix.height());
    console.log('width: ', matrix.width());

    matrix
      .clear()
      .brightness(100)
      .fgColor(0x0000FF)
      .drawRect(0, 0, matrix.width() - 1, matrix.height() - 1)
      .sync();

    wait(9999999);
  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
