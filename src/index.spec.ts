import * as color from 'color';
import { addon } from './addon';
import { MatrixOptions, RuntimeOptions, GpioMapping, PixelMapperType, LedMatrixInstance } from './types';
import { LedMatrixUtils } from './utils';

// tslint:disable-next-line:variable-name
enum Colors {
  black = 0x000000,
  red = 0xFF0000,
  green = 0x00FF00,
  blue = 0x0000FF,
  magenta = 0xFF00FF,
  cyan = 0x00FFFF,
  yellow = 0xFFFF00,
}

// const RGB = [Colors.red, Colors.green, Colors.blue];

// const toBytes = (hex: number) => [0xFF & (hex >> 16), 0xFF & (hex >> 8), 0xFF & hex];

const rainbow64 = Array.from(Array(64))
  .map((_, i, { length }) => Math.floor(360 * i / length))
  .map(hue => color.hsl(hue, 100, 50).rgbNumber());

const rainbow = (i: number) => rainbow64[Math.min(rainbow64.length - 1, Math.max(i, 0))];

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

const spin = async (matrix: LedMatrixInstance, speed = 50, clear = true) => {
  for (let i = 0; i <= matrix.height(); i++) {
    if (clear) matrix.clear();
    matrix.fgColor(rainbow(i)).drawLine(0, i, matrix.width(), matrix.height() - i).sync();
    if (speed) await wait(speed);
  }

  for (let i = matrix.width(); i >= 0; i--) {
    if (clear) matrix.clear();
    matrix.fgColor(rainbow(i)).drawLine(i, 0, matrix.width() - i, matrix.height()).sync();
    if (speed) await wait(speed);
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

    const colorStatic = Buffer.of(
      ...Array.from(Array(3 * matrix.height() * matrix.width())).map(() => Math.round(Math.random()) * 0xFF)
    );

    // Buffer.of(
    //   ...Array.from(Array(matrix.width())).flatMap((_, x) =>
    //     Array.from(Array(matrix.height())).flatMap((__, y) =>
    //       toBytes(RGB[Math.floor(3 * Math.random())])
    //     )
    //   )
    // );

    // const buffer = Buffer.of(Colors.red, Colors.green, Colors.blue);
    matrix.clear().drawBuffer(colorStatic).sync();
    // await wait(2000);
    for (let i = -font.height(); i < matrix.height() + font.height(); i++) {
      const k = Math.round(5 * i / matrix.height());
      const xOffset = (matrix.width() - font.stringWidth('Hello!', k)) / 2;
      matrix.clear().fgColor(rainbow(i)).drawText('Hello!', xOffset, i, k);
      matrix.sync();
      await wait(44);
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
        await wait(200);
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
      const x = i;
      matrix.clear()
        .fgColor(rainbow(i))
        .drawLine(x, 0, x, matrix.height())
        .sync();
      await wait(22);
    }

    // Draw line no clear
    matrix.clear();
    for (let y = 0; y < matrix.height(); y++) {
      matrix
        .fgColor(rainbow64[y])
        .drawLine(0, y, matrix.width(), y)
        .sync();
      await wait(22);
    }

    const centerX = Math.floor(matrix.width() / 2);
    const centerY = Math.floor(matrix.height() / 2);
    for (let r = 0; r <= matrix.width() * 1.5; r++) {
      matrix.clear()
        .fgColor(Colors.red)
        .drawCircle(0, r, r)
        .fgColor(Colors.magenta)
        .drawCircle(matrix.width() - r, matrix.height() - r, r)
        .fgColor(Colors.yellow)
        .drawCircle(r, r * Math.sin(r / 100), r)
        .fgColor(Colors.green)
        .drawCircle(matrix.width(), matrix.height() - r, r)
        .fgColor(Colors.blue)
        .drawCircle(centerX + r / 2, centerY, r)
        .sync();
      await wait(33);
    }
    matrix.clear();
    for (let r = matrix.width() - 15; r >= 0; r--) {
      matrix.fgColor(rainbow64[r]).drawCircle(centerX, centerY, r).sync();
      await wait(44);
    }
    await wait(1000);

    // await spin(matrix);
    await spin(matrix, 10);
    await spin(matrix, 5);
    await spin(matrix, 2);
    await spin(matrix, 1);
    await spin(matrix, 1);
    await spin(matrix, 0);
    await spin(matrix, 0);
    await spin(matrix, 0);
    await spin(matrix, 0);
    await spin(matrix, 0);
    await spin(matrix, 1, false);
    await wait(15000);
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
