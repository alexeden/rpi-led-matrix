import * as color from 'color';
import { LedMatrix, LedMatrixInstance, Font, LayoutUtils, HorizontalAlignment, VerticalAlignment } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

enum Colors {
  black = 0x000000,
  red = 0xFF0000,
  green = 0x00FF00,
  blue = 0x0000FF,
  magenta = 0xFF00FF,
  cyan = 0x00FFFF,
  yellow = 0xFFFF00,
}

const rainbow64 = Array.from(Array(64))
  .map((_, i, { length }) => Math.floor(360 * i / length))
  .map(hue => color.hsl(hue, 100, 50).rgbNumber());

const rainbow = (i: number) => rainbow64[Math.min(rainbow64.length - 1, Math.max(i % 64, 0))];

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
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);

    // RGB fills
    const interval = 200;
    matrix.fgColor(Colors.red).fill().sync();
    await wait(interval);
    matrix.fgColor(Colors.blue).fill().sync();
    await wait(interval);
    matrix.fgColor(Colors.green).fill().sync();
    await wait(interval);
    matrix.clear();
    await wait(interval);

    {
      // Text positions
      const font = new Font('helvR12', `${process.cwd()}/fonts/helvR12.bdf`);
      matrix.font(font);
      const lines = LayoutUtils.textToLines(font, matrix.width(), 'Hello, matrix!');

      for (const alignmentH of [HorizontalAlignment.Left, HorizontalAlignment.Center, HorizontalAlignment.Right]) {
        for (const alignmentV of [VerticalAlignment.Top, VerticalAlignment.Middle, VerticalAlignment.Bottom]) {
          matrix.fgColor(rainbow(Math.floor(64 * Math.random()))).clear();
          LayoutUtils.linesToMappedGlyphs(lines, font.height(), matrix.width(), matrix.height(), alignmentH, alignmentV)
            .map(glyph => {
              matrix.drawText(glyph.char, glyph.x, glyph.y);
            });
          matrix.sync();
          await wait(400);
        }
      }
    }


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
        matrix.fgColor(rgb[i % 3]).drawRect(0, i * rectHeight, matrix.width() - 1, rectHeight).sync();
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
        .fgColor(rainbow64[y % 64])
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
      matrix.fgColor(rainbow64[r % 64]).drawCircle(centerX, centerY, r).sync();
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
