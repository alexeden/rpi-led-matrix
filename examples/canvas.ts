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
import { matrixFromOptions, registerFont, } from '../src';
import { matrixOptions, runtimeOptions, } from './_config';

const rainbow64 = Array.from(Array(64))
  .map((_, i, { length, }) => Math.floor(360 * i / length))
  .map(hue => color.hsl(hue, 100, 50).hex());

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

const millis = () => Number(process.hrtime.bigint() / 1000000n);

(() => {
  try {
    registerFont('./fonts/ShareTechMono-Regular.ttf', {
      family: 'ShareTechMono',
    });
    registerFont('./fonts/ShareTech-Regular.ttf', {
      family: 'ShareTech',
    });
    const matrix = matrixFromOptions(matrixOptions, runtimeOptions);
    matrix.textAlign = 'center';
    matrix.textBaseline = 'middle';

    const draw = (t: number) => {
      matrix.clearRect(-10*matrix.width, -10*matrix.height, 20*matrix.width, 20*matrix.height);
      matrix.translate(...matrix.center);
      matrix.rotate(Math.PI / 90);
      // matrix.clearRect(0, 0, matrix.width, matrix.height);
      matrix.translate(-matrix.width / 2, -matrix.height / 2);
      // matrix.clearRect(0, 0, matrix.width, matrix.height);
      matrix.fillStyle = rainbow64[Math.floor(32 * (Math.sin(t / 500) + 1))];
      matrix.font = `${30 * (Math.sin(t / 100) + 1) + 10}px ShareTech`;
      matrix.fillText('YAAAS!!!!', ...matrix.center);
      matrix.sync();
      wait(20).then(() => draw(millis()));
    };

    draw(millis());
  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
