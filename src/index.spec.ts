import { addon } from './addon';
import { MatrixOptions, RuntimeOptions, GpioMapping, PixelMapperType, LedMatrixInstance } from './types';
import { LedMatrixUtils } from './utils';

// tslint:disable-next-line:variable-name
const Colors = {
  black: { r: 0, g: 0, b: 0 },
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 255, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  magenta: { r: 255, g: 0, b: 255 },
  cyan: { r: 0, g: 255, b: 255 },
  yellow: { r: 255, g: 255, b: 0 },
};

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

const spin = async (matrix: LedMatrixInstance, speed = 50) => {
  for (let i = 0; i < matrix.height(); i++) {
    matrix.clear().fgColor(Colors.green).drawLine(0, i, matrix.width(), matrix.height() - i).sync();
    await wait(speed);
  }

  for (let i = matrix.width(); i >= 0; i--) {
    matrix.clear().fgColor(Colors.magenta).drawLine(i, 0, matrix.width() - i, matrix.height()).sync();
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
      showRefreshRate: true,
      // disableHardwarePulsing: true,
      pixelMapperConfig: LedMatrixUtils.encodeMappers({ type: PixelMapperType.U }),
    };

    const runtimeOpts: RuntimeOptions = {
      ...addon.LedMatrix.defaultRuntimeOptions(),
      gpioSlowdown: 1,
    };

    const font = new addon.Font('../rpi-rgb-led-matrix/fonts/9x15B.bdf');
    console.log('new addon.Font: ', font);
    console.log('font.baseline(): ', font.baseline());
    console.log('font.height(): ', font.height());
    console.log('font.stringWidth("abc"): ', font.stringWidth('Mi'));

    const matrix = new addon.LedMatrix(matrixOpts, runtimeOpts);
    console.log('new addon.LedMatrix: ', matrix);
    console.log('matrix chainable setters: ', matrix.bgColor(Colors.black).fgColor(Colors.red).setFont(font));
    console.log('matrix.fgColor()', matrix.fgColor());
    console.log('matrix.bgColor()', matrix.bgColor());
    console.log('matrix.pwmBits(): ', matrix.pwmBits());
    console.log('matrix.pwmBits(1): ', matrix.pwmBits(1));
    console.log('matrix.pwmBits(12): ', matrix.pwmBits(12));
    console.log('matrix.pwmBits(11): ', matrix.pwmBits(11));
    console.log('matrix.brightness(): ', matrix.brightness());
    console.log('matrix.brightness(0): ', matrix.brightness(0));
    console.log('matrix.brightness(100): ', matrix.brightness(100));
    console.log('matrix.height(): ', matrix.height());
    console.log('matrix.width(): ', matrix.width());

    matrix.clear().sync();
    for (let i = 0; i < matrix.height() + font.height(); i++) {
      const k = Math.floor(8 * i / matrix.height());
      matrix.clear().fgColor(Colors.black).bgColor(Colors.magenta).drawText('YAAAS!!!', 0, i, k);
      matrix.sync();
      await wait(33);
    }

    const interval = 200;
    matrix.fgColor(Colors.red).fill().sync();
    await wait(interval);
    matrix.fgColor(Colors.blue).fill().sync();
    await wait(interval);
    matrix.fgColor(Colors.green).fill().sync();
    await wait(interval);
    matrix.clear();
    await wait(interval);

    // Clear section
    {
      matrix.clear().fgColor(Colors.magenta).fill().sync();
      await wait(333);
      matrix
        .clear(0, 0, matrix.width() / 2, matrix.height() / 2)
        .clear(matrix.width() / 2, matrix.height() / 2, matrix.width(), matrix.height())
        .sync();
      await wait(500);
    }

    // Fill section
    {
      matrix.clear()
        .fgColor(Colors.green)
        .fill(0, 0, matrix.width() / 2, matrix.height() / 2)
        .fill(matrix.width() / 2, matrix.height() / 2, matrix.width(), matrix.height())
        .sync();
      await wait(500);
    }

    // Draw rectangle
    {
      const rectHeight = Math.floor(matrix.height() / 10);
      const rgb = [Colors.red, Colors.green, Colors.blue];
      matrix.clear().sync();
      for (let i = 0; i < 10; i++) {
        matrix.fgColor(rgb[i % 3]).drawRect(0, i * rectHeight, matrix.width() - 1, (i + 1) * rectHeight).sync();
        await wait(333);
      }
    }

    // Set pixel
    for (let i = 0; i < matrix.height(); i++) {
      matrix.clear().fgColor(Colors.yellow);
      const y = i;
      Array.from(Array(matrix.width())).map((_, x) => {
        matrix.setPixel(x, y);
      });
      matrix.sync();
      await wait(22);
    }

    // Draw line
    for (let i = 0; i < matrix.width(); i++) {
      matrix.clear().fgColor(Colors.cyan);
      const x = i;
      Array.from(Array(matrix.height())).map((_, y) => {
        matrix.setPixel(x, y);
      });
      matrix.sync();
      await wait(22);
    }

    const centerX = Math.floor(matrix.width() / 2);
    const centerY = Math.floor(matrix.height() / 2);
    for (let r = 0; r <= matrix.width() * 1.5; r++) {
      matrix.clear()
        .fgColor(Colors.red)
        .drawCircle(0, 0, r)
        .fgColor(Colors.green)
        .drawCircle(matrix.width(), matrix.height(), r)
        .fgColor(Colors.blue)
        .drawCircle(centerX, centerY, r)
        .sync();
      await wait(44);
    }
    matrix.clear();
    for (let r = matrix.width(); r >= 0; r--) {
      matrix.clear().drawCircle(centerX, centerY, r).sync();
      await wait(44);
    }

    // await spin(matrix);
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
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 2);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 1);

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
