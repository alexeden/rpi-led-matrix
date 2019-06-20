import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);

    matrix.clear().brightness(100);

    const buffer = Buffer.of(
      ...[...Array(matrix.width() * matrix.height() * 3).keys()].map(() => 0xFF)
    );

    matrix.drawBuffer(buffer).sync();
    await wait(999999999);
  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
