// import * as color from 'color';
import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

// const rainbow64 = Array.from(Array(64))
//   .map((_, i, { length }) => Math.floor((360 * i) / length))
//   .map(hue => color.hsl(hue, 100, 50).rgbNumber());

// const rainbow = (i: number) =>
//   rainbow64[Math.min(rainbow64.length - 1, Math.max(i % 64, 0))];

(() => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions)
      .fgColor(0x0000ff) // set the active color to blue
      .bgColor(0xff0000);

    matrix.sync();
  } catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
