import { addon } from './addon';
import { MatrixOptions, RuntimeOptions, GpioMapping, PixelMapperType, LedMatrixInstance } from './types';
import { LedMatrixUtils } from './utils';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

const spin = async (matrix: LedMatrixInstance, speed = 50) => {
  for (let i = 0; i < matrix.height(); i++) {
    matrix.clear();
    matrix.drawLine(0, i, matrix.width(), matrix.height() - i, 255, 0, 255);
    await wait(speed);
  }

  for (let i = matrix.width(); i >= 0; i--) {
    matrix.clear();
    matrix.drawLine(i, 0, matrix.width() - i, matrix.height(), 255, 0, 255);
    await wait(speed);
  }
};

(async () => {
  try {
    console.log('addon: ', addon);
    console.log('addon.Font: ', addon.Font);
    console.log('addon.LedMatrix: ', addon.LedMatrix);
    console.log('addon.LedMatrix.defaultMatrixOptions(): ', addon.LedMatrix.defaultMatrixOptions());
    console.log('addon.LedMatrix.defaultRuntimeOptions(): ', addon.LedMatrix.defaultRuntimeOptions());
    const matrixOpts: MatrixOptions = {
      ...addon.LedMatrix.defaultMatrixOptions(),
      rows: 32,
      cols: 64,
      chainLength: 2,
      hardwareMapping: GpioMapping.AdafruitHatPwm,
      pixelMapperConfig: LedMatrixUtils.encodeMappers({ type: PixelMapperType.U }),
    };

    const runtimeOpts: RuntimeOptions = {
      ...addon.LedMatrix.defaultRuntimeOptions(),
      gpioSlowdown: 1,
    };

    const font = new addon.Font('../rpi-rgb-led-matrix/fonts/helvR12.bdf');
    console.log('new addon.Font: ', font);
    console.log('font.baseline(): ', font.baseline());
    console.log('font.height(): ', font.height());
    console.log('font.stringWidth("abc"): ', font.stringWidth('Mi'));

    const matrix = new addon.LedMatrix(matrixOpts, runtimeOpts);
    console.log('new addon.LedMatrix: ', matrix);
    console.log('matrix.pwmBits(): ', matrix.pwmBits());
    console.log('matrix.pwmBits(1): ', matrix.pwmBits(1));
    console.log('matrix.pwmBits(12): ', matrix.pwmBits(12));
    console.log('matrix.pwmBits(11): ', matrix.pwmBits(11));
    console.log('matrix.brightness(): ', matrix.brightness());
    console.log('matrix.brightness(0): ', matrix.brightness(0));
    console.log('matrix.brightness(100): ', matrix.brightness(100));
    console.log('matrix.height(): ', matrix.height());
    console.log('matrix.width(): ', matrix.width());

    matrix.clear();
    console.log('', matrix.drawText('YAAAS!!!', font, 0, 255, 255));
    await wait(2000);

    const interval = 200;
    matrix.fill(0, 0, 255);
    await wait(interval);
    matrix.fill(0, 255, 0);
    await wait(interval);
    matrix.fill(255, 0, 0);
    await wait(interval);
    matrix.clear();
    await wait(interval);

    for (let i = 0; i < matrix.height(); i++) {
      matrix.clear();
      const y = i;
      Array.from(Array(matrix.width())).map((_, x) => {
        matrix.setPixel(x, y, 255, 0, 0);
      });
      await wait(33);
    }
    for (let i = 0; i < matrix.width(); i++) {
      matrix.clear();
      const x = i;
      Array.from(Array(matrix.height())).map((_, y) => {
        matrix.setPixel(x, y, 0, 0, 255);
      });
      await wait(33);
    }

    const centerX = Math.floor(matrix.width() / 2);
    const centerY = Math.floor(matrix.height() / 2);
    for (let r = 0; r <= matrix.width(); r++) {
      matrix.clear();
      matrix.drawCircle(centerX, centerY, r, 0, 255, 0);
      await wait(66);
    }

    await spin(matrix);
    await spin(matrix, 40);
    await spin(matrix, 30);
    await spin(matrix, 20);
    await spin(matrix, 10);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);
    await spin(matrix, 5);

  }
  catch (error) {
    console.error(error);
  }

})();


/*

sudo ./scrolling-text-example \
  --led-rows=32 \
  --led-cols=64 \
  --led-chain=2 \
  --led-pixel-mapper="U-mapper" \
  -C 255,0,255 \
  -s 5 \
  -S -1 \
  -f ../fonts/helvR12.bdf \
  "YAAAAAS! yas."
*/
