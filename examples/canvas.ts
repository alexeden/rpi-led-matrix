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
import { createCanvas, } from 'canvas';


import { LedMatrix } from '../src';
import { matrixOptions, runtimeOptions } from './_config';

(async () => {
  try {
    const matrix = new LedMatrix(matrixOptions, runtimeOptions);
    const canvas = createCanvas(matrix.width(), matrix.height());
    const ctx = canvas.getContext('2d');
    matrix.clear().brightness(100);

  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
