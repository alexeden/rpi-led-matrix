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
import { registerFont, } from 'canvas';
import { LedMatrix, } from '../src';
import { matrixOptions, runtimeOptions, } from './_config';
const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

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
    ctx.font = '15px ShareTech';
    ctx.fillStyle = '#ff008F';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let lastAngle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, matrix.matrix.width(), matrix.matrix.height());
      ctx.save();
      ctx.translate(matrix.matrix.width() / 2, matrix.matrix.height() / 2);
      const nextAngle = lastAngle + 10 * Math.PI / 180;
      ctx.rotate(nextAngle);
      lastAngle = nextAngle >= 10 * Math.PI ? 0 : nextAngle;
      ctx.translate(-matrix.matrix.width() / 2, -matrix.matrix.height() / 2);
      ctx.fillText('YAAAS!!!!', matrix.matrix.width() / 2, matrix.matrix.height() / 2);
      ctx.restore();
      ctx.font = `${Math.round(2 * lastAngle + 1)}px ShareTech`;
      const buffer = matrix.toBuffer('raw').filter((_, i) => (i + 1) % 4 !== 0);

      matrix.matrix.drawBuffer(buffer).sync();
      wait(20).then(draw);
    };

    draw();

    // const buffer = matrix.toBuffer('raw').filter((_, i) => (i + 1) % 4 !== 0);
    // matrix.matrix.drawBuffer(buffer).sync();

    // await wait(9999999);

  }
  catch (error) {
    console.error(`${__filename} caught: `, error);
  }
})();
