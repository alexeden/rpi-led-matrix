import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);

    console.log('CENTER: ', matrix.center());

    // console.log(
    //   'drawing: ',
    //   matrix.unstable_drawCircle({
    //     ...matrix.center(),
    //     r: 10,
    //     strokeWidth: 1,
    //   })
    // );

    matrix
      .clear() // clear the display
      // .brightness(30) // set the panel brightness to 100%
      .fgColor(0x0000ff) // set the active color to blue
      // .fill() // color the entire diplay blue
      // .fgColor(0xffff00) // set the active color to yellow
      .strokeColor(0xff0000)
      .fillColor(0x0000ff)
      // draw a yellow circle around the display
      .unstable_drawRectangle({ p0: [70, 5], w: 10, h: 5, strokeWidth: 0 })
      .unstable_drawRectangle({ p0: [70, 15], w: 10, h: 5, strokeWidth: 1 })
      .unstable_drawRectangle({ p0: [70, 25], w: 10, h: 5, strokeWidth: 2 })
      .unstable_drawRectangle({ p0: [70, 35], w: 10, h: 5, strokeWidth: 3 })
      .unstable_drawRectangle({ p0: [70, 45], w: 10, h: 5, strokeWidth: 4 })
      .unstable_drawRectangle({ p0: [70, 55], w: 10, h: 5, strokeWidth: 5 })
      .unstable_drawRectangle({ p0: [85, 5], p1: [95, 10], strokeWidth: 0 })
      .unstable_drawRectangle({ p0: [85, 15], p1: [95, 20], strokeWidth: 1 })
      .unstable_drawRectangle({ p0: [85, 25], p1: [95, 30], strokeWidth: 2 })
      .unstable_drawRectangle({ p0: [85, 35], p1: [95, 40], strokeWidth: 3 })
      .unstable_drawRectangle({ p0: [85, 45], p1: [95, 50], strokeWidth: 4 })
      .unstable_drawRectangle({ p0: [85, 55], p1: [95, 60], strokeWidth: 5 })
      // .fillColor(0)
      .unstable_drawCircle({ center: [110, 5], r: 3, strokeWidth: 0 })
      .unstable_drawCircle({ center: [110, 15], r: 3, strokeWidth: 1 })
      .unstable_drawCircle({ center: [110, 25], r: 3, strokeWidth: 2 })
      .unstable_drawCircle({ center: [110, 35], r: 3, strokeWidth: 3 })
      .drawCircle(110, 55, 3)
      .unstable_drawCircle({ center: [120, 5], r: 4, strokeWidth: 0 })
      .unstable_drawCircle({ center: [120, 15], r: 4, strokeWidth: 1 })
      .unstable_drawCircle({ center: [120, 25], r: 4, strokeWidth: 2 })
      .unstable_drawCircle({ center: [120, 35], r: 4, strokeWidth: 3 })
      .unstable_drawCircle({ center: [120, 45], r: 4, strokeWidth: 4 })
      .unstable_drawCircle({
        center: [4, 4],
        r: 4,
        strokeWidth: 2,
        stroke: 0x0000ff,
        fill: false,
      })
      .drawCircle(4, 25, 4)
      .unstable_drawCircle({
        center: [20, 5],
        r: 3,
        strokeWidth: 1,
        stroke: 0x0000ff,
        fill: false,
      })
      .unstable_drawCircle({
        center: [30, 20],
        r: 9,
        strokeWidth: 6,
        stroke: 0x0000ff,
        fill: false,
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
