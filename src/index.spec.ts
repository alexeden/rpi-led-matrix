import { addon } from './addon';
import { MatrixOptions, RuntimeOptions, GpioMapping, PixelMapperType, LedMatrixInstance } from './types';
import { LedMatrixUtils } from './utils';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

const spin = async (matrix: LedMatrixInstance, speed = 50) => {
  for (let i = 0; i < matrix.height(); i++) {
    matrix.clear().drawLine(0, i, matrix.width(), matrix.height() - i);
    await wait(speed);
  }

  for (let i = matrix.width(); i >= 0; i--) {
    matrix.clear().drawLine(i, 0, matrix.width() - i, matrix.height());
    await wait(speed);
  }
};

// tslint:disable-next-line:variable-name
const Colors = {
  black: { r: 0, g: 0, b: 0 },
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 255, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  magenta: { r: 255, g: 0, b: 255 },
  cyan: { r: 0, g: 255, b: 255 },
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

    matrix.clear();
    for (let i = 0; i < matrix.height() + font.baseline(); i++) {
      matrix.clear().fgColor(Colors.black).bgColor(Colors.magenta).drawText('YAAAS!!!', 0, i);
      await wait(33);
    }

    const interval = 200;
    matrix.fgColor(Colors.red).fill();
    await wait(interval);
    matrix.fgColor(Colors.blue).fill();
    await wait(interval);
    matrix.fgColor(Colors.green).fill();
    await wait(interval);
    matrix.clear();
    await wait(interval);

    for (let i = 0; i < matrix.height(); i++) {
      matrix.clear();
      const y = i;
      Array.from(Array(matrix.width())).map((_, x) => {
        matrix.setPixel(x, y);
      });
      await wait(22);
    }
    for (let i = 0; i < matrix.width(); i++) {
      matrix.clear();
      const x = i;
      Array.from(Array(matrix.height())).map((_, y) => {
        matrix.setPixel(x, y);
      });
      await wait(22);
    }

    matrix.clear();
    const centerX = Math.floor(matrix.width() / 2);
    const centerY = Math.floor(matrix.height() / 2);
    for (let r = 0; r <= matrix.width() * 1.5; r++) {
      matrix.clear()
        .fgColor(Colors.red)
        .drawCircle(0, 0, r)
        .fgColor(Colors.green)
        .drawCircle(matrix.width(), matrix.height(), r)
        .fgColor(Colors.blue)
        .drawCircle(centerX, centerY, r);
      await wait(44);
    }
    matrix.clear();
    for (let r = matrix.width(); r >= 0; r--) {
      matrix.clear().drawCircle(centerX, centerY, r);
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
