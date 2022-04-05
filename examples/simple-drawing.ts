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
      .brightness(30) // set the panel brightness to 100%
      // .fgColor(0x0000ff) // set the active color to blue
      // .fill() // color the entire diplay blue
      // .fgColor(0xffff00) // set the active color to yellow
      .strokeColor(0xff0000)
      // .strokeWidth(matrix.width() / 6)
      .fillColor(0x0000ff)
      // draw a yellow circle around the display
      .unstable_drawRectangle({
        p0: [matrix.width() / 2 + 10, 10],
        w: 50,
        h: 5,
        // fill: false,
        strokeWidth: 0,
      })
      .unstable_drawRectangle({
        p0: [20, 20],
        p1: [40, 60],
        // fill: false,
        strokeWidth: 3,
      })
      .fillColor(0x0000ff)
      .strokeWidth(5)
      .unstable_drawCircle({
        center: [matrix.center()[0] + 10, matrix.center()[1] + 10],
        r: matrix.width() / 5,
      });
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
