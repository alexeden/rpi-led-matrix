import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);
    matrix
      .clear() // clear the display
      // .brightness(30) // set the panel brightness to 100%
      .fgColor(0x0000ff) // set the active color to blue
      // .fill() // color the entire diplay blue
      // .fgColor(0xffff00) // set the active color to yellow
      // .strokeColor(0xff0000)
      .bgColor(0xff0000)
      .unstable_drawRectangle({ p0: [70, 5], w: 10, h: 5 })
      .unstable_drawRectangle({ p0: [70, 15], w: 10, h: 5 })
      .unstable_drawRectangle({ p0: [70, 25], w: 10, h: 5 })
      .unstable_drawRectangle({ p0: [70, 35], w: 10, h: 5 })
      .unstable_drawRectangle({ p0: [70, 45], w: 10, h: 5 })
      .drawRect(70, 55, 10, 5)
      .unstable_drawRectangle({
        p0: [85, 5],
        p1: [95, 10],
        strokeWidth: 1,
        fill: true,
      })
      .unstable_drawRectangle({
        p0: [85, 15],
        p1: [95, 20],
        strokeWidth: 2,
        fill: true,
      })
      .unstable_drawRectangle({
        p0: [85, 25],
        p1: [95, 30],
        strokeWidth: 3,
        fill: true,
      })
      // .fillColor(0)
      .unstable_drawCircle({ center: [110, 5], r: 3 })
      .unstable_drawCircle({ center: [110, 15], r: 3 })
      .unstable_drawCircle({ center: [110, 25], r: 3 })
      .unstable_drawCircle({ center: [110, 35], r: 3 })
      .drawCircle(110, 55, 3)
      .unstable_drawCircle({ center: [120, 5], r: 4, fill: true })
      .unstable_drawCircle({ center: [120, 15], r: 4, fill: true })
      .unstable_drawCircle({ center: [120, 25], r: 4, fill: true })
      .unstable_drawCircle({ center: [120, 35], r: 4, fill: true })
      .unstable_drawCircle({ center: [120, 45], r: 4, fill: true })
      .unstable_drawCircle({ center: [4, 4], r: 4 })
      .drawCircle(4, 25, 4)
      .unstable_drawCircle({ center: [20, 5], r: 3 })
      .unstable_drawCircle({
        center: [30, 20],
        r: 9,
        fill: true,
      })
      .unstable_drawCircle({
        center: [30, 50],
        r: 19,
        fill: true,
      })
      .drawCircle(20, 25, 3);
    // .unstable_drawCircle({
    //   center: [96, 96],
    //   r: matrix.width() / 5,
    // });
    // matrix
    //   .clear() // clear the display
    //   .brightness(30) // set the panel brightness to 100%
    //   // .fgColor(0x0000ff) // set the active color to blue
    //   // .fill() // color the entire diplay blue
    //   // .fgColor(0xffff00) // set the active color to yellow
    //   .strokeColor(0xff0000)
    //   .strokeWidth(matrix.width() / 6)
    //   // draw a yellow circle around the display
    // draw a yellow rectangle
    // .drawRect(
    //   matrix.width() / 4,
    //   matrix.height() / 4,
    //   matrix.width() / 2,
    //   matrix.height() / 2
    // )
    // // sets the active color to red
    // .fgColor({ r: 255, g: 0, b: 0 })
    // // draw two diagonal red lines connecting the corners
    // .drawLine(0, 0, matrix.width(), matrix.height())
    // .drawLine(matrix.width() - 1, 0, 0, matrix.height() - 1);

    matrix.sync();

    await wait(999999999);
  } catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
