/**
 * So far, install failing on PI, trying this, [suggested here](https://www.thetopsites.net/article/52748123.shtml):
 *
 * ```
 * sudo apt-get install libcairo2-dev libjpeg-dev libgif-dev
 * ```
 *
 * Then run:
 *
 * ```
 * pkg-config --atleast-version=1.12.2 cairo
 * ```
 *
 * Make sure it succeeded! (`echo $?`)
 *
 * (still not working)
 *
 * Try this [suggested here](https://stackoverflow.com/a/24440069/901706):
 *
 * ```
 * sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
 * ```
 *
 * JFC `npm i` finally worked. Hopefully won't have to run that gauntlet ever again.
 *
 * *narrator: he would... many times*
 */
import { createCanvas, registerFont } from 'canvas';
import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';
const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);
    registerFont('./fonts/ShareTechMono-Regular.ttf', {
      family: 'ShareTechMono',
    });
    registerFont('./fonts/ShareTech-Regular.ttf', {
      family: 'ShareTech',
    });
    const canvas = createCanvas(matrix.width(), matrix.height());
    const ctx = canvas.getContext('2d');
    matrix.clear().brightness(100);
    ctx.font = '11px ShareTech';
    ctx.fillStyle = '#ffF0F0';
    ctx.fillText('YAAAS KWEEN 😎', 5, matrix.height() - 10);

    const buffer = canvas.toBuffer('raw').filter((_, i) => (i + 1) % 4 !== 0);
    matrix.drawBuffer(buffer).sync();
    console.log(Math.max(...buffer));
    await wait(9999999);

  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
