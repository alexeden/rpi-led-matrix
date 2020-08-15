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
import * as color from 'color';
import { LedMatrix, registerFont, } from '../src';
import { matrixOptions, runtimeOptions, } from './_config';

const rainbow64 = Array.from(Array(64))
  .map((_, i, { length, }) => Math.floor(360 * i / length))
  .map(hue => color.hsl(hue, 100, 50).hex());

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

const millis = () => Number(process.hrtime.bigint() / 1000000n);

(() => {
  try {
    const matrix = LedMatrix.fromOptions(matrixOptions, runtimeOptions);
    registerFont('./fonts/ShareTechMono-Regular.ttf', {
      family: 'ShareTechMono',
    });
    registerFont('./fonts/ShareTech-Regular.ttf', {
      family: 'ShareTech',
    });
    const ctx = matrix.getContext('2d');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const draw = (t: number) => {
      ctx.clearRect(-10*matrix.width, -10*matrix.height, 20*matrix.width, 20*matrix.height);
      ctx.translate(...matrix.center);
      ctx.rotate(Math.PI / 90);
      // ctx.clearRect(0, 0, matrix.width, matrix.height);
      ctx.translate(-matrix.width / 2, -matrix.height / 2);
      // ctx.clearRect(0, 0, matrix.width, matrix.height);
      ctx.fillStyle = rainbow64[Math.floor(32 * (Math.sin(t / 500) + 1))];
      ctx.font = `${30 * (Math.sin(t / 100) + 1) + 10}px ShareTech`;
      ctx.fillText('YAAAS!!!!', ...matrix.center);
      matrix.sync();
      wait(20).then(() => draw(millis()));
    };

    draw(millis());
  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
