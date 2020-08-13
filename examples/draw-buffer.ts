import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);

    matrix.clear().brightness(100);

    const baseBuffer = [...Array(matrix.width() * matrix.height() * 3).keys()];
    const buffer1 = Buffer.of(...baseBuffer.map(() => Math.random() < 0.1 ? 0xFF : 0x00));
    const buffer2 = Buffer.of(...baseBuffer.map(() => Math.random() < 0.1 ? 0xFF : 0x00));

    let useBuffer1 = true;
    matrix.afterSync(() => {
      useBuffer1 = !useBuffer1;
      matrix.drawBuffer(useBuffer1 ? buffer1 : buffer2);
      setTimeout(() => matrix.sync(), 17);
    });

    matrix.sync();
  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
