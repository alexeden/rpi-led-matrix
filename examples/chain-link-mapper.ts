import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);

    console.log('available pixel mappers: ', matrix.getAvailablePixelMappers());
    console.log(`current mapper config: ${matrixOptions.pixelMapperConfig}`);
    console.log('height: ', matrix.height());
    console.log('width: ', matrix.width());
    matrix
      .clear()
      .brightness(100)
      .fgColor(0x0000FF)
      .drawRect(0, 0, matrix.width() - 1, matrix.height() - 1)
      .fgColor(0xFF0000)
      .drawLine(0, matrix.height() / 2, matrix.width(), matrix.height() / 2)
      .sync();

    await wait(9999999);
  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
